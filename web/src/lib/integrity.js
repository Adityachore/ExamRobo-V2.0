// Client-side integrity detection.
//
// The browser can only ever produce SIGNALS: the student controls this
// machine, so everything here can be bypassed with a modified client. The
// server owns the count and the consequence (server/services/integrity.js).
// What the client does is remove the easy ways to cheat and report honestly
// what it saw.
//
// Three rules shape this file:
//   1. A capture/recording kind is never throttled away. A swallowed signal
//      would be a free pass.
//   2. The same kind is throttled per kind, not globally. One user action can
//      fire several events (blur + visibilitychange + fullscreenchange) and
//      must only count once - but a screenshot key press must never be
//      blocked by an unrelated clipboard event that happened a second earlier.
//   3. One incident is one warning. Leaving fullscreen is seen by the client
//      AND by the server heartbeat; both must not count it twice.
import { api } from './api.js';
import {
  clipboardAction,
  clipboardShortcut,
  detectFullscreen,
  isOsChord,
  isScreenshotKey,
} from './integrity-signals.js';

export { detectFullscreen, isClipboardChord, isOsChord, isScreenshotKey } from './integrity-signals.js';
export { clipboardAction, clipboardShortcut } from './integrity-signals.js';

// The kinds the server can act on. Kept in sync with the server registry in
// server/services/integrity.js.
export const KIND_LABELS = {
  tab_blur: 'You left the exam tab.',
  fullscreen_exit: 'You exited fullscreen.',
  clipboard: 'Copy, cut and paste are disabled during the exam.',
  context_menu: 'The right-click menu is disabled during the exam.',
  print: 'Printing is disabled during the exam.',
  screenshot_key: 'A screenshot key was pressed during the exam.',
  recording_revoked: 'The screen recording was stopped during the exam.',
  second_window: 'A second window of the exam was opened.',
  second_session: 'This exam was signed in from another device or browser.',
  display_change: 'The display configuration changed during the exam.',
  devtools: 'Developer tools appear to be open.',
  share_surface: 'The exam was shared as a single window instead of the entire screen.',
  os_chord: 'An operating-system key combination was pressed during the exam.',
};

// Kinds that must always reach the server; they are warned about, never
// throttled away.
export const CRITICAL_KINDS = new Set(['screenshot_key', 'recording_revoked']);
// Kinds the server records but never penalises.
export const LOG_KINDS = new Set(['devtools', 'share_surface', 'os_chord']);
// A clipboard press is never throttled away: every press the student makes is
// an attempt and an attempt is counted. The copy/cut/paste DOM event the
// press would cause is deduplicated on its own (CLIPBOARD_DEDUPE_MS).
const NEVER_THROTTLED = new Set([...CRITICAL_KINDS, 'clipboard']);

const THROTTLE_MS = 1500;
const DISPLAY_POLL_MS = 2000;
const DEVTOOLS_POLL_MS = 2500;
const FULLSCREEN_POLL_MS = 1000;
// A clipboard key press is followed by the DOM event it causes. The DOM event
// is the same press, so it must not be counted a second time.
const CLIPBOARD_DEDUPE_MS = 1200;

// The active reporter. Exactly one component reports violations during an
// exam - the runner - so a signal is never counted twice. The display-surface
// watcher is installed once for the whole page and always reaches the current
// reporter.
let reporter = null;

export function setReporter(fn) {
  const prev = reporter;
  reporter = fn || null;
  return () => { if (reporter === fn) reporter = prev; };
}

function emit(kind, detail = '') {
  try { reporter?.(kind, detail); } catch { /* a broken reporter must not break the page */ }
}

/**
 * Report a violation that the guards did not produce - the recorder losing its
 * capture track, for example. Uses the active reporter when the runner is
 * mounted, otherwise posts straight to the server.
 */
export async function reportViolation(kind, detail = '') {
  if (reporter) return reporter(kind, detail);
  try {
    return await api('/exam/event', { method: 'POST', role: 'student', body: { kind, detail } });
  } catch {
    return null; // no exam session yet, or the network is down
  }
}

/**
 * Wrap getDisplayMedia so the browser tells us what surface was shared.
 * The exam requires the ENTIRE screen; a single window means the student can
 * hide other applications behind the exam. Installed once, before the
 * recorder asks for the screen.
 */
export function watchDisplaySurface() {
  const md = navigator.mediaDevices;
  if (!md?.getDisplayMedia || md.__examroboWrapped) return;
  const original = md.getDisplayMedia.bind(md);
  md.getDisplayMedia = async (constraints) => {
    const stream = await original(constraints);
    const track = stream?.getVideoTracks?.()[0];
    const surface = track?.getSettings?.().displaySurface;
    if (surface && surface !== 'monitor') {
      emit('share_surface', `Shared surface: ${surface}.`);
    } else if (!surface) {
      emit('share_surface', 'The shared surface could not be determined.');
    }
    return stream;
  };
  md.__examroboWrapped = true;
}

// Best effort only: the OS owns the clipboard and the browser may not be
// allowed to write to it. The violation is reported either way.
async function clearClipboard() {
  try {
    await navigator.clipboard?.writeText?.('');
    return true;
  } catch {
    return false; // not permitted
  }
}

