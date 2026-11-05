import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { after, before, beforeEach, test } from 'node:test';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { createApp } from '../../app.js';
import { env } from '../../config/env.js';
import pool from '../../db/pool.js';
import { createSession, sessionCookieName } from '../account/session.service.js';
import { encryptSecret, newTotpSecret } from '../account/auth-crypto.js';
import { createSecurityStore } from './security.store.js';

// Opt-in tests use an isolated schema and never change real accounts or their logs.
const enabled = process.env.SECURITY_DB_TESTS === '1';
const integration = (name, fn) => test(name, { skip: !enabled }, fn);
const schema = `security_test_${randomUUID().replaceAll('-', '')}`;
const originalQuery = pool.query;
const originalConnect = pool.connect;
const client = new pg.Client({ connectionString: env.databaseUrl, connectionTimeoutMillis: 3000 });
let server, url, store, superToken, adminToken, app;
const authHeaders = session => ({ Cookie: `${sessionCookieName()}=${session.token}`, 'X-CSRF-Token': session.csrfToken });
const request = (path, options = {}) => fetch(url + path, { ...options, headers: { 'User-Agent': 'security-integration', ...options.headers } });
const json = (body, session) => ({ method: 'POST', headers: { 'Content-Type': 'application/json', ...(session ? authHeaders(session) : {}) }, body: JSON.stringify(body) });

