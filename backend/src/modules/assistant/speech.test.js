import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../../app.js';
import express from 'express';
import { buildSpeechSsml, buildUzbekSsml, createSpeechRouter } from './speech.routes.js';
import { prepareLocalSpeechText } from './local-speech.js';
import { smallTalkAnswer, uzbekSystemPrompt } from './uzbek.js';

const httpFetch = globalThis.fetch;
const saved = { key: process.env.AZURE_SPEECH_KEY, region: process.env.AZURE_SPEECH_REGION, voice: process.env.AZURE_SPEECH_VOICE, openai: process.env.OPENAI_API_KEY };
let server;
let url;

before(async () => {
  delete process.env.OPENAI_API_KEY;
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  url = `http://127.0.0.1:${server.address().port}/api/assistant`;
});
after(async () => {
  globalThis.fetch = httpFetch;
  for (const [name, value] of Object.entries({ AZURE_SPEECH_KEY: saved.key, AZURE_SPEECH_REGION: saved.region, AZURE_SPEECH_VOICE: saved.voice, OPENAI_API_KEY: saved.openai })) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
  await new Promise((resolve) => server.close(resolve));
});

const post = (path, body) => httpFetch(`${url}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('uses only native Uzbek voices and escapes SSML control characters', () => {
  const result = buildUzbekSsml('O‘zbekcha <voice> & "sinov"');
  assert.match(result, /xml:lang="uz-UZ"/);
  assert.match(result, /name="uz-UZ-MadinaNeural"/);
  assert.match(result, /&lt;voice&gt; &amp; &quot;sinov&quot;/);
  assert.match(buildUzbekSsml('Salom', 'uz-UZ-MadinaNeural'), /MadinaNeural/);
  assert.match(buildUzbekSsml('Salom', 'en-US-fake'), /MadinaNeural/);
  assert.match(buildSpeechSsml('Здравствуйте', 'ru'), /xml:lang="ru-RU".*SvetlanaNeural/);
  assert.match(buildSpeechSsml('Hello', 'en'), /xml:lang="en-US".*JennyNeural/);
});

test('prepares short clean Uzbek text without links or formatting', () => {
  assert.equal(prepareLocalSpeechText('**FSTU** va HEMIS: https://example.uz'), "Farg'ona davlat texnika universiteti va Hemis");
  assert.equal(prepareLocalSpeechText('O‘zbekcha   matn... Yaxshi!'), "O'zbekcha matn. Yaxshi!");
});

test('rejects empty or oversized speech without calling an external service', async () => {
  globalThis.fetch = () => { throw new Error('External call is unexpected'); };
  assert.equal((await post('/speech', { text: '' })).status, 400);
  assert.equal((await post('/speech', { text: 'x'.repeat(4001) })).status, 400);
});

test('missing cloud configuration produces real local Uzbek speech without external calls', async () => {
  delete process.env.AZURE_SPEECH_KEY;
  globalThis.fetch = () => { throw new Error('Local speech must not call an external service'); };
  const response = await post('/speech', { text: 'Assalomu alaykum.' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^audio\/wav/);
  const wav = Buffer.from(await response.arrayBuffer());
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt32LE(24), 22050);
  assert.equal(wav.readUInt32LE(40), wav.length - 44);
  assert.ok(wav.length > 22050);
  let nonzero = 0;
  for (let index = 44; index < wav.length; index += 2) if (wav.readInt16LE(index) !== 0) nonzero += 1;
  assert.ok(nonzero > 5000, 'Speech contains audible samples, not silence');
});

test('returns audio from the Uzbek voice provider and keeps credentials server-side', async () => {
  process.env.AZURE_SPEECH_KEY = 'test-only-subscription';
  process.env.AZURE_SPEECH_REGION = 'eastus';
  process.env.AZURE_SPEECH_VOICE = 'uz-UZ-SardorNeural';
  let providerCall;
  globalThis.fetch = async (address, options) => {
    providerCall = { address, options };
    return { ok: true, arrayBuffer: async () => new Uint8Array([73, 68, 51, 1]).buffer };
  };
  const response = await post('/speech', { text: 'Assalomu alaykum. Sizga qanday yordam bera olaman?' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^audio\/mpeg/);
  assert.equal((await response.arrayBuffer()).byteLength, 4);
  assert.equal(providerCall.address, 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1');
  assert.match(providerCall.options.body, /uz-UZ-SardorNeural/);
  assert.equal(providerCall.options.headers['Ocp-Apim-Subscription-Key'], 'test-only-subscription');
});

test('cloud provider failure falls back to real local speech', async () => {
  globalThis.fetch = async () => ({ ok: false });
  const response = await post('/speech', { text: 'Sinov uchun matn.' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^audio\/wav/);
  assert.ok((await response.arrayBuffer()).byteLength > 22050);
});

test('concurrent local requests return complete independent audio', async () => {
  delete process.env.AZURE_SPEECH_KEY;
  const responses = await Promise.all([
    post('/speech', { text: 'Salom.' }),
    post('/speech', { text: 'Assalomu alaykum. Sizga yordam berishga tayyorman.' })
  ]);
  const audio = await Promise.all(responses.map(async (response) => {
    assert.equal(response.status, 200);
    return Buffer.from(await response.arrayBuffer());
  }));
  assert.ok(audio[1].length > audio[0].length);
  for (const wav of audio) assert.equal(wav.readUInt32LE(40), wav.length - 44);
});

test('uses OpenAI consistently and reports failures without substituting another voice', async () => {
  process.env.OPENAI_API_KEY = 'test-only-key';
  delete process.env.AZURE_SPEECH_KEY;
  const calls = [];
  const app = express();
  app.use(express.json());
  app.use('/speech', createSpeechRouter({ naturalSpeech: async (...args) => {
    calls.push(args);
    if (calls.length === 2) throw new Error('provider unavailable');
    if (calls.length === 3) throw new Error('natural_speech_quota_exceeded');
    return Buffer.from('natural audio test');
  } }));
  const naturalServer = app.listen(0, '127.0.0.1');
  await new Promise(resolve => naturalServer.once('listening', resolve));
  try {
    const address = `http://127.0.0.1:${naturalServer.address().port}/speech`;
    const request = () => httpFetch(address, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Salom.', language: 'uz' }) });
    const natural = await request();
    assert.equal(natural.status, 200);
    assert.equal(await natural.text(), 'natural audio test');
    assert.match(natural.headers.get('content-type'), /^audio\/wav/);
    assert.equal(calls[0][0], 'Salom.');
    assert.equal(calls[0][1], 'uz');
    assert.ok(calls[0][2] instanceof AbortSignal);
    const unavailable = await request();
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { error: 'openai_speech_unavailable' });
    const quota = await request();
    assert.equal(quota.status, 503);
    assert.deepEqual(await quota.json(), { error: 'openai_speech_quota_exceeded' });
    const recovered = await request();
    assert.equal(recovered.status, 200);
    assert.equal(await recovered.text(), 'natural audio test');
  } finally {
    delete process.env.OPENAI_API_KEY;
    await new Promise(resolve => naturalServer.close(resolve));
  }
});

test('small talk works in the selected language without a language-model provider', async () => {
  globalThis.fetch = () => { throw new Error('External call is unexpected'); };
  const response = await post('/chat', { message: 'Hello!', language: 'en' });
  assert.equal(response.status, 200);
  assert.match((await response.json()).answer, /Hello/);
  assert.match(smallTalkAnswer('Rahmat!'), /Arzimaydi/);
  assert.match(smallTalkAnswer('Здравствуйте!', 'ru'), /Здравствуйте/);
  assert.match(smallTalkAnswer('Hello!', 'en'), /Hello/);
  assert.equal(smallTalkAnswer('Salom!', 'en'), null);
  assert.equal(smallTalkAnswer('Universitetda nechta talaba bor?'), null);
  assert.match(uzbekSystemPrompt([]), /faqat adabiy o‘zbek tilida/);
});
