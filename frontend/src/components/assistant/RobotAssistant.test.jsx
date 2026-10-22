import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RobotAssistant from './RobotAssistant';

const mockNavigate = jest.fn();
let mockLanguage = 'uz';
jest.mock('../../context/LanguageContext', () => ({ useLanguage: () => ({ currentLanguageCode: mockLanguage }) }));
const mockLocation = { pathname: '/news' };
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}), { virtual: true });
jest.mock('./RobotAvatar', () => ({ __esModule: true, default: () => <div data-testid="robot-model" /> }));
jest.mock('./FloatingRobot', () => ({
  __esModule: true,
  default: ({ state, onActivate, onHide }) => <div role="img" data-testid="robot-model" data-state={state}>
    <button type="button" onClick={onActivate}>Robot chatini ochish</button>
    <button type="button" onClick={onHide}>Robotni yashirish</button>
  </div>
}));

beforeEach(() => {
  window.matchMedia = jest.fn(() => ({ matches: true }));
  global.fetch = jest.fn();
  window.speechSynthesis = { cancel: jest.fn(), speak: jest.fn() };
  window.SpeechSynthesisUtterance = function (value) { this.text = value; };
  mockLocation.pathname = '/news';
  mockLanguage = 'uz';
  mockNavigate.mockReset();
});

function openMenu() { fireEvent.mouseEnter(document.querySelector('.fstu-ai__orbit')); }
function choose(label) { openMenu(); fireEvent.click(screen.getByRole('button', { name: label })); }
function fillRequest() {
  fireEvent.change(screen.getByLabelText('Ism va familiya'), { target: { value: 'Test Talaba' } });
  fireEvent.change(screen.getByLabelText('Telefon raqami'), { target: { value: '+998 90 123 45 67' } });
  fireEvent.change(screen.getByLabelText('Mavzu'), { target: { value: 'Test murojaat' } });
  fireEvent.change(screen.getByLabelText('Murojaat matni'), { target: { value: 'Bu sinov uchun yozilgan murojaat.' } });
}

test('starts as fstuAI even on an inner page; hover exposes all three choices and Escape closes them', () => {
  render(<RobotAssistant />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByRole('button', { name: 'fstuAI menyusi' }).getAttribute('aria-expanded')).toBe('false');
  openMenu();
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getByRole('button', { name: /Murojaat Murojaat yuborish/ })).toBeTruthy();
  expect(screen.getByRole('button', { name: /Imkoniyati cheklanganlar/ })).toBeTruthy();
  expect(screen.getByRole('button', { name: /HEMIS Ma’lumot yuborish/ })).toBeTruthy();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'fstuAI menyusi' }).getAttribute('aria-expanded')).toBe('false');
});

test('touch click opens the menu without hover and outside click closes it', () => {
  window.matchMedia.mockReturnValue({ matches: false });
  render(<RobotAssistant />);
  const launcher = screen.getByRole('button', { name: 'fstuAI menyusi' });
  fireEvent.click(launcher);
  expect(launcher.getAttribute('aria-expanded')).toBe('true');
  fireEvent.pointerDown(document.body);
  expect(launcher.getAttribute('aria-expanded')).toBe('false');
});

test('robot appears only in accessibility, can be hidden and restored, and resets when reopened', async () => {
  render(<RobotAssistant />);
  choose(/Imkoniyati cheklanganlar/);
  fireEvent.click(screen.getByRole('button', { name: 'Robot chatini ochish' }));
  expect(await screen.findByRole('dialog')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Robotni yashirish' }));
  expect(screen.queryByRole('img')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Yurib chiqadigan animatsiyali robot/ }));
  expect(screen.getByRole('img')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Robotni yashirish' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('button', { name: /Yurib chiqadigan animatsiyali robot/ })).toBeNull();
  choose(/Imkoniyati cheklanganlar/);
  expect(screen.getByRole('img')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Menyuga qaytish' }));
  expect(screen.queryByRole('img')).toBeNull();
  choose(/HEMIS Ma’lumot yuborish/);
  expect(screen.queryByRole('img')).toBeNull();
});

test('Murojaat opens only a form and confirms success only after the API saves it', async () => {
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ id: '42' }) });
  render(<RobotAssistant />);
  choose(/Murojaat Murojaat yuborish/);
  expect(screen.getByRole('dialog').textContent).toContain('Murojaat');
  expect(screen.queryByRole('log')).toBeNull();
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByLabelText('Talaba ID raqami')).toBeNull();
  fillRequest();
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  await screen.findByText('Murojaatingiz qabul qilindi');
  expect(screen.getByText('#42')).toBeTruthy();
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/assistant\/requests$/);
  expect(JSON.parse(options.body)).toMatchObject({ type: 'appeal', language: 'uz', fullName: 'Test Talaba' });
  expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
});

