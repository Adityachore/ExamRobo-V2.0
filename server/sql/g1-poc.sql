-- G1 isolated security proof schema.
--
-- This file is deliberately separate from schema.sql and migrations 001..013.
-- It is applied only to a disposable database whose name ends in _test and it
-- does not touch the v1.5 product schema. Roles are created by scripts/g1.mjs
-- before this file is applied; the signing key is inserted by that script too.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA app AUTHORIZATION examrobo_table_owner;
CREATE SCHEMA app_private AUTHORIZATION examrobo_table_owner;
CREATE SCHEMA auth AUTHORIZATION examrobo_table_owner;
CREATE SCHEMA platform AUTHORIZATION examrobo_table_owner;

SET ROLE examrobo_table_owner;

CREATE TABLE auth.principals (
  id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('active', 'disabled')),
  session_version integer NOT NULL CHECK (session_version > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE auth.login_identifiers (
  id uuid PRIMARY KEY,
  principal_id uuid NOT NULL REFERENCES auth.principals(id),
  identifier_type text NOT NULL CHECK (identifier_type IN ('email')),
  normalized_identifier text NOT NULL,
  UNIQUE (identifier_type, normalized_identifier)
);

CREATE TABLE auth.memberships (
  id uuid PRIMARY KEY,
  principal_id uuid NOT NULL UNIQUE REFERENCES auth.principals(id),
  institution_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'employee', 'student')),
  state text NOT NULL CHECK (state IN ('active', 'disabled')),
  auth_epoch integer NOT NULL CHECK (auth_epoch > 0)
);

CREATE TABLE auth.service_principals (
  id uuid PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('worker', 'platform')),
  status text NOT NULL CHECK (status IN ('active', 'disabled')),
  session_version integer NOT NULL CHECK (session_version > 0)
);

CREATE TABLE auth.institution_auth_state (
  institution_id uuid PRIMARY KEY,
  admin_state text NOT NULL CHECK (admin_state IN ('enabled', 'suspended', 'archived')),
  auth_epoch integer NOT NULL CHECK (auth_epoch > 0)
);

CREATE TABLE app.institutions (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.students (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  UNIQUE (institution_id, id),
  UNIQUE (institution_id, email)
);

CREATE TABLE app.tenant_parents (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  name text NOT NULL,
  UNIQUE (institution_id, id)
);

CREATE TABLE app.tenant_children (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  parent_id uuid NOT NULL,
  name text NOT NULL,
  UNIQUE (institution_id, id),
  CONSTRAINT tenant_children_same_tenant_fk
    FOREIGN KEY (institution_id, parent_id)
    REFERENCES app.tenant_parents (institution_id, id)
);

CREATE TABLE app.invoices (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  amount_paise integer NOT NULL CHECK (amount_paise >= 0),
  UNIQUE (institution_id, id)
);

CREATE TABLE app.job_queue (
  id uuid PRIMARY KEY,
  institution_id uuid NOT NULL,
  job_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('queued', 'leased', 'done', 'expired')),
  lease_token text,
  lease_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.tenant_table_registry (
  table_name text PRIMARY KEY,
  classification text NOT NULL CHECK (classification IN ('tenant', 'system'))
);

CREATE TABLE app_private.signing_keys (
  kid text PRIMARY KEY,
  secret bytea NOT NULL,
  active boolean NOT NULL DEFAULT true,
  not_before timestamptz NOT NULL,
  not_after timestamptz NOT NULL
);

CREATE TABLE app_private.support_access_grants (
  id uuid PRIMARY KEY,
  platform_principal_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('read')),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE TABLE platform.tenant_aggregate (
  institution_id uuid PRIMARY KEY,
  student_count integer NOT NULL CHECK (student_count >= 0)
);

INSERT INTO app.tenant_table_registry (table_name, classification) VALUES
  ('institutions', 'tenant'),
  ('students', 'tenant'),
  ('tenant_parents', 'tenant'),
  ('tenant_children', 'tenant'),
  ('invoices', 'tenant'),
  ('job_queue', 'system');

INSERT INTO app.institutions (id, name, code) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Shared Institute', 'ALPHA'),
  ('22222222-2222-4222-8222-222222222222', 'Shared Institute', 'BETA');

INSERT INTO auth.institution_auth_state (institution_id, admin_state, auth_epoch) VALUES
  ('11111111-1111-4111-8111-111111111111', 'enabled', 1),
  ('22222222-2222-4222-8222-222222222222', 'enabled', 1);

INSERT INTO auth.principals (id, status, session_version) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa0', 'active', 1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'active', 1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'active', 1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'active', 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb0', 'active', 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'active', 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'active', 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'active', 1);

