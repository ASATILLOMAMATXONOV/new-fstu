import assert from 'node:assert/strict';
import { test } from 'node:test';
import { env } from '../../config/env.js';
import { encryptSecret, decryptSecret, verifiedStep, recoveryCodes, recoveryHash, csrfFor, constantEqual, totp } from './auth-crypto.js';
import { validatePasswordStrength } from '../../utils/password-policy.js';

env.mfaEncryptionKey = 'a1'.repeat(32); // Test key; never used for application records.

test('matches RFC 6238 SHA1 test vectors and accepts a code only once', () => {
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  for (const [seconds, token] of [[59,'287082'],[1111111109,'081804'],[1111111111,'050471'],[1234567890,'005924'],[2000000000,'279037'],[20000000000,'353130']]) {
    assert.equal(totp(secret).generate({ timestamp: seconds*1000 }), token);
    const step = verifiedStep(secret, token, -1, seconds*1000);
    assert.equal(step, Math.floor(seconds/30));
    assert.equal(verifiedStep(secret, token, step, seconds*1000), null);
  }
  assert.equal(verifiedStep(secret, '12345'), null);
  assert.equal(verifiedStep(secret, 123456), null);
});

test('encrypts TOTP secrets with randomized IVs, authenticated data and tamper detection', () => {
  const first = encryptSecret('TEST-SEED', 1), second = encryptSecret('TEST-SEED', 1);
  assert.notEqual(first, second);
  assert.equal(first.includes('TEST-SEED'), false);
  assert.equal(decryptSecret(first, 1), 'TEST-SEED');
  assert.throws(() => decryptSecret(first, 2));
  const parts = first.split('.'); parts[2] = Buffer.alloc(16).toString('base64url');
  assert.throws(() => decryptSecret(parts.join('.'), 1));
});

test('backup codes have 96 bits of randomness and are stored only as hashes', () => {
  const recovery = recoveryCodes();
  assert.equal(recovery.codes.length, 10);
  assert.equal(new Set(recovery.codes).size, 10);
  for (const [index, code] of recovery.codes.entries()) {
    assert.match(code, /^[A-F0-9]{6}(?:-[A-F0-9]{6}){3}$/);
    assert.equal(recoveryHash(code), recovery.hashes[index]);
    assert.equal(recoveryHash(code.toLowerCase().replaceAll('-', '')), recovery.hashes[index]);
    assert.equal(recovery.hashes.includes(code), false);
  }
  assert.equal(recoveryHash('123456'), null);
});

test('CSRF values are bound to both the random session token and session ID', () => {
  assert.notEqual(csrfFor('one', 'session'), csrfFor('two', 'session'));
  assert.notEqual(csrfFor('one', 'session'), csrfFor('one', 'another'));
  assert.equal(constantEqual('same', 'same'), true);
  assert.equal(constantEqual('same', 'different'), false);
  assert.equal(constantEqual(undefined, 'same'), false);
});

test('password policy rejects common guesses, credentials and excessive bcrypt input', () => {
  for (const password of ['Admin@123456!', 'Password@12345', 'Qwerty123456!', 'aaaaaaaaaaaa', 'x'.repeat(73), 'Fstu20262026!']) {
    assert.equal(validatePasswordStrength(password).valid, false, password);
  }
  assert.equal(validatePasswordStrength('Rain!Forest9Moon-Cobalt').valid, true);
  assert.equal(validatePasswordStrength('Rain!Forest9Moon-Cobalt', { login: 'forest' }).valid, false);
});
