import test from 'node:test';
import assert from 'node:assert/strict';
import { paperDuration, paperMinuteRange } from '../services/event-config.js';

const selectEvent = {
  domain_mode: 'select',
  domain_rules: { common: ['Aptitude', 'Logic'], allowed: ['Frontend', 'Backend'], min: 1, max: 1 },
  question_counts: { Aptitude: 5, Logic: 5, Frontend: 10, Backend: 8 },
  categories: ['Aptitude', 'Logic', 'Frontend', 'Backend'],
  section_limits: { Aptitude: 10, Logic: 5, Frontend: 20, Backend: 30 },
  duration_min: 60,
};

const fixedEvent = {
  domain_mode: 'fixed',
  domain_rules: {},
  question_counts: { Aptitude: 5, Logic: 5 },
  categories: ['Aptitude', 'Logic'],
  section_limits: { Aptitude: 8, Logic: 12 },
  duration_min: 30,
};

test('a fixed paper uses every section limit', () => {
  assert.equal(paperDuration(fixedEvent), 20);
});

test('a select paper uses the common sections plus the chosen domain', () => {
  assert.equal(paperDuration(selectEvent, ['Frontend']), 35);
  assert.equal(paperDuration(selectEvent, ['Backend']), 45);
});

test('the event window is independent of the paper deadlines', () => {
  const range = paperMinuteRange(selectEvent);
  assert.deepEqual(range, { min: 35, max: 45 });
  assert.equal(selectEvent.duration_min, 60);
  assert.equal(paperDuration(selectEvent, ['Backend']), 45);
  assert.equal(fixedEvent.duration_min, 30);
  assert.equal(paperDuration(fixedEvent), 20);
});

test('a legacy event without section limits keeps its stored duration', () => {
  const legacy = {
    domain_mode: 'fixed',
    question_counts: { Aptitude: 5 },
    categories: ['Aptitude'],
    duration_min: 40,
  };
  assert.equal(paperDuration(legacy), 40);
});
