import { closePool } from './pool.js';
import { runMigrations } from './migrate.js';

runMigrations()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error.message);
    await closePool();
    process.exit(1);
  });
