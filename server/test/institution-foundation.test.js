import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(here, '..');
const read = (p) => fs.readFileSync(path.join(serverRoot, p), 'utf8');

const TENANT_TABLES = [
  'admins',
  'exam_events',
  'roster_emails',
  'skills',
  'questions',
  'question_variants',
  'papers',
  'paper_sections',
  'answers',
  'paper_questions',
  'warnings',
  'recordings',
  'flags',
  'tickets',
  'feedback',
  'proctor_events',
  'admin_actions',
  'paper_attempt_history',
];

function createTable(sql, table) {
  const match = sql.match(new RegExp(`CREATE TABLE ${table}\\s*\\(([\\s\\S]*?)\\n\\);`, 'i'));
  assert.ok(match, `CREATE TABLE ${table} was not found`);
  return match[1];
}

test('migration 014 adds a nullable tenant key to every tenant table', () => {
  const migration = read('sql/migrations/014_institution_foundation.sql');
  for (const table of TENANT_TABLES) {
    assert.match(
      migration,
      new RegExp(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS institution_id uuid;`),
      `migration 014 does not add institution_id to ${table}`,
    );
  }
});

test('migration 014 is expand-only', () => {
  const migration = read('sql/migrations/014_institution_foundation.sql');
  const sql = migration.replace(/--.*$/gm, '');
  assert.doesNotMatch(sql, /SET NOT NULL/i);
  assert.doesNotMatch(sql, /ROW LEVEL SECURITY/i);
  assert.match(sql, /RAISE EXCEPTION 'migration 014: unmapped tenant rows remain/);
});

test('migration 014 creates the legacy institution and composite keys', () => {
  const migration = read('sql/migrations/014_institution_foundation.sql');
  assert.match(migration, /'00000000-0000-4000-8000-000000000001'/);
  assert.match(migration, /'pararobo'/);
  assert.match(migration, /idx_papers_institution_event/);
  assert.match(migration, /idx_questions_institution_source_key/);
});

test('schema.sql mirrors the institution foundation', () => {
  const schema = read('sql/schema.sql');
  for (const table of ['institutions', 'institution_contacts', 'tenant_domains']) {
    assert.match(schema, new RegExp(`CREATE TABLE ${table} \\(`), `schema.sql is missing ${table}`);
  }
  for (const table of [...TENANT_TABLES, 'institution_contacts', 'tenant_domains']) {
    assert.match(
      createTable(schema, table),
      /\binstitution_id uuid\b/,
      `schema.sql does not give ${table} an institution_id`,
    );
  }
});

test('the taxonomy and backfill write the institution key', () => {
  assert.match(read('sql/taxonomy.sql'), /institution_id[\s\S]*slug = 'pararobo'/);
  assert.match(read('sql/backfill.sql'), /INSERT INTO paper_questions[\s\S]*institution_id/);
});

test('the seed writes the legacy tenant key to every row it inserts', () => {
  const seed = read('scripts/seed.js');
  for (const table of ['admins', 'exam_events', 'roster_emails', 'questions', 'question_variants']) {
    assert.match(seed, new RegExp(`INSERT INTO ${table}[^;]*institution_id`), `seed misses ${table}`);
  }
});
