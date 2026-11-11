// G1 isolated security proof harness.
//
// It creates a throwaway PostgreSQL 16 database, builds the proof schema in
// sql/g1-poc.sql, creates the required role set, and runs SEC-001..SEC-016 plus
// the role/grant report. It never connects to the live ExamRobo database.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

import { assertScratchDatabase, urlForDatabase } from './scratch-db.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.join(HERE, '..');
const SQL_PATH = path.join(SERVER_DIR, 'sql', 'g1-poc.sql');
const EVIDENCE_DIR = path.join(SERVER_DIR, '..', 'docs', 'phase2', 'evidence', 'g1');
const DB_NAME = 'examrobo_g1_test';
const ADMIN_URL = process.env.G1_PG_URL || process.env.VERIFY_PG_URL || 'postgres://examrobo:examrobo@127.0.0.1:5450/postgres';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const ADMIN_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const ADMIN_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
const STUDENT_A = '10000000-0000-4000-8000-000000000001';
const STUDENT_B = '20000000-0000-4000-8000-000000000001';
const PARENT_A = '11000000-0000-4000-8000-000000000001';
const PARENT_B = '22000000-0000-4000-8000-000000000001';
const JOB_A = '14000000-0000-4000-8000-000000000001';
const GRANT_A = '15000000-0000-4000-8000-000000000001';
const PLATFORM = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
const WORKER = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';
const LEASE = 'lease-alpha-1';

const ROLE_DEFINITIONS = [
  { name: 'examrobo_table_owner', login: false },
  { name: 'examrobo_migrator', login: true },
  { name: 'examrobo_app', login: true },
  { name: 'examrobo_auth_fn', login: false },
  { name: 'examrobo_auth_app', login: true },
  { name: 'examrobo_context_fn', login: false },
  { name: 'examrobo_worker', login: true },
  { name: 'examrobo_platform_fn', login: false },
  { name: 'examrobo_platform_app', login: true },
];

const roles = ROLE_DEFINITIONS.map((role) => ({
  ...role,
  password: role.login ? crypto.randomBytes(24).toString('base64url') : null,
}));

const results = [];
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}${detail ? ` - ${detail}` : ''}`);
};

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function roleUrl(baseUrl, role, password) {
  const url = new URL(baseUrl);
  url.username = role;
  if (password) url.password = password;
  return url.toString();
}

async function closePool(pool) {
  if (pool) await pool.end().catch(() => {});
}

async function closeClient(client) {
  if (client) await client.end().catch(() => {});
}

async function dropDatabase(admin) {
  const scratchUrl = urlForDatabase(ADMIN_URL, DB_NAME);
  assertScratchDatabase(scratchUrl);
  await admin.query(
    'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
    [DB_NAME],
  );
  await admin.query(`DROP DATABASE IF EXISTS ${quoteIdent(DB_NAME)}`);
}

async function createDatabase(admin) {
  const scratchUrl = urlForDatabase(ADMIN_URL, DB_NAME);
  assertScratchDatabase(scratchUrl);
  await admin.query(`CREATE DATABASE ${quoteIdent(DB_NAME)}`);
}

async function dropRoles(admin) {
  for (const role of roles) {
    await admin.query(`DROP OWNED BY ${quoteIdent(role.name)} CASCADE`).catch(() => {});
    await admin.query(`DROP ROLE IF EXISTS ${quoteIdent(role.name)}`);
  }
}

async function createRoles(admin) {
  for (const role of roles) {
    const login = role.login ? 'LOGIN' : 'NOLOGIN';
    const inherit = role.name === 'examrobo_migrator' ? 'INHERIT' : 'NOINHERIT';
    const password = role.password ? ` PASSWORD '${role.password}'` : '';
    await admin.query(
      `CREATE ROLE ${quoteIdent(role.name)} ${login}${password} ${inherit} NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION`,
    );
  }
  await admin.query('GRANT examrobo_table_owner TO examrobo_migrator');
}

function makeSigner(secret) {
  return function sign(fields) {
    const now = Math.floor(Date.now() / 1000);
    const value = {
      v: '1',
      kid: 'k1',
      iat: String(now),
      exp: String(now + 60),
      nonce: crypto.randomBytes(16).toString('base64url'),
      grant: '-',
      job: '-',
      lease: '-',
      sv: '1',
      epoch: '1',
      scope: 'tenant',
      ...fields,
    };
    const payload = [
      `v=${value.v}`,
      `kid=${value.kid}`,
      `iid=${value.iid}`,
      `sub=${value.sub}`,
      `ptype=${value.ptype}`,
      `role=${value.role}`,
      `sv=${value.sv}`,
      `epoch=${value.epoch}`,
      `iat=${value.iat}`,
      `exp=${value.exp}`,
      `nonce=${value.nonce}`,
      `scope=${value.scope}`,
      `grant=${value.grant}`,
      `job=${value.job}`,
      `lease=${value.lease}`,
    ].join('|');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${Buffer.from(payload, 'utf8').toString('base64url')}.${signature}`;
  };
}

