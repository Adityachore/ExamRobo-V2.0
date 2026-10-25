import test from 'node:test';
import assert from 'node:assert/strict';
import { createLockout } from '../services/lockout.js';

test('allows attempts under the max', () => {
  const l = createLockout({ max: 3 });
  assert.equal(l.check('a@x.com', '1').locked, false);
  l.fail('a@x.com', '1');
  l.fail('a@x.com', '1');
  const r = l.fail('a@x.com', '1');
  assert.equal(r.locked, true);
  assert.equal(r.attemptsLeft, 0);
});

test('locks after max failures and unlocks after window', () => {
  let t = 0;
  const l = createLockout({ max: 3, windowMs: 1000, now: () => t });
  for (let i = 0; i < 3; i++) l.fail('a@x.com', '1');
  assert.equal(l.check('a@x.com', '1').locked, true);
  t = 1001;
  assert.equal(l.check('a@x.com', '1').locked, false);
});

test('success resets the counter', () => {
  const l = createLockout({ max: 3 });
  l.fail('a@x.com', '1');
  l.fail('a@x.com', '1');
  l.reset('a@x.com', '1');
  assert.equal(l.check('a@x.com', '1').attemptsLeft, 3);
});

test('ip separation', () => {
  const l = createLockout({ max: 1 });
  l.fail('a@x.com', '1');
  assert.equal(l.check('a@x.com', '1').locked, true);
  assert.equal(l.check('a@x.com', '2').locked, false);
});
