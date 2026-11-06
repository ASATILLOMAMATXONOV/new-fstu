import { env } from '../src/config/env.js';
import { closePool } from '../src/db/pool.js';
import { ensureDefaultAdmin } from '../src/modules/account/account.service.js';

try {
  if (!(process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)) {
    throw new Error('Backend .env faylida DEFAULT_ADMIN_PASSWORD qiymatini kiriting.');
  }
  await ensureDefaultAdmin({ syncExisting: true });
  console.log(`Admin tayyor. Login: ${env.defaultAdminLogin}; email: ${env.defaultAdminEmail}.`);
  console.log('Parol .env faylidagi qiymat bilan sinxronlandi. Kirishda parolni yangilash talab qilinishi mumkin.');
} catch (error) {
  console.error(`Admin seeder bajarilmadi: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closePool();
}
