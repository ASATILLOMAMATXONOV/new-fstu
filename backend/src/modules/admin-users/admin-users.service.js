import { fetchMany, fetchOne } from '../../db/query.js';
import { query } from '../../db/pool.js';
import { HttpError } from '../../utils/http-error.js';
import { assertStrongPassword, hashPassword } from '../../utils/password-policy.js';

const allowedRoles = new Set(['super_admin', 'admin', 'editor', 'moderator']);
const loginPattern = /^[A-Za-z0-9._-]{4,64}$/;

function normalizeMenuAccess(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)));
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function serializeAdmin(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    login: row.login,
    email: row.email,
    role: row.role,
    active: row.active,
    menuAccess: Array.isArray(row.menu_access) ? row.menu_access : [],
    password: '',
    failedLoginAttempts: Number(row.failed_login_attempts || 0),
    lockedUntil: row.locked_until,
    lastLoginAt: row.last_login_at,
    lastLoginIp: row.last_login_ip,
    passwordChangedAt: row.password_changed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getAdminRowById(id) {
  return fetchOne('SELECT * FROM admin_users WHERE id = $1 LIMIT 1', [id]);
}

async function ensureUniqueLogin(login, currentId = null) {
  const existing = await fetchOne(
    `
      SELECT id
      FROM admin_users
      WHERE LOWER(login) = LOWER($1)
        AND ($2::bigint IS NULL OR id <> $2)
      LIMIT 1
    `,
    [login, currentId]
  );

  if (existing) {
    throw new HttpError(409, 'This login is already in use.');
  }
}

async function ensureUniqueEmail(email, currentId = null) {
  if (!email) {
    return;
  }

  const existing = await fetchOne(
    `
      SELECT id
      FROM admin_users
      WHERE LOWER(email) = LOWER($1)
        AND ($2::bigint IS NULL OR id <> $2)
      LIMIT 1
    `,
    [email, currentId]
  );

  if (existing) {
    throw new HttpError(409, 'This email is already in use.');
  }
}

async function countActiveSuperAdmins(excludedId = null) {
  const result = await query(
    `
      SELECT COUNT(*)::int AS count
      FROM admin_users
      WHERE role = 'super_admin'
        AND active = TRUE
        AND ($1::bigint IS NULL OR id <> $1)
    `,
    [excludedId]
  );

  return result.rows[0].count;
}

function normalizePayload(payload) {
  const fullName = normalizeOptionalString(payload.fullName);
  const login = normalizeOptionalString(payload.login);
  const email = normalizeOptionalString(payload.email)?.toLowerCase() ?? null;
  const role = normalizeOptionalString(payload.role) || 'admin';
  const active = payload.active !== undefined ? Boolean(payload.active) : true;
  const menuAccess = normalizeMenuAccess(payload.menuAccess).filter(
    (item) => role === 'super_admin' || item !== 'admin-users-management'
  );
  const password = normalizeOptionalString(payload.password);

  if (!fullName) {
    throw new HttpError(400, 'Full name is required.');
  }

  if (!login) {
    throw new HttpError(400, 'Login is required.');
  }

  if (!loginPattern.test(login)) {
    throw new HttpError(400, 'Login faqat harf, raqam, nuqta, tire va pastki chiziqdan iborat bo‘lishi kerak.');
  }

  if (!allowedRoles.has(role)) {
    throw new HttpError(400, 'Invalid role supplied.');
  }

  return {
    fullName,
    login,
    email,
    role,
    active,
    menuAccess,
    password
  };
}

export async function listAdminUsers() {
  const rows = await fetchMany('SELECT * FROM admin_users ORDER BY id ASC');
  return rows.map(serializeAdmin);
}

export async function createAdminUser(payload) {
  const normalized = normalizePayload(payload);

  if (!normalized.password) {
    throw new HttpError(400, 'Password is required when creating an admin user.');
  }

  assertStrongPassword(normalized.password, {
    login: normalized.login,
    email: normalized.email,
    fullName: normalized.fullName
  });

  await ensureUniqueLogin(normalized.login);
  await ensureUniqueEmail(normalized.email);

  const passwordHash = await hashPassword(normalized.password);
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
        failed_login_attempts,
        locked_until,
        password_changed_at,
        token_version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, 0, NULL, NOW(), 1)
      RETURNING *
    `,
    [
      normalized.fullName,
      normalized.login,
      normalized.email,
      passwordHash,
      normalized.role,
      normalized.active,
      JSON.stringify(normalized.menuAccess)
    ]
  );

  return serializeAdmin(result.rows[0]);
}

export async function updateAdminUser(id, payload, currentUserId) {
  const existing = await getAdminRowById(id);

  if (!existing) {
    throw new HttpError(404, 'Admin user not found.');
  }

  const normalized = normalizePayload({
    ...serializeAdmin(existing),
    ...payload
  });

  if (existing.id === currentUserId && !normalized.active) {
    throw new HttpError(400, 'You cannot deactivate your own account.');
  }

  if (existing.role === 'super_admin' && (!normalized.active || normalized.role !== 'super_admin')) {
    const otherSuperAdmins = await countActiveSuperAdmins(existing.id);

    if (otherSuperAdmins === 0) {
      throw new HttpError(400, 'At least one active super admin must remain.');
    }
  }

  await ensureUniqueLogin(normalized.login, existing.id);
  await ensureUniqueEmail(normalized.email, existing.id);

  if (normalized.password) {
    assertStrongPassword(normalized.password, {
      login: normalized.login,
      email: normalized.email,
      fullName: normalized.fullName
    });
  }

  const passwordChanged = Boolean(normalized.password);
  const passwordHash = passwordChanged
    ? await hashPassword(normalized.password)
    : existing.password_hash;

  const result = await query(
    `
      UPDATE admin_users
      SET full_name = $2,
          login = $3,
          email = $4,
          password_hash = $5,
          role = $6,
          active = $7,
          menu_access = $8::jsonb,
          failed_login_attempts = CASE WHEN $9::boolean THEN 0 ELSE failed_login_attempts END,
          locked_until = CASE WHEN $9::boolean THEN NULL ELSE locked_until END,
          password_changed_at = CASE WHEN $9::boolean THEN NOW() ELSE password_changed_at END,
          token_version = CASE WHEN $9::boolean THEN token_version + 1 ELSE token_version END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      existing.id,
      normalized.fullName,
      normalized.login,
      normalized.email,
      passwordHash,
      normalized.role,
      normalized.active,
      JSON.stringify(normalized.menuAccess),
      passwordChanged
    ]
  );

  return serializeAdmin(result.rows[0]);
}

export async function deleteAdminUser(id, currentUserId) {
  const existing = await getAdminRowById(id);

  if (!existing) {
    throw new HttpError(404, 'Admin user not found.');
  }

  if (existing.id === currentUserId) {
    throw new HttpError(400, 'You cannot delete your own account.');
  }

  if (existing.role === 'super_admin') {
    const otherSuperAdmins = await countActiveSuperAdmins(existing.id);

    if (otherSuperAdmins === 0) {
      throw new HttpError(400, 'At least one active super admin must remain.');
    }
  }

  await query('DELETE FROM admin_users WHERE id = $1', [existing.id]);
}
