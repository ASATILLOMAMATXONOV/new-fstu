import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { query, closePool } from '../src/db/pool.js';
import { validatePasswordStrength } from '../src/utils/password-policy.js';

// Check known guesses against hashes; never print passwords, hashes or MFA seeds.
const apply = process.argv.includes('--apply');
const candidates = [...new Set(['Admin123!', 'admin123', '12345678', 'Password123!', 'Qwerty123!',
  ...(!validatePasswordStrength(env.defaultAdminPassword).valid ? [env.defaultAdminPassword] : [])])];
try {
  const users = (await query('SELECT id,password_hash,mfa_enabled,password_reset_required FROM admin_users WHERE active=TRUE ORDER BY id')).rows;
  const report = { activeAccounts: users.length, mfaEnrolled: 0, enrollmentRequired: 0,
    weakKnownPasswords: 0, outdatedPasswordHash: 0, invalidPasswordHash: 0, markedForPasswordChange: 0, applied: apply };
  for (const user of users) {
    if (user.mfa_enabled) report.mfaEnrolled += 1; else report.enrollmentRequired += 1;
    let validHash = true;
    try { if (bcrypt.getRounds(user.password_hash) < env.bcryptRounds) report.outdatedPasswordHash += 1; }
    catch { validHash = false; report.invalidPasswordHash += 1; }
    let weak = false;
    if (validHash) for (const candidate of candidates) {
      if (await bcrypt.compare(candidate, user.password_hash)) { weak = true; break; }
    }
    if (weak) report.weakKnownPasswords += 1;
    if (apply && (weak || !validHash) && !user.password_reset_required) {
      await query('UPDATE admin_users SET password_reset_required=TRUE,token_version=token_version+1 WHERE id=$1', [user.id]);
      report.markedForPasswordChange += 1;
    }
  }
  console.log(JSON.stringify(report, null, 2));
  console.log('Unknown passwords remain hashed; password policy is checked again during every real login.');
} finally { await closePool(); }
