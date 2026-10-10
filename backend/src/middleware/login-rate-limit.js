import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

const attemptsByKey = new Map();

function getAttemptKey(req) {
  const ip = String(req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown');
  return `login:${ip}`;
}

function getOrCreateEntry(key) {
  const now = Date.now();
  const existing = attemptsByKey.get(key);

  if (existing && existing.resetAt > now) {
    return existing;
  }

  const freshEntry = {
    count: 0,
    resetAt: now + env.loginRateLimitWindowMs
  };

  attemptsByKey.set(key, freshEntry);
  return freshEntry;
}

function clearExpiredEntries() {
  const now = Date.now();

  for (const [key, value] of attemptsByKey.entries()) {
    if (value.resetAt <= now) {
      attemptsByKey.delete(key);
    }
  }
}

export function registerLoginFailure(req) {
  clearExpiredEntries();

  const entry = getOrCreateEntry(getAttemptKey(req));
  entry.count += 1;
}

export function clearLoginFailures(req) {
  attemptsByKey.delete(getAttemptKey(req));
}

export function loginRateLimit(req, _res, next) {
  clearExpiredEntries();

  const entry = getOrCreateEntry(getAttemptKey(req));

  if (entry.count >= env.loginRateLimitMaxAttempts) {
    next(new HttpError(429, 'Juda ko‘p login urinishlari aniqlandi. Birozdan keyin qayta urinib ko‘ring.'));
    return;
  }

  next();
}
