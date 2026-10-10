import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Client } = pg;

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTargetConfig() {
  if (process.env.DB_NAME || process.env.DB_HOST || process.env.DB_USER) {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: toNumber(process.env.DB_PORT, 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fstu_cms'
    };
  }

  const url = new URL(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fstu_cms');

  return {
    host: url.hostname || 'localhost',
    port: toNumber(url.port, 5432),
    user: decodeURIComponent(url.username || 'postgres'),
    password: decodeURIComponent(url.password || ''),
    database: decodeURIComponent(url.pathname.replace(/^\//, '') || 'fstu_cms')
  };
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function createDatabaseIfMissing() {
  const target = getTargetConfig();
  const maintenanceDatabase = process.env.DB_MAINTENANCE_NAME || 'postgres';
  const client = new Client({
    host: target.host,
    port: target.port,
    user: target.user,
    password: target.password,
    database: maintenanceDatabase
  });

  await client.connect();

  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1', [
      target.database
    ]);

    if (existing.rowCount > 0) {
      console.log(`Database "${target.database}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(target.database)}`);
    console.log(`Database "${target.database}" created.`);
  } finally {
    await client.end();
  }
}

createDatabaseIfMissing().catch((error) => {
  console.error(`Database create failed: ${error.message}`);
  process.exit(1);
});
