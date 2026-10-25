// The competency model: the rules in services/competency.js and the shape of
// the reference data that ships with the project.
//
// These are pure checks - no database. The parts that need a database (a paper
// freezing its competency, the filters) are covered by the smoke test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CATEGORIES,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  DIFFICULTY_LEVELS,
  difficultyLabel,
  difficultyScale,
  normalizeDifficulty,
  normalizeSkillCode,
  skillView,
  validateDifficulty,
  validateSkillCode,
  validateSkillName,
} from '../services/competency.js';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

/* ------------------------------------------------------------ the categories */

test('the categories are a fixed, unique, non-empty list', () => {
  assert.ok(CATEGORIES.length > 0);
  assert.equal(new Set(CATEGORIES).size, CATEGORIES.length);
  for (const c of CATEGORIES) {
    assert.equal(typeof c, 'string');
    assert.ok(c.trim().length > 0);
  }
});

/* --------------------------------------------------------- the difficulty scale */

test('the difficulty scale is 1 to 5', () => {
  assert.deepEqual(DIFFICULTY_LEVELS, [1, 2, 3, 4, 5]);
  assert.equal(DEFAULT_DIFFICULTY, 3);
  for (const level of DIFFICULTY_LEVELS) {
    assert.ok(DIFFICULTIES[level].label, `level ${level} has a label`);
    assert.ok(DIFFICULTIES[level].tone, `level ${level} has a tone`);
  }
});

test('a difficulty has a human label, and an unknown one falls back to the default', () => {
  assert.equal(difficultyLabel(1), 'Foundation');
  assert.equal(difficultyLabel(5), 'Expert');
  assert.equal(difficultyLabel(3), DIFFICULTIES[3].label);
  assert.equal(difficultyLabel(99), DIFFICULTIES[DEFAULT_DIFFICULTY].label);
  assert.equal(difficultyLabel(null), DIFFICULTIES[DEFAULT_DIFFICULTY].label);
});

test('the scale is handed to a client as a list, so no client hard-codes it', () => {
  const scale = difficultyScale();
  assert.equal(scale.length, 5);
  assert.deepEqual(scale[0], { level: 1, label: 'Foundation' });
  assert.deepEqual(scale[4], { level: 5, label: 'Expert' });
});

test('a difficulty is validated as a whole number from 1 to 5', () => {
  assert.equal(validateDifficulty(1), null);
  assert.equal(validateDifficulty(5), null);
  assert.equal(validateDifficulty('3'), null);
  assert.equal(validateDifficulty(''), null, 'an empty value means "not set", not an error');
  assert.equal(validateDifficulty(null), null);
  assert.equal(validateDifficulty(undefined), null);
  assert.ok(validateDifficulty(0));
  assert.ok(validateDifficulty(6));
  assert.ok(validateDifficulty(3.5));
  assert.ok(validateDifficulty('hard'));
});

test('an unset difficulty becomes the default', () => {
  assert.equal(normalizeDifficulty(undefined), DEFAULT_DIFFICULTY);
  assert.equal(normalizeDifficulty(null), DEFAULT_DIFFICULTY);
  assert.equal(normalizeDifficulty(''), DEFAULT_DIFFICULTY);
  assert.equal(normalizeDifficulty('4'), 4);
  assert.equal(normalizeDifficulty(5), 5);
});

/* ------------------------------------------------------------- the skill code */

test('a skill code is normalised into a machine key', () => {
  assert.equal(normalizeSkillCode('React Frontend'), 'react_frontend');
  assert.equal(normalizeSkillCode('  SQL / DB  '), 'sql_db');
  assert.equal(normalizeSkillCode('Threat-Modelling'), 'threat_modelling');
  assert.equal(normalizeSkillCode('ai__evaluation'), 'ai_evaluation');
  assert.equal(normalizeSkillCode('!!!'), '');
  assert.equal(normalizeSkillCode(null), '');
});

test('a skill code is bounded, so it can be a key and a URL segment', () => {
  assert.equal(normalizeSkillCode('a'.repeat(80)).length, 60);
});

