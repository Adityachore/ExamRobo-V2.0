import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeMany } from '../services/grading.js';
import * as db from '../db.js';

// The grader joins papers.variant_ids (0-based positions, the same convention
// as answers.qno) with unnest(...) WITH ORDINALITY (1-based). If the ordinal is
// not shifted down by one, every answer is compared with the key of the
// PREVIOUS question and the last question is never scored.
//
// The fake database below emulates Postgres: the ordinality starts at 1 and the
// shift is read back from the SQL, so removing the shift breaks these tests.

const PAPER_ID = '11111111-1111-1111-1111-111111111111';

const VARIANT_IDS = ['v0', 'v1', 'v2'];
const KEYS = [0, 1, 2]; // the correct option of every variant

function installFakeDb(answers) {
  db.pool.query = async (sql) => {
    if (/correct_idx/.test(sql)) {
      // shift = -1 -> the query aligns the 1-based ordinality with the
      // 0-based answers.qno
      const shift = /ord\.n::int\s*-\s*1/.test(sql) ? -1 : 0;
      return {
        rows: VARIANT_IDS.map((vid, i) => ({
          paper_id: PAPER_ID,
          qno: i + 1 + shift,
          correct_idx: KEYS[i],
          category: 'Logic',
        })),
      };
    }
    if (/FROM answers/.test(sql)) {
      return {
        rows: answers.map((a) => ({ paper_id: PAPER_ID, qno: a.qno, choice: a.choice })),
      };
    }
    return { rows: [] };
  };
}

test('a fully correct paper gets the full score', async () => {
  installFakeDb([
    { qno: 0, choice: 0 },
    { qno: 1, choice: 1 },
    { qno: 2, choice: 2 },
  ]);
  const out = await gradeMany([{ id: PAPER_ID }]);
  const g = out.get(PAPER_ID);
  assert.equal(g.total, 3, 'every answer must be graded against its own question');
  assert.equal(g.max, 3);
  assert.equal(g.sections[0].score, 3);
});

test('a wrong answer costs exactly one point', async () => {
  installFakeDb([
    { qno: 0, choice: 3 }, // wrong
    { qno: 1, choice: 1 }, // right
    { qno: 2, choice: 2 }, // right
  ]);
  const out = await gradeMany([{ id: PAPER_ID }]);
  const g = out.get(PAPER_ID);
  assert.equal(g.total, 2);
  assert.equal(g.max, 3);
});

test('the last question is graded too', async () => {
  installFakeDb([
    { qno: 0, choice: 0 },
    { qno: 1, choice: 1 },
    { qno: 2, choice: 0 }, // the key of the last variant is 2
  ]);
  const out = await gradeMany([{ id: PAPER_ID }]);
  assert.equal(out.get(PAPER_ID).total, 2);
});

test('an unanswered question scores nothing', async () => {
  installFakeDb([{ qno: 1, choice: 1 }]);
  const out = await gradeMany([{ id: PAPER_ID }]);
  const g = out.get(PAPER_ID);
  assert.equal(g.total, 1);
  assert.equal(g.max, 3, 'the maximum must still count every question');
});
