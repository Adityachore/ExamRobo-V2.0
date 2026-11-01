// A throwaway database for tests.
//
// The rule: a test may only ever talk to a database whose name ends in
// "_smoke" or "_test". The live database is protected by this module, not by
// a sentence in a readme - a test run physically cannot truncate the live
// tables because it never connects to them.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const SCRATCH_SUFFIXES = ['_smoke', '_test'];
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SCHEMA_PATH = path.join(HERE, '..', 'sql', 'schema.sql');
const MIGRATIONS_DIR = path.join(HERE, '..', 'sql', 'migrations');
const TAXONOMY_PATH = path.join(HERE, '..', 'sql', 'taxonomy.sql');
const BACKFILL_PATH = path.join(HERE, '..', 'sql', 'backfill.sql');

export function databaseNameFromUrl(url) {
  if (!url) return null;
  try {
    const name = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
    return name || null;
  } catch {
    return null;
  }
}

export function isScratchName(name) {
  if (!name) return false;
  return SCRATCH_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

// Throws unless the URL points at a scratch database.
export function assertScratchDatabase(url) {
  const name = databaseNameFromUrl(url);
  if (!isScratchName(name)) {
    const error = new Error(
      `Refusing to run: DATABASE_URL points at "${name || 'unknown'}", which is not a scratch database. ` +
        `A test database name must end in ${SCRATCH_SUFFIXES.join(' or ')}.`,
    );
    error.code = 'NOT_SCRATCH_DB';
    throw error;
  }
  return name;
}

// Swaps the database name in a connection URL.
export function urlForDatabase(url, name) {
  const parsed = new URL(url);
  parsed.pathname = `/${encodeURIComponent(name)}`;
  return parsed.toString();
}

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

// Drops any leftover database with the same name, creates it fresh and loads
// the current schema. Returns the connection URL of the new database.
export async function createScratchDatabase({ adminUrl, name, schemaPath = SCHEMA_PATH }) {
  assertScratchDatabase(urlForDatabase(adminUrl, name));
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [name],
    );
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(name)}`);
    await client.query(`CREATE DATABASE ${quoteIdent(name)}`);
  } finally {
    await client.end();
  }

  const sql = await fs.readFile(schemaPath, 'utf8');
  const app = new pg.Client({ connectionString: urlForDatabase(adminUrl, name) });
  await app.connect();
  try {
    await app.query(sql);
    // The migrations on top of it, in file order. They are idempotent, and
    // applying them here means the scratch database has exactly the shape
    // production has - including the seeded data (the skills taxonomy) that
    // a migration carries.
    const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      await app.query(await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8'));
    }
    // The taxonomy: the reference data the seeded questions point at.
    await app.query(await fs.readFile(TAXONOMY_PATH, 'utf8'));
    // The backfill last: it reads the skill code from the skills table.
    await app.query(await fs.readFile(BACKFILL_PATH, 'utf8'));
  } finally {
    await app.end();
  }

  return urlForDatabase(adminUrl, name);
}

// Removes the scratch database and everything in it.
export async function dropScratchDatabase({ adminUrl, name }) {
  assertScratchDatabase(urlForDatabase(adminUrl, name));
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [name],
    );
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(name)}`);
  } finally {
    await client.end();
  }
}
