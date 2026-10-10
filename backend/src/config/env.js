import dotenv from 'dotenv';

dotenv.config();

function toBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function toNumber(value, defaultValue) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function toList(value, defaultValue = []) {
  const source = value ?? defaultValue.join(',');

  return String(source)
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function hasAnyDatabasePartEnv() {
  return [
    process.env.DB_HOST,
    process.env.DB_PORT,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_NAME
  ].some((value) => value !== undefined && String(value).trim() !== '');
}

function buildDatabaseUrlFromParts() {
  const host = String(process.env.DB_HOST || 'localhost').trim();
  const port = toNumber(process.env.DB_PORT, 5432);
  const user = encodeURIComponent(String(process.env.DB_USER || 'postgres').trim());
  const password = encodeURIComponent(String(process.env.DB_PASSWORD || '').trim());
  const databaseName = encodeURIComponent(String(process.env.DB_NAME || 'fstu_cms').trim());
  const authSegment = password ? `${user}:${password}` : user;

  return `postgresql://${authSegment}@${host}:${port}/${databaseName}`;
}

function resolveDatabaseUrl() {
  if (hasAnyDatabasePartEnv()) {
    return buildDatabaseUrlFromParts();
  }

  return process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fstu_cms';
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 4000),
  databaseUrl: resolveDatabaseUrl(),
  databaseSsl: toBoolean(process.env.DATABASE_SSL, false),
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  jwtIssuer: process.env.JWT_ISSUER || 'fstu-admin',
  jwtAudience: process.env.JWT_AUDIENCE || 'fstu-admin-panel',
  bcryptRounds: Math.max(10, toNumber(process.env.BCRYPT_ROUNDS, 12)),
  authMaxFailedAttempts: Math.max(3, toNumber(process.env.AUTH_MAX_FAILED_ATTEMPTS, 5)),
  authLockMinutes: Math.max(5, toNumber(process.env.AUTH_LOCK_MINUTES, 15)),
  loginRateLimitWindowMs: Math.max(60000, toNumber(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000)),
  loginRateLimitMaxAttempts: Math.max(5, toNumber(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS, 10)),
  adminPasswordMinLength: Math.max(10, toNumber(process.env.ADMIN_PASSWORD_MIN_LENGTH, 12)),
  corsOrigins: toList(
    process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN,
    [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://new.fstu.uz',
      'https://www.new.fstu.uz',
      'https://admin.new.fstu.uz'
    ]
  ),
  allowPublicRegistration: toBoolean(process.env.ALLOW_PUBLIC_REGISTRATION, false),
  defaultAdminFullName:
    process.env.DEFAULT_ADMIN_FULL_NAME ||
    process.env.ADMIN_FULL_NAME ||
    'System Administrator',
  defaultAdminLogin:
    process.env.DEFAULT_ADMIN_LOGIN ||
    process.env.ADMIN_LOGIN ||
    'admin',
  defaultAdminEmail:
    process.env.DEFAULT_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'admin@fstu.local',
  defaultAdminPassword:
    process.env.DEFAULT_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    'Admin123!',
  syncDefaultAdminOnBoot: toBoolean(process.env.SYNC_DEFAULT_ADMIN_ON_BOOT, false)
};
