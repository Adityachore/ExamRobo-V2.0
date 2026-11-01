// The domain selection rules (R-015): services/domains.js.
//
// These are pure checks - no database. The parts that need a database (a paper
// freezing its domains, the event accepting a selection) are covered by the
// smoke test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DOMAIN_MODES,
  domainConfig,
  domainRules,
  plannedCategories,
  plannedQuestionCount,
  validateSelection,
} from '../services/domains.js';
import { CATEGORIES } from '../services/competency.js';

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

// A domain-aware event: the common part is always in, the student picks one
// of two technical domains.
const selectEvent = {
  domain_mode: 'select',
  domain_rules: { common: ['Aptitude', 'Logic'], allowed: ['Frontend', 'Backend'], min: 1, max: 1 },
  question_counts: { Aptitude: 5, Logic: 5, Frontend: 10, Backend: 8, AI: 4 },
  categories: ['Aptitude', 'Logic', 'Frontend', 'Backend', 'AI'],
};

// A classic event: everybody gets the same questions.
const fixedEvent = {
  domain_mode: 'fixed',
  domain_rules: {},
  question_counts: { Aptitude: 5, Logic: 5 },
  categories: ['Aptitude', 'Logic'],
};

/* ------------------------------------------------------------------- the rules */

test('a fixed event has no domain selection at all', () => {
  const rules = domainRules(fixedEvent);
  assert.equal(rules.mode, DOMAIN_MODES.FIXED);
  assert.deepEqual(rules.allowed, []);
  assert.equal(domainConfig(fixedEvent).enabled, false);
});

test('a broken configuration degrades to the safest reading, never to a crash', () => {
  assert.equal(domainRules(null).mode, DOMAIN_MODES.FIXED);
  assert.equal(domainRules({}).mode, DOMAIN_MODES.FIXED);
  assert.equal(domainRules({ domain_mode: 'nonsense' }).mode, DOMAIN_MODES.FIXED);
  assert.equal(domainRules({ domain_mode: 'select', domain_rules: 'nonsense' }).mode, DOMAIN_MODES.SELECT);
  assert.deepEqual(domainRules({ domain_mode: 'select', domain_rules: [] }).allowed, []);
});

test('the rules of a domain-aware event are read as configured', () => {
  const rules = domainRules(selectEvent);
  assert.equal(rules.mode, DOMAIN_MODES.SELECT);
  assert.deepEqual(rules.common, ['Aptitude', 'Logic']);
  assert.deepEqual(rules.allowed, ['Frontend', 'Backend']);
  assert.equal(rules.min, 1);
  assert.equal(rules.max, 1);
});

test('a domain without a question count cannot be offered', () => {
  // AI has a count but is not in the allowed list; Frontend without a count
  // would have nothing to put in the paper.
  const event = {
    ...selectEvent,
    question_counts: { Aptitude: 5, Logic: 5, Frontend: 0, Backend: 8 },
  };
  const rules = domainRules(event);
  assert.deepEqual(rules.allowed, ['Backend'], 'Frontend has no questions, so it is not offered');
});

test('a category cannot be common and selectable at the same time', () => {
  const event = {
    ...selectEvent,
    domain_rules: { common: ['Aptitude', 'Logic', 'Frontend'], allowed: ['Frontend', 'Backend'], min: 1, max: 1 },
  };
  const rules = domainRules(event);
  assert.ok(!rules.allowed.includes('Frontend'), 'a common category is not selectable');
  assert.ok(rules.common.includes('Frontend'));
});

test('the maximum can never be smaller than the minimum', () => {
  const event = {
    ...selectEvent,
    domain_rules: { common: ['Aptitude'], allowed: ['Frontend', 'Backend', 'AI'], min: 3, max: 1 },
  };
  const rules = domainRules(event);
  assert.equal(rules.max, rules.min, 'the maximum is raised to the minimum');
});

test('the maximum can never be larger than the number of selectable domains', () => {
  const event = {
    ...selectEvent,
    domain_rules: { common: ['Aptitude'], allowed: ['Frontend', 'Backend'], min: 1, max: 9 },
  };
  assert.equal(domainRules(event).max, 2);
});

/* ------------------------------------------------------------- the selection */

test('a valid selection is accepted', () => {
  const result = validateSelection(selectEvent, ['Frontend']);
  assert.equal(result.ok, true);
  assert.deepEqual(result.selected, ['Frontend']);
});

test('a selection is refused when nothing was chosen', () => {
  const result = validateSelection(selectEvent, []);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'domains_required');
});

