import { env } from '../config/env.js';
import { validatePasswordStrength } from './password-policy.js';

const DEFAULT_JWT_SECRET = 'change-this-secret';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

export function validateSecurityConfiguration() {
  const warnings = [];

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
