import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

export const PASSWORD_POLICY_HINT =
  `Password kamida ${env.adminPasswordMinLength} ta belgidan iborat bo‘lishi, katta va kichik harf, raqam hamda maxsus belgi qatnashishi kerak.`;

function normalizeComparableValue(value) {
  return String(value || '').trim().toLowerCase();
}

function containsForbiddenFragment(password, fragments = []) {
  const source = normalizeComparableValue(password);

  return fragments.some((fragment) => {
    const normalizedFragment = normalizeComparableValue(fragment);

    if (!normalizedFragment || normalizedFragment.length < 3) {
      return false;
    }

    return source.includes(normalizedFragment);
  });
}

export function validatePasswordStrength(password, options = {}) {
  const value = String(password || '');
  const errors = [];

  if (value.length < env.adminPasswordMinLength) {
    errors.push(`Kamida ${env.adminPasswordMinLength} ta belgi bo‘lishi kerak.`);
  }

  if (!/[A-Z]/.test(value)) {
    errors.push('Kamida bitta katta harf kerak.');
  }

  if (!/[a-z]/.test(value)) {
    errors.push('Kamida bitta kichik harf kerak.');
  }

  if (!/[0-9]/.test(value)) {
    errors.push('Kamida bitta raqam kerak.');
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push('Kamida bitta maxsus belgi kerak.');
  }

  if (/\s/.test(value)) {
    errors.push('Parolda bo‘sh joy bo‘lmasligi kerak.');
  }

  const forbiddenFragments = [
    options.login,
    options.email,
    options.fullName,
    'password',
    'admin123',
    'qwerty'
  ];

  if (containsForbiddenFragment(value, forbiddenFragments)) {
    errors.push('Parol login, email yoki juda oson taxmin qilinadigan so‘zlarni o‘z ichiga olmasligi kerak.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function assertStrongPassword(password, options = {}) {
  const result = validatePasswordStrength(password, options);

  if (!result.valid) {
    throw new HttpError(400, result.errors[0] || PASSWORD_POLICY_HINT, {
      details: result.errors
    });
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(String(password || ''), env.bcryptRounds);
}
