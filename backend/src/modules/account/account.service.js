import bcrypt from 'bcryptjs';

import { env } from '../../config/env.js';
import { fetchOne } from '../../db/query.js';
import { query } from '../../db/pool.js';
import { HttpError } from '../../utils/http-error.js';
import { assertStrongPassword, hashPassword } from '../../utils/password-policy.js';
import { beginMfaLogin } from './mfa.service.js';
import { serializeAdminUser } from './account-user.js';
export { serializeAdminUser } from './account-user.js';

const DUMMY_PASSWORD_HASH = '$2a$12$zQW4rM2d9jJmQxVJQ7h0V.wMZu7pA0CbxQ4o7E5fR3A7lP5WnJf3K';

export async function getAdminById(id) {
  return fetchOne('SELECT * FROM admin_users WHERE id = $1 LIMIT 1', [id]);
}

async function getAdminByLoginOrEmail(login, email) {
  return fetchOne(
    `
      SELECT *
      FROM admin_users
      WHERE LOWER(login) = LOWER($1)
         OR LOWER(COALESCE(email, '')) = LOWER($2)
      ORDER BY id ASC
      LIMIT 1
    `,
    [login, email]
  );
}

async function getAdminByIdentity(identity) {
  return fetchOne(
    `
      SELECT *
      FROM admin_users
      WHERE LOWER(login) = LOWER($1) OR LOWER(COALESCE(email, '')) = LOWER($1)
      LIMIT 1
    `,
    [identity]
  );
}

function normalizeIdentity(payload = {}) {
  return String(payload.identity || payload.email || payload.login || '').trim();
}

function isLocked(row) {
  if (!row?.locked_until) {
    return false;
  }

  return new Date(row.locked_until).getTime() > Date.now();
}

async function registerFailedAttempt(user) {
  const result = await query(
    `
      UPDATE admin_users
      SET failed_login_attempts = CASE WHEN locked_until <= NOW() THEN 1 ELSE failed_login_attempts + 1 END,
          last_failed_login_at = NOW(),
          locked_until = CASE
            WHEN (CASE WHEN locked_until <= NOW() THEN 1 ELSE failed_login_attempts + 1 END) >= $2
              THEN NOW() + ($3 * INTERVAL '1 minute')
            ELSE NULL
          END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [user.id, env.authMaxFailedAttempts, env.authLockMinutes]
  );

  return result.rows[0];
}

async function verifyPasswordAgainstDummyHash(password) {
  try {
    await bcrypt.compare(String(password || ''), DUMMY_PASSWORD_HASH);
  } catch (_error) {
    return false;
  }

  return false;
}

export async function loginAdmin(payload = {}, context = {}) {
  if (typeof payload.password !== 'string' || typeof (payload.identity ?? payload.email ?? payload.login) !== 'string') {
    throw new HttpError(400, 'Login va parolni kiriting.');
  }
  const identity = normalizeIdentity(payload);
  const password = String(payload.password || '');

  if (!identity || !password) {
    throw new HttpError(400, 'Login/email and password are required.');
  }
  if (identity.length > 254 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Login or password exceeds the supported length.');
  }

  const user = await getAdminByIdentity(identity);

  if (!user || !user.active || isLocked(user)) {
    await verifyPasswordAgainstDummyHash(password);
    throw new HttpError(401, 'Invalid credentials.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    await registerFailedAttempt(user);
    throw new HttpError(401, 'Invalid credentials.');
  }

  return beginMfaLogin(user, password, context.request);
}

export async function getCurrentAdmin(id) {
  const user = await getAdminById(id);

  if (!user || !user.active) {
    throw new HttpError(401, 'User not found or inactive.');
  }

  return serializeAdminUser(user);
}

export async function registerAdmin({ email, password, firstName, lastName }) {
  if (!env.allowPublicRegistration) {
    throw new HttpError(403, 'Public registration is disabled.');
  }

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }

  const existing = await fetchOne(
    'SELECT id FROM admin_users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email.trim()]
  );

  if (existing) {
    throw new HttpError(409, 'User with this email already exists.');
  }

  assertStrongPassword(password, {
    email,
    fullName: [firstName, lastName].filter(Boolean).join(' ').trim()
  });

  const passwordHash = await hashPassword(password);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || email.trim();
  const loginSeed = email.split('@')[0].trim().toLowerCase();
  const login = `${loginSeed}-${Date.now()}`;

  const result = await query(
    `
      INSERT INTO admin_users (
        full_name,
        login,
        email,
        password_hash,
        role,
        active,
        menu_access,
        password_changed_at,
        token_version
      )
      VALUES ($1, $2, $3, $4, 'admin', TRUE, '[]'::jsonb, NOW(), 1)
      RETURNING *
    `,
    [fullName, login, email.trim().toLowerCase(), passwordHash]
  );

  return {
    user: serializeAdminUser(result.rows[0])
  };
}

async function syncDefaultAdmin(existingUser) {
  const passwordMatches = await bcrypt.compare(
    env.defaultAdminPassword,
    existingUser.password_hash
  );
  const shouldUpdatePassword = !passwordMatches;
  const nextPasswordHash = shouldUpdatePassword
    ? await hashPassword(env.defaultAdminPassword)
    : existingUser.password_hash;

  const result = await query(
    `
      UPDATE admin_users
      SET full_name = $2,
          login = $3,
          email = $4,
          password_hash = $6,
          role = 'super_admin',
          active = TRUE,
          failed_login_attempts = 0,
          locked_until = NULL,
          password_changed_at = CASE WHEN $5::boolean THEN NOW() ELSE password_changed_at END,
          token_version = CASE WHEN $5::boolean THEN token_version + 1 ELSE token_version END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `,
    [
      existingUser.id,
      env.defaultAdminFullName,
      env.defaultAdminLogin,
      env.defaultAdminEmail.toLowerCase(),
      shouldUpdatePassword,
      nextPasswordHash
    ]
  );

  console.log(
    `Synced default admin "${env.defaultAdminLogin}" (id: ${result.rows[0].id}).`
  );

  return result.rows[0];
}

export async function ensureDefaultAdmin({ syncExisting = env.syncDefaultAdminOnBoot } = {}) {
  const existingUser = await getAdminByLoginOrEmail(
    env.defaultAdminLogin,
    env.defaultAdminEmail
  );

  if (existingUser) {
    if (syncExisting) {
      return syncDefaultAdmin(existingUser);
    }

    return existingUser;
  }

  const passwordHash = await hashPassword(env.defaultAdminPassword);
  const result = await query(
    `
      INSERT INTO admin_users (
        full_name,
        login,
        email,
        password_hash,
        role,
        active,
        menu_access,
        password_changed_at,
        token_version
      )
      VALUES ($1, $2, $3, $4, 'super_admin', TRUE, '[]'::jsonb, NOW(), 1)
      RETURNING id
    `,
    [
      env.defaultAdminFullName,
      env.defaultAdminLogin,
      env.defaultAdminEmail.toLowerCase(),
      passwordHash
    ]
  );

  console.log(`Created default admin "${env.defaultAdminLogin}" (id: ${result.rows[0].id}).`);

  return result.rows[0];
}
