import { api } from './api.js';
import { reportViolation } from './integrity.js';

/**
 * Screen recorder. Raw MediaRecorder chunks (no transcoding) are uploaded about
 * every 10 s with a sequence number. Failed uploads retry with exponential
 * backoff. Uploads NEVER block the exam: they run on their own queue, and if
 * the queue grows too long the oldest chunk is dropped — the server then sees a
 * gap in the sequence and records it.
 *
 * status is truthful: 'recording' means capture is running locally; `uploaded`
 * only counts chunks the server acknowledged.
 */
const SLICE_MS = 10000;
const MAX_QUEUE = 30;

export class ScreenRecorder {
  constructor(onChange, onViolation = reportViolation) {
    this.onChange = onChange;
    this.onViolation = onViolation;
    this.state = { status: 'idle', uploaded: 0, pending: 0, retrying: false, error: null };
    this.seq = 0;
    this.queue = [];
    this.sending = false;
    this.stopped = false;
    this.backoff = 1000;
    this.stream = null;
    this.surface = null;
    this.trackEnded = false;
    this.revoked = false;
    this.started = false;
    this.onTrackEnded = this._handleTrackEnded.bind(this);
  }
  _set(patch) { this.state = { ...this.state, ...patch }; this.onChange?.(this.state); }

  get supported() { return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia; }

  _stopStream() {
    if (!this.stream) return;
    this.stream.getTracks().forEach((track) => {
      track.removeEventListener?.('ended', this.onTrackEnded);
      track.stop();
    });
    this.stream = null;
  }

  _revoke(error, detail) {
    if (this.stopped || this.revoked) return;
    this.revoked = true;
    this._set({ status: 'error', error });
    this.onViolation?.('recording_revoked', detail);
  }

  _handleTrackEnded() {
    if (this.stopped || this.trackEnded) return;
    this.trackEnded = true;
    this.stream = null;
    if (this.started) {
      this._revoke('Screen sharing was stopped.', 'The screen capture track ended.');
      try { if (this.rec?.state !== 'inactive') this.rec.stop(); } catch { /* ignore */ }
    } else {
      this._set({ status: 'denied', error: 'Screen sharing was stopped. Share your entire screen again.' });
    }
  }

  /**
   * Acquire the screen capture without starting the recorder. The picker must
   * run before fullscreen: the browser leaves fullscreen to show it and the
   * activation cannot be reused after it closes.
   */
  async prepare() {
    if (this.stopped || this.state.status === 'requesting' || this.state.status === 'recording') return false;
    if (this.state.status === 'ready' && this.stream?.active) return true;

    this._stopStream();
    this.surface = null;
    this.trackEnded = false;
    this.revoked = false;
    this.started = false;

    if (!this.supported) {
      this._set({ status: 'unsupported', error: 'This browser cannot record the screen.' });
      return false;
    }

    this._set({ status: 'requesting', error: null });
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: false,
      });
    } catch (e) {
      if (this.stopped) return false;
      this._set({
        status: 'denied',
        error: e?.name === 'NotAllowedError'
          ? 'Screen sharing permission was denied. Share your entire screen to begin.'
          : 'Screen sharing could not start. Share your entire screen to begin.',
      });
      return false;
    }

    if (this.stopped) {
      stream.getTracks().forEach((track) => track.stop());
      return false;
    }

    const track = stream.getVideoTracks()[0];
    const surface = track?.getSettings?.().displaySurface || null;
    if (!track || track.readyState === 'ended') {
      stream.getTracks().forEach((item) => item.stop());
      this._set({ status: 'error', error: 'Screen sharing could not start. Try again.' });
      return false;
    }
    // Chrome reports "browser" for a tab and "window" for a window. The exam
    // requires the whole monitor; a tab capture also breaks fullscreen.
    if (surface !== 'monitor') {
      stream.getTracks().forEach((item) => item.stop());
      this._set({
        status: 'wrong_surface',
        error: surface
          ? 'Share the entire screen, not a tab or window.'
          : 'The shared surface could not be verified. Choose Entire screen and try again.',
      });
      return false;
    }

    this.stream = stream;
    this.surface = surface;
    track.addEventListener('ended', this.onTrackEnded, { once: true });
    this._set({ status: 'ready', error: null });
    return true;
  }

  /**
   * Start recording from the stream acquired by prepare(). This deliberately
   * never opens the picker: it runs after requestFullscreen(), and getDisplayMedia
   * would drop the exam out of fullscreen again.
   */
  async start() {
    if (this.state.status === 'recording') return true;
    if (this.state.status !== 'ready' || !this.stream?.active) {
      this._set({ status: 'error', error: 'Share your entire screen before starting the exam.' });
      return false;
    }
    const track = this.stream.getVideoTracks()[0];
    if (!track || track.readyState === 'ended') {
      this._stopStream();
      this._set({ status: 'error', error: 'Screen sharing stopped. Share your entire screen again.' });
      return false;
    }
    const mime = ['video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported?.(m));
    try {
      this.rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined);
    } catch {
      this._set({ status: 'error', error: 'Recorder could not be created.' });
      return false;
    }
    this.mime = this.rec.mimeType || 'video/webm';
    this.rec.ondataavailable = (e) => { if (e.data?.size) this._enqueue(e.data); };
    this.rec.onstop = () => {
      if (this.stopped) return;
      this._revoke('Recording stopped unexpectedly.', 'The recorder stopped unexpectedly.');
    };
    this.started = true;
    this.rec.start(SLICE_MS);
    this._set({ status: 'recording' });
    return true;
  }

  _enqueue(blob) {
    this.queue.push({ seq: this.seq++, blob, tries: 0 });
    if (this.queue.length > MAX_QUEUE) this.queue.shift(); // oldest dropped -> server sees a gap
    this._set({ pending: this.queue.length });
    this._pump();
  }

  async _pump() {
    if (this.sending) return;
    this.sending = true;
    while (this.queue.length && !this.stopped) {
      const item = this.queue[0];
      try {
        await api('/exam/recording/chunk', { method: 'POST', role: 'student', body: item.blob, headers: { 'Content-Type': this.mime, 'x-chunk-seq': String(item.seq) } });
        this.queue.shift();
        this.backoff = 1000;
        this._set({ uploaded: this.state.uploaded + 1, pending: this.queue.length, retrying: false });
      } catch (e) {
        if (e.status === 409 || e.status === 401) { this.queue = []; break; }
        this._set({ retrying: true });
        await new Promise((r) => setTimeout(r, this.backoff));
        this.backoff = Math.min(this.backoff * 2, 15000);
      }
    }
    this.sending = false;
  }

  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.started = false;
    try { if (this.rec?.state !== 'inactive') this.rec?.stop(); } catch { /* ignore */ }
    this._stopStream();
  }
}
