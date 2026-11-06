import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { createApp } from '../../app.js';
import pool from '../../db/pool.js';
import { env } from '../../config/env.js';
import { decryptSecret, encryptSecret, recoveryCodes, totp } from './auth-crypto.js';
import { createSession, sessionCookieName } from './session.service.js';
import { verifyLoginMfa } from './mfa.service.js';
import { ensureDefaultAdmin } from './account.service.js';

const enabled = process.env.SECURITY_DB_TESTS === '1';
const integration = (name, action) => test(name, { skip: !enabled }, action);
const schema = `mfa_test_${randomUUID().replaceAll('-', '')}`;
const password = 'Rain!Forest9Moon-Cobalt';
const weakPassword = 'Admin@123456!';
const secret = 'JBSWY3DPEHPK3PXP';
const agent = 'mfa-integration';
const requestContext = { ip: '127.0.0.1', headers: { 'user-agent': agent } };
const original = { query: pool.query, connect: pool.connect, rounds: env.bcryptRounds };
const ownerClient = new pg.Client({ connectionString: env.databaseUrl, connectionTimeoutMillis: 3000 });
let database, app, server, base, hash, weakHash;

async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers: { 'User-Agent': agent, ...options.headers } });
  const data = response.status === 204 ? null : await response.json();
  await app.locals.securityMonitor.drain();
  return { response, data, status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
const post = (path, body, headers = {}) => request('/api/account' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const start = (identity = 'owner', value = password) => post('/login', { identity, password: value });
const verify = (challenge, code, extra = {}) => post('/login/verify', { challengeToken: challenge.challengeToken, code, ...extra });
const confirm = challenge => post('/login/confirm', { challengeToken: challenge.challengeToken, acknowledged: true });
const token = value => totp(value).generate();

async function enrolledLogin(extra = {}) {
  const begun = await start('enrolled-user');
  assert.equal(begun.data.stage, 'verify');
  return verify(begun.data, token(secret), extra);
}

before(async () => {
  if (!enabled) return;
  if (!env.mfaEncryptionKey) env.mfaEncryptionKey = 'bc'.repeat(32);
  env.bcryptRounds = 4; // Test-only cost; runtime configuration enforces at least 12.
  await ownerClient.connect();
  await ownerClient.query(`CREATE SCHEMA ${schema}`);
  database = new pg.Pool({ connectionString: env.databaseUrl, options: `-c search_path=${schema}`, max: 8, connectionTimeoutMillis: 3000 });
  for (const file of ['001_initial_schema.sql','010_security_monitoring.sql','011_security_ip_intelligence.sql','012_security_honeytokens.sql','013_admin_multifactor_sessions.sql']) {
    await database.query(await readFile(new URL(`../../../migrations/${file}`, import.meta.url), 'utf8'));
  }
  hash = await bcrypt.hash(password, 4);
  weakHash = await bcrypt.hash(weakPassword, 4);
  pool.query = database.query.bind(database);
  pool.connect = database.connect.bind(database);
  await database.query(`INSERT INTO admin_users(full_name,login,password_hash,role)
    VALUES('Test Owner','owner',$1,'super_admin'),('Test Enrolled','enrolled-user',$1,'admin')`, [hash]);
  app = createApp();
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(async () => {
  if (!enabled) return;
  await app.locals.securityMonitor.drain();
  await database.query('TRUNCATE admin_login_challenges,admin_sessions,security_events,security_counters,security_ip_blocks');
  await database.query(`UPDATE admin_users SET password_hash=$1,token_version=1,active=TRUE,
    failed_login_attempts=0,locked_until=NULL,mfa_enabled=FALSE,mfa_secret_encrypted=NULL,
    mfa_last_step=-1,mfa_recovery_hashes='[]'::jsonb,password_reset_required=FALSE`, [hash]);
  await database.query('UPDATE admin_users SET mfa_enabled=TRUE,mfa_secret_encrypted=$1 WHERE id=2', [encryptSecret(secret, 2)]);
});

after(async () => {
  if (!enabled) return;
  if (server) { await new Promise(resolve => server.close(resolve)); await app.locals.securityMonitor.drain(); }
  pool.query = original.query; pool.connect = original.connect; env.bcryptRounds = original.rounds;
  if (database) await database.end();
  await ownerClient.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await ownerClient.end(); await pool.end();
});

integration('admin seeder explicitly restores env credentials without resetting them on normal startup', async () => {
  const originalDefaults = {
    defaultAdminLogin: env.defaultAdminLogin,
    defaultAdminEmail: env.defaultAdminEmail,
    defaultAdminFullName: env.defaultAdminFullName,
    defaultAdminPassword: env.defaultAdminPassword,
    syncDefaultAdminOnBoot: env.syncDefaultAdminOnBoot
  };
  const seedPassword = 'Cobalt!Ocean7-MoonRiver';
  try {
    Object.assign(env, {
      defaultAdminLogin: 'owner', defaultAdminEmail: 'owner@example.test',
      defaultAdminFullName: 'Test Owner', defaultAdminPassword: seedPassword,
      syncDefaultAdminOnBoot: false
    });
    await database.query(`UPDATE admin_users SET active=FALSE,failed_login_attempts=5,
      locked_until=NOW()+INTERVAL '15 minutes' WHERE id=1`);
    await ensureDefaultAdmin();
    const unchanged = (await database.query('SELECT * FROM admin_users WHERE id=1')).rows[0];
    assert.equal(await bcrypt.compare(seedPassword, unchanged.password_hash), false);
    assert.equal(unchanged.active, false);

    await ensureDefaultAdmin({ syncExisting: true });
    const synced = (await database.query('SELECT * FROM admin_users WHERE id=1')).rows[0];
    assert.equal(await bcrypt.compare(seedPassword, synced.password_hash), true);
    assert.equal(synced.email, 'owner@example.test');
    assert.equal(synced.active, true);
    assert.equal(synced.failed_login_attempts, 0);
    assert.equal(synced.locked_until, null);
    assert.equal(synced.token_version, unchanged.token_version + 1);

    env.defaultAdminPassword = 'Different!Bootstrap9-Silver';
    await ensureDefaultAdmin();
    const afterRestart = (await database.query('SELECT password_hash FROM admin_users WHERE id=1')).rows[0];
    assert.equal(await bcrypt.compare(seedPassword, afterRestart.password_hash), true);
  } finally {
    Object.assign(env, originalDefaults);
  }
});

integration('with ADMIN_MFA_REQUIRED disabled, a correct password alone grants a session', async () => {
  env.adminMfaRequired = false;
  try {
    const begun = await start('owner');
    assert.equal(begun.status, 200);
    assert.equal(begun.data.stage, undefined);
    assert.equal(begun.data.user.login, 'owner');
    assert.ok(begun.cookie && begun.cookie.startsWith(`${sessionCookieName()}=`));
    const me = await request('/api/account/me', { headers: { Cookie: begun.cookie } });
    assert.equal(me.status, 200);
    assert.equal(me.data.user.login, 'owner');
    const wrong = await start('owner', 'Wrong!Password9000-Zzz');
    assert.equal(wrong.status, 401);
  } finally {
    env.adminMfaRequired = true;
  }
});

integration('password-only access never grants a session; enrollment secrets are encrypted at rest', async () => {
  const begun = await start();
  assert.equal(begun.status, 200);
  assert.equal(begun.data.stage, 'enroll');
  assert.equal(begun.cookie, undefined);
  assert.equal(begun.data.serviceToken, undefined);
  assert.match(begun.data.qrCode, /^data:image\/png;base64,/);
  assert.match(begun.data.secret, /^[A-Z2-7]+$/);
  const stored = (await database.query('SELECT * FROM admin_login_challenges')).rows[0];
  assert.notEqual(stored.token_hash, begun.data.challengeToken);
  assert.equal(JSON.stringify(stored).includes(begun.data.secret), false);
  assert.equal(decryptSecret(stored.pending_secret_encrypted, 1), begun.data.secret);
  assert.equal((await request('/api/account/me')).status, 401);
  assert.equal((await request('/api/account/me', { headers: { Authorization: `Bearer ${begun.data.challengeToken}` } })).status, 401);
  const premature = await confirm(begun.data);
  assert.equal(premature.status, 401);
  assert.equal(premature.cookie, undefined);
});

integration('enrollment verifies the code, shows ten backup codes once, then sets an HttpOnly cookie', async () => {
  const begun = await start();
  const verified = await verify(begun.data, token(begun.data.secret));
  assert.equal(verified.data.stage, 'recovery_codes');
  assert.equal(verified.cookie, undefined);
  assert.equal(verified.data.recoveryCodes.length, 10);
  const stored = (await database.query('SELECT * FROM admin_users WHERE id=1')).rows[0];
  assert.equal(stored.mfa_enabled, true);
  assert.equal(JSON.stringify(stored).includes(verified.data.recoveryCodes[0]), false);
  const result = await confirm(verified.data);
  assert.equal(result.status, 200);
  assert.equal(result.data.user.mfaEnabled, true);
  assert.equal(result.data.serviceToken, undefined);
  assert.ok(result.data.csrfToken);
  assert.match(result.response.headers.get('set-cookie'), /HttpOnly/i);
  assert.match(result.response.headers.get('set-cookie'), /SameSite=Strict/i);
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie } })).status, 200);
  assert.equal((await confirm(verified.data)).status, 401);
  assert.equal((await database.query("SELECT COUNT(*)::int AS count FROM security_events WHERE event_type='login_success'")).rows[0].count, 1);
});

