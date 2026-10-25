import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, buildVariantIds } from '../services/paper.js';

// Minimal fake db layer: buildVariantIds only uses q() for one query.
import * as db from '../db.js';

const event = {
  id: 'evt-1',
  duration_min: 30,
  categories: ['aptitude'],
  question_counts: { aptitude: 3 },
};

function fakeQuestions() {
  // 4 logical questions, each with 3 variants
  const rows = [];
  for (let question = 1; question <= 4; question++) {
    for (let v = 1; v <= 3; v++) {
      rows.push({ id: `q${question}-v${v}`, question_id: `q${question}` });
    }
  }
  return rows;
}

test('shuffle keeps all elements', () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input);
  assert.deepEqual([...out].sort((a, b) => a - b), input);
});

test('buildVariantIds picks one variant per logical question, respecting counts', async () => {
  db.pool.query = async () => ({ rows: fakeQuestions() });
  const ids = await buildVariantIds(event);
  assert.equal(ids.length, 3);
  const questions = new Set(ids.map((id) => id.split('-')[0]));
  assert.equal(questions.size, 3, 'one variant per logical question');
});

test('buildVariantIds throws when bank is too small', async () => {
  db.pool.query = async () => ({ rows: fakeQuestions().slice(0, 3) });
  await assert.rejects(
    () => buildVariantIds({ ...event, question_counts: { aptitude: 5 } }),
    /needs 5 questions, only 1 available/,
  );
});

test('buildVariantIds throws on empty bank', async () => {
  db.pool.query = async () => ({ rows: [] });
  await assert.rejects(() => buildVariantIds(event), /no questions for category/);
});

test('different rng seeds produce orders (randomization smoke)', async () => {
  db.pool.query = async () => ({ rows: fakeQuestions() });
  let seed = 1;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const orders = new Set();
  for (let i = 0; i < 20; i++) orders.add((await buildVariantIds(event, rng)).join(','));
  assert.ok(orders.size > 1, 'multiple distinct orderings observed');
});
