import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {
  SEB_HEADER,
  createSebGate,
  normalizeSebKey,
  sebAbsoluteUrl,
  sebHash,
  verifySebRequest,
} from '../services/seb.js';

const KEY = 'a'.repeat(64);

function request(url = '/api/exam/start', host = 'exam.example', header = '') {
  return {
    protocol: 'https',
    originalUrl: url,
    headers: { host, [SEB_HEADER]: header },
    get(name) {
      return this.headers[String(name).toLowerCase()];
    },
  };
}

test('a configuration key is 64 hex characters', () => {
  assert.equal(normalizeSebKey(KEY), KEY);
  assert.equal(normalizeSebKey(KEY.toUpperCase()), KEY);
  assert.equal(normalizeSebKey('not-a-key'), null);
  assert.equal(normalizeSebKey('a'.repeat(63)), null);
});

test('the header hash covers the exact absolute URL and key', () => {
  const req = request('/api/exam/start?event=1');
  assert.equal(sebAbsoluteUrl(req), 'https://exam.example/api/exam/start?event=1');
  assert.equal(sebHash(sebAbsoluteUrl(req), KEY), crypto.createHash('sha256').update(`https://exam.example/api/exam/start?event=1${KEY}`).digest('hex'));
});

test('a matching hash verifies and a different URL does not', () => {
  const url = 'https://exam.example/api/exam/question/4';
  const hash = sebHash(url, KEY);
  const req = request('/api/exam/question/4', 'exam.example', hash);
  assert.equal(verifySebRequest(req, KEY), true);
  assert.equal(verifySebRequest(request('/api/exam/question/5', 'exam.example', hash), KEY), false);
  assert.equal(verifySebRequest(request('/api/exam/question/4', 'other.example', hash), KEY), false);
  assert.equal(verifySebRequest(request('/api/exam/question/4', 'exam.example', 'b'.repeat(64)), KEY), false);
});

test('the gate rejects requests that are not from Safe Exam Browser', () => {
  const gate = createSebGate({ required: true, key: KEY });
  const res = {
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let next = false;
  gate(request(), res, () => { next = true; });
  assert.equal(next, false);
  assert.equal(res.code, 403);
  assert.equal(res.body.code, 'seb_required');
});

test('the gate passes a valid hash and exposes verification state', () => {
  const gate = createSebGate({ required: true, key: KEY });
  const url = 'https://exam.example/api/exam/snapshot';
  const req = request('/api/exam/snapshot', 'exam.example', sebHash(url, KEY));
  const res = { status() { throw new Error('should not respond'); } };
  let next = false;
  gate(req, res, () => { next = true; });
  assert.equal(next, true);
  assert.equal(req.seb.verified, true);
  assert.equal(req.seb.required, true);
});

test('a gate with no configured key fails closed', () => {
  const gate = createSebGate({ required: true, key: null });
  const res = {
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let next = false;
  gate(request(), res, () => { next = true; });
  assert.equal(next, false);
  assert.equal(res.code, 503);
  assert.equal(res.body.code, 'seb_not_configured');
});

test('the gate is disabled when SEB is not required', () => {
  const gate = createSebGate({ required: false, key: null });
  const req = request();
  let next = false;
  gate(req, { status() {} }, () => { next = true; });
  assert.equal(next, true);
  assert.equal(req.seb.required, false);
  assert.equal(req.seb.verified, false);
});

test('the mounted gate protects exam routes and serves the config file', async () => {
  const file = path.join(os.tmpdir(), `examrobo-seb-route-${process.pid}-${Date.now()}.seb`);
  const old = {
    required: process.env.SEB_REQUIRED,
    key: process.env.SEB_CONFIG_KEY,
    file: process.env.SEB_CONFIG_FILE,
  };
  fs.writeFileSync(file, 'route-test-seb');
  process.env.SEB_REQUIRED = 'true';
  process.env.SEB_CONFIG_KEY = KEY;
  process.env.SEB_CONFIG_FILE = file;
  let server;
  try {
    const { app } = await import('../app.js');
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    const base = `http://127.0.0.1:${port}`;

    const status = await fetch(`${base}/api/seb/status`);
    const body = await status.json();
    assert.equal(status.status, 200);
    assert.equal(body.required, true);
    assert.equal(body.configured, true);

    const refused = await fetch(`${base}/api/exam/start`, { method: 'POST' });
    const refusedBody = await refused.json();
    assert.equal(refused.status, 403);
    assert.equal(refusedBody.code, 'seb_required');

    const accepted = await fetch(`${base}/api/exam/start`, {
      method: 'POST',
      headers: { [SEB_HEADER]: sebHash(`${base}/api/exam/start`, KEY) },
    });
    assert.equal(accepted.status, 401, 'the gate lets the request reach the auth layer');

    const config = await fetch(`${base}/api/seb/config`);
    assert.equal(config.status, 200);
    assert.equal(await config.text(), 'route-test-seb');
  } finally {
    if (server) {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    }
    fs.rmSync(file, { force: true });
    for (const [name, value] of Object.entries({ SEB_REQUIRED: old.required, SEB_CONFIG_KEY: old.key, SEB_CONFIG_FILE: old.file })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
