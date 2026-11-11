import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { q, pool } from '../db.js';
import { applyTaxonomy, migrate } from './migrate.js';

// Seed data for development and for the ported smoke test. The dev mock kept
// this in memory; here it is real rows the API reads.

export const ADMIN = { email: 'admin@examrobo.dev', password: 'admin123' };
export const STUDENTS = [
  { email: 'student@example.com', name: 'Student One' },
  { email: 'john.doe@example.com', name: 'John Doe' },
];

// Every question carries the skill it measures and how hard it is.
const BANK = [
  {
    category: 'Aptitude',
    skill: 'quantitative_reasoning',
    difficulty: 1,
    stem: 'A train travels 120 km in 90 minutes. What is its average speed in km/h?',
    options: ['60', '80', '90', '100'],
    correct: 1,
  },
  {
    category: 'Aptitude',
    skill: 'quantitative_reasoning',
    difficulty: 1,
    stem: 'If 3 pens cost 45 rupees, how much do 7 pens cost in rupees?',
    options: ['95', '105', '110', '115'],
    correct: 1,
  },
  {
    category: 'Aptitude',
    skill: 'quantitative_reasoning',
    difficulty: 2,
    stem: 'What is 15 percent of 240?',
    options: ['24', '30', '36', '40'],
    correct: 2,
  },
  {
    category: 'Aptitude',
    skill: 'quantitative_reasoning',
    difficulty: 2,
    stem: 'A rectangle has a perimeter of 36 cm and a length of 11 cm. What is its width in cm?',
    options: ['6', '7', '8', '9'],
    correct: 1,
  },
  {
    category: 'Logic',
    skill: 'logical_reasoning',
    difficulty: 2,
    stem: 'All roses are flowers. Some flowers fade quickly. Which statement must be true?',
    options: [
      'All roses fade quickly',
      'Some roses are flowers',
      'No roses fade quickly',
      'All flowers are roses',
    ],
    correct: 1,
  },
  {
    category: 'Logic',
    skill: 'pattern_recognition',
    difficulty: 1,
    stem: 'If North is turned to East, which way is South?',
    options: ['East', 'West', 'North', 'South'],
    correct: 1,
  },
  {
    category: 'Logic',
    skill: 'pattern_recognition',
    difficulty: 3,
    stem: 'Which number comes next: 2, 6, 12, 20, 30?',
    options: ['36', '40', '42', '44'],
    correct: 2,
  },
  {
    category: 'Frontend',
    skill: 'html_css',
    difficulty: 1,
    stem: 'Which HTML element is used for the largest heading on a page?',
    options: ['<h1>', '<h6>', '<head>', '<title>'],
    correct: 0,
  },
  {
    category: 'Frontend',
    skill: 'html_css',
    difficulty: 2,
    stem: 'Which CSS property changes the spacing outside an element?',
    options: ['padding', 'margin', 'border', 'display'],
    correct: 1,
  },
  {
    category: 'Frontend',
    skill: 'javascript_core',
    difficulty: 1,
    stem: 'Which JavaScript method returns a promise?',
    options: ['parseInt', 'fetch', 'typeof', 'push'],
    correct: 1,
  },
];

// Each logical question gets a second, equivalent variant so the paper
// builder has something to randomise.
const VARIANT_SUFFIX = [
  ' (pick the closest match)',
  ' (choose one answer)',
  ' (single correct option)',
];

async function truncate() {
  await q(
    `TRUNCATE proctor_events, feedback, answers, warnings, recordings, papers,
             paper_questions, flags, tickets, roster_emails, question_variants, questions,
             exam_events, admins CASCADE`,
  );
}

// The skills the seed uses. The taxonomy is seeded by migration 004, so a
// missing skill means the database is behind: the seed says so instead of
// quietly creating untagged questions.
async function skillIds(codes) {
  const { rows } = await q(`SELECT code, id FROM skills WHERE code = ANY($1::text[])`, [codes]);
  const map = new Map(rows.map((r) => [r.code, r.id]));
  const missing = codes.filter((c) => !map.has(c));
  if (missing.length) {
    throw new Error(
      `the skills taxonomy is missing (${missing.join(', ')}). Run the migrations first.`,
    );
  }
  return map;
}

