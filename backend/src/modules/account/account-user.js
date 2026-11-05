export function serializeAdminUser(row) {
  if (!row) return null;
  return {
    id: row.id, fullName: row.full_name, login: row.login, email: row.email,
    role: row.role, active: row.active, menuAccess: Array.isArray(row.menu_access) ? row.menu_access : [],
    failedLoginAttempts: Number(row.failed_login_attempts || 0), lockedUntil: row.locked_until,
    lastLoginAt: row.last_login_at, lastLoginIp: row.last_login_ip, passwordChangedAt: row.password_changed_at,
    mfaEnabled: Boolean(row.mfa_enabled), passwordResetRequired: Boolean(row.password_reset_required),
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}