integration('weak passwords must change before an unenrolled account can proceed', async () => {
  await database.query('UPDATE admin_users SET password_hash=$1 WHERE id=1', [weakHash]);
  const begun = await start('owner', weakPassword);
  assert.equal(begun.data.stage, 'password_change');
  assert.equal(begun.cookie, undefined);
  assert.equal((await post('/login/password', { challengeToken: begun.data.challengeToken, newPassword: weakPassword })).status, 400);
  const updated = await post('/login/password', { challengeToken: begun.data.challengeToken, newPassword: password });
  assert.equal(updated.data.stage, 'enroll');
  assert.equal(updated.cookie, undefined);
  const user = (await database.query('SELECT * FROM admin_users WHERE id=1')).rows[0];
  assert.equal(await bcrypt.compare(password, user.password_hash), true);
  assert.equal(await bcrypt.compare(weakPassword, user.password_hash), false);
  assert.equal((await verify(updated.data, token(updated.data.secret))).data.stage, 'recovery_codes');
});

integration('an enrolled user must prove MFA before changing a weak password', async () => {
  await database.query('UPDATE admin_users SET password_hash=$1 WHERE id=2', [weakHash]);
  const begun = await start('enrolled-user', weakPassword);
  assert.equal(begun.data.stage, 'verify');
  assert.equal(begun.data.secret, undefined);
  assert.equal((await post('/login/password', { challengeToken: begun.data.challengeToken, newPassword: password })).status, 401);
  const verified = await verify(begun.data, token(secret));
  assert.equal(verified.data.stage, 'password_change');
  const changed = await post('/login/password', { challengeToken: verified.data.challengeToken, newPassword: password });
  assert.equal(changed.status, 200);
  assert.ok(changed.cookie);
});

