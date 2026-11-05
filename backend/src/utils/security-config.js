import { env } from '../config/env.js';
import { validatePasswordStrength } from './password-policy.js';

const DEFAULT_JWT_SECRET = 'change-this-secret';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

export function validateSecurityConfiguration() {
  const warnings = [];
  if (!/^[a-f0-9]{64}$/i.test(env.mfaEncryptionKey)) {
    throw new Error('MFA_ENCRYPTION_KEY must contain 64 hexadecimal characters. Keep it stable and backed up.');
  }
  if (env.nodeEnv === 'production' && (env.allowPublicRegistration || env.corsOrigins.includes('*') || env.syncDefaultAdminOnBoot)) {
    throw new Error('Production requires closed registration, explicit CORS origins and disabled bootstrap password sync.');
  }

  if (env.trustedProxies.some((proxy) => ['true', '*', '0.0.0.0/0', '::/0'].includes(proxy) || /^\d+$/.test(proxy))) {
    throw new Error('TRUST_PROXY must contain only explicit trusted proxy addresses or networks.');
  }
  if (env.jwtSecret.length < 32 && env.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must contain at least 32 random characters.');
  }

  if (env.jwtSecret === DEFAULT_JWT_SECRET) {
    const message = 'JWT_SECRET hali default qiymatda turibdi.';

    if (env.nodeEnv === 'production') {
      throw new Error(message);
    }

    warnings.push(message);
  }

  if (env.defaultAdminPassword === DEFAULT_ADMIN_PASSWORD) {
    const message = 'DEFAULT_ADMIN_PASSWORD hali default qiymatda turibdi.';

    if (env.nodeEnv === 'production') {
      throw new Error(message);
    }

    warnings.push(message);
  }

  const defaultPasswordCheck = validatePasswordStrength(env.defaultAdminPassword, {
    login: env.defaultAdminLogin,
    email: env.defaultAdminEmail,
    fullName: env.defaultAdminFullName
  });

  if (!defaultPasswordCheck.valid) {
    const message = 'DEFAULT_ADMIN_PASSWORD kuchsiz. Kuchliroq parol ishlating.';

    if (env.nodeEnv === 'production') {
      throw new Error(message);
    }

    warnings.push(message);
  }

  if (env.bcryptRounds < 12) {
    warnings.push(`BCRYPT_ROUNDS=${env.bcryptRounds}. Tavsiya: kamida 12.`);
  }

  warnings.forEach((warning) => {
    console.warn(`⚠️ Security warning: ${warning}`);
  });
}
