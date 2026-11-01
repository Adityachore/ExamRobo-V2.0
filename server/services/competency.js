// The competency model: the skills taxonomy, the difficulty scale and the
// rules that validate them.
//
// The taxonomy is reference data - the rows live in the `skills` table and are
// seeded by migration 004. This module owns the *rules*: how a skill code is
// written, how a difficulty is read, and what a difficulty is called. The
// API, the tests and the admin UI all go through here, so they cannot drift
// apart.

export const CATEGORIES = [
  'Aptitude',
  'Logic',
  'Grammar',
  'Frontend',
  'Backend',
  'Full Stack',
  'Cybersecurity',
  'Cyber Security',
  'Digital Marketing',
  'On-Field Marketing',
  'Business & Data Analyst',
  'WordPress',
  'AI',
  'AI and ML',
  'LLM',
  'Prompt Engineering',
  'Machine Learning',
  'DevOps',
];

// 1 to 5. The labels are what the admin UI and the result pages show.
export const DIFFICULTIES = {
  1: { label: 'Foundation', tone: 'ok' },
  2: { label: 'Easy', tone: 'ok' },
  3: { label: 'Medium', tone: 'blue' },
  4: { label: 'Hard', tone: 'warn' },
  5: { label: 'Expert', tone: 'danger' },
};

export const DIFFICULTY_LEVELS = Object.keys(DIFFICULTIES).map(Number);
export const DEFAULT_DIFFICULTY = 3;

export function difficultyLabel(level) {
  return DIFFICULTIES[Number(level)]?.label || DIFFICULTIES[DEFAULT_DIFFICULTY].label;
}

// The difficulty scale as the API hands it to a client: a list, so the client
// does not have to hard-code the levels.
export function difficultyScale() {
  return DIFFICULTY_LEVELS.map((level) => ({ level, label: DIFFICULTIES[level].label }));
}

// A skill code is a machine key: lowercase, digits and underscores, starting
// with a letter. "React Frontend" becomes "react_frontend".
export function normalizeSkillCode(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

export function validateSkillCode(code) {
  if (!code) return 'Skill code is required.';
  if (code.length > 60) return 'Skill code is too long (60 characters max).';
  if (!/^[a-z][a-z0-9_]*$/.test(code)) {
    return 'Skill code must start with a letter and use lowercase letters, digits and underscores.';
  }
  return null;
}

export function validateSkillName(name) {
  const value = String(name ?? '').trim();
  if (!value) return 'Skill name is required.';
  if (value.length > 120) return 'Skill name is too long (120 characters max).';
  return null;
}

export function validateDifficulty(value) {
  if (value === null || value === undefined || value === '') return null;
  const level = Number(value);
  if (!Number.isInteger(level) || level < 1 || level > 5) {
    return 'Difficulty must be a whole number from 1 (foundation) to 5 (expert).';
  }
  return null;
}

export function normalizeDifficulty(value) {
  if (value === null || value === undefined || value === '') return DEFAULT_DIFFICULTY;
  return Number(value);
}

// A skill row as the API returns it.
export function skillView(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    description: row.description || null,
    question_count: Number(row.question_count || 0),
  };
}
