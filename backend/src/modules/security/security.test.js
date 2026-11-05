import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EventEmitter } from 'node:events';
import { classifyRequest, normalizeIp, clientIp, responseEvent, safePath } from './security-rules.js';
import { createSecurityStore } from './security.store.js';
import { eventFilters } from './security.routes.js';
import { createSecurityMonitor } from '../../middleware/security-monitor.js';
import { validatePasswordStrength } from '../../utils/password-policy.js';

test('canonicalizes IPs and never trusts a raw forwarding header', () => {
  assert.equal(normalizeIp('::ffff:203.0.113.8'), '203.0.113.8');
  assert.equal(normalizeIp('2001:0DB8:0000:0000:0000:0000:0000:0001'), '2001:db8::1');
  for (const value of ['example.org', '127.0.0.1, 203.0.113.8', '1.2.3.4/24', '1.2.3.999', 'fe80::1%eth0', '']) assert.equal(normalizeIp(value), null);
  assert.equal(clientIp({ ip: '203.0.113.8', headers: { 'x-forwarded-for': '127.0.0.1' } }), '203.0.113.8');
});

test('rejects encoded traversal, secret files and high-confidence URL payloads', () => {
  const cases = [
    ['/api/%252e%252e%252f.env', 'path_traversal'], ['/api/..\\.env', 'path_traversal'],
    ['/.env.production', 'sensitive_probe'], ['/.git/config', 'sensitive_probe'], ['/wp-login.php', 'sensitive_probe'],
    ['/api/content/news?q=1+UNION+SELECT+password', 'sql_probe'], ['/api/content/news?q=pg_sleep(5)', 'sql_probe'],
    ['/api/content/news?q=%3Cscript%3Ealert(1)', 'xss_probe'], ['/api/content/news?q=%3Cimg%20onerror=alert(1)%3E', 'xss_probe']
  ];
  for (const [originalUrl, type] of cases) assert.equal(classifyRequest({ originalUrl, method: 'GET' })?.type, type, originalUrl);
  assert.equal(classifyRequest({ originalUrl: '/a', method: 'TRACE' })?.type, 'invalid_method');
  assert.equal(classifyRequest({ originalUrl: '/a?' + 'x'.repeat(8192), method: 'GET' })?.type, 'oversized_url');
});

test('preserves legitimate CMS HTML, passwords, Uzbek names and search text', () => {
  for (const originalUrl of ['/api/content/news?search=O%27ktam', '/api/settings/site-theme', '/api/content/menus/tree', '/api/media/images/123.png', '/api/content/news?search=SQL%20kursi']) {
    assert.equal(classifyRequest({ originalUrl, method: 'PUT', body: { content: '<p>SQL SELECT va xavfsizlik</p>', password: '<script>' } }), null);
  }
  assert.equal(safePath({ originalUrl: '/api/account/me?token=private-secret' }), '/api/account/me');
});

test('classifies responses without treating every failure as an attack', () => {
  const login = { originalUrl: '/API/account/login/', method: 'POST' };
  assert.equal(responseEvent(login, 200).type, 'login_success');
  assert.equal(responseEvent(login, 401).type, 'login_failure');
  assert.equal(responseEvent({ originalUrl: '/api/content/news', method: 'GET' }, 404), null);
  assert.equal(responseEvent(login, 500).type, 'server_error');
});

test('uses bound SQL and keeps secrets out of audit records', async () => {
  const calls = [];
  const store = createSecurityStore(async (sql, params) => { calls.push({ sql, params }); return { rows: [] }; });
  await store.record({ ip: '203.0.113.8', originalUrl: '/api/account/login?token=QUERY_SECRET', method: 'POST',
    headers: { authorization: 'Bearer TOKEN_SECRET', cookie: 'COOKIE_SECRET', 'user-agent': 'browser\r\nforged-line' },
    body: { password: 'PASSWORD_SECRET', identity: 'PERSONAL_SECRET' } },
  { type: 'login_failure', severity: 'medium', status: 401, summary: 'Login failed.' });
  const serialized = JSON.stringify(calls[0].params);
  for (const secret of ['QUERY_SECRET', 'TOKEN_SECRET', 'COOKIE_SECRET', 'PASSWORD_SECRET', 'PERSONAL_SECRET', '\\r', '\\n']) assert.equal(serialized.includes(secret), false);
  assert.match(calls[0].sql, /VALUES \(\$1,\$2/);
  assert.equal(calls[0].params[6], '/api/account/login');
});

test('validates all journal filters before SQL and enforces bcrypt byte limits', () => {
  assert.equal(eventFilters({ ip: '::ffff:203.0.113.8' }).ip, '203.0.113.8');
  for (const input of [{ page: '-1' }, { limit: '101' }, { hours: 'NaN' }, { hours: '9000' }, { ip: "' OR 1=1" }, { severity: 'x' }, { type: 'a; DROP TABLE x' }, { action: 'delete' }]) assert.throws(() => eventFilters(input), { statusCode: 400 });
  assert.equal(validatePasswordStrength('Aa1!' + 'ж'.repeat(40)).valid, false);
});

test('storage failure fails closed without exposing implementation errors', async () => {
  const monitor = createSecurityMonitor({ activeBlock: async () => { throw new Error('connection password=secret'); } });
  const req = { ip: '203.0.113.8', path: '/api/content/news', url: '/api/content/news', method: 'GET' };
  const res = new EventEmitter();
  res.headers = {};
  res.set = (key, value) => { res.headers[key] = value; return res; };
  res.status = (value) => { res.statusCode = value; return res; };
  res.json = (body) => { res.body = body; return res; };
  let nextCalled = false;
  await monitor.middleware(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 503);
  assert.equal(JSON.stringify(res.body).includes('password'), false);
  assert.equal(res.headers['Retry-After'], '30');
  assert.ok(monitor.state.lastErrorAt);
});
