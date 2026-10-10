import { fetchOne } from '../../db/query.js';
import { query } from '../../db/pool.js';
import { sanitizeStructuredContent } from '../../utils/html-security.js';
import { touchPublicSiteRevision } from '../content/public-site-revision.service.js';

function normalizeSettingData(payload) {
  const normalized = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  return sanitizeStructuredContent(normalized);
}

function mapSetting(row) {
  const data = normalizeSettingData(row.data);

  return {
    key: row.key,
    data,
    ...data,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at
  };
}

export async function getSetting(key) {
  const row = await fetchOne('SELECT * FROM site_settings WHERE key = $1 LIMIT 1', [key]);

  if (!row) {
    return null;
  }

  return mapSetting(row);
}

export async function upsertSetting(key, payload, userId = null) {
  const data = normalizeSettingData(payload);
  const result = await query(
    `
      INSERT INTO site_settings (key, data, updated_by, updated_at)
      VALUES ($1, $2::jsonb, $3, NOW())
      ON CONFLICT (key)
      DO UPDATE SET
        data = EXCLUDED.data,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *
    `,
    [key, JSON.stringify(data), userId]
  );

  const item = mapSetting(result.rows[0]);
  await touchPublicSiteRevision();
  return item;
}

export async function deleteSetting(key) {
  await query('DELETE FROM site_settings WHERE key = $1 RETURNING key', [key]);
  await touchPublicSiteRevision();
}
