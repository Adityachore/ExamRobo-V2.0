import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { pool, q } from '../db.js';

// Applies every server/sql/migrations/*.sql once, in filename order.
// schema.sql only runs on a fresh volume (initdb), so an existing database
// needs these migrations to catch up.
//
// The order matters:
//   1. the migrations        - the schema
//   2. the taxonomy          - reference data (sql/taxonomy.sql). It is
//      applied after them because a TRUNCATE ... CASCADE follows the foreign
//      keys from the questions down to the skills table, so the taxonomy has
//      to be re-appliable on its own.
//   3. the backfill          - the frozen competency of the papers that ran
//      before the taxonomy existed (sql/backfill.sql). It runs last because
//      it reads the skill code from the skills table.
const DIR = path.join(process.cwd(), 'sql', 'migrations');
const TAXONOMY = path.join(process.cwd(), 'sql', 'taxonomy.sql');
const BACKFILL = path.join(process.cwd(), 'sql', 'backfill.sql');
const LOCK_KEY = 823471205;
const LEGACY_SECTIONS = 'paper_sections_target_legacy';
const BRIDGE_MARKER = 'target_sections_v1';
const BASELINE_FILES = new Set([
  '001_flags_event_id.sql',
  '002_integrity_hardening.sql',
  '003_exam_integrity_v2.sql',
  '004_bank_competency.sql',
  '005_domain_selection.sql',
  '006_integrity_delivery.sql',
]);
const TARGET_PROCTOR_KINDS = [
  'started',
  'submitted',
  'tab_blur',
  'fullscreen_exit',
  'message',
  'clipboard',
  'context_menu',
  'print',
  'screenshot_key',
  'recording_revoked',
  'second_window',
  'second_session',
  'display_change',
  'devtools',
  'share_surface',
  'os_chord',
  'locked',
  'network_gap',
  'resumed',
  'retried',
];

export async function applyTaxonomy() {
  const sql = await fs.readFile(TAXONOMY, 'utf8');
  await q(sql);
}

export async function applyBackfill() {
  const sql = await fs.readFile(BACKFILL, 'utf8');
  await q(sql);
}

const checksum = (sql) => crypto.createHash('sha256').update(sql).digest('hex');

const positiveInt = (value) => Number.isInteger(value) && value > 0;

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

async function tableColumns(client, table) {
  const { rows } = await client.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return new Set(rows.map((row) => row.column_name));
}

async function relationExists(client, name) {
  const { rows } = await client.query(`SELECT to_regclass($1) AS relation`, [`public.${name}`]);
  return !!rows[0]?.relation;
}

async function bridgeState(client) {
  const targetColumns = await tableColumns(client, 'paper_sections');
  const legacy = await relationExists(client, LEGACY_SECTIONS);
  const canonical = await relationExists(client, 'paper_sections');
  const marked = await client.query(`SELECT 1 FROM schema_bridge WHERE name = $1`, [BRIDGE_MARKER]);
  return {
    target: targetColumns.has('idx') && !targetColumns.has('position'),
    mixed: targetColumns.has('idx') && targetColumns.has('position'),
    legacy,
    canonical,
    complete: marked.rows.length > 0,
  };
}

async function verifyBaseline(client) {
  const columns = [
    ['flags', 'event_id'],
    ['papers', 'lock_reason'],
    ['warnings', 'detail'],
    ['papers', 'fullscreen_state'],
    ['questions', 'skill_id'],
    ['questions', 'difficulty'],
    ['paper_questions', 'skill_id'],
    ['paper_questions', 'skill_code'],
    ['paper_questions', 'difficulty'],
    ['paper_questions', 'category'],
    ['exam_events', 'domain_mode'],
    ['exam_events', 'domain_rules'],
    ['papers', 'selected_categories'],
    ['papers', 'last_seen_at'],
    ['papers', 'source'],
    ['warnings', 'source'],
    ['warnings', 'client_event_id'],
  ];
  const tables = [...new Set(columns.map(([table]) => table))];
  const tableSet = new Set(tables);
  const { rows } = await client.query(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [tables],
  );
  const found = new Set(rows.map((row) => `${row.table_name}.${row.column_name}`));
  const issues = [];
  for (const [table, column] of columns) {
    if (!found.has(`${table}.${column}`)) issues.push(`missing column ${table}.${column}`);
  }
  for (const table of tableSet) {
    if (!rows.some((row) => row.table_name === table)) issues.push(`missing table ${table}`);
  }

  const indexes = [
    'idx_flags_event',
    'idx_warnings_paper_kind',
    'idx_papers_started',
    'idx_paper_questions_skill',
    'idx_paper_questions_difficulty',
    'idx_questions_skill',
    'idx_warnings_client_event',
    'idx_papers_last_seen',
  ];
  const indexRows = await client.query(
    `SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = ANY($1)`,
    [indexes],
  );
  const foundIndexes = new Set(indexRows.rows.map((row) => row.indexname));
  for (const index of indexes) {
    if (!foundIndexes.has(index)) issues.push(`missing index ${index}`);
  }
  return issues;
}

