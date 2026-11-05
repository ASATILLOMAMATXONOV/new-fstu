import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import * as OTPAuth from 'otpauth';
import { env } from '../../config/env.js';

export const digest = value => createHash('sha256').update(String(value)).digest('hex');
export const userAgentHash = req => digest(req.headers?.['user-agent'] || '');
export const opaqueToken = () => randomBytes(32).toString('base64url');

function encryptionKey() {
  if (!/^[a-f0-9]{64}$/i.test(env.mfaEncryptionKey)) throw new Error('MFA_ENCRYPTION_KEY must contain 64 hexadecimal characters.');
  return Buffer.from(env.mfaEncryptionKey, 'hex');
}

export function encryptSecret(secret, adminId) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(Buffer.from(`fstu-mfa-v1:${adminId}`));
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptSecret(encrypted, adminId) {
  const [version, iv, tag, ciphertext] = String(encrypted || '').split('.');
  if (version !== 'v1' || !iv || !tag || !ciphertext) throw new Error('Invalid encrypted MFA secret.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAAD(Buffer.from(`fstu-mfa-v1:${adminId}`));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}

export function totp(secret, label = 'Admin') {
  return new OTPAuth.TOTP({ issuer: 'FSTU Admin', label, algorithm: 'SHA1', digits: 6, period: 30, secret });
}

export const newTotpSecret = () => new OTPAuth.Secret({ size: 20 }).base32;

export function verifiedStep(secret, code, lastStep = -1, timestamp = Date.now()) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  const delta = totp(secret).validate({ token: code, timestamp, window: 1 });
  if (delta === null) return null;
  const step = Math.floor(timestamp / 30000) + delta;
  return step > Number(lastStep) ? step : null;
}

export function recoveryCodes() {
  const codes = Array.from({ length: 10 }, () => randomBytes(12).toString('hex').toUpperCase().match(/.{6}/g).join('-'));
  return { codes, hashes: codes.map(code => digest(code.replaceAll('-', '').toLowerCase())) };
}

export function recoveryHash(code) {
  const value = typeof code === 'string' ? code.replaceAll('-', '').trim().toLowerCase() : '';
  return /^[a-f0-9]{24}$/.test(value) ? digest(value) : null;
}

export function csrfFor(token, sessionId) {
  return createHmac('sha256', encryptionKey()).update(`fstu-csrf-v1:${sessionId}:${token}`).digest('base64url');
}

export function constantEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left), b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
