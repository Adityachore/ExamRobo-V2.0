import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResultsVisibility, resultsState } from '../services/results.js';

const NOW = Date.parse('2026-01-10T12:00:00.000Z');
const event = (overrides = {}) => ({
  results_visibility: 'manual',
  results_published_at: null,
  results_expires_at: null,
  ...overrides,
});

test('an unknown visibility falls back to manual', () => {
  assert.equal(normalizeResultsVisibility('nope'), 'manual');
  assert.equal(normalizeResultsVisibility(undefined), 'manual');
  assert.equal(normalizeResultsVisibility('immediate'), 'immediate');
});

test('immediate results are visible without a publication', () => {
  const state = resultsState(event({ results_visibility: 'immediate' }), { now: NOW });
  assert.equal(state.available, true);
  assert.equal(state.code, null);
});

test('manual results stay hidden until the exam team publishes them', () => {
  const state = resultsState(event(), { now: NOW });
  assert.equal(state.available, false);
  assert.equal(state.status, 409);
  assert.equal(state.code, 'results_not_published');
});

test('manual results expire at the end of the result window', () => {
  const published = event({
    results_published_at: '2026-01-10T10:00:00.000Z',
    results_expires_at: '2026-01-10T11:00:00.000Z',
  });
  const state = resultsState(published, { now: NOW });
  assert.equal(state.available, false);
  assert.equal(state.status, 403);
  assert.equal(state.code, 'results_expired');
  assert.equal(state.expired, true);
});

test('manual results without an expiry stay visible', () => {
  const state = resultsState(
    event({ results_published_at: '2026-01-10T10:00:00.000Z' }),
    { now: NOW },
  );
  assert.equal(state.available, true);
  assert.equal(state.code, null);
});

test('never hides results even after a publish', () => {
  const state = resultsState(
    event({
      results_visibility: 'never',
      results_published_at: '2026-01-10T10:00:00.000Z',
    }),
    { now: NOW },
  );
  assert.equal(state.available, false);
  assert.equal(state.status, 403);
  assert.equal(state.code, 'results_unavailable');
});

test('after_all_submitted waits for every paper', () => {
  const pending = resultsState(
    event({ results_visibility: 'after_all_submitted' }),
    { totalPapers: 3, submittedPapers: 2, now: NOW },
  );
  assert.equal(pending.available, false);
  assert.equal(pending.code, 'results_not_published');
  assert.equal(pending.all_submitted, false);
  assert.equal(pending.total_papers, 3);

  const complete = resultsState(
    event({ results_visibility: 'after_all_submitted' }),
    { totalPapers: 3, submittedPapers: 3, now: NOW },
  );
  assert.equal(complete.available, true);
  assert.equal(complete.all_submitted, true);
});

test('after_all_submitted has no papers left to wait for in an empty event', () => {
  const state = resultsState(
    event({ results_visibility: 'after_all_submitted' }),
    { totalPapers: 0, submittedPapers: 0, now: NOW },
  );
  assert.equal(state.available, true);
  assert.equal(state.all_submitted, true);
});