before(async () => {
  if (!enabled) return;
  await client.connect();
  await client.query(`CREATE SCHEMA ${schema}`);
  await client.query(`SET search_path TO ${schema}`);
  if (!env.mfaEncryptionKey) env.mfaEncryptionKey = 'ab'.repeat(32);
  for (const migration of ['001_initial_schema.sql', '010_security_monitoring.sql', '011_security_ip_intelligence.sql', '012_security_honeytokens.sql', '013_admin_multifactor_sessions.sql']) {
    await client.query(await readFile(new URL(`../../../migrations/${migration}`, import.meta.url), 'utf8'));
  }
  const hash = await bcrypt.hash('Safe-Testing9!Pass', 4);
  const users = await client.query(`INSERT INTO admin_users(full_name,login,password_hash,role,mfa_enabled)
    VALUES ('Security Test','security-test',$1,'super_admin',TRUE),('Regular Test','regular-test',$1,'admin',TRUE) RETURNING *`, [hash]);
  const req = { ip: '127.0.0.1', headers: { 'user-agent': 'security-integration' } };
  for (const user of users.rows) await client.query('UPDATE admin_users SET mfa_secret_encrypted=$2 WHERE id=$1', [user.id, encryptSecret(newTotpSecret(), user.id)]);
  superToken = await createSession(users.rows[0], req, client.query.bind(client));
  adminToken = await createSession(users.rows[1], req, client.query.bind(client));
  pool.query = client.query.bind(client);
  pool.connect = async () => ({ query: client.query.bind(client), release() {} });
  store = createSecurityStore(client.query.bind(client), async (fn) => {
    await client.query('BEGIN');
    try { const result = await fn(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; }
  });
  app = createApp({ securityStorage: store });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(async () => {
  if (!enabled) return;
  await app.locals.securityMonitor.drain();
  await client.query('TRUNCATE security_events, security_counters, security_ip_blocks');
});

after(async () => {
  if (!enabled) return;
  if (server) { await new Promise((resolve) => server.close(resolve)); await app.locals.securityMonitor.drain(); }
  pool.query = originalQuery;
  pool.connect = originalConnect;
  // The identifier is an internal random UUID, not user input.
  await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await client.end();
  await pool.end();
});

integration('counter increments are atomic, expire correctly and survive store recreation', async () => {
  await Promise.all(Array.from({ length: 20 }, () => store.increment('203.0.113.8', 'test', 60)));
  const recreated = createSecurityStore(client.query.bind(client));
  assert.equal(Number((await recreated.increment('203.0.113.8', 'test', 60)).count), 21);
  await client.query("UPDATE security_counters SET expires_at = NOW() - INTERVAL '1 second'");
  assert.equal(Number((await recreated.increment('203.0.113.8', 'test', 60)).count), 1);
});

integration('repeated URL attacks are blocked persistently, including forged IP headers', async () => {
  for (let index = 0; index < 3; index += 1) assert.equal((await request('/.env', { headers: { 'X-Forwarded-For': `203.0.113.${index}` } })).status, 403);
  const blocked = await request('/api/content/news');
  assert.equal(blocked.status, 403);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  const recreated = createSecurityStore(client.query.bind(client));
  assert.ok(await recreated.activeBlock('127.0.0.1'));
  const logs = await client.query('SELECT host(ip) AS ip, occurrences, action FROM security_events ORDER BY id');
  assert.ok(logs.rows.every((item) => item.ip === '127.0.0.1'));
  assert.equal(logs.rows.find((item) => item.action === 'rejected').occurrences, 2);
  assert.equal((await request('/health')).status, 200);
});

integration('public and ordinary admins cannot access any security endpoint', async () => {
  for (const path of ['/api/security/overview', '/api/security/events', '/api/security/sources', '/api/security/blocks']) {
    assert.equal((await request(path)).status, 401);
    assert.equal((await request(path, { headers: authHeaders(adminToken) })).status, 403);
  }
  assert.equal((await request('/api/security/blocks', json({ ip: '203.0.113.9', minutes: 15, reason: 'test block' }, adminToken))).status, 403);
  assert.equal((await request('/api/security/blocks/203.0.113.9', { method: 'DELETE', headers: authHeaders(adminToken) })).status, 403);
});

integration('super admin can review, filter, block and unblock; every change is audited', async () => {
  const headers = authHeaders(superToken);
  assert.equal((await request('/api/security/overview', { headers })).status, 200);
  assert.equal((await request('/api/security/events?severity=unknown', { headers })).status, 400);
  assert.equal((await request('/api/security/blocks', json({ ip: '127.0.0.1', minutes: 15, reason: 'self block' }, superToken))).status, 400);
  assert.equal((await request('/api/security/blocks', json({ ip: '203.0.113.9', minutes: 15, reason: 'Confirmed repeated probes' }, superToken))).status, 201);
  assert.ok(await store.activeBlock('203.0.113.9'));
  const records = await (await request('/api/security/events?ip=203.0.113.9', { headers })).json();
  assert.equal(records.total, 1);
  assert.equal(records.items[0].event_type, 'manual_block');
  assert.equal((await request('/api/security/blocks/203.0.113.9', { method: 'DELETE', headers })).status, 200);
  assert.equal(await store.activeBlock('203.0.113.9'), null);
  const audit = await client.query("SELECT event_type FROM security_events WHERE ip = '203.0.113.9' ORDER BY id");
  assert.deepEqual(audit.rows.map((row) => row.event_type), ['manual_block', 'manual_unblock']);
});

integration('manual block and audit record roll back together if recording fails', async () => {
  const brokenStore = createSecurityStore(client.query.bind(client), async (fn) => {
    await client.query('BEGIN');
    try {
      await fn({ query: (sql, params) => /INSERT INTO security_events/.test(sql) ? Promise.reject(new Error('audit unavailable')) : client.query(sql, params) });
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  });
  await assert.rejects(() => brokenStore.manualBlock({ user: { id: 1 }, ip: '127.0.0.1', method: 'POST', url: '/api/security/blocks' }, '203.0.113.9', 15, 'Rollback test'));
  assert.equal(await store.activeBlock('203.0.113.9'), null);
});

integration('HTTP attack requests are rejected, auto-blocked and shown with their actual action and times', async () => {
  const target = '203.0.113.44';
  const previousTrust = app.get('trust proxy');
  app.set('trust proxy', ['loopback']); // Simulate our explicitly trusted ingress, only in this isolated server.
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await request('/api/content/news?search=1+UNION+SELECT+password', { headers: { 'X-Forwarded-For': target } });
      assert.equal(response.status, 403);
    }
    const denied = await request('/api/content/news', { headers: { 'X-Forwarded-For': target } });
    assert.equal(denied.status, 403);
    assert.ok(Number(denied.headers.get('retry-after')) > 0);
    await app.locals.securityMonitor.drain();
    const headers = authHeaders(superToken);
    const activity = await (await request(`/api/security/sources?ip=${target}&status=blocked`, { headers })).json();
    assert.equal(activity.total, 1);
    assert.equal(Number(activity.items[0].attempts), 4);
    assert.equal(activity.items[0].event_type, 'blocked_request');
    assert.equal(activity.items[0].path, '/api/content/news');
    assert.equal(activity.items[0].last_login_at, null);
    assert.ok(activity.items[0].first_seen && activity.items[0].last_seen && activity.items[0].blocked_at);
    assert.equal(activity.block.source, 'automatic');
    const history = await (await request(`/api/security/events?ip=${target}&compact=1`, { headers })).json();
    assert.ok(history.items.some(item => item.event_type === 'sql_probe' && item.action === 'blocked'));
    assert.equal(JSON.stringify(history).includes('SELECT+password'), false);
    assert.equal((await request('/api/security/sources?ip=127.0.0.1', { headers })).status, 200);
  } finally { app.set('trust proxy', previousTrust); }
});

integration('normal requests pass while an actual request burst is blocked at the server', async () => {
  const previousLimit = env.securityRequestLimit;
  const previousTrust = app.get('trust proxy');
  env.securityRequestLimit = 4;
  app.set('trust proxy', ['loopback']);
  try {
    const headers = { 'X-Forwarded-For': '203.0.113.88' };
    for (let index = 0; index < 4; index += 1) assert.equal((await request('/api/content/news', { headers })).status, 200);
    assert.equal((await request('/api/content/news', { headers })).status, 429);
    assert.equal((await request('/api/content/news', { headers })).status, 403);
    await app.locals.securityMonitor.drain();
    assert.ok(await store.activeBlock('203.0.113.88'));
    assert.equal((await client.query("SELECT COUNT(*)::int AS count FROM security_events WHERE event_type='request_flood'")).rows[0].count, 1);
  } finally { env.securityRequestLimit = previousLimit; app.set('trust proxy', previousTrust); }
});

integration('manual blocks have their own list and history without inventing incoming activity', async () => {
  const headers = authHeaders(superToken);
  const target = '203.0.113.77';
  assert.equal((await request('/api/security/blocks', json({ ip: target, minutes: 60, reason: 'Repeated confirmed attacks' }, superToken))).status, 201);
  const result = await (await request('/api/security/blocks?source=manual&limit=1', { headers })).json();
  assert.equal(result.total, 1);
  assert.equal(result.items[0].ip, target);
  assert.equal(Number(result.items[0].created_by), 1);
  assert.ok(new Date(result.items[0].created_at).getTime() < new Date(result.items[0].blocked_until).getTime());
  const activity = await (await request(`/api/security/sources?ip=${target}`, { headers })).json();
  assert.equal(activity.total, 0);
  assert.equal(activity.block.reason, 'Repeated confirmed attacks');
  const overview = await (await request('/api/security/overview?compact=1', { headers })).json();
  assert.equal(overview.totals.prevented, 0);
  assert.equal(overview.totals.sources, 0);
  assert.equal(overview.totals.activeBlocks, 1);
  assert.equal((await request(`/api/security/blocks/${target}`, { method: 'DELETE', headers })).status, 200);
  assert.equal((await (await request('/api/security/blocks', { headers })).json()).total, 0);
  const history = await (await request(`/api/security/events?ip=${target}&compact=1`, { headers })).json();
  assert.deepEqual(history.items.map(item => item.event_type).sort(), ['manual_block', 'manual_unblock']);
  assert.ok(history.items.every(item => Number(item.actor_id) === 1));
});

integration('source search and pagination retain accurate totals, latest action and successful login time', async () => {
  const headers = authHeaders(superToken);
  const req = { ip: '2001:db8::1', method: 'POST', originalUrl: '/api/account/login/verify', headers: {} };
  await store.record(req, { type: 'login_success', severity: 'info', status: 200, summary: 'MFA completed' });
  await client.query("UPDATE security_events SET first_seen=NOW()-INTERVAL '2 hours',last_seen=NOW()-INTERVAL '2 hours'");
  await store.record({ ...req, method: 'GET', originalUrl: '/.env' }, { type: 'sensitive_probe', severity: 'high', status: 403, summary: 'Secret file probe' });
  for (const ip of ['203.0.113.8', '203.0.113.9']) await store.record({ ...req, ip }, { type: 'login_step', severity: 'info', status: 200, summary: 'Partial authentication only' });
  const page = await (await request('/api/security/sources?limit=1&page=1', { headers })).json();
  assert.equal(page.total, 3); assert.equal(page.items.length, 1);
  const found = await (await request('/api/security/sources?ip=2001:0db8::1', { headers })).json();
  assert.equal(found.total, 1);
  assert.equal(found.items[0].ip, '2001:db8::1');
  assert.equal(Number(found.items[0].attempts), 2);
  assert.equal(found.items[0].event_type, 'sensitive_probe');
  assert.ok(new Date(found.items[0].last_login_at).getTime() < new Date(found.items[0].last_seen).getTime());
  const recent = await (await request('/api/security/sources?ip=2001:db8::1&hours=1', { headers })).json();
  assert.equal(recent.items[0].last_login_at, null);
  assert.equal((await (await request('/api/security/sources?status=suspicious', { headers })).json()).total, 1);
  for (const path of ['/api/security/sources?status=bad', '/api/security/sources?ip=bad', '/api/security/blocks?source=bad', '/api/security/blocks?page=-1']) {
    assert.equal((await request(path, { headers })).status, 400);
  }
});

integration('automatic re-block resets expired metadata while preserving an active manual block', async () => {
  const req = { user: { id: 1 }, ip: '127.0.0.1', method: 'POST', originalUrl: '/api/security/blocks', headers: {} };
  await store.manualBlock(req, '203.0.113.55', 60, 'Manual investigation');
  const manual = await store.activeBlock('203.0.113.55');
  await store.block('203.0.113.55', 'Automatic trigger');
  const preserved = await store.activeBlock('203.0.113.55');
  assert.equal(preserved.source, 'manual'); assert.equal(preserved.reason, manual.reason);
  assert.equal(preserved.created_at.getTime(), manual.created_at.getTime());
  await client.query("UPDATE security_ip_blocks SET blocked_until=NOW()-INTERVAL '1 second',created_at=NOW()-INTERVAL '2 days'");
  await store.block('203.0.113.55', 'New automatic attack');
  const automatic = await store.activeBlock('203.0.113.55');
  assert.equal(automatic.source, 'automatic'); assert.equal(automatic.created_by, null);
  assert.equal(automatic.reason, 'New automatic attack');
  assert.ok(Date.now()-automatic.created_at.getTime() < 5000);
});

integration('password-only login is a challenge, and repeated login failures cause a persistent block', async () => {
  const loggedIn = await request('/api/account/login', json({ identity: 'security-test', password: 'Safe-Testing9!Pass' }));
  assert.equal(loggedIn.status, 200);
  await app.locals.securityMonitor.drain();
  assert.equal((await client.query("SELECT COUNT(*)::int AS count FROM security_events WHERE event_type='login_success'")).rows[0].count, 0);
  for (let index = 0; index < env.loginRateLimitMaxAttempts; index += 1) {
    await request('/api/account/login', json({}));
    await app.locals.securityMonitor.drain();
  }
  assert.ok(await store.activeBlock('127.0.0.1'));
  assert.equal((await request('/api/account/me', { headers: authHeaders(superToken) })).status, 403);
});

integration('sensitive bodies require authentication before parsing; errors do not leak secrets', async () => {
  assert.equal((await request('/api/content/news', json({ body: 'x'.repeat(300000) }))).status, 401);
  const invalid = await request('/api/account/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"password":"PRIVATE_SECRET",broken' });
  assert.equal(invalid.status, 400);
  const invalidBody = await invalid.json();
  assert.equal(JSON.stringify(invalidBody).includes('PRIVATE_SECRET'), false);
  assert.equal((await request('/api/account/login', json({ password: 'x'.repeat(300000) }))).status, 413);
  await app.locals.securityMonitor.drain();
  const logs = await client.query('SELECT * FROM security_events');
  assert.equal(JSON.stringify(logs.rows).includes('PRIVATE_SECRET'), false);
  const cors = await request('/api/security/overview', { headers: { Origin: 'https://untrusted.example', ...authHeaders(superToken) } });
  assert.equal(cors.status, 403);
});

integration('rate limits stop floods and expensive public writes', async () => {
  await client.query("INSERT INTO security_counters(ip,kind,count,expires_at) VALUES ('127.0.0.1','requests',$1,NOW()+INTERVAL '1 minute')", [env.securityRequestLimit]);
  assert.equal((await request('/api/content/news')).status, 429);
  assert.ok(await store.activeBlock('127.0.0.1'));
  await client.query('TRUNCATE security_counters, security_ip_blocks');
  await client.query("INSERT INTO security_counters(ip,kind,count,expires_at) VALUES ('127.0.0.1','writes',$1,NOW()+INTERVAL '1 minute')", [env.securityWriteLimit]);
  assert.equal((await request('/api/assistant/requests', json({}))).status, 429);
});

integration('retention removes old records and expired blocks without deleting recent evidence', async () => {
  const req = { ip: '203.0.113.8', method: 'GET', url: '/test' };
  await store.record(req, { type: 'probe', severity: 'high', status: 403, summary: 'Old evidence' });
  await client.query("UPDATE security_events SET last_seen = NOW() - INTERVAL '400 days'");
  await store.record({ ...req, url: '/new' }, { type: 'probe', severity: 'high', status: 403, summary: 'New evidence' });
  await store.increment('203.0.113.8', 'old', 60);
  await client.query("UPDATE security_counters SET expires_at = NOW() - INTERVAL '1 second'");
  await store.block('203.0.113.8', 'Expired test');
  await client.query("UPDATE security_ip_blocks SET blocked_until = NOW() - INTERVAL '1 second'");
  await store.cleanup();
  assert.equal((await client.query('SELECT * FROM security_events')).rows.length, 1);
  assert.equal((await client.query('SELECT * FROM security_counters')).rows.length, 0);
  assert.equal(await store.activeBlock('203.0.113.8'), null);
});
