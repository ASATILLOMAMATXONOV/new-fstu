import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../../app.js';
import pool from '../../db/pool.js';
import { validateRequest } from './requests.routes.js';

const valid = { type: 'appeal', fullName: 'Test Talaba', phone: '+998 90 123 45 67', subject: 'Test murojaat', message: 'Bu sinov uchun yozilgan murojaat.', language: 'uz' };
let server;
let url;
let queries = [];
const originalQuery = pool.query;

before(async () => {
  pool.query = async (sql, params) => {
    queries.push({ sql, params });
    return { rows: [{ id: '42', created_at: '2026-10-20T00:00:00Z' }] };
  };
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  url = `http://127.0.0.1:${server.address().port}/api/assistant/requests`;
});
after(async () => {
  pool.query = originalQuery;
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('validates type, required fields, lengths, phone digits and language', () => {
  assert.ok(validateRequest(valid));
  assert.ok(validateRequest({ ...valid, type: 'hemis', studentId: '123', group: '12-24' }));
  for (const changes of [{ type: 'chat' }, { fullName: '' }, { phone: '-------' }, { phone: 'abcdefghi' }, { subject: 'ab' }, { message: 'short' }, { message: 'x'.repeat(5001) }, { language: 'xx' }, { studentId: 'x'.repeat(51) }, { group: 'x'.repeat(81) }]) {
    assert.equal(validateRequest({ ...valid, ...changes }), null);
  }
});

test('persists appeal and HEMIS with parameterized SQL and returns the saved ID', async () => {
  for (const type of ['appeal', 'hemis']) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, type, fullName: "O'ktam Test", studentId: '123', group: '12-24' }) });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).id, '42');
    const call = queries.at(-1);
    assert.match(call.sql, /VALUES \(\$1, \$2/);
    assert.equal(call.params[1], "O'ktam Test");
    assert.equal(call.params[5], type === 'hemis' ? '123' : null);
    assert.equal(call.params[6], type === 'hemis' ? '12-24' : null);
  }
});

test('invalid submissions never reach the database', async () => {
  const count = queries.length;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...valid, message: '' }) });
  assert.equal(response.status, 400);
  assert.equal(queries.length, count);
});

test('public visitors cannot read submitted personal details', async () => {
  const count = queries.length;
  const response = await fetch(url);
  assert.equal(response.status, 401);
  assert.equal(queries.length, count);
});
