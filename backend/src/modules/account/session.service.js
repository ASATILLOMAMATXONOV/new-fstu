import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { query } from '../../db/pool.js';
import { clientIp } from '../security/security-rules.js';
import { csrfFor, digest, opaqueToken, userAgentHash, constantEqual } from './auth-crypto.js';
import { serializeAdminUser } from './account-user.js';
import { HttpError } from '../../utils/http-error.js';

export const sessionCookieName = () => env.nodeEnv === 'production' ? '__Host-fstu_session' : 'fstu_session';
const cookieOptions = () => ({ httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'strict', path: '/' });

function cookieToken(req) {
  const cookies = String(req.headers?.cookie || '').split(';').map(item => item.trim());
  const matches = cookies.filter(item => item.startsWith(`${sessionCookieName()}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(sessionCookieName().length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

export const hasSessionCookie = req => Boolean(cookieToken(req));

export async function createSession(user, req, execute = query) {
  if (!user.active || user.password_reset_required || (env.adminMfaRequired && !user.mfa_enabled)) throw new HttpError(401, 'Complete authentication is required.');
  const id = randomUUID(), token = opaqueToken();
  // Keep at most three active sessions per administrator.
  await execute(`UPDATE admin_sessions SET revoked_at = NOW() WHERE admin_id = $1 AND revoked_at IS NULL
    AND id NOT IN (SELECT id FROM admin_sessions WHERE admin_id = $1 AND revoked_at IS NULL
      AND expires_at > NOW() ORDER BY created_at DESC LIMIT 2)`, [user.id]);
  const result = await execute(`INSERT INTO admin_sessions(id,token_hash,admin_id,token_version,ip,user_agent_hash,expires_at)
    VALUES($1,$2,$3,$4,$5,$6,NOW()+$7*INTERVAL '1 minute') RETURNING expires_at`,
  [id, digest(token), user.id, user.token_version, clientIp(req), userAgentHash(req), env.sessionMinutes]);
  return { token, csrfToken: csrfFor(token, id), expiresAt: result.rows[0].expires_at, user: serializeAdminUser(user) };
}

export function sendSession(res, session) {
  res.cookie(sessionCookieName(), session.token, { ...cookieOptions(), maxAge: env.sessionMinutes * 60000 });
  res.set('Cache-Control', 'no-store');
  // The session token is never returned in JSON or made readable to JavaScript.
  return res.json({ user: session.user, csrfToken: session.csrfToken, expiresAt: session.expiresAt });
}

export function clearSessionCookie(res) { res.clearCookie(sessionCookieName(), cookieOptions()); }

export async function resolveSession(req) {
  if (req.authSession) return req.authSession;
  const token = cookieToken(req);
  if (!token) return null;
  const result = await query(`UPDATE admin_sessions s SET last_seen_at = NOW() FROM admin_users u
    WHERE s.token_hash = $1 AND s.admin_id = u.id AND s.token_version = u.token_version
      AND s.revoked_at IS NULL AND s.expires_at > NOW()
      AND s.last_seen_at > NOW() - $2 * INTERVAL '1 minute'
      AND s.user_agent_hash = $3 AND u.active = TRUE AND u.password_reset_required = FALSE
      ${env.adminMfaRequired ? 'AND u.mfa_enabled = TRUE' : ''}
    RETURNING s.id, s.expires_at, row_to_json(u) AS admin`, [digest(token), env.sessionIdleMinutes, userAgentHash(req)]);
  const session = result.rows[0];
  if (!session) return null;
  const csrfToken = csrfFor(token, session.id);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !constantEqual(req.headers['x-csrf-token'], csrfToken)) {
    throw new HttpError(403, 'Xavfsizlik kodi noto‘g‘ri. Sahifani yangilang.');
  }
  req.authSession = { id: session.id, expiresAt: session.expires_at, csrfToken, user: serializeAdminUser(session.admin) };
  return req.authSession;
}

export async function revokeSession(req) {
  if (req.authSession) await query('UPDATE admin_sessions SET revoked_at = NOW() WHERE id = $1', [req.authSession.id]);
}