test('a skill code has to start with a letter and use lower case', () => {
  assert.equal(validateSkillCode('react_frontend'), null);
  assert.equal(validateSkillCode('seo2'), null);
  assert.ok(validateSkillCode(''));
  assert.ok(validateSkillCode('1st_place'), 'a code cannot start with a digit');
  assert.ok(validateSkillCode('React'), 'a code is lower case');
  assert.ok(validateSkillCode('react-frontend'), 'a code uses underscores, not dashes');
  assert.ok(validateSkillCode('a'.repeat(61)), 'a code is at most 60 characters');
});

test('a skill needs a name', () => {
  assert.equal(validateSkillName('Pattern Recognition'), null);
  assert.ok(validateSkillName(''));
  assert.ok(validateSkillName('   '));
  assert.ok(validateSkillName('x'.repeat(121)));
});

test('a skill row always has the same shape', () => {
  const v = skillView({ id: 'i', code: 'c', name: 'n', category: 'cat' });
  assert.equal(v.question_count, 0, 'the count defaults to zero');
  assert.equal(v.description, null);
  assert.equal(skillView({ ...v, question_count: '3' }).question_count, 3);
});

/* ---------------------------------------------------------- the taxonomy file */

const taxonomy = read('../sql/taxonomy.sql');
const taxonomyRows = [...taxonomy.matchAll(/\(\s*'([a-z0-9_]+)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'([^']+)'\s*,/g)].map((m) => ({
  code: m[1],
  name: m[2].replace(/''/g, "'"),
  category: m[3],
}));

test('the taxonomy file holds a skill per category and no more', () => {
  assert.ok(taxonomyRows.length >= CATEGORIES.length, 'every category has at least one skill');
  const covered = new Set(taxonomyRows.map((r) => r.category));
  for (const c of CATEGORIES) assert.ok(covered.has(c), `the taxonomy covers ${c}`);
  for (const c of covered) assert.ok(CATEGORIES.includes(c), `${c} is a known category`);
});

test('the skill codes in the taxonomy are unique and well formed', () => {
  const codes = taxonomyRows.map((r) => r.code);
  assert.equal(new Set(codes).size, codes.length, 'no duplicate codes');
  for (const r of taxonomyRows) {
    assert.equal(validateSkillCode(r.code), null, `${r.code} is a valid code`);
    assert.ok(r.name.trim().length > 0, `${r.code} has a name`);
  }
});

test('the taxonomy is re-appliable, so a boot never breaks it', () => {
  assert.match(taxonomy, /ON CONFLICT \(code\) DO NOTHING/);
});

/* ------------------------------------------------------------- the migration */

const migration = read('../sql/migrations/004_bank_competency.sql');
const schema = read('../sql/schema.sql');

test('the migration is idempotent, because it is re-applied on every boot', () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS skill_id/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS difficulty/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS skills/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS paper_questions/);
  assert.match(migration, /DROP CONSTRAINT IF EXISTS questions_difficulty_check/);
});

test('the seed data lives in the taxonomy file, not in the migration', () => {
  // A TRUNCATE ... CASCADE follows the foreign keys down to the skills table,
  // so the taxonomy has to be a file that can be re-applied on its own.
  assert.doesNotMatch(migration, /INSERT INTO skills/);
});

test('the fresh-install schema mirrors the migration', () => {
  assert.match(schema, /CREATE TABLE skills \(/);
  assert.match(schema, /CREATE TABLE paper_questions \(/);
  assert.match(schema, /skill_id uuid REFERENCES skills\(id\) ON DELETE SET NULL/);
  assert.match(schema, /difficulty int NOT NULL DEFAULT 3 CHECK \(difficulty BETWEEN 1 AND 5\)/);
  assert.match(schema, /skill_code text/);
});

test('the difficulty is bounded by the database, not only by the API', () => {
  assert.match(migration, /CHECK \(difficulty BETWEEN 1 AND 5\)/);
  assert.match(schema, /CHECK \(difficulty BETWEEN 1 AND 5\)/);
  // The migration names the constraint so it can drop and re-add it; the
  // schema lets Postgres name it the same way (questions_difficulty_check).
  assert.match(migration, /CONSTRAINT questions_difficulty_check/);
});

test('a question keeps its competency when its skill is deleted', () => {
  // ON DELETE SET NULL: the question survives, it just stops being tagged.
  assert.match(migration, /REFERENCES skills\(id\) ON DELETE SET NULL/);
  assert.match(schema, /REFERENCES skills\(id\) ON DELETE SET NULL/);
});