async function adoptBaseline(client, files, digests) {
  for (const file of files) {
    if (!BASELINE_FILES.has(file)) continue;
    const digest = digests.get(file);
    await client.query(
      `INSERT INTO schema_migrations (filename, checksum)
       VALUES ($1, $2)
       ON CONFLICT (filename) DO UPDATE SET checksum = EXCLUDED.checksum`,
      [file, digest],
    );
  }
}

function optionOrderIssue(value) {
  if (!Array.isArray(value)) return 'option_orders is not an array';
  for (let qno = 0; qno < value.length; qno++) {
    const order = value[qno];
    if (order === null) continue;
    if (!Array.isArray(order)) return `option_orders[${qno}] is not an array`;
    const seen = new Set();
    for (const choice of order) {
      if (!Number.isInteger(choice) || choice < 0 || choice > 3) {
        return `option_orders[${qno}] has an invalid option index`;
      }
      if (seen.has(choice)) return `option_orders[${qno}] repeats an option index`;
      seen.add(choice);
    }
  }
  return null;
}

function pushIssue(issues, message) {
  if (issues.length < 20) issues.push(message);
  else if (issues.length === 20) issues.push('... more issues were omitted');
}

async function validateTargetData(client) {
  const issues = [];

  const eventRows = await client.query(
    `SELECT id, name, module_minutes, categories, domain_mode, domain_rules
       FROM exam_events`,
  );
  const limitsByEvent = new Map();
  for (const event of eventRows.rows) {
    const limits = {};
    if (!isPlainObject(event.module_minutes)) {
      pushIssue(issues, `event ${event.id} (${event.name}) has malformed module_minutes`);
    } else {
      for (const [category, minutes] of Object.entries(event.module_minutes)) {
        if (!category.trim() || !positiveInt(minutes)) {
          pushIssue(
            issues,
            `event ${event.id} (${event.name}) has an invalid module limit for "${category}"`,
          );
          continue;
        }
        limits[category] = minutes;
      }
    }
    limitsByEvent.set(event.id, limits);
  }

  const paperRows = await client.query(
    `SELECT p.id, p.email, p.event_id, p.option_orders,
            COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'position', s.idx,
                  'category', s.category,
                  'minutes', s.minutes,
                  'qcount', s.qcount,
                  'started_at', s.started_at,
                  'ends_at', s.ends_at,
                  'finished_at', s.finished_at
                )
                ORDER BY s.idx
              ) FILTER (WHERE s.paper_id IS NOT NULL),
              '[]'::jsonb
            ) AS sections
       FROM papers p
       LEFT JOIN paper_sections s ON s.paper_id = p.id
      GROUP BY p.id`,
  );

  for (const paper of paperRows.rows) {
    const orderIssue = optionOrderIssue(paper.option_orders);
    if (orderIssue) {
      pushIssue(issues, `paper ${paper.id} (${paper.email}) ${orderIssue}`);
    }

    const sections = Array.isArray(paper.sections) ? paper.sections : [];
    if (!sections.length) continue;

    const positions = new Set();
    const categories = new Set();
    const limits = limitsByEvent.get(paper.event_id) || {};
    for (const section of sections) {
      if (!Number.isInteger(section.position) || section.position < 0) {
        pushIssue(issues, `paper ${paper.id} (${paper.email}) has an invalid section position`);
      } else if (positions.has(section.position)) {
        pushIssue(issues, `paper ${paper.id} (${paper.email}) repeats a section position`);
      } else {
        positions.add(section.position);
      }
      if (!String(section.category || '').trim()) {
        pushIssue(issues, `paper ${paper.id} (${paper.email}) has an empty section category`);
      } else if (categories.has(section.category)) {
        pushIssue(
          issues,
          `paper ${paper.id} (${paper.email}) repeats section "${section.category}"`,
        );
      } else {
        categories.add(section.category);
        if (!positiveInt(limits[section.category])) {
          pushIssue(
            issues,
            `paper ${paper.id} (${paper.email}) has no event time limit for "${section.category}"`,
          );
        }
      }
      if (!positiveInt(section.minutes)) {
        pushIssue(issues, `paper ${paper.id} (${paper.email}) has an invalid section time limit`);
      }
      if (!positiveInt(section.qcount)) {
        pushIssue(issues, `paper ${paper.id} (${paper.email}) has an invalid section question count`);
      }
    }
    const sorted = [...positions].sort((a, b) => a - b);
    for (let index = 0; index < sorted.length; index++) {
      if (sorted[index] !== index) {
        pushIssue(
          issues,
          `paper ${paper.id} (${paper.email}) has non-contiguous section positions`,
        );
        break;
      }
    }
  }

  const countRows = await client.query(
    `SELECT s.paper_id, s.category, s.qcount,
            (SELECT count(*)::int
               FROM paper_questions pq
              WHERE pq.paper_id = s.paper_id AND pq.category = s.category) AS actual
       FROM paper_sections s`,
  );
  for (const row of countRows.rows) {
    if (row.qcount !== row.actual) {
      pushIssue(
        issues,
        `paper ${row.paper_id} section "${row.category}" says ${row.qcount} questions but has ${row.actual}`,
      );
    }
  }

  return issues;
}