INSERT INTO auth.login_identifiers (id, principal_id, identifier_type, normalized_identifier) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa0', 'email', 'owner.a@example.test'),
  ('a1000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'email', 'admin.a@example.test'),
  ('a1000000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'email', 'employee.a@example.test'),
  ('a1000000-0000-4000-8000-000000000004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'email', 'student.a@example.test'),
  ('b1000000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb0', 'email', 'owner.b@example.test'),
  ('b1000000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'email', 'admin.b@example.test'),
  ('b1000000-0000-4000-8000-000000000003', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'email', 'employee.b@example.test'),
  ('b1000000-0000-4000-8000-000000000004', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'email', 'student.b@example.test');

INSERT INTO auth.memberships (id, principal_id, institution_id, role, state, auth_epoch) VALUES
  ('aaaa0000-0000-4000-8000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa0', '11111111-1111-4111-8111-111111111111', 'owner', 'active', 1),
  ('aaaa0000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'admin', 'active', 1),
  ('aaaa0000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 'employee', 'active', 1),
  ('aaaa0000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '11111111-1111-4111-8111-111111111111', 'student', 'active', 1),
  ('bbbb0000-0000-4000-8000-000000000000', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb0', '22222222-2222-4222-8222-222222222222', 'owner', 'active', 1),
  ('bbbb0000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '22222222-2222-4222-8222-222222222222', 'admin', 'active', 1),
  ('bbbb0000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '22222222-2222-4222-8222-222222222222', 'employee', 'active', 1),
  ('bbbb0000-0000-4000-8000-000000000003', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', '22222222-2222-4222-8222-222222222222', 'student', 'active', 1);

INSERT INTO auth.service_principals (id, kind, status, session_version) VALUES
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'platform', 'active', 1),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'worker', 'active', 1);

INSERT INTO app.students (id, institution_id, name, email) VALUES
  ('10000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Student One', 'student@example.test'),
  ('20000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Student One', 'student@example.test');

INSERT INTO app.tenant_parents (id, institution_id, name) VALUES
  ('11000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Event One'),
  ('22000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Event One');

INSERT INTO app.tenant_children (id, institution_id, parent_id, name) VALUES
  ('12000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', '11000000-0000-4000-8000-000000000001', 'Paper One'),
  ('22000000-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', '22000000-0000-4000-8000-000000000001', 'Paper One');

INSERT INTO app.invoices (id, institution_id, amount_paise) VALUES
  ('13000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 10000),
  ('23000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 10000);

INSERT INTO app.job_queue (id, institution_id, job_type, status, lease_token, lease_expires_at) VALUES
  ('14000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'export', 'leased', 'lease-alpha-1', now() + interval '10 minutes');

INSERT INTO app_private.support_access_grants (id, platform_principal_id, institution_id, scope, expires_at) VALUES
  ('15000000-0000-4000-8000-000000000001', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1', '11111111-1111-4111-8111-111111111111', 'read', now() + interval '10 minutes');

INSERT INTO platform.tenant_aggregate (institution_id, student_count) VALUES
  ('11111111-1111-4111-8111-111111111111', 1),
  ('22222222-2222-4222-8222-222222222222', 1);

CREATE FUNCTION app.b64url_decode(p text)
RETURNS bytea
LANGUAGE sql IMMUTABLE
AS $$
  SELECT decode(
    rpad(translate(p, '-_', '+/'), length(p) + ((4 - (length(p) % 4)) % 4), '='),
    'base64'
  )
$$;

CREATE FUNCTION app.ct_eq(a bytea, b bytea)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  diff integer := 0;
  i integer;
BEGIN
  IF length(a) <> length(b) THEN
    RETURN false;
  END IF;
  IF length(a) = 0 THEN
    RETURN true;
  END IF;
  FOR i IN 0..length(a) - 1 LOOP
    diff := diff | (get_byte(a, i) # get_byte(b, i));
  END LOOP;
  RETURN diff = 0;
END;
$$;

CREATE FUNCTION app.context_canonical(
  p_v text,
  p_kid text,
  p_iid text,
  p_sub text,
  p_ptype text,
  p_role text,
  p_sv text,
  p_epoch text,
  p_iat text,
  p_exp text,
  p_nonce text,
  p_scope text,
  p_grant text,
  p_job text,
  p_lease text
)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT format(
    'v=%s|kid=%s|iid=%s|sub=%s|ptype=%s|role=%s|sv=%s|epoch=%s|iat=%s|exp=%s|nonce=%s|scope=%s|grant=%s|job=%s|lease=%s',
    p_v, p_kid, p_iid, p_sub, p_ptype, p_role, p_sv, p_epoch,
    p_iat, p_exp, p_nonce, p_scope, p_grant, p_job, p_lease
  )
$$;

CREATE FUNCTION app.current_iid()
RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_token text := current_setting('app.tenant_context', true);
  v_guc_iid text := current_setting('app.iid', true);
  v_payload_b64 text;
  v_sig_b64 text;
  v_payload text;
  v_fields text[];
  v_v text;
  v_kid text;
  v_iid text;
  v_sub text;
  v_ptype text;
  v_role text;
  v_sv text;
  v_epoch text;
  v_iat text;
  v_exp text;
  v_nonce text;
  v_scope text;
  v_grant text;
  v_job text;
  v_lease text;
  v_iid_uuid uuid;
  v_sub_uuid uuid;
  v_grant_uuid uuid;
  v_job_uuid uuid;
  v_key bytea;
  v_sig bytea;
  v_expected bytea;
  v_state text;
  v_epoch_value integer;
  v_session_value integer;
  v_membership_iid uuid;
  v_membership_role text;
  v_membership_state text;
  v_membership_epoch integer;
  v_job_status text;
  v_job_lease text;
  v_job_lease_expires timestamptz;
  v_grant_scope text;
  v_grant_expires timestamptz;
  v_grant_revoked timestamptz;
BEGIN
  IF v_token IS NULL OR length(v_token) < 10 OR length(v_token) > 8192 THEN
    RETURN NULL;
  END IF;
  IF length(v_token) - length(replace(v_token, '.', '')) <> 1 THEN
    RETURN NULL;
  END IF;

  v_payload_b64 := split_part(v_token, '.', 1);
  v_sig_b64 := split_part(v_token, '.', 2);
  v_payload := convert_from(app.b64url_decode(v_payload_b64), 'UTF8');
  IF length(v_payload) > 4096 THEN
    RETURN NULL;
  END IF;

  v_fields := string_to_array(v_payload, '|');
  IF array_length(v_fields, 1) <> 15 THEN
    RETURN NULL;
  END IF;
  IF v_fields[1] NOT LIKE 'v=%'
    OR v_fields[2] NOT LIKE 'kid=%'
    OR v_fields[3] NOT LIKE 'iid=%'
    OR v_fields[4] NOT LIKE 'sub=%'
    OR v_fields[5] NOT LIKE 'ptype=%'
    OR v_fields[6] NOT LIKE 'role=%'
    OR v_fields[7] NOT LIKE 'sv=%'
    OR v_fields[8] NOT LIKE 'epoch=%'
    OR v_fields[9] NOT LIKE 'iat=%'
    OR v_fields[10] NOT LIKE 'exp=%'
    OR v_fields[11] NOT LIKE 'nonce=%'
    OR v_fields[12] NOT LIKE 'scope=%'
    OR v_fields[13] NOT LIKE 'grant=%'
    OR v_fields[14] NOT LIKE 'job=%'
    OR v_fields[15] NOT LIKE 'lease=%' THEN
    RETURN NULL;
  END IF;

  v_v := substr(v_fields[1], 3);
  v_kid := substr(v_fields[2], 5);
  v_iid := substr(v_fields[3], 5);
  v_sub := substr(v_fields[4], 5);
  v_ptype := substr(v_fields[5], 7);
  v_role := substr(v_fields[6], 6);
  v_sv := substr(v_fields[7], 4);
  v_epoch := substr(v_fields[8], 7);
  v_iat := substr(v_fields[9], 5);
  v_exp := substr(v_fields[10], 5);
  v_nonce := substr(v_fields[11], 7);
  v_scope := substr(v_fields[12], 7);
  v_grant := substr(v_fields[13], 7);
  v_job := substr(v_fields[14], 5);
  v_lease := substr(v_fields[15], 7);

  IF v_v <> '1'
    OR v_kid !~ '^[A-Za-z0-9_-]{1,32}$'
    OR v_iid !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR v_sub !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    OR v_ptype NOT IN ('human', 'service', 'platform')
    OR v_role NOT IN ('owner', 'admin', 'employee', 'student', 'worker', 'platform', 'support')
    OR v_sv !~ '^[0-9]{1,9}$'
    OR v_epoch !~ '^[0-9]{1,9}$'
    OR v_iat !~ '^[0-9]{1,12}$'
    OR v_exp !~ '^[0-9]{1,12}$'
    OR v_nonce !~ '^[A-Za-z0-9_-]{16,64}$'
    OR v_scope NOT IN ('tenant', 'support_read', 'platform_aggregate')
    OR (v_grant <> '-' AND v_grant !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
    OR (v_job <> '-' AND v_job !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
    OR (v_lease <> '-' AND v_lease !~ '^[A-Za-z0-9_-]{8,128}$') THEN
    RETURN NULL;
  END IF;

  IF v_payload <> app.context_canonical(
    v_v, v_kid, v_iid, v_sub, v_ptype, v_role, v_sv, v_epoch,
    v_iat, v_exp, v_nonce, v_scope, v_grant, v_job, v_lease
  ) THEN
    RETURN NULL;
  END IF;

  v_iid_uuid := v_iid::uuid;
  v_sub_uuid := v_sub::uuid;

  IF v_guc_iid IS NOT NULL AND v_guc_iid <> v_iid THEN
    RETURN NULL;
  END IF;

  SELECT secret INTO v_key
  FROM app_private.signing_keys
  WHERE kid = v_kid
    AND active
    AND now() >= not_before
    AND now() < not_after;
  IF v_key IS NULL THEN
    RETURN NULL;
  END IF;

  v_sig := app.b64url_decode(v_sig_b64);
  v_expected := hmac(convert_to(v_payload, 'UTF8'), v_key, 'sha256');
  IF NOT app.ct_eq(v_sig, v_expected) THEN
    RETURN NULL;
  END IF;

  IF v_exp::bigint <= extract(epoch FROM now())::bigint
    OR v_iat::bigint > extract(epoch FROM now())::bigint + 5
    OR v_exp::bigint <= v_iat::bigint
    OR v_exp::bigint - v_iat::bigint > 60
    OR v_iat::bigint < extract(epoch FROM now())::bigint - 300 THEN
    RETURN NULL;
  END IF;

  IF v_ptype = 'human' THEN
    IF v_scope <> 'tenant'
      OR v_role NOT IN ('owner', 'admin', 'employee', 'student')
      OR v_grant <> '-'
      OR v_job <> '-'
      OR v_lease <> '-' THEN
      RETURN NULL;
    END IF;

    SELECT p.status, p.session_version
      INTO v_state, v_session_value
    FROM auth.principals p
    WHERE p.id = v_sub_uuid;
    IF v_state IS DISTINCT FROM 'active' OR v_session_value IS DISTINCT FROM v_sv::integer THEN
      RETURN NULL;
    END IF;

    SELECT m.institution_id, m.role, m.state, m.auth_epoch
      INTO v_membership_iid, v_membership_role, v_membership_state, v_membership_epoch
    FROM auth.memberships m
    WHERE m.principal_id = v_sub_uuid;
    IF NOT FOUND
      OR v_membership_iid IS DISTINCT FROM v_iid::uuid
      OR v_membership_role IS DISTINCT FROM v_role
      OR v_membership_state IS DISTINCT FROM 'active'
      OR v_membership_epoch IS DISTINCT FROM v_epoch::integer THEN
      RETURN NULL;
    END IF;

    SELECT s.admin_state, s.auth_epoch
      INTO v_state, v_epoch_value
    FROM auth.institution_auth_state s
    WHERE s.institution_id = v_iid_uuid;
    IF v_state IS DISTINCT FROM 'enabled' OR v_epoch_value IS DISTINCT FROM v_epoch::integer THEN
      RETURN NULL;
    END IF;

    RETURN v_iid_uuid;
  END IF;

  IF v_ptype = 'service' AND v_role = 'worker' THEN
    IF v_scope <> 'tenant' OR v_grant <> '-' OR v_job = '-' OR v_lease = '-' THEN
      RETURN NULL;
    END IF;

    SELECT sp.status, sp.session_version
      INTO v_state, v_session_value
    FROM auth.service_principals sp
    WHERE sp.id = v_sub_uuid AND sp.kind = 'worker';
    IF v_state IS DISTINCT FROM 'active' OR v_session_value IS DISTINCT FROM v_sv::integer THEN
      RETURN NULL;
    END IF;

    v_job_uuid := v_job::uuid;
    SELECT j.status, j.lease_token, j.lease_expires_at
      INTO v_job_status, v_job_lease, v_job_lease_expires
    FROM app.job_queue j
    WHERE j.id = v_job_uuid AND j.institution_id = v_iid_uuid;
    IF NOT FOUND
      OR v_job_status IS DISTINCT FROM 'leased'
      OR v_job_lease IS DISTINCT FROM v_lease
      OR v_job_lease_expires <= now() THEN
      RETURN NULL;
    END IF;

    RETURN v_iid_uuid;
  END IF;

  IF v_ptype = 'platform' AND v_role = 'platform' AND v_scope = 'platform_aggregate' THEN
    SELECT sp.status, sp.session_version
      INTO v_state, v_session_value
    FROM auth.service_principals sp
    WHERE sp.id = v_sub_uuid AND sp.kind = 'platform';
    IF v_state IS DISTINCT FROM 'active' OR v_session_value IS DISTINCT FROM v_sv::integer THEN
      RETURN NULL;
    END IF;
    -- A platform aggregate context never grants raw tenant-table access.
    RETURN NULL;
  END IF;

  IF v_ptype = 'platform' AND v_role = 'support' AND v_scope = 'support_read' THEN
    IF v_grant = '-' THEN
      RETURN NULL;
    END IF;

    SELECT sp.status, sp.session_version
      INTO v_state, v_session_value
    FROM auth.service_principals sp
    WHERE sp.id = v_sub_uuid AND sp.kind = 'platform';
    IF v_state IS DISTINCT FROM 'active' OR v_session_value IS DISTINCT FROM v_sv::integer THEN
      RETURN NULL;
    END IF;

    v_grant_uuid := v_grant::uuid;
    SELECT g.scope, g.expires_at, g.revoked_at
      INTO v_grant_scope, v_grant_expires, v_grant_revoked
    FROM app_private.support_access_grants g
    WHERE g.id = v_grant_uuid
      AND g.platform_principal_id = v_sub_uuid
      AND g.institution_id = v_iid_uuid;
    IF NOT FOUND
      OR v_grant_scope IS DISTINCT FROM 'read'
      OR v_grant_expires <= now()
      OR v_grant_revoked IS NOT NULL THEN
      RETURN NULL;
    END IF;

    RETURN v_iid_uuid;
  END IF;

  RETURN NULL;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE FUNCTION auth.lookup_login(p_identifier text)
RETURNS TABLE (principal_id uuid, status text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT p.id, p.status
  FROM auth.principals p
  JOIN auth.login_identifiers li ON li.principal_id = p.id
  WHERE li.identifier_type = 'email'
    AND li.normalized_identifier = p_identifier
$$;

CREATE FUNCTION platform.tenant_student_count(p_institution_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT a.student_count
  FROM platform.tenant_aggregate a
  WHERE a.institution_id = p_institution_id
$$;

CREATE FUNCTION app.unregistered_tenant_tables()
RETURNS TABLE (table_name text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT c.relname::text
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'app'
    AND c.relkind = 'r'
    AND (
      c.relname = 'institutions'
      OR EXISTS (
        SELECT 1
        FROM pg_attribute a
        WHERE a.attrelid = c.oid
          AND a.attname = 'institution_id'
          AND a.attnum > 0
          AND NOT a.attisdropped
      )
    )
    AND c.relname NOT IN (SELECT r.table_name FROM app.tenant_table_registry r)
  ORDER BY 1
$$;

ALTER TABLE app.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.institutions FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app.institutions
  USING (id = app.current_iid())
  WITH CHECK (id = app.current_iid());

ALTER TABLE app.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.students FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app.students
  USING (institution_id = app.current_iid())
  WITH CHECK (institution_id = app.current_iid());

ALTER TABLE app.tenant_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tenant_parents FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app.tenant_parents
  USING (institution_id = app.current_iid())
  WITH CHECK (institution_id = app.current_iid());

ALTER TABLE app.tenant_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tenant_children FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app.tenant_children
  USING (institution_id = app.current_iid())
  WITH CHECK (institution_id = app.current_iid());

ALTER TABLE app.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.invoices FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON app.invoices
  USING (institution_id = app.current_iid())
  WITH CHECK (institution_id = app.current_iid());

RESET ROLE;

ALTER FUNCTION app.b64url_decode(text) OWNER TO examrobo_context_fn;
ALTER FUNCTION app.ct_eq(bytea, bytea) OWNER TO examrobo_context_fn;
ALTER FUNCTION app.context_canonical(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text) OWNER TO examrobo_context_fn;
ALTER FUNCTION app.current_iid() OWNER TO examrobo_context_fn;
ALTER FUNCTION auth.lookup_login(text) OWNER TO examrobo_auth_fn;
ALTER FUNCTION platform.tenant_student_count(uuid) OWNER TO examrobo_platform_fn;

GRANT USAGE ON SCHEMA app TO examrobo_context_fn, examrobo_app, examrobo_auth_app, examrobo_worker, examrobo_platform_app;
GRANT USAGE ON SCHEMA app_private TO examrobo_context_fn;
GRANT USAGE ON SCHEMA auth TO examrobo_context_fn, examrobo_auth_fn, examrobo_auth_app;
GRANT USAGE ON SCHEMA platform TO examrobo_platform_fn, examrobo_platform_app;

REVOKE CREATE ON SCHEMA app FROM PUBLIC;
REVOKE CREATE ON SCHEMA app_private FROM PUBLIC;
REVOKE CREATE ON SCHEMA auth FROM PUBLIC;
REVOKE CREATE ON SCHEMA platform FROM PUBLIC;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;

GRANT SELECT ON app_private.signing_keys TO examrobo_context_fn;
GRANT SELECT ON app_private.support_access_grants TO examrobo_context_fn;
GRANT SELECT ON auth.principals TO examrobo_context_fn;
GRANT SELECT ON auth.memberships TO examrobo_context_fn;
GRANT SELECT ON auth.service_principals TO examrobo_context_fn;
GRANT SELECT ON auth.institution_auth_state TO examrobo_context_fn;
GRANT SELECT ON app.job_queue TO examrobo_context_fn;
GRANT EXECUTE ON FUNCTION public.hmac(bytea, bytea, text) TO examrobo_context_fn;

GRANT SELECT ON auth.principals TO examrobo_auth_fn;
GRANT SELECT ON auth.login_identifiers TO examrobo_auth_fn;

GRANT SELECT ON platform.tenant_aggregate TO examrobo_platform_fn;

GRANT SELECT, INSERT, UPDATE, DELETE ON app.institutions, app.students, app.tenant_parents, app.tenant_children, app.invoices TO examrobo_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.institutions, app.students, app.tenant_parents, app.tenant_children, app.invoices TO examrobo_worker;

GRANT EXECUTE ON FUNCTION app.current_iid() TO examrobo_app, examrobo_worker;
GRANT EXECUTE ON FUNCTION auth.lookup_login(text) TO examrobo_auth_app;
GRANT EXECUTE ON FUNCTION platform.tenant_student_count(uuid) TO examrobo_platform_app;
GRANT EXECUTE ON FUNCTION app.unregistered_tenant_tables() TO examrobo_migrator;

REVOKE ALL ON FUNCTION app.b64url_decode(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.ct_eq(bytea, bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.context_canonical(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.current_iid() FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.lookup_login(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.tenant_student_count(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.unregistered_tenant_tables() FROM PUBLIC;
