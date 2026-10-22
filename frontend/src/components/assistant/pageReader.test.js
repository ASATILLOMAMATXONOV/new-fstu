import { isReadPageCommand, pageReadingAnswer, readCurrentPage, waitForReadablePage } from './pageReader';

afterEach(() => { document.body.innerHTML = ''; });

test('reads page content while excluding navigation, private form fields, chat and hidden text', () => {
  document.body.innerHTML = `<header><h1>Navigation</h1></header><main><h1>Qabul</h1>
    <p>Arizalar universitet saytida qabul qilinadi.</p><p style="display:none">Hidden</p>
    <div hidden><p>Secret</p></div><form><p>Private name</p><input value="private"></form>
    <div class="fstu-ai"><p>Chat answer</p></div><button>Menu</button></main><footer><p>Footer</p></footer>`;
  expect(readCurrentPage()).toEqual({ title: 'Qabul', text: 'Qabul\n\nArizalar universitet saytida qabul qilinadi.' });
});

test('reads plain div and span content while skipping sidebar and hidden inline text', () => {
  document.body.innerHTML = '<main><h2>Tarix</h2><div>Universitet <strong>tarixi</strong> haqida.</div><section><span>Yangi ma’lumot.</span><span hidden>Yashirin</span></section><aside><p>Menyu havolalari</p></aside></main>';
  expect(readCurrentPage().text).toBe('Tarix\n\nUniversitet tarixi haqida.\n\nYangi ma’lumot.');
});

test('waits for navigation and loaded frontend content rather than reading the old page', async () => {
  document.body.innerHTML = '<main><p>Eski sahifa matni.</p></main>';
  let path = '/news';
  let loading = true;
  const promise = waitForReadablePage({ target: '/admission', getLocation: () => path, isLoading: () => loading, settleMs: 0, timeoutMs: 2000 });
  path = '/admission';
  document.body.innerHTML = '<main><h1>Qabul</h1></main>';
  await Promise.resolve();
  loading = false;
  document.querySelector('main').appendChild(Object.assign(document.createElement('p'), { textContent: 'Yangi sahifa matni yuklandi.' }));
  expect((await promise).text).toContain('Yangi sahifa matni yuklandi.');
});

test('cancels a pending page read when stopped', async () => {
  const controller = new AbortController();
  const promise = waitForReadablePage({ target: '/pages/1', getLocation: () => '/', signal: controller.signal });
  controller.abort();
  await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
});

test('recognizes typed and spoken page-reading requests across supported languages', () => {
  for (const command of ['Sahifani o‘qib ber', 'saxifani oqib ber', 'Shu matnni o\'qib bering', 'Прочитай страницу', 'Read this page aloud']) {
    expect(isReadPageCommand(command)).toBe(true);
  }
  expect(isReadPageCommand('Qabul qachon boshlanadi?')).toBe(false);
  expect(pageReadingAnswer({ text: 'Sahifadagi matn.' })).toBe('Sahifadagi matn.');
  expect(pageReadingAnswer({ text: '' })).toContain('matn topilmadi');
});

test('includes text from every home page content section without repeating nested blocks', () => {
  document.body.innerHTML = '<div class="app-content-shell"><h2>Yangiliklar</h2><p>Birinchi xabar.</p></div><div class="app-content-shell"><p>Ikkinchi xabar.</p></div>';
  expect(readCurrentPage().text).toBe('Yangiliklar\n\nBirinchi xabar.\n\nIkkinchi xabar.');
});
