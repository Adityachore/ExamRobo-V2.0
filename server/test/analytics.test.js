import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, cohortOf, competencyByPaper } from '../services/analytics.js';
import * as db from '../db.js';

// The results analytics read the competency the paper FROZE (paper_questions),
// not the questions as they are today. The fake database below returns the
// rows that query would return, so the aggregation can be tested without a
// database.

const PAPER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_PAPER_ID = '22222222-2222-2222-2222-222222222222';

function row(overrides = {}) {
  return {
    paper_id: PAPER_ID,
    qno: 0,
    skill_code: 'logical_reasoning',
    skill_name: 'Logical Reasoning',
    skill_category: 'Logic',
    difficulty: 3,
    answered: true,
    is_correct: true,
    ...overrides,
  };
}

function installFakeDb(rows) {
  db.pool.query = async (sql) => {
    if (/FROM paper_questions/.test(sql)) return { rows };
    return { rows: [] };
  };
}

test('a skill counts every question of the paper', () => {
  const out = summarize([
    row(),
    row({ qno: 1 }),
    row({ qno: 2, is_correct: false }),
  ]);
  assert.equal(out.skills.length, 1);
  const skill = out.skills[0];
  assert.equal(skill.code, 'logical_reasoning');
  assert.equal(skill.name, 'Logical Reasoning');
  assert.equal(skill.category, 'Logic');
  assert.equal(skill.total, 3);
  assert.equal(skill.answered, 3);
  assert.equal(skill.correct, 2);
  assert.equal(skill.accuracy, 66.7);
});

test('an unanswered question is not a wrong answer', () => {
  const out = summarize([row(), row({ qno: 1, answered: false, is_correct: false })]);
  const skill = out.skills[0];
  assert.equal(skill.total, 2, 'the question is still part of the exam');
  assert.equal(skill.answered, 1, 'but the student never answered it');
  assert.equal(skill.correct, 1);
  assert.equal(skill.accuracy, 50);
});

test('a question with no skill is counted separately', () => {
  const out = summarize([row(), row({ qno: 1, skill_code: null, skill_name: null, skill_category: null })]);
  assert.equal(out.skills.length, 2);
  const untagged = out.skills.find((s) => s.code === null);
  assert.equal(untagged.name, 'Not tagged');
  assert.equal(untagged.total, 1);
  assert.equal(untagged.correct, 1);
});

test('the difficulty scale follows the question, not the order', () => {
  const out = summarize([
    row({ difficulty: 1 }),
    row({ qno: 1, difficulty: 5 }),
    row({ qno: 2, difficulty: 1, is_correct: false }),
  ]);
  assert.deepEqual(out.difficulties.map((d) => d.level), [1, 5]);
  assert.equal(out.difficulties[0].label, 'Foundation');
  assert.equal(out.difficulties[0].total, 2);
  assert.equal(out.difficulties[0].correct, 1);
  assert.equal(out.difficulties[1].label, 'Expert');
});

test('the cohort adds the papers up and puts the weak skill first', () => {
  const first = summarize([row(), row({ qno: 1, is_correct: false })]);
  const second = summarize([row({ skill_code: 'html_css', skill_name: 'HTML & CSS', skill_category: 'Frontend' })]);
  const cohort = cohortOf(
    new Map([
      [PAPER_ID, first],
      [OTHER_PAPER_ID, second],
    ]),
  );
  assert.equal(cohort.skills.length, 2);
  assert.equal(cohort.skills[0].code, 'logical_reasoning', '50% is weaker than 100%');
  assert.equal(cohort.skills[0].total, 2);
  assert.equal(cohort.skills[0].correct, 1);
  assert.equal(cohort.skills[1].code, 'html_css');
  assert.equal(cohort.skills[1].accuracy, 100);
});

test('every paper of the scope comes back in one query', async () => {
  let calls = 0;
  db.pool.query = async (sql) => {
    calls += 1;
    if (/FROM paper_questions/.test(sql)) {
      return {
        rows: [
          row(),
          row({ paper_id: OTHER_PAPER_ID, skill_code: 'html_css', skill_name: 'HTML & CSS', skill_category: 'Frontend' }),
        ],
      };
    }
    return { rows: [] };
  };
  const map = await competencyByPaper([PAPER_ID, OTHER_PAPER_ID]);
  assert.equal(calls, 1, 'the scope is asked for once, not once per paper');
  assert.equal(map.size, 2);
  assert.equal(map.get(PAPER_ID).skills[0].code, 'logical_reasoning');
  assert.equal(map.get(OTHER_PAPER_ID).skills[0].code, 'html_css');
});

test('an empty scope asks nothing', async () => {
  let calls = 0;
  db.pool.query = async () => {
    calls += 1;
    return { rows: [] };
  };
  const map = await competencyByPaper([]);
  assert.equal(calls, 0);
  assert.equal(map.size, 0);
});