async function validateProctorKinds(client) {
  const { rows } = await client.query(
    `SELECT DISTINCT kind FROM proctor_events
      WHERE kind IS NULL OR NOT (kind = ANY($1))`,
    [TARGET_PROCTOR_KINDS],
  );
  if (rows.length) {
    return rows.map((row) => String(row.kind));
  }
  return [];
}

function bridgeFailure(title, issues) {
  return new Error(`${title}:\n- ${issues.join('\n- ')}`);
}

async function prepareTargetBridge(client, files, digests) {
  const state = await bridgeState(client);
  if (state.complete) return;
  if (state.mixed) {
    throw new Error('paper_sections has both target and canonical columns; refusing to guess.');
  }
  if (!state.target && !state.legacy) return;

  if (state.target && state.legacy) {
    throw new Error(
      `Both paper_sections and ${LEGACY_SECTIONS} exist; refusing to overwrite either.`,
    );
  }

  if (state.target) {
    const baselineIssues = await verifyBaseline(client);
    if (baselineIssues.length) {
      throw bridgeFailure('target database verification failed', baselineIssues);
    }
    const dataIssues = await validateTargetData(client);
    if (dataIssues.length) {
      throw bridgeFailure('target exam data cannot be migrated safely', dataIssues);
    }
    const proctorIssues = await validateProctorKinds(client);
    if (proctorIssues.length) {
      throw bridgeFailure(
        'target proctor events contain unknown kinds',
        proctorIssues.map((kind) => `unknown proctor event kind "${kind}"`),
      );
    }

    await client.query('BEGIN');
    try {
      await adoptBaseline(client, files, digests);
      await client.query(`UPDATE proctor_events SET kind = 'restarted' WHERE kind = 'retried'`);
      await client.query(`ALTER TABLE paper_sections RENAME TO ${LEGACY_SECTIONS}`);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }
}

async function syncTargetLimits(client) {
  const columns = await tableColumns(client, 'exam_events');
  if (!columns.has('module_minutes') || !columns.has('section_limits')) return;

  await client.query(
    `UPDATE exam_events
        SET section_limits = module_minutes
      WHERE section_limits = '{}'::jsonb
        AND module_minutes <> '{}'::jsonb`,
  );

  const { rows } = await client.query(
    `SELECT id, name
       FROM exam_events
      WHERE module_minutes <> '{}'::jsonb
        AND section_limits IS DISTINCT FROM module_minutes`,
  );
  if (rows.length) {
    throw bridgeFailure(
      'target section limits conflict with the canonical limits',
      rows.map((row) => `event ${row.id} (${row.name}) has different module_minutes`),
    );
  }
}

async function copyLegacySections(client) {
  await client.query(
    `INSERT INTO paper_sections
       (paper_id, position, category, limit_min, started_at, ends_at, completed_at)
     SELECT paper_id, idx, category, minutes, started_at, ends_at, finished_at
       FROM ${LEGACY_SECTIONS}
     ON CONFLICT DO NOTHING`,
  );

  const { rows } = await client.query(
    `SELECT l.paper_id, l.category, l.idx
       FROM ${LEGACY_SECTIONS} l
       LEFT JOIN paper_sections c
         ON c.paper_id = l.paper_id AND c.category = l.category
      WHERE c.paper_id IS NULL
         OR c.position <> l.idx
         OR c.limit_min <> l.minutes
         OR c.started_at IS DISTINCT FROM l.started_at
         OR c.ends_at IS DISTINCT FROM l.ends_at
         OR c.completed_at IS DISTINCT FROM l.finished_at
      LIMIT 20`,
  );
  if (rows.length) {
    throw bridgeFailure(
      'the copied paper sections do not match the target data',
      rows.map((row) => `paper ${row.paper_id} section ${row.category} (position ${row.idx})`),
    );
  }
}

async function preserveTargetPublication(client) {
  const columns = await tableColumns(client, 'exam_events');
  if (!columns.has('results_published') || !columns.has('results_published_at')) return;
  await client.query(
    `UPDATE exam_events
        SET results_published = true
      WHERE results_visibility = 'manual'
        AND results_published_at IS NOT NULL
        AND results_published = false`,
  );
}

async function completeTargetBridge(client) {
  const state = await bridgeState(client);
  if (state.complete || !state.legacy) return false;
  if (!state.canonical) {
    throw new Error(`Target sections exist in ${LEGACY_SECTIONS} but paper_sections was not created.`);
  }

  await client.query('BEGIN');
  try {
    await copyLegacySections(client);
    await syncTargetLimits(client);
    await preserveTargetPublication(client);
    await client.query(
      `INSERT INTO schema_bridge (name) VALUES ($1) ON CONFLICT DO NOTHING`,
      [BRIDGE_MARKER],
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  return true;
}

// pg reports a refused connection as an AggregateError whose own message is
// often empty. Without this the startup log is just "migration failed:".
export function describeError(err) {
  const seen = new Set();
  const parts = [];
  const add = (value) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    parts.push(String(value));
  };
  add(err?.message);
  add(err?.code);
  if (err?.address) add(`${err.address}:${err.port || '?'}`);
  if (Array.isArray(err?.errors)) {
    for (const nested of err.errors.slice(0, 3)) {
      add(nested?.message);
      add(nested?.code);
      if (nested?.address) add(`${nested.address}:${nested.port || '?'}`);
    }
  }
  return parts.length ? parts.join(' | ') : String(err);
}

export async function migrate() {
  let files = [];
  try {
    files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.sql')).sort();
  } catch {
    return [];
  }

  const digests = new Map();
  for (const file of files) {
    const sql = await fs.readFile(path.join(DIR, file), 'utf8');
    digests.set(file, checksum(sql));
  }

  const client = await pool.connect();
  const applied = [];
  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_bridge (
        name text PRIMARY KEY,
        completed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await prepareTargetBridge(client, files, digests);
    await completeTargetBridge(client);

    for (const file of files) {
      const sql = await fs.readFile(path.join(DIR, file), 'utf8');
      const digest = digests.get(file);
      const { rows } = await client.query(
        'SELECT checksum FROM schema_migrations WHERE filename = $1',
        [file],
      );
      if (rows[0]) {
        if (rows[0].checksum !== digest) {
          throw new Error(`migration changed after it was applied: ${file}`);
        }
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
          [file, digest],
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      applied.push(file);
    }

    await completeTargetBridge(client);
    await applyTaxonomy();
    await applyBackfill();
    return applied;
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
    } catch {
      /* the connection is already broken */
    }
    client.release();
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  migrate()
    .then((applied) => {
      console.log(applied.length ? `applied: ${applied.join(', ')}` : 'no migrations to apply');
    })
    .catch((err) => {
      console.error('migration failed:', describeError(err));
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
