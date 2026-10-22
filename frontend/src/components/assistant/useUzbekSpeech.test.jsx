import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import useUzbekSpeech, { chooseBrowserVoice, spokenUzbek, splitSpeechText } from './useUzbekSpeech';

const onStateChange = jest.fn();
function Harness({ value = 'FSTU haqida ma’lumot.' }) {
  const { speak, stop, notice } = useUzbekSpeech({ muted: false, onStateChange });
  return <><button onClick={() => speak(value)}>Speak</button><button onClick={stop}>Stop</button><p>{notice}</p></>;
}

beforeEach(() => {
  onStateChange.mockClear();
  window.speechSynthesis = { cancel: jest.fn(), speak: jest.fn(), getVoices: jest.fn(() => []) };
  window.SpeechSynthesisUtterance = function (value) { this.text = value; };
  global.fetch = jest.fn(async () => ({ ok: false, status: 503 }));
});

test('normalizes speech text without reading formatting or Latin abbreviations', () => {
  expect(spokenUzbek('**FSTU** [ma’lumot](https://example.com)')).toBe('Farg‘ona davlat texnika universiteti ma’lumot');
});

test('never falls back to a Russian or English voice for Uzbek speech', async () => {
  window.speechSynthesis.getVoices.mockReturnValue([{ lang: 'en-US', default: true }, { lang: 'ru-RU' }]);
  render(<Harness />);
  fireEvent.click(screen.getByText('Speak'));
  await screen.findByText('Ovoz xizmati hozir mavjud emas.');
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  expect(onStateChange).toHaveBeenLastCalledWith('idle');
});

test('uses an installed Uzbek voice when the native cloud voice is not configured', async () => {
  const uzbek = { lang: 'uz-UZ', name: 'O‘zbekcha' };
  window.speechSynthesis.getVoices.mockReturnValue([{ lang: 'en-US' }, uzbek]);
  render(<Harness />);
  fireEvent.click(screen.getByText('Speak'));
  await waitFor(() => expect(window.speechSynthesis.speak).toHaveBeenCalled());
  const utterance = window.speechSynthesis.speak.mock.calls[0][0];
  expect(utterance.voice).toBe(uzbek);
  expect(utterance.lang).toBe('uz-UZ');
  act(() => utterance.onstart());
  expect(onStateChange).toHaveBeenLastCalledWith('talking');
  act(() => utterance.onend());
  await waitFor(() => expect(onStateChange).toHaveBeenLastCalledWith('idle'));
});

test('stopping aborts a pending synthesis without speaking a late answer', async () => {
  let resolve;
  global.fetch.mockImplementation(() => new Promise((done) => { resolve = done; }));
  render(<Harness />);
  fireEvent.click(screen.getByText('Speak'));
  const signal = global.fetch.mock.calls[0][1].signal;
  fireEvent.click(screen.getByText('Stop'));
  expect(signal.aborted).toBe(true);
  await act(async () => resolve({ ok: false, status: 503 }));
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
});

test('WAV audio starts gestures and stopping releases audio resources', async () => {
  const originalAudio = window.Audio;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  const audio = { pause: jest.fn(), load: jest.fn(), removeAttribute: jest.fn(), play: jest.fn(async () => audio.onplaying()) };
  window.Audio = jest.fn(() => audio);
  URL.createObjectURL = jest.fn(() => 'blob:test-uzbek-audio');
  URL.revokeObjectURL = jest.fn();
  global.fetch.mockResolvedValue({ ok: true, headers: { get: () => 'audio/wav' }, blob: async () => new Blob(['test audio'], { type: 'audio/wav' }) });
  const view = render(<Harness />);
  try {
    fireEvent.click(screen.getByText('Speak'));
    await waitFor(() => expect(audio.play).toHaveBeenCalled());
    expect(onStateChange).toHaveBeenLastCalledWith('talking');
    fireEvent.click(screen.getByText('Stop'));
    expect(audio.pause).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-uzbek-audio');
    expect(audio.onplaying).toBeNull();
  } finally {
    view.unmount();
    window.Audio = originalAudio;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  }
});

