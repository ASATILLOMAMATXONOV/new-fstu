import { query } from './pool.js';

export async function fetchOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] ?? null;
}

export async function fetchMany(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}
