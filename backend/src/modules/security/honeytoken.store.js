import { randomBytes } from 'node:crypto';

import { query } from '../../db/pool.js';
import { safeText } from './security-rules.js';

// Fake credentials planted by the admin. The active token set is cached in memory
// so every request can be checked cheaply; the cache refreshes periodically and
// immediately after a token is created or removed.

const TOKEN_PREFIX = 'fstu_live_sk_';
const CACHE_TTL_MS = 30_000;
const CREDENTIAL_HEADERS = ['authorization', 'x-api-key', 'api-key', 'x-auth-token', 'x-access-token'];
const CREDENTIAL_QUERY_KEYS = ['api_key', 'apikey', 'token', 'access_token', 'key', 'secret'];

let cache = new Map();
let cachedAt = 0;
let pending = null;

export function generateHoneytoken() {
  return `${TOKEN_PREFIX}${randomBytes(24).toString('hex')}`;
}

async function loadActiveTokens() {
  const result = await query('SELECT id, token FROM security_honeytokens WHERE active = TRUE');
  cache = new Map(result.rows.map((row) => [row.token, row.id]));
  cachedAt = Date.now();
  return cache;
}

async function ensureCache() {
  if (cache.size !== 0 && Date.now() - cachedAt < CACHE_TTL_MS) return cache;
  if (Date.now() - cachedAt < CACHE_TTL_MS) return cache;
  if (!pending) pending = loadActiveTokens().catch(() => cache).finally(() => { pending = null; });
  return pending;
}

export function invalidateHoneytokenCache() {
  cachedAt = 0;
  cache = new Map();
}

function collectCandidates(req) {
  const values = [];
  const headers = req.headers || {};
  for (const name of CREDENTIAL_HEADERS) {
    const raw = headers[name];
    if (!raw) continue;
    const text = String(Array.isArray(raw) ? raw.join(' ') : raw);
    values.push(text.replace(/^Bearer\s+/i, '').trim());
  }
  const q = req.query || {};
  for (const key of CREDENTIAL_QUERY_KEYS) {
    if (q[key]) values.push(String(q[key]).trim());
  }
  // Catch a planted token pasted anywhere in the URL as well.
  const url = String(req.originalUrl || req.url || '');
  const match = url.match(/fstu_live_sk_[a-f0-9]{16,}/i);
  if (match) values.push(match[0]);
  return values;
}

/**
 * Returns the matched honeytoken id if the request carries any active fake
 * credential, otherwise null. Safe to call on every request.
 */
export async function matchHoneytoken(req) {
  const tokens = await ensureCache();
  if (!tokens || tokens.size === 0) return null;
  for (const candidate of collectCandidates(req)) {
    const id = tokens.get(candidate);
    if (id) return id;
  }
  return null;
}

export async function registerTrigger(id, ip) {
  await query(
    `UPDATE security_honeytokens
        SET triggers = triggers + 1, last_triggered_at = NOW(), last_ip = $2
      WHERE id = $1`,
    [id, ip]
  ).catch(() => {});
}

export async function listHoneytokens() {
  const result = await query(
    `SELECT id, token, label, placement, active, triggers,
            last_triggered_at, host(last_ip) AS last_ip, created_by, created_at
       FROM security_honeytokens
      ORDER BY active DESC, last_triggered_at DESC NULLS LAST, created_at DESC`
  );
  return result.rows;
}

export async function createHoneytoken({ label, placement, userId }) {
  const token = generateHoneytoken();
  const result = await query(
    `INSERT INTO security_honeytokens (token, label, placement, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, token, label, placement, active, triggers, last_triggered_at, host(last_ip) AS last_ip, created_at`,
    [token, safeText(label, 160), safeText(placement, 200), userId || null]
  );
  invalidateHoneytokenCache();
  return result.rows[0];
}

export async function setHoneytokenActive(id, active) {
  const result = await query(
    'UPDATE security_honeytokens SET active = $2 WHERE id = $1 RETURNING id',
    [id, Boolean(active)]
  );
  invalidateHoneytokenCache();
  return result.rowCount > 0;
}

export async function deleteHoneytoken(id) {
  const result = await query('DELETE FROM security_honeytokens WHERE id = $1 RETURNING id', [id]);
  invalidateHoneytokenCache();
  return result.rowCount > 0;
}
