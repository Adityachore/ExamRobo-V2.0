import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertScratchDatabase,
  createScratchDatabase,
  dropScratchDatabase,
  isScratchName,
} from '../scripts/scratch-db.mjs';

const ADMIN_URL = 'postgres://examrobo:examrobo@127.0.0.1:1/postgres';

test('only _smoke and _test database names are scratch databases', () => {
  assert.equal(isScratchName('examrobo_smoke'), true);
  assert.equal(isScratchName('examrobo_test'), true);
  assert.equal(isScratchName('examrobo'), false);
  assert.equal(isScratchName('examrobo_smoke_live'), false);
  assert.equal(isScratchName(null), false);
});

test('assertScratchDatabase rejects a live database URL', () => {
  assert.throws(
    () => assertScratchDatabase('postgres://examrobo:examrobo@127.0.0.1:5450/examrobo'),
    (err) => err.code === 'NOT_SCRATCH_DB',
  );
});

test('createScratchDatabase refuses a non-scratch name before connecting', async () => {
  await assert.rejects(
    createScratchDatabase({ adminUrl: ADMIN_URL, name: 'examrobo' }),
    (err) => err.code === 'NOT_SCRATCH_DB',
  );
});

test('dropScratchDatabase refuses a non-scratch name before connecting', async () => {
  await assert.rejects(
    dropScratchDatabase({ adminUrl: ADMIN_URL, name: 'examrobo' }),
    (err) => err.code === 'NOT_SCRATCH_DB',
  );
});
