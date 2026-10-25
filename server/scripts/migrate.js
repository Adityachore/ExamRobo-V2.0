import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { q, pool } from '../db.js';

// Applies every server/sql/migrations/*.sql in filename order.
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

export async function applyTaxonomy() {
  const sql = await fs.readFile(TAXONOMY, 'utf8');
  await q(sql);
}

export async function applyBackfill() {
  const sql = await fs.readFile(BACKFILL, 'utf8');
  await q(sql);
}

export async function migrate() {
  let files = [];
  try {
    files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.sql')).sort();
  } catch {
    return [];
  }
  const applied = [];
  for (const file of files) {
    const sql = await fs.readFile(path.join(DIR, file), 'utf8');
    await q(sql);
    applied.push(file);
  }
  await applyTaxonomy();
  await applyBackfill();
  return applied;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  migrate()
    .then((applied) => {
      console.log(applied.length ? `applied: ${applied.join(', ')}` : 'no migrations to apply');
    })
    .catch((err) => {
      console.error('migration failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