/**
 * Install the browser guards for the duration of the exam.
 *
 * onViolation(kind, detail) - called for every signal the browser sees.
 * onFullscreenChange(active) - optional, for the fullscreen UI.
 *
 * Returns a cleanup function.
 */
export function installIntegrityGuards({ onViolation, onFullscreenChange } = {}) {
  const restore = setReporter(onViolation);
  watchDisplaySurface();

  const offs = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    offs.push(() => target.removeEventListener(type, fn, opts));
  };

  // --- clipboard: no copy, no cut, no paste ------------------------------
  // The exam page has no editable field, so the DOM copy/cut/paste events
  // never fire there. The keyboard is the only signal that is always
  // available, and preventing the keydown is also the only way to actually
  // stop a paste on a page that has nothing to paste into.
  let lastClipboardKeyAt = 0;
  const blockClipboard = (e) => {
    e.preventDefault();
    // The keydown handler already reported this press.
    if (Date.now() - lastClipboardKeyAt < CLIPBOARD_DEDUPE_MS) return;
    emit('clipboard', `Blocked ${e.type}.`);
  };
  on(document, 'copy', blockClipboard);
  on(document, 'cut', blockClipboard);
  on(document, 'paste', blockClipboard);

  // --- context menu ------------------------------------------------------
  on(document, 'contextmenu', (e) => {
    e.preventDefault();
    emit('context_menu', 'Right-click blocked.');
  });

  // --- printing ----------------------------------------------------------
  on(window, 'beforeprint', () => emit('print', 'Print blocked.'));
  on(document, 'keydown', (e) => {
    if (isScreenshotKey(e)) {
      e.preventDefault();
      clearClipboard().then((wiped) =>
        emit('screenshot_key', `Key "${e.key}" pressed.${wiped ? ' The clipboard was cleared.' : ''}`),
      );
      return;
    }
    const action = clipboardAction(e);
    if (action) {
      e.preventDefault();
      lastClipboardKeyAt = Date.now();
      emit('clipboard', `Blocked ${action} (${clipboardShortcut(e)}).`);
      return;
    }
    if (isOsChord(e)) {
      emit('os_chord', 'An operating-system key combination was pressed.');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'p') {
      e.preventDefault();
      emit('print', 'Print shortcut blocked.');
    }
  });

  // --- leaving the exam --------------------------------------------------
  on(window, 'blur', () => emit('tab_blur', 'The exam window lost focus.'));
  on(document, 'visibilitychange', () => {
    if (document.hidden) emit('tab_blur', 'The exam tab was hidden.');
  });

  // --- fullscreen --------------------------------------------------------
  // F11 does not set document.fullscreenElement and does not fire
  // fullscreenchange, so the state is polled and the window is compared with
  // the screen. A fullscreen_exit is reported on a true -> false TRANSITION
  // only: going fullscreen with F11 used to look like leaving fullscreen and
  // cost the student a warning for nothing.
  let lastFullscreen = detectFullscreen();
  const checkFullscreen = () => {
    const active = detectFullscreen();
    if (active === lastFullscreen) return;
    const was = lastFullscreen;
    lastFullscreen = active;
    onFullscreenChange?.(active);
    if (was && !active) emit('fullscreen_exit', 'Fullscreen was exited.');
  };
  on(document, 'fullscreenchange', checkFullscreen);
  on(window, 'resize', checkFullscreen);
  const fullscreenTimer = setInterval(checkFullscreen, FULLSCREEN_POLL_MS);
  offs.push(() => clearInterval(fullscreenTimer));

  // --- display configuration --------------------------------------------
  // Best effort: browsers do not expose the number of attached screens, so
  // this catches a resolution change or a resized window, not every second
  // monitor. The screen recording is the real evidence.
  const geometry = () => {
    const s = window.screen || {};
    return [s.width, s.height, s.availWidth, s.availHeight].join('x');
  };
  let lastGeometry = geometry();
  const checkDisplay = () => {
    const now = geometry();
    if (now !== lastGeometry) {
      lastGeometry = now;
      emit('display_change', `Display geometry is now ${now}.`);
    }
  };
  const displayTimer = setInterval(checkDisplay, DISPLAY_POLL_MS);
  offs.push(() => clearInterval(displayTimer));
  on(window, 'resize', checkDisplay);

  // --- developer tools ----------------------------------------------------
  // A side-docked devtools panel makes the window much bigger than the
  // viewport. Logged only: the signal is too weak to penalise.
  let devtoolsOpen = false;
  const checkDevtools = () => {
    const open = window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 220;
    if (open && !devtoolsOpen) emit('devtools', 'A developer panel appears to be open.');
    devtoolsOpen = open;
  };
  const devtoolsTimer = setInterval(checkDevtools, DEVTOOLS_POLL_MS);
  offs.push(() => clearInterval(devtoolsTimer));

  return () => {
    for (const off of offs.splice(0)) off();
    restore();
  };
}

/**
 * Per-kind throttling. One user action often fires several events; only the
 * first of a kind counts. Critical kinds are never throttled.
 */
export function createKindThrottle({ windowMs = THROTTLE_MS } = {}) {
  const last = new Map();
  return (kind) => {
    if (NEVER_THROTTLED.has(kind)) return true;
    const now = Date.now();
    const prev = last.get(kind) || 0;
    if (now - prev < windowMs) return false;
    last.set(kind, now);
    return true;
  };
}
