import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INTEGRITY_KINDS,
  REPORTABLE_KINDS,
  SERVER_ONLY_KINDS,
  TIERS,
  evaluate,
  isClientReportable,
  isKnownKind,
  kindInfo,
} from '../services/integrity.js';
import { MAX_WARNINGS, SUBMIT_REASONS } from '../services/sessions.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(here, '..');
const read = (p) => fs.readFileSync(path.join(serverRoot, p), 'utf8');

/* ---------------------------------------------------------------- registry */

test('every kind has a tier, a label and a reason', () => {
  for (const [kind, info] of Object.entries(INTEGRITY_KINDS)) {
    assert.ok(info.tier, `${kind} has no tier`);
    assert.ok([TIERS.WARN, TIERS.LOG].includes(info.tier), `${kind} has an unknown tier`);
    assert.ok(info.label?.length, `${kind} has no label`);
    assert.ok(info.reason?.length, `${kind} has no reason`);
  }
});

test('the tiers are the ones the policy states', () => {
  const tier = (kind) => kindInfo(kind).tier;
  // capture and recording are warnings for review, not instant endings
  assert.equal(tier('screenshot_key'), TIERS.WARN);
  assert.equal(tier('recording_revoked'), TIERS.WARN);
  // warnings accumulate and the last one submits the paper
  for (const k of ['tab_blur', 'fullscreen_exit', 'clipboard', 'context_menu', 'print', 'second_window', 'second_session', 'display_change']) {
    assert.equal(tier(k), TIERS.WARN, `${k} should warn`);
  }
  // recorded, never penalised
  assert.equal(tier('devtools'), TIERS.LOG);
  assert.equal(tier('share_surface'), TIERS.LOG);
  assert.equal(tier('os_chord'), TIERS.LOG);
});

test('unknown kinds are rejected', () => {
  assert.equal(isKnownKind('tab_blur'), true);
  assert.equal(isKnownKind('nonsense'), false);
  assert.equal(isKnownKind(''), false);
  // prototype keys must not pass
  assert.equal(isKnownKind('toString'), false);
  assert.equal(isKnownKind('constructor'), false);
});

/* --------------------------------------------------------------- decisions */

test('a capture kind warns on the first occurrence', () => {
  const d = evaluate('screenshot_key', 0);
  assert.equal(d.ok, true);
  assert.equal(d.action, 'warn');
  assert.equal(d.warnings, 1);
});

test('a capture kind still warns below the limit', () => {
  assert.equal(evaluate('recording_revoked', 1).action, 'warn');
});

test('the warning that reaches the limit submits the exam', () => {
  assert.equal(evaluate('tab_blur', 0).action, 'warn');
  assert.equal(evaluate('tab_blur', 0).warnings, 1);
  assert.equal(evaluate('tab_blur', 1).warnings, 2);
  const third = evaluate('tab_blur', MAX_WARNINGS - 1);
  assert.equal(third.action, 'submit');
  assert.equal(third.warnings, MAX_WARNINGS);
  assert.equal(evaluate('tab_blur', MAX_WARNINGS + 10).action, 'submit');
});

test('a log kind never changes the warning count', () => {
  const d = evaluate('devtools', 2);
  assert.equal(d.action, 'log');
  assert.equal(d.warnings, 2);
});

test('a network gap is logged and never warned', () => {
  assert.equal(kindInfo('network_gap').tier, TIERS.LOG);
  const d = evaluate('network_gap', 2);
  assert.equal(d.action, 'log');
  assert.equal(d.warnings, 2);
});

test('an unknown kind is ignored', () => {
  const d = evaluate('nope', 0);
  assert.equal(d.ok, false);
  assert.equal(d.action, 'ignore');
});

/* --------------------------------------------------- database consistency */

// The SQL that belongs to one table: the CREATE TABLE block in schema.sql,
// the ALTER statements in a migration.