test('a selection is refused when it is not a domain of the event', () => {
  const result = validateSelection(selectEvent, ['Frontend', 'WordPress']);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'unknown_domain');
});

test('a selection is refused when the same domain is chosen twice', () => {
  const result = validateSelection(selectEvent, ['Frontend', 'Frontend']);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'duplicate_domain');
});

test('a selection is refused when it is too short or too long', () => {
  const event = {
    ...selectEvent,
    domain_rules: { common: ['Aptitude'], allowed: ['Frontend', 'Backend', 'AI'], min: 2, max: 2 },
    question_counts: { Aptitude: 5, Frontend: 4, Backend: 4, AI: 4 },
  };
  const short = validateSelection(event, ['Frontend']);
  assert.equal(short.ok, false);
  assert.equal(short.code, 'too_few_domains');
  const long = validateSelection(event, ['Frontend', 'Backend', 'AI']);
  assert.equal(long.ok, false);
  assert.equal(long.code, 'too_many_domains');
  assert.equal(validateSelection(event, ['Frontend', 'Backend']).ok, true);
});

test('a fixed event ignores the selection - there is nothing to choose', () => {
  const result = validateSelection(fixedEvent, ['Frontend']);
  assert.equal(result.ok, true);
  assert.deepEqual(result.selected, []);
});

/* ----------------------------------------------------------------- the paper */

test('the paper of a selection holds the common part plus the chosen domains', () => {
  assert.deepEqual(plannedCategories(selectEvent, ['Frontend']), ['Aptitude', 'Logic', 'Frontend']);
  assert.equal(plannedQuestionCount(selectEvent, ['Frontend']), 20); // 5 + 5 + 10
  assert.equal(plannedQuestionCount(selectEvent, ['Backend']), 18); // 5 + 5 + 8
});

test('a fixed event holds the categories of the event', () => {
  assert.deepEqual(plannedCategories(fixedEvent, []), ['Aptitude', 'Logic']);
  assert.equal(plannedQuestionCount(fixedEvent, []), 10);
});

test('the order of the domains is the same for every student', () => {
  // The sections of two papers of one exam must read the same, whichever
  // order the student clicked the domains in. The order is the order of the
  // allowed list, never the order of the clicks.
  const event = {
    ...selectEvent,
    domain_rules: { common: ['Aptitude'], allowed: ['Frontend', 'Backend'], min: 1, max: 2 },
  };
  assert.deepEqual(plannedCategories(event, ['Backend', 'Frontend']), ['Aptitude', 'Frontend', 'Backend']);
  assert.deepEqual(plannedCategories(event, ['Frontend', 'Backend']), ['Aptitude', 'Frontend', 'Backend']);
});

/* ------------------------------------------------------------ what the client sees */

test('the client is told what it may choose and what a choice is worth', () => {
  const config = domainConfig(selectEvent);
  assert.equal(config.enabled, true);
  assert.deepEqual(config.common, [
    { code: 'Aptitude', name: 'Aptitude', count: 5 },
    { code: 'Logic', name: 'Logic', count: 5 },
  ]);
  assert.deepEqual(config.allowed, [
    { code: 'Frontend', name: 'Frontend', count: 10 },
    { code: 'Backend', name: 'Backend', count: 8 },
  ]);
  assert.equal(config.min, 1);
  assert.equal(config.max, 1);
});

/* -------------------------------------------------------------- the categories */

test('the technical domains of the project are the categories of the model', () => {
  const common = ['Aptitude', 'Logic'];
  const technical = CATEGORIES.filter((c) => !common.includes(c));
  assert.equal(technical.length, 16, 'sixteen technical domains the student may pick');
});

/* ----------------------------------------------------------------- the migration */

const migration = read('../sql/migrations/005_domain_selection.sql');
const schema = read('../sql/schema.sql');

test('the migration is idempotent, because it is re-applied on every boot', () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS domain_mode/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS domain_rules/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS selected_categories/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS category/);
});

test('the fresh-install schema mirrors the migration', () => {
  assert.match(schema, /domain_mode text NOT NULL DEFAULT 'fixed'/);
  assert.match(schema, /domain_rules jsonb NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(schema, /selected_categories text\[\]/);
  assert.match(schema, /category text/);
});

test('the selection of an event is frozen with the paper', () => {
  // The chosen domains and the domain of every question are frozen, so a
  // re-tagged question never rewrites an exam that already ran.
  assert.match(migration, /ALTER TABLE papers ADD COLUMN IF NOT EXISTS selected_categories text\[\]/);
  assert.match(migration, /ALTER TABLE paper_questions ADD COLUMN IF NOT EXISTS category text/);
});
