// Pure browser-signal predicates.
//
// Everything here is a function of its arguments only: no browser globals are
// read at module scope and nothing is imported. That keeps the rules easy to
// reason about AND lets the server's unit test exercise the exact code the
// browser runs (server/test/client-signals.test.js).

// Keys that produce a screen capture. PrintScreen and PrintWindow are the
// hardware keys; the Meta+Shift+3/4/5 chords are the macOS equivalents.
export const SCREENSHOT_KEYS = new Set(['PrintScreen', 'PrintWindow', 'F13', 'F14', 'F15']);
export const MAC_CAPTURE_KEYS = new Set(['3', '4', '5', '6']);

// The clipboard shortcuts. Ctrl/⌘ + C / X / V, plus Shift+Insert (paste).
export const CLIPBOARD_KEYS = new Set(['c', 'x', 'v']);

/**
 * A screenshot key press.
 *
 * The browser cannot stop an operating-system capture - preventDefault() on
 * PrintScreen does not stop the screen from being copied. It can only report
 * the key press, which is what the policy acts on.
 */
export function isScreenshotKey(e) {
  if (!e) return false;
  if (SCREENSHOT_KEYS.has(e.key)) return true;
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && MAC_CAPTURE_KEYS.has(e.key)) return true;
  return false;
}

/**
 * A bare operating-system key (the Windows / macOS key).
 *
 * The Windows snipping tool (Win+Shift+S) is consumed by the operating system
 * and never reaches the page, so this is the only in-page trace of it. It is
 * a signal for the proctor, never a penalty.
 */
export function isOsChord(e) {
  if (!e) return false;
  if (e.repeat) return false;
  const key = String(e.key || '');
  return key === 'Meta' || key === 'OS' || key === 'Win';
}

/**
 * The clipboard action a key press asks for: 'copy', 'cut' or 'paste'.
 *
 * The exam page has no editable field, so the DOM copy/cut/paste events never
 * fire there: a paste needs a text field and a copy needs a selection. The
 * keyboard is the only signal that is always available - and preventing the
 * keydown is also the only way to actually stop the paste.
 *
 * Returns null for everything that is not a clipboard action.
 */
export function clipboardAction(e) {
  if (!e) return null;
  if (e.repeat) return null; // holding the key down is one attempt
  const key = String(e.key || '').toLowerCase();
  if (key === 'insert') return e.shiftKey ? 'paste' : null;
  // AltGr is reported as Ctrl+Alt and is used to type characters on many
  // keyboard layouts. It must never look like a clipboard shortcut.
  if (e.altKey) return null;
  if (!(e.ctrlKey || e.metaKey)) return null;
  if (key === 'c') return 'copy';
  if (key === 'x') return 'cut';
  if (key === 'v') return 'paste';
  return null;
}

export function isClipboardChord(e) {
  return clipboardAction(e) !== null;
}

/** The shortcut as the student pressed it, for the proctor log. */
export function clipboardShortcut(e) {
  if (!e) return '';
  if (String(e.key || '') === 'Insert') return 'Shift+Insert';
  const mod = e.metaKey ? 'Cmd' : e.ctrlKey ? 'Ctrl' : '';
  return `${mod}+${String(e.key || '').toUpperCase()}`;
}

/**
 * Is the browser window covering the whole screen?
 *
 * F11 (browser fullscreen) does not set document.fullscreenElement, so a
 * student who goes fullscreen with F11 used to look like a student who LEFT
 * fullscreen. Comparing the window with the screen tells the two apart.
 */
export function isFullWindow(win = globalThis) {
  const s = win?.screen;
  if (!s) return false;
  const w = Number(win.outerWidth) || 0;
  const h = Number(win.outerHeight) || 0;
  const aw = Number(s.availWidth) || 0;
  const ah = Number(s.availHeight) || 0;
  if (!w || !h || !aw || !ah) return false;
  const TOLERANCE = 16; // window borders and the taskbar
  return w >= aw - TOLERANCE && h >= ah - TOLERANCE;
}

/**
 * Is the exam in fullscreen - either the Fullscreen API or the whole screen
 * covered by the browser window (F11)?
 */
export function detectFullscreen(win = globalThis) {
  if (win?.document?.fullscreenElement) return true;
  return isFullWindow(win);
}
