// The browser signal rules, tested on the server.
//
// web/src/lib/integrity-signals.js is the exact code the browser runs, and it
// has no imports and no browser globals at module scope, so it can be
// exercised here. These rules decide what the student is charged with, so
// they are worth pinning down.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clipboardAction,
  clipboardShortcut,
  detectFullscreen,
  isClipboardChord,
  isFullWindow,
  isOsChord,
  isScreenshotKey,
} from '../../web/src/lib/integrity-signals.js';

const key = (k, mods = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, repeat: false, ...mods });

/* ------------------------------------------------------------- screenshots */

test('the screenshot keys are recognised', () => {
  assert.equal(isScreenshotKey(key('PrintScreen')), true);
  assert.equal(isScreenshotKey(key('PrintWindow')), true);
  assert.equal(isScreenshotKey(key('F13')), true);
  assert.equal(isScreenshotKey(key('F15')), true);
});

test('the macOS capture chords are recognised', () => {
  assert.equal(isScreenshotKey(key('3', { metaKey: true, shiftKey: true })), true);
  assert.equal(isScreenshotKey(key('4', { metaKey: true, shiftKey: true })), true);
});

test('ordinary keys are not a screenshot', () => {
  assert.equal(isScreenshotKey(key('a')), false);
  assert.equal(isScreenshotKey(key('P', { ctrlKey: true })), false);
  assert.equal(isScreenshotKey(key('3')), false);
  assert.equal(isScreenshotKey(null), false);
});

/* --------------------------------------------------------- the os key chord */

test('the operating-system key is a signal, not a screenshot', () => {
  assert.equal(isOsChord(key('Meta')), true);
  assert.equal(isOsChord(key('OS')), true);
  assert.equal(isOsChord(key('a')), false);
  assert.equal(isOsChord(key('Meta', { repeat: true })), false);
});

/* --------------------------------------------------------------- clipboard */

test('copy, cut and paste are detected from the keyboard', () => {
  assert.equal(clipboardAction(key('c', { ctrlKey: true })), 'copy');
  assert.equal(clipboardAction(key('x', { ctrlKey: true })), 'cut');
  assert.equal(clipboardAction(key('v', { ctrlKey: true })), 'paste');
  assert.equal(clipboardAction(key('v', { metaKey: true })), 'paste');
});

test('Shift+Insert is a paste', () => {
  assert.equal(clipboardAction(key('Insert', { shiftKey: true })), 'paste');
  assert.equal(clipboardAction(key('Insert')), null);
});

test('paste-as-text and copy-as-text are clipboard actions', () => {
  assert.equal(clipboardAction(key('v', { ctrlKey: true, shiftKey: true })), 'paste');
  assert.equal(clipboardAction(key('c', { ctrlKey: true, shiftKey: true })), 'copy');
});

test('other shortcuts are not clipboard actions', () => {
  assert.equal(clipboardAction(key('a', { ctrlKey: true })), null);
  assert.equal(clipboardAction(key('f', { ctrlKey: true })), null);
  assert.equal(clipboardAction(key('p', { ctrlKey: true })), null);
  assert.equal(clipboardAction(key('v')), null);
  assert.equal(clipboardAction(null), null);
});

test('AltGr chords never look like a clipboard action', () => {
  // AltGr is reported as Ctrl+Alt and types characters on many layouts.
  assert.equal(clipboardAction(key('v', { ctrlKey: true, altKey: true })), null);
  assert.equal(clipboardAction(key('c', { ctrlKey: true, altKey: true })), null);
});

test('holding a key down is one attempt, not many', () => {
  assert.equal(clipboardAction(key('c', { ctrlKey: true, repeat: true })), null);
  assert.equal(isClipboardChord(key('c', { ctrlKey: true, repeat: true })), false);
  assert.equal(isClipboardChord(key('c', { ctrlKey: true })), true);
});

test('the shortcut is reported the way the student pressed it', () => {
  assert.equal(clipboardShortcut(key('c', { ctrlKey: true })), 'Ctrl+C');
  assert.equal(clipboardShortcut(key('v', { metaKey: true })), 'Cmd+V');
  assert.equal(clipboardShortcut(key('Insert', { shiftKey: true })), 'Shift+Insert');
});

/* -------------------------------------------------------------- fullscreen */

const screen = { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040 };

test('a window that covers the screen counts as fullscreen', () => {
  assert.equal(isFullWindow({ outerWidth: 1920, outerHeight: 1080, screen }), true);
  assert.equal(isFullWindow({ outerWidth: 1904, outerHeight: 1040, screen }), true);
});

test('a normal window is not fullscreen', () => {
  assert.equal(isFullWindow({ outerWidth: 1280, outerHeight: 800, screen }), false);
  assert.equal(isFullWindow({ outerWidth: 0, outerHeight: 0, screen }), false);
  assert.equal(isFullWindow({ outerWidth: 1920, outerHeight: 1080 }), false);
});

test('the fullscreen API is fullscreen', () => {
  assert.equal(detectFullscreen({ document: { fullscreenElement: {} }, outerWidth: 800, outerHeight: 600, screen }), true);
});

test('F11 is fullscreen even though fullscreenElement stays null', () => {
  // This is the case that used to look like leaving fullscreen.
  const win = { document: { fullscreenElement: null }, outerWidth: 1920, outerHeight: 1080, screen };
  assert.equal(detectFullscreen(win), true);
});

test('a windowed browser is not fullscreen', () => {
  const win = { document: { fullscreenElement: null }, outerWidth: 1000, outerHeight: 700, screen };
  assert.equal(detectFullscreen(win), false);
});

test('no browser globals means no fullscreen, never a crash', () => {
  assert.equal(detectFullscreen({}), false);
  assert.equal(isFullWindow({}), false);
});