async function withClient(pool, fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

async function tenantTx(pool, token, fn, extraSettings = null) {
  return withClient(pool, async (client) => {
    await client.query('BEGIN');
    try {
      if (token) {
        await client.query("SELECT set_config('app.tenant_context', $1, true)", [token]);
      }
      if (extraSettings) {
        for (const [name, value] of Object.entries(extraSettings)) {
          await client.query('SELECT set_config($1, $2, true)', [name, value]);
        }
      }
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    }
  });
}

async function countAs(pool, token, sql = 'SELECT count(*)::int AS n FROM app.students', params = [], extraSettings = null) {
  const result = await tenantTx(pool, token, (client) => client.query(sql, params), extraSettings);
  return result.rows[0]?.n;
}

async function expectError(fn, expectedCode) {
  try {
    await fn();
    return { ok: false, detail: 'no error was raised' };
  } catch (error) {
    return {
      ok: error.code === expectedCode,
      detail: `${error.code || error.name}: ${error.message}`,
    };
  }
}

async function buildRoleReport(admin, roleNames) {
  const q = async (sql, params = []) => (await admin.query(sql, params)).rows;
  return {
    generated_at: new Date().toISOString(),
    database: DB_NAME,
    postgres_version: (await q('SELECT version() AS version'))[0].version,
    roles: await q(`
      SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb,
             rolcanlogin, rolreplication, rolbypassrls
      FROM pg_roles
      WHERE rolname = ANY($1)
      ORDER BY rolname
    `, [roleNames]),
    memberships: await q(`
      SELECT r.rolname AS role, m.rolname AS member, am.admin_option
      FROM pg_auth_members am
      JOIN pg_roles r ON r.oid = am.roleid
      JOIN pg_roles m ON m.oid = am.member
      WHERE r.rolname = ANY($1) AND m.rolname = ANY($1)
      ORDER BY 1, 2
    `, [roleNames]),
    objects: await q(`
      SELECT n.nspname AS schema, c.relname AS name, c.relkind,
             pg_get_userbyid(c.relowner) AS owner
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname IN ('app', 'app_private', 'auth', 'platform')
        AND c.relkind IN ('r', 'S')
      ORDER BY 1, 2
    `),
    functions: await q(`
      SELECT n.nspname AS schema, p.proname AS name,
             pg_get_function_identity_arguments(p.oid) AS args,
             pg_get_userbyid(p.proowner) AS owner
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname IN ('app', 'auth', 'platform')
      ORDER BY 1, 2
    `),
    table_grants: await q(`
      SELECT grantee, table_schema, table_name, privilege_type, is_grantable
      FROM information_schema.role_table_grants
      WHERE grantee = ANY($1)
      ORDER BY 1, 2, 3, 4
    `, [roleNames]),
    schema_grants: await q(`
      SELECT n.nspname AS schema, pg_get_userbyid(a.grantee) AS grantee,
             a.privilege_type, a.is_grantable
      FROM pg_namespace n
      CROSS JOIN LATERAL aclexplode(n.nspacl) a
      WHERE n.nspname IN ('app', 'app_private', 'auth', 'platform', 'public')
        AND a.grantee <> 0
        AND pg_get_userbyid(a.grantee) = ANY($1)
      ORDER BY 1, 2, 3
    `, [roleNames]),
    routine_grants: await q(`
      SELECT grantee, routine_schema, routine_name, privilege_type, is_grantable
      FROM information_schema.routine_privileges
      WHERE grantee = ANY($1)
      ORDER BY 1, 2, 3, 4
    `, [roleNames]),
  };
}

async function main() {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  const adminUrl = urlForDatabase(ADMIN_URL, 'postgres');
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();

  const pools = [];
  const clients = [];
  let setupDone = false;

  try {
    await dropDatabase(admin);
    await dropRoles(admin);
    await createRoles(admin);
    await createDatabase(admin);

    const g1AdminUrl = urlForDatabase(ADMIN_URL, DB_NAME);
    const schemaClient = new pg.Client({ connectionString: g1AdminUrl });
    await schemaClient.connect();
    try {
      await schemaClient.query(await fs.readFile(SQL_PATH, 'utf8'));
      const signingKey = crypto.randomBytes(32);
      await schemaClient.query(
        `INSERT INTO app_private.signing_keys (kid, secret, active, not_before, not_after)
         VALUES ('k1', $1, true, now() - interval '1 hour', now() + interval '1 day')`,
        [signingKey],
      );
      const sign = makeSigner(signingKey);
      setupDone = true;

      const appUrl = roleUrl(g1AdminUrl, 'examrobo_app', roles.find((r) => r.name === 'examrobo_app').password);
      const workerUrl = roleUrl(g1AdminUrl, 'examrobo_worker', roles.find((r) => r.name === 'examrobo_worker').password);
      const authUrl = roleUrl(g1AdminUrl, 'examrobo_auth_app', roles.find((r) => r.name === 'examrobo_auth_app').password);
      const platformUrl = roleUrl(g1AdminUrl, 'examrobo_platform_app', roles.find((r) => r.name === 'examrobo_platform_app').password);

      const appPool = new pg.Pool({ connectionString: appUrl, max: 4 });
      const workerPool = new pg.Pool({ connectionString: workerUrl, max: 2 });
      const reusePool = new pg.Pool({ connectionString: appUrl, max: 1 });
      const forgedPool = new pg.Pool({ connectionString: appUrl, max: 1 });
      pools.push(appPool, workerPool, reusePool, forgedPool);

      const authClient = new pg.Client({ connectionString: authUrl });
      const platformClient = new pg.Client({ connectionString: platformUrl });
      const adminClient = new pg.Client({ connectionString: g1AdminUrl });
      clients.push(authClient, platformClient, adminClient);
      await authClient.connect();
      await platformClient.connect();
      await adminClient.connect();

      const requiredRoles = ROLE_DEFINITIONS.map((role) => role.name);
      const roleReport = await buildRoleReport(adminClient, requiredRoles);
      const roleByName = Object.fromEntries(roleReport.roles.map((r) => [r.rolname, r]));
      check(
        'ROLE-01',
        'required roles exist',
        requiredRoles.every((name) => roleByName[name]),
        requiredRoles.filter((name) => !roleByName[name]).join(', ') || requiredRoles.length + ' roles',
      );
      check(
        'ROLE-02',
        'every role is NOSUPERUSER and NOBYPASSRLS',
        roleReport.roles.every((role) => !role.rolsuper && !role.rolbypassrls),
        roleReport.roles.filter((role) => role.rolsuper || role.rolbypassrls).map((role) => role.rolname).join(', ') || 'all clean',
      );
      const logins = new Set(['examrobo_migrator', 'examrobo_app', 'examrobo_auth_app', 'examrobo_worker', 'examrobo_platform_app']);
      check(
        'ROLE-03',
        'login is limited to the runtime and migration identities',
        roleReport.roles.every((role) => role.rolcanlogin === logins.has(role.rolname)),
        roleReport.roles.filter((role) => role.rolcanlogin !== logins.has(role.rolname)).map((role) => role.rolname).join(', ') || 'split is correct',
      );
      check(
        'ROLE-04',
        'table owner owns every proof table',
        roleReport.objects.every((object) => object.owner === 'examrobo_table_owner'),
        roleReport.objects.filter((object) => object.owner !== 'examrobo_table_owner').map((object) => `${object.schema}.${object.name}:${object.owner}`).join(', ') || `${roleReport.objects.length} tables`,
      );
      const membershipPairs = roleReport.memberships.map((membership) => `${membership.member}->${membership.role}`);
      check(
        'ROLE-05',
        'migrator is only a member of the table owner',
        membershipPairs.length === 1 && membershipPairs[0] === 'examrobo_migrator->examrobo_table_owner',
        membershipPairs.join(', ') || 'no memberships',
      );
      const privilegeResult = await adminClient.query(`
        SELECT
          has_table_privilege('examrobo_app', 'app.students', 'TRUNCATE') AS app_can_truncate,
          has_schema_privilege('examrobo_app', 'app', 'CREATE') AS app_can_create,
          has_table_privilege('examrobo_app', 'app_private.signing_keys', 'SELECT') AS app_can_read_key,
          has_table_privilege('examrobo_auth_app', 'app.students', 'SELECT') AS auth_can_read_students,
          has_table_privilege('examrobo_platform_app', 'app.students', 'SELECT') AS platform_can_read_students,
          has_function_privilege('examrobo_app', 'auth.lookup_login(text)', 'EXECUTE') AS app_can_call_auth,
          has_function_privilege('examrobo_app', 'app.current_iid()', 'EXECUTE') AS app_can_call_context,
          has_table_privilege('examrobo_context_fn', 'app_private.signing_keys', 'SELECT') AS context_can_read_key,
          has_table_privilege('examrobo_context_fn', 'app.students', 'SELECT') AS context_can_read_students
      `);
      const privileges = privilegeResult.rows[0];
      check(
        'ROLE-06',
        'runtime privileges are narrow',
        !privileges.app_can_truncate
          && !privileges.app_can_create
          && !privileges.app_can_read_key
          && !privileges.auth_can_read_students
          && !privileges.platform_can_read_students
          && !privileges.app_can_call_auth
          && privileges.app_can_call_context
          && privileges.context_can_read_key
          && !privileges.context_can_read_students,
        JSON.stringify(privileges),
      );
      const rlsResult = await adminClient.query(`
        SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity,
               EXISTS (
                 SELECT 1 FROM pg_policies p
                 WHERE p.schemaname = 'app'
                   AND p.tablename = c.relname
                   AND p.policyname = 'tenant_isolation'
               ) AS has_policy
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'app'
          AND c.relname IN ('institutions', 'students', 'tenant_parents', 'tenant_children', 'invoices')
        ORDER BY c.relname
      `);
      check(
        'ROLE-07',
        'every tenant table has forced RLS and a tenant policy',
        rlsResult.rows.length === 5 && rlsResult.rows.every((row) => row.relrowsecurity && row.relforcerowsecurity && row.has_policy),
        rlsResult.rows.map((row) => `${row.relname}:${row.relrowsecurity}/${row.relforcerowsecurity}/${row.has_policy}`).join(', '),
      );
      const unregisteredBefore = await adminClient.query('SELECT table_name FROM app.unregistered_tenant_tables()');
      check(
        'ROLE-08',
        'tenant table registry covers every classified table',
        unregisteredBefore.rows.length === 0,
        unregisteredBefore.rows.map((row) => row.table_name).join(', ') || 'all registered',
      );

      const adminAToken = sign({ iid: A, sub: ADMIN_A, ptype: 'human', role: 'admin' });
      const adminBToken = sign({ iid: B, sub: ADMIN_B, ptype: 'human', role: 'admin' });
      const workerToken = sign({ iid: A, sub: WORKER, ptype: 'service', role: 'worker', job: JOB_A, lease: LEASE });
      const platformAggregateB = sign({ iid: B, sub: PLATFORM, ptype: 'platform', role: 'platform', scope: 'platform_aggregate' });
      const supportA = sign({ iid: A, sub: PLATFORM, ptype: 'platform', role: 'support', scope: 'support_read', grant: GRANT_A });
      const supportWrong = sign({ iid: B, sub: PLATFORM, ptype: 'platform', role: 'support', scope: 'support_read', grant: GRANT_A });

      const sec001 = await countAs(appPool, adminAToken, 'SELECT count(*)::int AS n FROM app.students WHERE id = $1', [STUDENT_B]);
      check('SEC-001', 'tenant A cannot read tenant B row by guessed UUID', sec001 === 0, `rows=${sec001}`);

      const sec002Rows = await tenantTx(appPool, adminAToken, (client) =>
        client.query('UPDATE app.tenant_parents SET name = $1 WHERE id = $2', ['hacked', PARENT_B]),
      );
      const sec002Name = await adminClient.query('SELECT name FROM app.tenant_parents WHERE id = $1', [PARENT_B]);
      check(
        'SEC-002',
        'tenant A cannot update tenant B row',
        sec002Rows.rowCount === 0 && sec002Name.rows[0].name === 'Event One',
        `updated=${sec002Rows.rowCount}, name=${sec002Name.rows[0].name}`,
      );

      const sec003 = await expectError(
        () => tenantTx(appPool, adminAToken, (client) =>
          client.query('INSERT INTO app.tenant_parents (id, institution_id, name) VALUES ($1, $2, $3)', [crypto.randomUUID(), B, 'cross']),
        ),
        '42501',
      );
      check('SEC-003', 'tenant A cannot insert a row with tenant B institution id', sec003.ok, sec003.detail);

      const sec004 = await countAs(forgedPool, adminAToken, 'SELECT count(*)::int AS n FROM app.tenant_parents', [], { 'app.iid': B });
      check('SEC-004', 'forged app.iid GUC does not verify or grant access', sec004 === 0, `rows=${sec004}`);

      const malformed = await countAs(appPool, 'not-a-context');
      const expired = sign({ iid: A, sub: ADMIN_A, ptype: 'human', role: 'admin', iat: String(Math.floor(Date.now() / 1000) - 120), exp: String(Math.floor(Date.now() / 1000) - 60) });
      const expiredRows = await countAs(appPool, expired);
      const validForTamper = sign({ iid: A, sub: ADMIN_A, ptype: 'human', role: 'admin' });
      const tampered = `${validForTamper.slice(0, -1)}${validForTamper.endsWith('A') ? 'B' : 'A'}`;
      const tamperedRows = await countAs(appPool, tampered);
      const wrongKey = makeSigner(crypto.randomBytes(32))({ iid: A, sub: ADMIN_A, ptype: 'human', role: 'admin' });
      const wrongKeyRows = await countAs(appPool, wrongKey);
      const unsignedRows = await countAs(appPool, null);
      check(
        'SEC-005',
        'unsigned, malformed, expired, tampered and wrong-key contexts are denied',
        unsignedRows === 0 && malformed === 0 && expiredRows === 0 && tamperedRows === 0 && wrongKeyRows === 0,
        `unsigned=${unsignedRows}, malformed=${malformed}, expired=${expiredRows}, tampered=${tamperedRows}, wrongKey=${wrongKeyRows}`,
      );

      await adminClient.query("UPDATE auth.principals SET status = 'disabled' WHERE id = $1", [ADMIN_A]);
      const disabledRows = await countAs(appPool, adminAToken);
      await adminClient.query("UPDATE auth.principals SET status = 'active' WHERE id = $1", [ADMIN_A]);
      check('SEC-006', 'stale context is denied after principal disablement', disabledRows === 0, `rows=${disabledRows}`);

      await adminClient.query("UPDATE auth.institution_auth_state SET auth_epoch = 2 WHERE institution_id = $1", [A]);
      const epochRows = await countAs(appPool, adminAToken);
      await adminClient.query("UPDATE auth.institution_auth_state SET auth_epoch = 1 WHERE institution_id = $1", [A]);
      check('SEC-007', 'stale context is denied after institution epoch change', epochRows === 0, `rows=${epochRows}`);

      const sec008 = await expectError(
        () => tenantTx(appPool, adminAToken, (client) =>
          client.query('SELECT * FROM auth.lookup_login($1)', ['admin.a@example.test']),
        ),
        '42501',
      );
      check('SEC-008', 'app role cannot call the auth lookup function', sec008.ok, sec008.detail);

      const sec009Students = await expectError(() => authClient.query('SELECT * FROM app.students'), '42501');
      const sec009Auth = await expectError(() => authClient.query('SELECT * FROM auth.principals'), '42501');
      check('SEC-009', 'auth role cannot select student or auth tables directly', sec009Students.ok && sec009Auth.ok, `${sec009Students.detail}; ${sec009Auth.detail}`);

      const sec010 = await expectError(
        () => tenantTx(appPool, adminAToken, (client) => client.query("UPDATE app_private.signing_keys SET secret = 'x'::bytea WHERE kid = 'k1'")),
        '42501',
      );
      check('SEC-010', 'app role cannot change the private HMAC key', sec010.ok, sec010.detail);

      const platformRaw = await countAs(appPool, platformAggregateB);
      const platformDirect = await expectError(() => platformClient.query('SELECT * FROM app.students'), '42501');
      const platformAggregate = await platformClient.query('SELECT platform.tenant_student_count($1) AS n', [B]);
      check(
        'SEC-011',
        'platform dashboard cannot read raw tenant rows but can read the aggregate projection',
        platformRaw === 0 && platformDirect.ok && platformAggregate.rows[0].n === 1,
        `raw=${platformRaw}, direct=${platformDirect.ok}, aggregate=${platformAggregate.rows[0].n}`,
      );

      const supportWrongRows = await countAs(appPool, supportWrong);
      const supportValidRows = await countAs(appPool, supportA);
      const supportOtherRow = await countAs(appPool, supportA, 'SELECT count(*)::int AS n FROM app.students WHERE id = $1', [STUDENT_B]);
      check(
        'SEC-012',
        'scoped support grant cannot read another institution',
        supportWrongRows === 0 && supportValidRows === 1 && supportOtherRow === 0,
        `wrongGrant=${supportWrongRows}, ownTenant=${supportValidRows}, otherRow=${supportOtherRow}`,
      );

      const reuseClient1 = await reusePool.connect();
      await reuseClient1.query('BEGIN');
      await reuseClient1.query("SELECT set_config('app.tenant_context', $1, true)", [adminAToken]);
      const reuseA = await reuseClient1.query('SELECT count(*)::int AS n FROM app.students');
      await reuseClient1.query('ROLLBACK');
      reuseClient1.release();

      const reuseClient2 = await reusePool.connect();
      await reuseClient2.query('BEGIN');
      const reuseEmpty = await reuseClient2.query('SELECT count(*)::int AS n FROM app.students');
      await reuseClient2.query('ROLLBACK');
      reuseClient2.release();

      const reuseClient3 = await reusePool.connect();
      await reuseClient3.query('BEGIN');
      await reuseClient3.query("SELECT set_config('app.tenant_context', $1, true)", [adminAToken]);
      try {
        await reuseClient3.query('SELECT 1 / 0');
      } catch {
        /* expected failed transaction */
      }
      await reuseClient3.query('ROLLBACK');
      reuseClient3.release();

      const reuseClient4 = await reusePool.connect();
      await reuseClient4.query('BEGIN');
      const reuseAfterError = await reuseClient4.query('SELECT count(*)::int AS n FROM app.students');
      await reuseClient4.query('ROLLBACK');
      reuseClient4.release();

      check(
        'SEC-013',
        'pooled connection reuse leaves no tenant context behind',
        reuseA.rows[0].n === 1
          && reuseEmpty.rows[0].n === 0
          && reuseAfterError.rows[0].n === 0
          && reuseClient1 === reuseClient2
          && reuseClient3 === reuseClient4,
        `A=${reuseA.rows[0].n}, empty=${reuseEmpty.rows[0].n}, afterError=${reuseAfterError.rows[0].n}`,
      );

      await adminClient.query("UPDATE app.job_queue SET lease_expires_at = now() - interval '1 minute' WHERE id = $1", [JOB_A]);
      const staleLease = await tenantTx(workerPool, workerToken, (client) =>
        client.query('UPDATE app.tenant_parents SET name = $1 WHERE institution_id = $2', ['stale-worker', A]),
      );
      await adminClient.query("UPDATE app.job_queue SET lease_expires_at = now() + interval '10 minutes' WHERE id = $1", [JOB_A]);
      check('SEC-014', 'stale worker lease cannot execute a tenant mutation', staleLease.rowCount === 0, `updated=${staleLease.rowCount}`);

      const sec015 = await expectError(
        () => tenantTx(appPool, adminAToken, (client) =>
          client.query('INSERT INTO app.tenant_children (id, institution_id, parent_id, name) VALUES ($1, $2, $3, $4)', [
            crypto.randomUUID(),
            A,
            PARENT_B,
            'cross-tenant child',
          ]),
        ),
        '23503',
      );
      check('SEC-015', 'composite foreign key rejects a foreign tenant parent', sec015.ok, sec015.detail);

      await adminClient.query('CREATE TABLE app.tenant_unregistered (id uuid PRIMARY KEY, institution_id uuid NOT NULL)');
      const unregistered = await adminClient.query('SELECT table_name FROM app.unregistered_tenant_tables()');
      await adminClient.query('DROP TABLE app.tenant_unregistered');
      check(
        'SEC-016',
        'new tenant table omitted from the registry is detected',
        unregistered.rows.some((row) => row.table_name === 'tenant_unregistered') && unregisteredBefore.rows.length === 0,
        unregistered.rows.map((row) => row.table_name).join(', ') || 'none detected',
      );

      const pass = results.filter((result) => result.ok).length;
      const fail = results.length - pass;
      const summary = {
        generated_at: new Date().toISOString(),
        database: DB_NAME,
        postgres_version: roleReport.postgres_version,
        pass,
        fail,
        results,
      };
      await fs.writeFile(path.join(EVIDENCE_DIR, 'role-report.json'), `${JSON.stringify(roleReport, null, 2)}\n`);
      await fs.writeFile(path.join(EVIDENCE_DIR, 'results.json'), `${JSON.stringify(summary, null, 2)}\n`);
      console.log(`\n${pass} passed, ${fail} failed`);
      if (fail) process.exitCode = 1;
    } finally {
      await schemaClient.end().catch(() => {});
    }
  } catch (error) {
    console.error('\nG1 harness crashed:', error?.stack || error?.message || error);
    process.exitCode = 1;
  } finally {
    for (const pool of pools) await closePool(pool);
    for (const client of clients) await closeClient(client);
    if (setupDone) {
      await dropDatabase(admin).catch((error) => console.error(`database cleanup failed: ${error.message}`));
      await dropRoles(admin).catch((error) => console.error(`role cleanup failed: ${error.message}`));
    }
    await admin.end().catch(() => {});
  }
}

main();