test('HEMIS has student fields, preserves entries on API failure and can retry', async () => {
  global.fetch.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ id: '43' }) });
  render(<RobotAssistant />);
  choose(/HEMIS Ma’lumot yuborish/);
  fillRequest();
  fireEvent.change(screen.getByLabelText('Talaba ID raqami'), { target: { value: '123456' } });
  fireEvent.change(screen.getByLabelText('Guruh'), { target: { value: '12-24' } });
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Ism va familiya').value).toBe('Test Talaba');
  expect(screen.queryByText('Murojaatingiz qabul qilindi')).toBeNull();
  expect(screen.queryByRole('log')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  await screen.findByText('#43');
  expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toMatchObject({ type: 'hemis', studentId: '123456', group: '12-24' });
});

test('accessibility mounts the robot, chats using API history and stops speech on close', async () => {
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ answer: 'Sizga yordam beraman.' }) });
  render(<RobotAssistant />);
  choose(/Imkoniyati cheklanganlar/);
  await screen.findByTestId('robot-model');
  expect(screen.getByRole('img')).toBeTruthy();
  expect(screen.getByRole('log').textContent).toContain('Assalomu alaykum');
  fireEvent.change(screen.getByLabelText('Savolingizni yozing…'), { target: { value: 'Salom' } });
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  await screen.findByText('Sizga yordam beraman.');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toMatchObject({ message: 'Salom', history: [{ role: 'assistant', content: expect.any(String) }] });
  fireEvent.click(screen.getByRole('button', { name: 'Mikrofon orqali gapirish' }));
  expect(screen.getByText(/Brauzeringiz ovozli kiritishni/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Yopish' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.queryByRole('img')).toBeNull();
  expect(window.speechSynthesis.cancel).toHaveBeenCalled();
});

test('recognized voice is submitted directly, and closing aborts the microphone', async () => {
  let recognition;
  window.SpeechRecognition = function () { recognition = this; this.start = jest.fn(); this.abort = jest.fn(); };
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ answer: 'Ovozli javob.' }) });
  const view = render(<RobotAssistant />);
  choose(/Imkoniyati cheklanganlar/);
  await screen.findByTestId('robot-model');
  fireEvent.click(screen.getByRole('button', { name: 'Mikrofon orqali gapirish' }));
  act(() => recognition.onresult({ results: [[{ transcript: 'Salom robot' }]] }));
  await screen.findByText('Ovozli javob.');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).message).toBe('Salom robot');
  view.unmount();
  expect(recognition.abort).toHaveBeenCalled();
  delete window.SpeechRecognition;
});

test('closing an in-flight form cancels its request', async () => {
  global.fetch.mockImplementation(() => new Promise(() => {}));
  render(<RobotAssistant />);
  choose(/Murojaat Murojaat yuborish/);
  fillRequest();
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  const signal = global.fetch.mock.calls[0][1].signal;
  fireEvent.click(screen.getByRole('button', { name: 'Yopish' }));
  await waitFor(() => expect(signal.aborted).toBe(true));
});

test('robot conversation follows the selected website language and can switch languages', async () => {
  mockLanguage = 'ru';
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ answer: 'Я помощник университета.' }) });
  render(<RobotAssistant />);
  choose(/Специальные возможности/);
  await screen.findByTestId('robot-model');
  expect(screen.getByRole('log').textContent).toContain('Здравствуйте');
  fireEvent.change(screen.getByLabelText('Напишите вопрос…'), { target: { value: 'Кто вы?' } });
  fireEvent.click(screen.getByRole('button', { name: 'Отправить' }));
  await screen.findByText('Я помощник университета.');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).language).toBe('ru');
  fireEvent.click(screen.getByRole('button', { name: 'EN' }));
  expect(screen.getByRole('log').textContent).toContain('Hello');
});

