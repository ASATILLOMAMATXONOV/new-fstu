import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { query, withTransaction } from '../../db/pool.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/http-error.js';
import { assertStrongPassword, hashPassword, validatePasswordStrength } from '../../utils/password-policy.js';
import { clientIp } from '../security/security-rules.js';
import { createSession } from './session.service.js';
import { decryptSecret, digest, encryptSecret, newTotpSecret, opaqueToken, recoveryCodes,
  recoveryHash, totp, userAgentHash, verifiedStep } from './auth-crypto.js';

const invalid = () => new HttpError(401, 'Tasdiqlash muddati tugagan yoki ma’lumot noto‘g‘ri. Kirishni qaytadan boshlang.');
const passwordContext = user => ({ login: user.login, email: user.email, fullName: user.full_name });
const locked = user => user.locked_until && new Date(user.locked_until).getTime() > Date.now();

async function enrollmentResponse(challenge, user, token) {
  const secret = decryptSecret(challenge.pending_secret_encrypted, user.id);
  const uri = totp(secret, user.login).toString();
  return { challengeToken: token, stage: 'enroll', expiresAt: challenge.expires_at, secret,
    qrCode: await QRCode.toDataURL(uri, { width: 240, margin: 2, errorCorrectionLevel: 'M' }) };
}

async function nextResponse(client, challenge, user, token, stage) {
  const secret = stage === 'enroll' ? encryptSecret(newTotpSecret(), user.id) : null;
  const result = await client.query(`UPDATE admin_login_challenges SET stage=$2,pending_secret_encrypted=$3,
    token_version=$4,requires_password_change=$5 WHERE id=$1 RETURNING *`,
  [challenge.id, stage, secret, user.token_version, Boolean(challenge.requires_password_change)]);
  return stage === 'enroll' ? enrollmentResponse(result.rows[0], user, token) :
    { challengeToken: token, stage, expiresAt: result.rows[0].expires_at };
}