export async function seedDatabase({
  offsetSec = 2,
  durationMin = 60,
  eventName = 'ExamRobo Certification Run',
  config = { Aptitude: 3, Logic: 3, Frontend: 3 },
  reset = true,
} = {}) {
  // The seed needs the current schema: the questions it writes carry a skill
  // and a difficulty, and the taxonomy it points at lives in a migration.
  await migrate();

  if (reset) await truncate();

  // The truncate follows the foreign keys down to the skills table, so the
  // taxonomy has to come back before the questions can point at it.
  await applyTaxonomy();

  const { rows: institutions } = await q(
    `SELECT id FROM institutions WHERE slug = 'pararobo' AND is_internal`,
  );
  if (!institutions.length) throw new Error('the legacy ParaRobo institution is missing');
  const institutionId = institutions[0].id;

  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
  const hash = await bcrypt.hash(ADMIN.password, rounds);
  const { rows: admins } = await q(
    `INSERT INTO admins (email, password_hash, name, institution_id) VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING id, email, name`,
    [ADMIN.email, hash, 'Exam Admin', institutionId],
  );

  const skills = await skillIds([...new Set(BANK.map((b) => b.skill))]);

  for (const item of BANK) {
    const { rows: questions } = await q(
      `INSERT INTO questions (category, skill_id, difficulty, institution_id)
       VALUES ($1,$2,$3,$4)
       RETURNING id, category`,
      [item.category, skills.get(item.skill), item.difficulty, institutionId],
    );
    const question = questions[0];
    await q(
      `INSERT INTO question_variants (question_id, stem, options, correct_idx, institution_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [question.id, item.stem, item.options, item.correct, institutionId],
    );
    await q(
      `INSERT INTO question_variants (question_id, stem, options, correct_idx, institution_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [question.id, `${item.stem}${VARIANT_SUFFIX[0]}`, item.options, item.correct, institutionId],
    );
  }

  const startsAt = new Date(Date.now() + offsetSec * 1000);
  // A seeded paper must exercise the sequential section engine, so the event
  // gets one limit per category. The default 60-minute window is split evenly;
  // a legacy event without limits falls back to a single deadline.
  const categories = Object.keys(config);
  const baseMinutes = Math.max(1, Math.floor(durationMin / Math.max(1, categories.length)));
  const remainder = durationMin % Math.max(1, categories.length);
  const sectionLimits = Object.fromEntries(
    categories.map((category, index) => [
      category,
      Math.max(1, baseMinutes + (index < remainder ? 1 : 0)),
    ]),
  );
  const { rows: events } = await q(
    `INSERT INTO exam_events
       (name, starts_at, duration_min, categories, question_counts, section_limits, created_by, institution_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      eventName,
      startsAt,
      durationMin,
      categories,
      config,
      sectionLimits,
      admins[0].id,
      institutionId,
    ],
  );
  const event = events[0];

  for (const student of STUDENTS) {
    await q(
      `INSERT INTO roster_emails (event_id, email, name, institution_id) VALUES ($1,$2,$3,$4)
       ON CONFLICT (event_id, email) DO UPDATE SET name = EXCLUDED.name`,
      [event.id, student.email, student.name, institutionId],
    );
  }

  return {
    eventId: event.id,
    startsAt: event.starts_at,
    admin: ADMIN,
    students: STUDENTS,
    config,
  };
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const offsetArg = process.argv.find((a) => a.startsWith('--offset-sec='));
  const offsetSec = offsetArg ? Number(offsetArg.split('=')[1]) : 2;
  seedDatabase({ offsetSec })
    .then((info) => {
      console.log(`seeded event ${info.eventId} starting at ${info.startsAt.toISOString()}`);
      console.log(`admin    ${info.admin.email} / ${info.admin.password}`);
      info.students.forEach((s) => console.log(`student  ${s.email}`));
    })
    .catch((err) => {
      console.error('seed failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
