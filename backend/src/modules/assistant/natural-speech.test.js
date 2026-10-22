import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { naturalSpeechInstructions, synthesizeNaturalSpeech } from './natural-speech.js';

class FakeSocket extends EventEmitter {
  static latest;
  constructor(address, options) {
    super();
    this.address = address;
    this.options = options;
    this.events = [];
    FakeSocket.latest = this;
  }
  send(data) { this.events.push(JSON.parse(data)); }
  terminate() { this.terminated = true; }
  receive(event) { this.emit('message', Buffer.from(JSON.stringify(event))); }
}
const options = { apiKey: 'test-only-key', WebSocketClass: FakeSocket };

test('configures conversational Uzbek audio and returns complete 24kHz PCM as WAV', async () => {
  const promise = synthesizeNaturalSpeech('Assalomu alaykum.', 'uz', undefined, options);
  const socket = FakeSocket.latest;
  assert.equal(socket.options.headers.Authorization, 'Bearer test-only-key');
  assert.match(socket.address, /model=gpt-realtime-2.1-mini$/);
  assert.ok(!socket.address.includes('test-only-key'));
  socket.emit('open');
  assert.equal(socket.events[0].session.audio.output.voice, 'marin');
  assert.equal(socket.events[0].session.audio.output.format.rate, 24000);
  assert.match(socket.events[0].session.instructions, /Uzbek.*verbatim|verbatim.*Uzbek/);
  assert.equal(socket.events.length, 1, 'Wait for the server to confirm the audio format');
  socket.receive({ type: 'session.updated' });
  socket.receive({ type: 'session.updated' });
  assert.equal(socket.events.length, 3, 'Send the text and request audio exactly once');
  assert.equal(socket.events[1].item.content[0].text, 'Assalomu alaykum.');
  const first = Buffer.from([1, 0, 2, 0]);
  const second = Buffer.from([3, 0, 4, 0]);
  for (const chunk of [first, second]) socket.receive({ type: 'response.output_audio.delta', delta: chunk.toString('base64') });
  socket.receive({ type: 'response.done', response: { status: 'completed' } });
  const wav = await promise;
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.deepEqual(wav.subarray(44), Buffer.concat([first, second]));
  assert.equal(socket.terminated, true);
  assert.match(naturalSpeechInstructions('ru'), /Russian/);
  assert.match(naturalSpeechInstructions('en'), /English/);
});

test('stopping speech closes the upstream connection and rejects late audio', async () => {
  const controller = new AbortController();
  const promise = synthesizeNaturalSpeech('Salom.', 'uz', controller.signal, options);
  const socket = FakeSocket.latest;
  controller.abort();
  socket.receive({ type: 'response.output_audio.delta', delta: 'AQACAA==' });
  await assert.rejects(promise, /speech_cancelled/);
  assert.equal(socket.terminated, true);
  await assert.rejects(synthesizeNaturalSpeech('Salom.', 'uz', controller.signal, options), /speech_cancelled/);
});

test('provider errors, truncated audio and timeouts fail without exposing credentials', async () => {
  for (const event of [
    { type: 'error', error: { message: 'private provider details' } },
    { type: 'response.done', response: { status: 'incomplete' } },
    { type: 'response.done', response: { status: 'completed' } }
  ]) {
    const promise = synthesizeNaturalSpeech('Salom.', 'uz', undefined, options);
    FakeSocket.latest.receive(event);
    await assert.rejects(promise, /natural_speech_(provider_error|incomplete)/);
    assert.equal(FakeSocket.latest.terminated, true);
  }
  const timedOut = synthesizeNaturalSpeech('Salom.', 'uz', undefined, { ...options, timeoutMs: 5 });
  await assert.rejects(timedOut, /natural_speech_timeout/);
  assert.equal(FakeSocket.latest.terminated, true);
});

test('reports exhausted API credits with a safe error for both realtime error formats', async () => {
  for (const event of [
    { type: 'error', error: { type: 'insufficient_quota', code: 'credit_balance_exhausted', message: 'private provider details' } },
    { type: 'response.done', response: { status: 'failed', status_details: { error: { code: 'insufficient_quota' } } } }
  ]) {
    const promise = synthesizeNaturalSpeech('Salom.', 'uz', undefined, options);
    FakeSocket.latest.receive(event);
    await assert.rejects(promise, { message: 'natural_speech_quota_exceeded' });
    assert.equal(FakeSocket.latest.terminated, true);
  }
});
