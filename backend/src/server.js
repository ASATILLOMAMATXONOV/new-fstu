
import 'dotenv/config';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool, testConnection } from './db/pool.js';
import { ensureDefaultAdmin } from './modules/account/account.service.js';
import { validateSecurityConfiguration } from './utils/security-config.js';

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

  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(
      `${signal} received, shutting down...`
    );

    server.close(async () => {
      try {
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
