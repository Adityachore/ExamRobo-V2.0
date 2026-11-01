import test from 'node:test';
import assert from 'node:assert/strict';
import { activeSection, mergeSectionState, sectionViewOf } from '../services/sections.js';

const now = Date.parse('2026-01-01T12:00:00.000Z');
const row = (overrides = {}) => ({
  paper_id: 'paper-1',
  position: 0,
  category: 'Aptitude',
  limit_min: 5,
  started_at: null,
  ends_at: null,
  completed_at: null,
  ...overrides,
});

test('an unstarted section is locked', () => {
  const view = sectionViewOf(row(), now);
  assert.equal(view.state, 'locked');
  assert.equal(view.locked, true);
  assert.equal(view.remaining_sec, null);
});

test('a started section with time left is active', () => {
  const view = sectionViewOf(
    row({
      started_at: '2026-01-01T11:59:00.000Z',
      ends_at: '2026-01-01T12:04:00.000Z',
    }),
    now,
  );
  assert.equal(view.state, 'active');
  assert.equal(view.locked, false);
  assert.equal(view.remaining_sec, 240);
});

test('an expired section is locked at zero remaining time', () => {
  const view = sectionViewOf(
    row({
      started_at: '2026-01-01T11:50:00.000Z',
      ends_at: '2026-01-01T11:55:00.000Z',
    }),
    now,
  );
  assert.equal(view.state, 'expired');
  assert.equal(view.locked, true);
  assert.equal(view.remaining_sec, 0);
});

test('a completed section stays completed even if its deadline has passed', () => {
  const view = sectionViewOf(
    row({
      started_at: '2026-01-01T11:50:00.000Z',
      ends_at: '2026-01-01T11:55:00.000Z',
      completed_at: '2026-01-01T11:52:00.000Z',
    }),
    now,
  );
  assert.equal(view.state, 'completed');
  assert.equal(view.locked, true);
});

test('only a started, unfinished, unexpired section is active', () => {
  const rows = [
    row({ position: 0, category: 'Aptitude', completed_at: '2026-01-01T11:59:00.000Z' }),
    row({ position: 1, category: 'Logic', started_at: '2026-01-01T11:59:00.000Z', ends_at: '2026-01-01T12:04:00.000Z' }),
    row({ position: 2, category: 'Frontend' }),
  ];
  assert.equal(activeSection(rows, now)?.category, 'Logic');
});

test('mergeSectionState attaches the timing to the manifest section', () => {
  const merged = mergeSectionState(
    [{ name: 'Aptitude', questions: [] }, { name: 'Logic', questions: [] }],
    [row({ category: 'Aptitude', started_at: '2026-01-01T11:59:00.000Z', ends_at: '2026-01-01T12:04:00.000Z' })],
    now,
  );
  assert.equal(merged[0].timing.state, 'active');
  assert.equal(merged[1].timing, null);
});