test('temporary server unavailability does not permanently disable speech retries', async () => {
  render(<Harness />);
  fireEvent.click(screen.getByText('Speak'));
  await screen.findByText('Ovoz xizmati hozir mavjud emas.');
  const attempts = global.fetch.mock.calls.length;
  expect(attempts).toBeGreaterThan(0);
  fireEvent.click(screen.getByText('Speak'));
  await waitFor(() => expect(global.fetch.mock.calls.length).toBeGreaterThan(attempts));
});

test('chooses a female voice in the requested language and keeps whole sentences together', () => {
  const female = { lang: 'uz-UZ', name: 'Microsoft Madina' };
  expect(chooseBrowserVoice([{ lang: 'en-US', name: 'Jenny' }, { lang: 'uz-UZ', name: 'Sardor' }, female], 'uz')).toBe(female);
  const input = 'Bu universitet sahifasidagi uzun gap. '.repeat(180).trim();
  const chunks = splitSpeechText(input);
  expect(chunks.length).toBeGreaterThan(1);
  expect(chunks.join(' ')).toBe(input);
  expect(chunks.every(chunk => chunk.length <= 3500 && chunk.endsWith('.'))).toBe(true);
});

test('reads beyond 4000 characters in order and prepares the next paragraph during playback', async () => {
  const originalAudio = window.Audio;
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  const audios = [];
  const input = 'Sahifadagi ma’lumotlar ravon o‘qiladi. '.repeat(140).trim();
  window.Audio = jest.fn(() => {
    const audio = { pause: jest.fn(), load: jest.fn(), removeAttribute: jest.fn(), play: jest.fn(async () => audio.onplaying()) };
    audios.push(audio);
    return audio;
  });
  URL.createObjectURL = jest.fn(() => 'blob:page-audio');
  URL.revokeObjectURL = jest.fn();
  global.fetch.mockResolvedValue({ ok: true, headers: { get: () => 'audio/wav' }, blob: async () => new Blob(['speech'], { type: 'audio/wav' }) });
  const view = render(<Harness value={input} />);
  try {
    fireEvent.click(screen.getByText('Speak'));
    await waitFor(() => expect(audios.length).toBe(1));
    expect(global.fetch).toHaveBeenCalledTimes(2);
    for (let index = 0; index < 10; index += 1) {
      await waitFor(() => expect(audios[index]).toBeDefined());
      await act(async () => audios[index].onended());
      await waitFor(() => expect(
        audios.length > index + 1 || onStateChange.mock.calls.at(-1)?.[0] === 'idle'
      ).toBe(true));
      if (onStateChange.mock.calls.at(-1)?.[0] === 'idle') break;
    }
    const spoken = global.fetch.mock.calls.map(([, options]) => JSON.parse(options.body).text).join(' ');
    expect(spoken).toBe(spokenUzbek(input));
    expect(onStateChange).toHaveBeenLastCalledWith('idle');
    expect(audios.length).toBeGreaterThan(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(audios.length);
  } finally {
    view.unmount();
    window.Audio = originalAudio;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  }
});

test.each([
  ['openai_speech_quota_exceeded', 'Ovoz xizmati limiti tugagan. Administratorga murojaat qiling.'],
  ['openai_speech_unavailable', 'Tabiiy ovoz xizmati hozir mavjud emas. Iltimos, keyinroq urinib ko‘ring.']
])('displays %s without replacing the OpenAI voice with browser speech', async (code, notice) => {
  window.speechSynthesis.getVoices.mockReturnValue([{ lang: 'uz-UZ', name: 'Madina' }]);
  global.fetch.mockResolvedValue({
    ok: false, status: 503,
    clone: () => ({ json: async () => ({ error: code }) }),
    json: async () => ({ error: code })
  });
  render(<Harness />);
  fireEvent.click(screen.getByText('Speak'));
  await screen.findByText(notice);
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  expect(onStateChange).toHaveBeenLastCalledWith('idle');
});