test('an answer failure is spoken aloud as well as displayed', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 503 });
  render(<RobotAssistant />);
  choose(/Imkoniyati cheklanganlar/);
  await screen.findByTestId('robot-model');
  fireEvent.change(screen.getByLabelText('Savolingizni yozing…'), { target: { value: 'Savolim bor' } });
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  await screen.findByText('Hozir javob olishning imkoni bo‘lmadi. Iltimos, qayta urinib ko‘ring.');
  const voiceCall = global.fetch.mock.calls.find(([url]) => url.endsWith('/api/assistant/speech'));
  expect(JSON.parse(voiceCall[1].body).text).toContain('Hozir javob olishning imkoni bo‘lmadi');
});

test('typed and spoken page-reading commands read actual page text without asking the model', async () => {
  let recognition;
  window.SpeechRecognition = function () { recognition = this; this.start = jest.fn(); this.abort = jest.fn(); };
  global.fetch.mockResolvedValue({ ok: false, status: 503 });
  const view = render(<><main><h1>Qabul haqida</h1><p>Hujjatlar elektron shaklda topshiriladi.</p></main><RobotAssistant /></>);
  try {
    choose(/Imkoniyati cheklanganlar/);
    fireEvent.change(screen.getByLabelText('Savolingizni yozing…'), { target: { value: 'Sahifani o‘qib ber' } });
    fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
    await waitFor(() => expect(screen.getByRole('log').textContent).toContain('Hujjatlar elektron shaklda topshiriladi.'));
    expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/chat'))).toBe(false);
    const speech = global.fetch.mock.calls.find(([url]) => url.endsWith('/speech'));
    expect(JSON.parse(speech[1].body).text).toContain('Hujjatlar elektron shaklda topshiriladi.');
    fireEvent.click(screen.getByRole('button', { name: 'Mikrofon orqali gapirish' }));
    act(() => recognition.onresult({ results: [[{ transcript: 'saxifani oqib ber' }]] }));
    await waitFor(() => expect(screen.getByRole('log').querySelectorAll('.is-assistant').length).toBe(3));
    expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/chat'))).toBe(false);
  } finally { view.unmount(); delete window.SpeechRecognition; }
});

test('waits for final speech recognition and submits all recognized words with page context', async () => {
  let recognition;
  window.SpeechRecognition = function () { recognition = this; this.start = jest.fn(); this.abort = jest.fn(); };
  global.fetch.mockResolvedValue({ ok: true, json: async () => ({ answer: 'Qabul haqida javob.' }) });
  const view = render(<><main><h1>Qabul</h1><p>Arizalar onlayn topshiriladi.</p></main><RobotAssistant /></>);
  try {
    choose(/Imkoniyati cheklanganlar/);
    fireEvent.click(screen.getByRole('button', { name: 'Mikrofon orqali gapirish' }));
    act(() => recognition.onresult({ results: [Object.assign([{ transcript: 'Qabul' }], { isFinal: false })] }));
    expect(global.fetch).not.toHaveBeenCalled();
    act(() => recognition.onresult({ results: [Object.assign([{ transcript: 'Qabul haqida' }], { isFinal: true }), Object.assign([{ transcript: 'aytib bering' }], { isFinal: true })] }));
    await screen.findByText('Qabul haqida javob.');
    const chat = global.fetch.mock.calls.find(([url]) => url.endsWith('/chat'));
    expect(JSON.parse(chat[1].body)).toMatchObject({ message: 'Qabul haqida aytib bering', page: { title: 'Qabul', text: expect.stringContaining('Arizalar onlayn topshiriladi.') } });
  } finally { view.unmount(); delete window.SpeechRecognition; }
});

