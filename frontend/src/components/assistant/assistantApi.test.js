let api;
beforeEach(() => { jest.resetModules(); api = require('./assistantApi'); global.fetch = jest.fn(); });

test('tries the next configured backend and reuses it for speech', async () => {
  global.fetch.mockRejectedValueOnce(new TypeError('connection refused'))
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ answer: 'Saytdagi javob.' }) })
    .mockResolvedValueOnce({ ok: true, status: 200 });
  expect(await api.askAssistant({ message: 'Qabul haqida', language: 'uz', page: { text: 'Hujjatlar onlayn olinadi.' } })).toBe('Saytdagi javob.');
  expect(global.fetch.mock.calls[0][0]).not.toBe(global.fetch.mock.calls[1][0]);
  await api.requestAssistantSpeech({ text: 'Saytdagi javob.', language: 'uz' });
  const chatUrl = new URL(global.fetch.mock.calls[1][0]);
  const speechUrl = new URL(global.fetch.mock.calls[2][0]);
  expect(chatUrl.origin).toBe(speechUrl.origin);
  expect(JSON.parse(global.fetch.mock.calls[1][1].body).page.text).toBe('Hujjatlar onlayn olinadi.');
});

test('does not retry a stopped request on another server', async () => {
  const controller = new AbortController();
  global.fetch.mockImplementation(async () => { controller.abort(); throw new DOMException('Aborted', 'AbortError'); });
  await expect(api.askAssistant({ message: 'Salom', signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('does not accept an empty answer as a successful conversation', async () => {
  global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ answer: '' }) });
  await expect(api.askAssistant({ message: 'Savol' })).rejects.toThrow('assistant-empty');
});

test('keeps OpenAI voice failures on the connected server instead of trying other voices', async () => {
  const response = {
    ok: false, status: 503,
    clone: () => ({ json: async () => ({ error: 'openai_speech_quota_exceeded' }) })
  };
  global.fetch.mockResolvedValue(response);
  expect(await api.requestAssistantSpeech({ text: 'Salom.', language: 'uz' })).toBe(response);
  expect(global.fetch).toHaveBeenCalledTimes(1);
});
