import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getMigrationFiles() {
  const files = await fs.readdir(migrationsDir);

  return files
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right));
}

export async function runMigrations() {
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const executedResult = await client.query('SELECT filename FROM schema_migrations');
    const executed = new Set(executedResult.rows.map((row) => row.filename));
    const files = await getMigrationFiles();
    const pending = files.filter((file) => !executed.has(file));

    for (const file of pending) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration failed (${file}): ${error.message}`);
      }
    }

    if (pending.length === 0) {
      console.log('No pending migrations.');
    }

    return pending;
  } finally {
    client.release();
  }
}
