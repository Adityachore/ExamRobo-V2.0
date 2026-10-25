// Concurrency detection: a reload must not look like a second window, and a
// second device must not be counted twice.
import test from 'node:test';
import assert from 'node:assert/strict';
import { addClient, concurrencySignal, reapSameSession, studentClients } from '../services/live.js';

// A websocket stand-in: live.js registers a 'close' handler that removes the
// client from the registry, so the fake has to fire it too.
function fakeSocket() {
  const handlers = {};
  return {
    closed: false,
    on(event, fn) {
      handlers[event] = fn;
    },
    close(code, reason) {
      if (this.closed) return;
      this.closed = true;
      this.closeCode = code;
      this.closeReason = reason;
      handlers.close?.();
    },
  };
}

test('two connections from one sign-in are a second window', () => {
  const signal = concurrencySignal([
    { sid: 'sid-a', tab: 'tab-1' },
    { sid: 'sid-a', tab: 'tab-2' },
  ]);
  assert.equal(signal.kind, 'second_window');
});

test('two sign-ins are a second device', () => {
  const signal = concurrencySignal([
    { sid: 'sid-a', tab: 'tab-1' },
    { sid: 'sid-b', tab: 'tab-2' },
  ]);
  assert.equal(signal.kind, 'second_session');
});

test('the two signals never both apply', () => {
  // A second device that also has two tabs is still reported once, as the
  // stronger signal. Counting both would spend two warning strikes on one
  // mistake.
  const signal = concurrencySignal([
    { sid: 'sid-a', tab: 'tab-1' },
    { sid: 'sid-b', tab: 'tab-2' },
    { sid: 'sid-b', tab: 'tab-3' },
  ]);
  assert.equal(signal.kind, 'second_session');
});

test('the reap closes the stale socket of the same tab only', () => {
  const email = 'reap-test@example.com';
  const sameTab = fakeSocket();
  const otherTab = fakeSocket();
  const otherEmail = fakeSocket();

  addClient(sameTab, 'student', email, 'sid-a', 'tab-1');
  addClient(otherTab, 'student', email, 'sid-a', 'tab-2');
  addClient(otherEmail, 'student', 'someone-else@example.com', 'sid-z', 'tab-1');

  const reaped = reapSameSession(email, 'tab-1');
  assert.equal(reaped, 1);
  assert.equal(sameTab.closed, true, 'the stale socket of the same tab must be closed');
  assert.equal(otherTab.closed, false, 'a second tab must survive');
  assert.equal(otherEmail.closed, false, 'another account must survive');

  // Clean up so the module state does not leak into the other tests.
  for (const c of studentClients(email)) c.ws.close?.();
  for (const c of studentClients('someone-else@example.com')) c.ws.close?.();
});

test('a second tab of the same browser is not reaped', () => {
  const email = 'tabs-test@example.com';
  const tabOne = fakeSocket();
  const tabTwo = fakeSocket();

  addClient(tabOne, 'student', email, 'sid-a', 'tab-1');
  addClient(tabTwo, 'student', email, 'sid-a', 'tab-2');

  const reaped = reapSameSession(email, 'tab-1');
  assert.equal(reaped, 1, 'only the socket of that one tab is reaped');
  assert.equal(tabOne.closed, true, 'the reloaded tab is closed');
  assert.equal(tabTwo.closed, false, 'the other tab must survive');
});