integration('wrong passwords and unknown users fail without disclosing account details', async () => {
  const existing = await start('owner', 'Unknown!Password9');
  const unknown = await start('does-not-exist', 'Unknown!Password9');
  assert.equal(existing.status, 401); assert.equal(unknown.status, 401);
  assert.equal(existing.data.message, unknown.data.message);
  assert.equal(existing.cookie, undefined); assert.equal(unknown.cookie, undefined);
  assert.equal((await database.query('SELECT * FROM admin_login_challenges')).rows.length, 0);
});

integration('five wrong second-factor codes lock the account across fresh challenges', async () => {
  const correct = token(secret), wrong = correct === '000000' ? '111111' : '000000';
  for (let i=0; i<5; i+=1) {
    const begun = await start('enrolled-user');
    assert.equal(begun.status, 200);
    assert.equal((await verify(begun.data, wrong)).status, 401);
  }
  const user = (await database.query('SELECT * FROM admin_users WHERE id=2')).rows[0];
  assert.equal(user.failed_login_attempts, 5);
  assert.ok(new Date(user.locked_until).getTime() > Date.now());
  await database.query('TRUNCATE security_ip_blocks,security_counters');
  assert.equal((await start('enrolled-user')).status, 401);
});

integration('expired, foreign-device and foreign-IP challenges cannot grant access', async () => {
  const begun = await start('enrolled-user');
  const foreign = await post('/login/verify', { challengeToken: begun.data.challengeToken, code: token(secret) }, { 'User-Agent': 'another-browser' });
  assert.equal(foreign.status, 401);
  await assert.rejects(() => verifyLoginMfa({ challengeToken: begun.data.challengeToken, code: token(secret) }, { ip: '203.0.113.10', headers: { 'user-agent': agent } }), { statusCode: 401 });
  await database.query("UPDATE admin_login_challenges SET expires_at=NOW()-INTERVAL '1 second'");
  assert.equal((await verify(begun.data, token(secret))).status, 401);
});

integration('TOTP values and consumed challenges cannot be replayed, even concurrently', async () => {
  const begun = await start('enrolled-user');
  const code = token(secret);
  const responses = await Promise.all([verify(begun.data, code), verify(begun.data, code)]);
  assert.deepEqual(responses.map(r=>r.status).sort(), [200,401]);
  assert.equal((await database.query('SELECT * FROM admin_sessions')).rows.length, 1);
  const next = await start('enrolled-user');
  assert.equal((await verify(next.data, code)).status, 401);
});

integration('simultaneous distinct login challenges serialize without a deadlock or second session', async () => {
  const first = await start('enrolled-user');
  const second = await start('enrolled-user');
  const code = token(secret);
  const responses = await Promise.all([verify(first.data, code), verify(second.data, code)]);
  assert.deepEqual(responses.map(item => item.status).sort(), [200, 401]);
  assert.equal((await database.query('SELECT COUNT(*)::int AS count FROM admin_sessions')).rows[0].count, 1);
});