test('opens the requested page and reads its loaded text instead of the previous page', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 503 });
  const content = loaded => <><main>{loaded === 'old' ? <p>Eski yangiliklar matni.</p> : loaded === 'new' ? <><h1>Qabul</h1><div>Qabul sahifasidagi yangi matn.</div></> : null}</main><RobotAssistant /></>;
  const view = render(content('old'));
  mockNavigate.mockImplementation(path => { mockLocation.pathname = path; view.rerender(content('loading')); });
  choose(/Imkoniyati cheklanganlar/);
  fireEvent.change(screen.getByLabelText('Savolingizni yozing…'), { target: { value: 'Qabulni ochib, matnlarini o‘qib ber' } });
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  expect(mockNavigate).toHaveBeenCalledWith('/admission');
  expect(global.fetch).not.toHaveBeenCalled();
  view.rerender(content('new'));
  await waitFor(() => expect(screen.getByRole('log').textContent).toContain('Qabul sahifasidagi yangi matn.'));
  const speech = global.fetch.mock.calls.find(([url]) => url.endsWith('/speech'));
  expect(JSON.parse(speech[1].body).text).toContain('Qabul sahifasidagi yangi matn.');
  expect(JSON.parse(speech[1].body).text).not.toContain('Eski yangiliklar matni');
  expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/chat'))).toBe(false);
});

test('a spoken page name opens the specific frontend article without asking AI', async () => {
  let recognition;
  window.SpeechRecognition = function () { recognition = this; this.start = jest.fn(); this.abort = jest.fn(); };
  global.fetch.mockResolvedValue({ ok: false, status: 503 });
  const view = render(<><main><article><h3>Mexanika fakulteti</h3><a href="/faculties/9">Batafsil</a></article></main><RobotAssistant /></>);
  try {
    choose(/Imkoniyati cheklanganlar/);
    fireEvent.click(screen.getByRole('button', { name: 'Mikrofon orqali gapirish' }));
    act(() => recognition.onresult({ results: [[{ transcript: 'Mexanika fakultetini och' }]] }));
    expect(mockNavigate).toHaveBeenCalledWith('/faculties/9');
    await waitFor(() => expect(screen.getByRole('log').textContent).toContain('Mexanika fakulteti sahifasini ochdim.'));
    expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/chat'))).toBe(false);
  } finally { view.unmount(); delete window.SpeechRecognition; }
});

test.each(['typed', 'spoken'])('%s navigation opens a page even when OpenAI voice credits are exhausted', async (source) => {
  let recognition;
  window.SpeechRecognition = function () { recognition = this; this.start = jest.fn(); this.abort = jest.fn(); };
  global.fetch.mockResolvedValue({
    ok: false, status: 503,
    clone: () => ({ json: async () => ({ error: 'openai_speech_quota_exceeded' }) }),
    json: async () => ({ error: 'openai_speech_quota_exceeded' })
  });
  const view = render(<RobotAssistant />);
  try {
    choose(/Imkoniyati cheklanganlar/);
    const command = 'Iltimos, yangiliklar sahifasiga kirib bera olasanmi?';
    if (source === 'spoken') {
      fireEvent.click(screen.getByRole('button', { name: 'Mikrofon orqali gapirish' }));
      act(() => recognition.onresult({ results: [[{ transcript: command }]] }));
    } else {
      fireEvent.change(screen.getByLabelText('Savolingizni yozing…'), { target: { value: command } });
      fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
    }
    expect(mockNavigate).toHaveBeenCalledWith('/news');
    expect(screen.getByRole('log').textContent).toContain('Yangiliklar sahifasini ochdim.');
    await screen.findByText('Ovoz xizmati limiti tugagan. Administratorga murojaat qiling.');
    expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/chat'))).toBe(false);
  } finally { view.unmount(); delete window.SpeechRecognition; }
});

test('stopping while the requested page loads prevents it from being read later', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 503 });
  const content = <><main /><RobotAssistant /></>;
  const view = render(content);
  mockNavigate.mockImplementation(path => { mockLocation.pathname = path; view.rerender(content); });
  choose(/Imkoniyati cheklanganlar/);
  fireEvent.change(screen.getByLabelText('Savolingizni yozing…'), { target: { value: 'Qabulni ochib oqib ber' } });
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }));
  expect(mockNavigate).toHaveBeenCalledWith('/admission');
  fireEvent.click(screen.getByRole('button', { name: 'Ovozni to‘xtatish' }));
  await act(async () => {});
  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Yuborish' }).disabled).toBe(true);
});
