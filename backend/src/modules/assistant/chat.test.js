import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import { createChatRouter } from './chat.routes.js';
import { plainText, siteAnswer } from './site-answer.js';

const originalKey = process.env.OPENAI_API_KEY;
let server;
let address;
let provider;
const context = [{ resource: 'faculties', items: [{ title: 'Energetika fakulteti', uz: { content: '<p>Energetika fakultetida elektr muhandislari tayyorlanadi.</p>' } }] }];
before(async () => {
  delete process.env.OPENAI_API_KEY;
  const app = express();
  app.use(express.json());
  app.use('/chat', createChatRouter({ listContent: async resource => context.find(item => item.resource === resource)?.items || [],
    fetchResponse: (...args) => provider(...args) }));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  address = `http://127.0.0.1:${server.address().port}/chat`;
});
after(async () => {
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
  await new Promise(resolve => server.close(resolve));
});
const ask = body => fetch(address, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('answers factual university questions without a model key instead of returning 503', async () => {
  provider = () => { throw new Error('No provider should be called'); };
  const response = await ask({ message: 'Energetika fakulteti haqida aytib bering', language: 'uz' });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.mode, 'site');
  assert.match(result.answer, /elektr muhandislari tayyorlanadi/);
  assert.doesNotMatch(result.answer, /<p>/);
});

test('answers from the actual current page and does not invent unknown facts', async () => {
  const response = await ask({ message: 'Arizalar qachon qabul qilinadi?', page: { title: 'Qabul', text: 'Arizalar 1-iyundan qabul qilinadi.\n\nSport tadbiri o‘tkazildi.' } });
  assert.match((await response.json()).answer, /Arizalar 1-iyundan qabul qilinadi/);
  const unknown = siteAnswer('Universitet qachon tashkil topgan?', [], undefined, 'uz');
  assert.match(unknown, /aniq ma’lumot topilmadi/);
  assert.doesNotMatch(unknown, /\d{4}/);
  const unrelated = siteAnswer('Universitetda yotoqxona bormi?', context);
  assert.match(unrelated, /aniq ma’lumot topilmadi/);
  const editorial = siteAnswer('Universitet haqida', [{ resource: 'pages', items: [{ title: 'Universitet menyusi', content: 'Responsive dizayn, hover va animatsiyalar saqlandi.' }] }]);
  assert.doesNotMatch(editorial, /Responsive|hover/);
  const hemis = siteAnswer('HEMIS parolini qanday tiklash mumkin?', [{ resource: 'pages', items: [{ title: 'Qabul', content: 'Abituriyentlar qabul bo‘limiga murojaat qilishlari mumkin.' }] }]);
  assert.match(hemis, /HEMIS bo‘limidan murojaat/);
  assert.doesNotMatch(hemis, /Abituriyentlar/);
  assert.equal(plainText('qabul bo&lsquo;limi &#x2014; ma&#8217;lumot'), 'qabul bo‘limi — ma’lumot');
});

test('uses local website answers when the AI provider fails, times out or returns no text', async () => {
  process.env.OPENAI_API_KEY = 'test-only-key';
  for (const implementation of [async () => ({ ok: false }), async () => { throw new Error('offline'); }, async () => ({ ok: true, json: async () => ({ output: [] }) })]) {
    provider = implementation;
    const response = await ask({ message: 'Energetika fakulteti' });
    assert.equal(response.status, 200);
    assert.match((await response.json()).answer, /elektr muhandislari/);
  }
  delete process.env.OPENAI_API_KEY;
});

test('sends current page facts and conversation history to a configured AI provider', async () => {
  process.env.OPENAI_API_KEY = 'test-only-key';
  let input;
  provider = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    input = JSON.parse(options.body).input;
    return { ok: true, json: async () => ({ output: [{ content: [{ type: 'output_text', text: 'Aniq javob.' }] }] }) };
  };
  const response = await ask({ message: 'Qabul haqida', page: { title: 'Qabul', text: 'Arizalar iyunda olinadi.' }, history: [{ role: 'user', content: 'Salom' }] });
  assert.equal((await response.json()).answer, 'Aniq javob.');
  assert.match(input[0].content, /Arizalar iyunda olinadi/);
  assert.deepEqual(input[1], { role: 'user', content: 'Salom' });
  delete process.env.OPENAI_API_KEY;
});

test('rejects invalid requests without searching content or calling an AI provider', async () => {
  assert.equal((await ask({ message: '' })).status, 400);
  assert.equal((await ask({ message: 'a'.repeat(4001) })).status, 400);
});