integration('backup codes are single use and require a replacement authenticator', async () => {
  const backups = recoveryCodes();
  await database.query('UPDATE admin_users SET mfa_recovery_hashes=$1::jsonb WHERE id=2', [JSON.stringify(backups.hashes)]);
  const begun = await start('enrolled-user');
  const recovery = await verify(begun.data, backups.codes[0], { useRecoveryCode: true });
  assert.equal(recovery.data.stage, 'enroll');
  assert.equal(recovery.cookie, undefined);
  const second = await start('enrolled-user');
  assert.equal((await verify(second.data, backups.codes[0], { useRecoveryCode: true })).status, 401);
  const replaced = await verify(recovery.data, token(recovery.data.secret));
  assert.equal(replaced.data.stage, 'recovery_codes');
  assert.ok((await confirm(replaced.data)).cookie);
  const user = (await database.query('SELECT * FROM admin_users WHERE id=2')).rows[0];
  assert.equal(decryptSecret(user.mfa_secret_encrypted, 2), recovery.data.secret);
  assert.equal(user.mfa_recovery_hashes.includes(backups.hashes[0]), false);
});

integration('valid MFA can regenerate backup codes without exposing the existing secret', async () => {
  const result = await enrolledLogin({ regenerateRecoveryCodes: true });
  assert.equal(result.data.stage, 'recovery_codes');
  assert.equal(result.data.recoveryCodes.length, 10);
  assert.equal(result.data.secret, undefined);
  assert.equal(result.cookie, undefined);
  assert.ok((await confirm(result.data)).cookie);
});

integration('authenticated writes require CSRF; logout revokes the server session', async () => {
  const result = await enrolledLogin();
  assert.ok(result.cookie);
  assert.equal((await post('/logout', {}, { Cookie: result.cookie })).status, 403);
  assert.equal((await post('/logout', {}, { Cookie: result.cookie, 'X-CSRF-Token': 'wrong' })).status, 403);
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie } })).status, 200);
  assert.equal((await post('/logout', {}, { Cookie: result.cookie, 'X-CSRF-Token': result.data.csrfToken })).status, 204);
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie } })).status, 401);
});

integration('legacy bearer tokens, changed devices, expired and idle sessions are rejected', async () => {
  const result = await enrolledLogin();
  const raw = result.cookie.split('=')[1];
  assert.equal((await request('/api/account/me', { headers: { Authorization: `Bearer ${raw}` } })).status, 401);
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie, 'User-Agent': 'stolen-device' } })).status, 401);
  await database.query("UPDATE admin_sessions SET last_seen_at=NOW()-INTERVAL '2 hours'");
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie } })).status, 401);
  await database.query("UPDATE admin_sessions SET last_seen_at=NOW(),expires_at=NOW()-INTERVAL '1 second'");
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie } })).status, 401);
});

integration('account changes invalidate pending challenges and active sessions', async () => {
  const begun = await start('enrolled-user');
  await database.query('UPDATE admin_users SET token_version=token_version+1 WHERE id=2');
  assert.equal((await verify(begun.data, token(secret))).status, 401);
  const result = await enrolledLogin();
  await database.query('UPDATE admin_users SET token_version=token_version+1 WHERE id=2');
  assert.equal((await request('/api/account/me', { headers: { Cookie: result.cookie } })).status, 401);
});

integration('only three active sessions remain, and logout-all revokes them all', async () => {
  const user = (await database.query('SELECT * FROM admin_users WHERE id=2')).rows[0];
  const sessions = [];
  for (let i=0;i<4;i+=1) sessions.push(await createSession(user, requestContext));
  assert.equal((await database.query('SELECT * FROM admin_sessions WHERE revoked_at IS NULL')).rows.length, 3);
  const headers = { Cookie: `${sessionCookieName()}=${sessions[3].token}`, 'X-CSRF-Token': sessions[3].csrfToken };
  assert.equal((await post('/logout-all', {}, headers)).status, 204);
  assert.equal((await database.query('SELECT * FROM admin_sessions WHERE revoked_at IS NULL')).rows.length, 0);
});

integration('security records contain no passwords, challenge tokens, TOTP secrets or backup values', async () => {
  const begun = await start();
  const result = await verify(begun.data, token(begun.data.secret));
  await confirm(result.data);
  const rows = (await database.query('SELECT * FROM security_events')).rows;
  const serialized = JSON.stringify(rows);
  for (const sensitive of [password, begun.data.challengeToken, begun.data.secret, ...result.data.recoveryCodes]) assert.equal(serialized.includes(sensitive), false);
});