// The list of values a CHECK constraint allows for one column. The lists
// never contain parentheses, so the first ")" after "IN (" ends the list.
function allowedValues(sql, column) {
  const match = sql.match(new RegExp(`CHECK\\s*\\(\\s*${column}\\s+IN\\s*\\(([^)]*)\\)`, 'i'));
  assert.ok(match, `the ${column} CHECK was not found`);
  return [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
}

// The constraint the database actually has after every migration ran.
// Migrations are re-applied on every boot, in file-name order, and a later
// migration can replace a constraint an earlier one created. So the last
// file that mentions the constraint wins.
function effectiveAllowedValues(table, column) {
  const migrationsDir = path.join(serverRoot, 'sql', 'migrations');
  const files = [
    'sql/schema.sql',
    ...fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => `sql/migrations/${f}`),
  ];
  let effective = null;
  for (const file of files) {
    const sql = read(file);
    const fresh = sql.match(new RegExp(`CREATE TABLE ${table}\\s*\\(([\\s\\S]*?)\\n\\);`, 'i'));
    const list = fresh
      ? allowedValues(fresh[1], column)
      : (sql.match(new RegExp(`ALTER TABLE ${table}\\b`, 'i')) ? tryAllowedValues(sql, column) : null);
    if (list) effective = list;
  }
  assert.ok(effective, `no constraint for ${table}.${column} was found`);
  return effective;
}

// The same as allowedValues, but returns null instead of throwing when the
// statement does not mention the column.
function tryAllowedValues(sql, column) {
  const match = sql.match(new RegExp(`CHECK\\s*\\(\\s*${column}\\s+IN\\s*\\(([^)]*)\\)`, 'i'));
  return match ? [...match[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]) : null;
}

test('the database accepts every kind the policy can produce', () => {
  const allowed = effectiveAllowedValues('proctor_events', 'kind');
  for (const kind of REPORTABLE_KINDS) {
    assert.ok(allowed.includes(kind), `the database does not allow the kind "${kind}"`);
  }
});

test('the database accepts the integrity_lockout submit reason', () => {
  const reasons = effectiveAllowedValues('papers', 'submit_reason');
  assert.ok(reasons.includes('integrity_lockout'), 'the database does not allow integrity_lockout');
  for (const r of SUBMIT_REASONS) {
    assert.ok(reasons.includes(r), `the database does not allow the submit reason "${r}"`);
  }
});

test('migration 002 is idempotent', () => {
  const sql = read('sql/migrations/002_integrity_hardening.sql');
  assert.match(sql, /ADD COLUMN IF NOT EXISTS lock_reason/);
  assert.match(sql, /ADD COLUMN IF NOT EXISTS detail/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS/);
});

test('migration 003 is idempotent', () => {
  // It is re-applied on every boot, so every statement has to be safe to run
  // again on a database that already has the column and the constraint.
  const sql = read('sql/migrations/003_exam_integrity_v2.sql');
  assert.match(sql, /ADD COLUMN IF NOT EXISTS fullscreen_state/);
  assert.match(sql, /DROP CONSTRAINT IF EXISTS proctor_events_kind_check/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS idx_papers_started/);
});

test('the fullscreen state is stored on the paper', () => {
  assert.match(read('sql/schema.sql'), /fullscreen_state boolean/);
});

test('migration 006 is idempotent', () => {
  const sql = read('sql/migrations/006_integrity_delivery.sql');
  assert.match(sql, /ADD COLUMN IF NOT EXISTS last_seen_at/);
  assert.match(sql, /ADD COLUMN IF NOT EXISTS client_event_id/);
  assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS idx_warnings_client_event/);
  assert.match(sql, /DROP CONSTRAINT IF EXISTS proctor_events_kind_check/);
});

/* --------------------------------------------------------- reported kinds */

test('the reportable kinds are exactly the registered kinds', () => {
  assert.deepEqual([...REPORTABLE_KINDS].sort(), Object.keys(INTEGRITY_KINDS).sort());
});

test('concurrency signals are server-only', () => {
  for (const kind of SERVER_ONLY_KINDS) {
    assert.equal(isKnownKind(kind), true, `${kind} is not registered`);
    assert.equal(isClientReportable(kind), false, `${kind} must not be client-reportable`);
  }
  assert.equal(isClientReportable('tab_blur'), true);
  assert.equal(isClientReportable('screenshot_key'), true);
  assert.equal(isClientReportable('nonsense'), false);
});
