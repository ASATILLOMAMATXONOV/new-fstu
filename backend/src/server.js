
import 'dotenv/config';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool, testConnection } from './db/pool.js';
import { ensureDefaultAdmin } from './modules/account/account.service.js';
import { validateSecurityConfiguration } from './utils/security-config.js';
import { securityStore } from './modules/security/security.store.js';
import { runDependencyAudit } from './modules/security/security-audit.js';

async function startServer() {
  validateSecurityConfiguration();

  // OpenAI konfiguratsiyasini tekshirish
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (openaiKey) {
    console.log('✅ OpenAI API key yuklangan');
  } else {
    console.warn(
      '⚠️ OPENAI_API_KEY topilmadi. AI ovoz xizmati ishlamaydi.'
    );
  }

  // PostgreSQL ulanishi
  await testConnection();

  console.log(
    '✅ PostgreSQL bazaga muvaffaqiyatli ulandi'
  );

  // Administratorni tekshirish
  await ensureDefaultAdmin();
  // Fail startup if security migration 010 is missing instead of running unprotected.
  await securityStore.run('SELECT ip FROM security_ip_blocks LIMIT 0');
  await securityStore.run('SELECT id FROM admin_sessions LIMIT 0');
  const maintenance = () => securityStore.cleanup().catch(() => console.error('Security retention cleanup failed.'));
  void maintenance();
  const cleanupTimer = setInterval(maintenance, 10 * 60 * 1000);
  cleanupTimer.unref();
  const audit = () => runDependencyAudit().catch(() => console.error('Dependency audit could not be saved.'));
  void audit();
  const auditTimer = setInterval(audit, 24 * 60 * 60 * 1000);
  auditTimer.unref();

  console.log(
    '✅ Default admin tekshirildi / tayyor'
  );

  // Express ilova
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(
      `🚀 FSTU backend listening on port ${env.port} (${env.nodeEnv})`
    );
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxRequestsPerSocket = 1000;

  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;

    shuttingDown = true;
    clearInterval(cleanupTimer);
    clearInterval(auditTimer);

    console.log(
      `${signal} received, shutting down...`
    );

    server.close(async () => {
      try {
        await app.locals.securityMonitor.drain();
        await closePool();

        console.log(
          '✅ PostgreSQL ulanishi yopildi'
        );

        process.exit(0);
      } catch (error) {
        console.error(
          '❌ Shutdown error:',
          error
        );

        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch(async (error) => {
  console.error(
    '❌ Failed to start backend:',
    error
  );

  await closePool();
  process.exit(1);
});
