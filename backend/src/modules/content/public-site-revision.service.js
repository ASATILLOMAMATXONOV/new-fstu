import { fetchOne } from '../../db/query.js';
import { query } from '../../db/pool.js';

const PUBLIC_SITE_REVISION_KEY = 'site';
let revisionTableReady = false;
let revisionTablePromise = null;

async function createRevisionTableIfNeeded() {
  await query(`
    CREATE TABLE IF NOT EXISTS public_site_revisions (
      key TEXT PRIMARY KEY,
      revision BIGINT NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(
    `
      INSERT INTO public_site_revisions (key, revision, updated_at)
      VALUES ($1, 1, NOW())
      ON CONFLICT (key) DO NOTHING
    `,
    [PUBLIC_SITE_REVISION_KEY]
  );
}

async function ensureRevisionTable() {
  if (revisionTableReady) {
    return;
  }

  if (!revisionTablePromise) {
    revisionTablePromise = (async () => {
      await createRevisionTableIfNeeded();
      revisionTableReady = true;
    })().finally(() => {
      revisionTablePromise = null;
    });
  }

  await revisionTablePromise;
}

function mapRevision(row) {
  return {
    key: PUBLIC_SITE_REVISION_KEY,
    revision: Number(row?.revision || 1),
    updatedAt: row?.updated_at || new Date().toISOString()
  };
}

export async function getPublicSiteRevision() {
  await ensureRevisionTable();

  const row = await fetchOne(
    'SELECT revision, updated_at FROM public_site_revisions WHERE key = $1 LIMIT 1',
    [PUBLIC_SITE_REVISION_KEY]
  );

  if (row) {
    return mapRevision(row);
  }

  const result = await query(
    `
      INSERT INTO public_site_revisions (key, revision, updated_at)
      VALUES ($1, 1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET updated_at = public_site_revisions.updated_at
      RETURNING revision, updated_at
    `,
    [PUBLIC_SITE_REVISION_KEY]
  );

  return mapRevision(result.rows[0]);
}

export async function touchPublicSiteRevision() {
  await ensureRevisionTable();

  const result = await query(
    `
      INSERT INTO public_site_revisions (key, revision, updated_at)
      VALUES ($1, 1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET
        revision = public_site_revisions.revision + 1,
        updated_at = NOW()
      RETURNING revision, updated_at
    `,
    [PUBLIC_SITE_REVISION_KEY]
  );

  return mapRevision(result.rows[0]);
}
