import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool, testConnection } from './db/pool.js';
import { ensureDefaultAdmin } from './modules/account/account.service.js';
import { validateSecurityConfiguration } from './utils/security-config.js';

async function startServer() {
  validateSecurityConfiguration();
  await testConnection();
  console.log('✅ PostgreSQL bazaga muvaffaqiyatli ulandi');

  await ensureDefaultAdmin();
  console.log('✅ Default admin tekshirildi / tayyor');

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`🚀 FSTU backend listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down...`);

    server.close(async () => {
      await closePool();
      console.log('✅ PostgreSQL ulanishi yopildi');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch(async (error) => {
  console.error('❌ Failed to start backend:', error);
  await closePool();
  process.exit(1);
});