export async function beginMfaLogin(snapshot, password, req) {
  return withTransaction(async client => {
    const user = (await client.query('SELECT * FROM admin_users WHERE id=$1 FOR UPDATE', [snapshot.id])).rows[0];
    if (!user?.active || locked(user) || user.password_hash !== snapshot.password_hash) throw invalid();
    const count = (await client.query(`SELECT COUNT(*)::int AS count FROM admin_login_challenges
      WHERE admin_id=$1 AND created_at > NOW()-INTERVAL '10 minutes'`, [user.id])).rows[0].count;
    if (count >= 10) throw new HttpError(429, 'Juda ko‘p tasdiqlash urinishlari. 10 daqiqadan keyin qayta urinib ko‘ring.');
    // Rehash old bcrypt work factors only after a verified password, without changing it.
    if (bcrypt.getRounds(user.password_hash) < env.bcryptRounds) {
      user.password_hash = await hashPassword(password);
      await client.query('UPDATE admin_users SET password_hash=$2 WHERE id=$1', [user.id, user.password_hash]);
    }
    const requiresChange = user.password_reset_required || !validatePasswordStrength(password, passwordContext(user)).valid;
    // Already enrolled users must prove MFA BEFORE replacing an old/weak password.
    const stage = user.mfa_enabled ? 'verify' : requiresChange ? 'password_change' : env.adminMfaRequired ? 'enroll' : 'complete';
    // MFA optional and password already acceptable: issue the session immediately.
    if (stage === 'complete') return completeSession(client, user, req);
    const token = opaqueToken();
    const pending = stage === 'enroll' ? encryptSecret(newTotpSecret(), user.id) : null;
    const challenge = (await client.query(`INSERT INTO admin_login_challenges
      (id,token_hash,admin_id,token_version,stage,requires_password_change,pending_secret_encrypted,ip,user_agent_hash)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [randomUUID(), digest(token), user.id, user.token_version, stage, requiresChange, pending, clientIp(req), userAgentHash(req)])).rows[0];
    return stage === 'enroll' ? enrollmentResponse(challenge, user, token) :
      { challengeToken: token, stage, expiresAt: challenge.expires_at,
        ...(stage === 'password_change' ? { passwordHint: 'Kamida 12 belgi, katta/kichik harf, raqam va maxsus belgi. Login yoki oddiy parollardan foydalanmang.' } : {}) };
  });
}

async function withChallenge(token, req, stages, work) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw invalid();
  const result = await withTransaction(async client => {
    // Always lock the user before a challenge. Completion removes other challenges;
    // the opposite lock order could deadlock simultaneous logins on two devices.
    await client.query(`SELECT id FROM admin_users WHERE id=(SELECT admin_id FROM admin_login_challenges
      WHERE token_hash=$1) FOR UPDATE`, [digest(token)]);
    const challenge = (await client.query(`SELECT c.*,host(c.ip) AS client_ip,row_to_json(u) AS admin
      FROM admin_login_challenges c JOIN admin_users u ON c.admin_id=u.id
      WHERE c.token_hash=$1 FOR UPDATE OF c`, [digest(token)])).rows[0];
    if (!challenge || !stages.includes(challenge.stage) || new Date(challenge.expires_at).getTime() <= Date.now() ||
      challenge.attempts >= 5 || !challenge.admin.active || locked(challenge.admin) ||
      challenge.token_version !== challenge.admin.token_version || challenge.client_ip !== clientIp(req) ||
      challenge.user_agent_hash !== userAgentHash(req)) return { error: invalid() };
    return work(client, challenge, challenge.admin);
  });
  if (result?.error) throw result.error;
  return result;
}

async function rejectCode(client, challenge, user) {
  await client.query('UPDATE admin_login_challenges SET attempts=attempts+1 WHERE id=$1', [challenge.id]);
  await client.query(`UPDATE admin_users SET failed_login_attempts=CASE WHEN locked_until<=NOW() THEN 1 ELSE failed_login_attempts+1 END,
    locked_until=CASE WHEN (CASE WHEN locked_until<=NOW() THEN 1 ELSE failed_login_attempts+1 END)>=$2
      THEN NOW()+$3*INTERVAL '1 minute' ELSE locked_until END,last_failed_login_at=NOW() WHERE id=$1`,
  [user.id, env.authMaxFailedAttempts, env.authLockMinutes]);
  // Return the error so the transaction commits the attempt counters.
  return { error: new HttpError(401, 'Kod noto‘g‘ri, ishlatilgan yoki muddati tugagan. Yangi kodni kiriting.') };
}

async function completeSession(client, user, req) {
  const updated = (await client.query(`UPDATE admin_users SET failed_login_attempts=0,locked_until=NULL,
    last_login_at=NOW(),last_login_ip=$2,updated_at=NOW() WHERE id=$1 RETURNING *`, [user.id, clientIp(req)])).rows[0];
  await client.query('DELETE FROM admin_login_challenges WHERE admin_id=$1', [user.id]);
  return { session: await createSession(updated, req, client.query.bind(client)) };
}

async function complete(client, challenge, user, req) {
  // With mandatory MFA the second factor must be proven; when MFA is optional
  // (ADMIN_MFA_REQUIRED=false) a verified password is enough.
  const mfaSatisfied = !env.adminMfaRequired || (challenge.mfa_verified && user.mfa_enabled);
  if (!mfaSatisfied || user.password_reset_required || challenge.requires_password_change) throw invalid();
  return completeSession(client, user, req);
}

async function showRecoveryCodes(client, challenge, user, token) {
  const recovery = recoveryCodes();
  await client.query('UPDATE admin_users SET mfa_recovery_hashes=$2::jsonb WHERE id=$1', [user.id, JSON.stringify(recovery.hashes)]);
  await client.query(`UPDATE admin_login_challenges SET stage='recovery_codes',mfa_verified=TRUE,
    pending_secret_encrypted=NULL,token_version=$2 WHERE id=$1`, [challenge.id, user.token_version]);
  return { challengeToken: token, stage: 'recovery_codes', expiresAt: challenge.expires_at, recoveryCodes: recovery.codes };
}

export function changeLoginPassword(payload, req) {
  return withChallenge(payload?.challengeToken, req, ['password_change'], async (client, challenge, user) => {
    const password = payload?.newPassword;
    if (typeof password !== 'string') throw new HttpError(400, 'Yangi parolni kiriting.');
    assertStrongPassword(password, passwordContext(user));
    if (await bcrypt.compare(password, user.password_hash)) throw new HttpError(400, 'Yangi parol avvalgisidan farq qilishi kerak.');
    const hash = await hashPassword(password);
    const updated = (await client.query(`UPDATE admin_users SET password_hash=$2,password_reset_required=FALSE,
      password_changed_at=NOW(),token_version=token_version+1,updated_at=NOW() WHERE id=$1 RETURNING *`, [user.id, hash])).rows[0];
    await client.query('UPDATE admin_sessions SET revoked_at=NOW() WHERE admin_id=$1 AND revoked_at IS NULL', [user.id]);
    await client.query('UPDATE admin_login_challenges SET token_version=$2,requires_password_change=FALSE WHERE id=$1', [challenge.id, updated.token_version]);
    const nextChallenge = { ...challenge, token_version: updated.token_version, requires_password_change: false };
    if (updated.mfa_enabled && nextChallenge.mfa_verified) return complete(client, nextChallenge, updated, req);
    // MFA optional: the new password alone completes the login (the "one-time" first password).
    if (!env.adminMfaRequired && !updated.mfa_enabled) return complete(client, nextChallenge, updated, req);
    return nextResponse(client, nextChallenge, updated, payload.challengeToken, 'enroll');
  });
}

export function verifyLoginMfa(payload, req) {
  return withChallenge(payload?.challengeToken, req, ['verify', 'enroll'], async (client, challenge, user) => {
    if (challenge.stage === 'verify' && payload?.useRecoveryCode === true) {
      const hash = recoveryHash(payload.code);
      const hashes = Array.isArray(user.mfa_recovery_hashes) ? user.mfa_recovery_hashes : [];
      if (!hash || !hashes.includes(hash)) return rejectCode(client, challenge, user);
      await client.query('UPDATE admin_users SET mfa_recovery_hashes=$2::jsonb WHERE id=$1', [user.id, JSON.stringify(hashes.filter(item => item !== hash))]);
      // Recovery proves possession of a backup factor; replace the lost authenticator
      // before granting a session. It never disables the second factor.
      await client.query('UPDATE admin_login_challenges SET mfa_verified=FALSE WHERE id=$1', [challenge.id]);
      return nextResponse(client, challenge, user, payload.challengeToken, challenge.requires_password_change ? 'password_change' : 'enroll');
    }
    const encrypted = challenge.stage === 'enroll' ? challenge.pending_secret_encrypted : user.mfa_secret_encrypted;
    const step = verifiedStep(decryptSecret(encrypted, user.id), payload?.code,
      challenge.stage === 'enroll' ? -1 : user.mfa_last_step);
    if (step === null) return rejectCode(client, challenge, user);
    if (challenge.stage === 'enroll') {
      const updated = (await client.query(`UPDATE admin_users SET mfa_enabled=TRUE,mfa_secret_encrypted=$2,
        mfa_last_step=$3,token_version=token_version+1,updated_at=NOW() WHERE id=$1 RETURNING *`, [user.id, encrypted, step])).rows[0];
      await client.query('UPDATE admin_sessions SET revoked_at=NOW() WHERE admin_id=$1 AND revoked_at IS NULL', [user.id]);
      await client.query('DELETE FROM admin_login_challenges WHERE admin_id=$1 AND id<>$2', [user.id, challenge.id]);
      return showRecoveryCodes(client, challenge, updated, payload.challengeToken);
    }
    await client.query('UPDATE admin_users SET mfa_last_step=$2 WHERE id=$1', [user.id, step]);
    await client.query('UPDATE admin_login_challenges SET mfa_verified=TRUE WHERE id=$1', [challenge.id]);
    const verified = { ...challenge, mfa_verified: true };
    if (challenge.requires_password_change) return nextResponse(client, verified, user, payload.challengeToken, 'password_change');
    if (payload.regenerateRecoveryCodes === true) return showRecoveryCodes(client, verified, user, payload.challengeToken);
    return complete(client, verified, user, req);
  });
}

export function acknowledgeRecoveryCodes(payload, req) {
  if (payload?.acknowledged !== true) throw new HttpError(400, 'Tiklash kodlarini saqlaganingizni tasdiqlang.');
  return withChallenge(payload?.challengeToken, req, ['recovery_codes'], (client, challenge, user) => complete(client, challenge, user, req));
}

export async function accountSecuritySummary(run = query) {
  const result = await run(`SELECT COUNT(*)::int AS total,
    COUNT(*) FILTER(WHERE mfa_enabled)::int AS enrolled,
    COUNT(*) FILTER(WHERE password_reset_required)::int AS password_reset_required,
    COUNT(*) FILTER(WHERE locked_until>NOW())::int AS locked FROM admin_users WHERE active=TRUE`);
  return result.rows[0];
}
