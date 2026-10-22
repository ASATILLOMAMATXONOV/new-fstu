import { getCachedContentList, getCachedContentTree } from '../../api/cms';
import { resolvePageCommand } from './pageCommands';

jest.mock('../../api/cms', () => ({ getCachedContentList: jest.fn(), getCachedContentTree: jest.fn() }));
beforeEach(() => { getCachedContentList.mockReturnValue(null); getCachedContentTree.mockReturnValue(null); });
afterEach(() => { document.body.innerHTML = ''; });

test.each([
  ['Bosh sahifani och', '/'], ['E’lonlar sahifasini oching', '/announcements'],
  ['Talabalar bo‘limini och', '/students'], ['Kafedralarni och', '/departments'],
  ['Hamkorlar sahifasiga o‘t', '/partners'], ['Qabulni ochib ber', '/admission'],
  ['Fakultetlarni ko‘rsat', '/faculties'], ['Bo‘limlarni och', '/sections'],
  ['Qabul sahifasiga kir', '/admission'], ['Yangiliklar saxifasiga kirib ber', '/news'],
  ['Iltimos, qabul sahifasiga kirib bera olasanmi?', '/admission'],
  ['Talabalar sahifasiga o‘tib ber', '/students'], ['Meni hamkorlar sahifasiga olib bor', '/partners'],
  ['Bosh sahifaga qaytib ber', '/'],
  ['Yangiliklar', '/news'], ['Go to the admissions page', '/admission'],
  ['Перейди на страницу новости', '/news']
])('opens the frontend page requested by %s', (command, path) => {
  expect(resolvePageCommand(command)).toMatchObject({ type: 'navigate', path, read: false });
});

test('opens named sections and translated menu titles using their actual site routes', () => {
  getCachedContentList.mockImplementation((resource, query = {}) => resource === 'faculties' && query.entityType === 'section'
    ? [{ id: 18, uz: { title: 'Xalqaro aloqalar' } }] : null);
  getCachedContentTree.mockImplementation(resource => resource === 'menus'
    ? [{ id: 42, uz: { title: 'Universitet tarixi' }, en: { title: 'University history' }, children: [] }] : null);
  expect(resolvePageCommand('Xalqaro aloqalar sahifasiga kirib ber')).toMatchObject({ path: '/sections/18' });
  expect(resolvePageCommand('Universitet tarixi sahifasiga kir', { language: 'en' })).toMatchObject({ path: '/menu/42', title: 'University history' });
});

test('finds a named CMS menu or faculty instead of opening a general category', () => {
  getCachedContentTree.mockImplementation(resource => resource === 'menus' ? [{ id: 42, active: true, uz: { title: 'Universitet tarixi' }, children: [] }] : null);
  getCachedContentList.mockImplementation(resource => resource === 'faculties' ? [{ id: 7, uz: { title: 'Energetika fakulteti' } }] : null);
  expect(resolvePageCommand('Universitet tarixi sahifasini och')).toMatchObject({ path: '/menu/42' });
  expect(resolvePageCommand('Energetika fakultetini ochib, matnlarini o‘qib ber')).toMatchObject({ path: '/faculties/7', read: true });
});

test('uses a card title to open the corresponding article and ignores external links', () => {
  document.body.innerHTML = '<main><article><h3>Yangi ilmiy laboratoriya</h3><a href="/news/page/12">Batafsil</a></article><a href="https://outside.example/news">Tashqi yangiliklar</a></main>';
  expect(resolvePageCommand('Yangi ilmiy laboratoriya sahifasini och')).toMatchObject({ path: '/news/page/12' });
  expect(resolvePageCommand('Tashqi yangiliklarni och')).toEqual({ type: 'missing' });
});

test('supports reading frontend text and combined navigation and reading commands', () => {
  for (const value of ['Frontenddagi matinlarni oqib ebr', 'Matnlarni o‘qib ber', 'Shu yerdagi matnlarni o‘qib ber', 'O‘qib ber']) {
    expect(resolvePageCommand(value)).toEqual({ type: 'read' });
  }
  expect(resolvePageCommand('Qabul sahifasini och va o‘qib ber')).toMatchObject({ path: '/admission', read: true });
  expect(resolvePageCommand('Qabul sahifasini o‘qib ber')).toMatchObject({ path: '/admission', read: true });
  expect(resolvePageCommand('Qabul qachon boshlanadi?')).toBeNull();
  expect(resolvePageCommand('HEMISga kirish uchun nima qilish kerak?')).toBeNull();
  expect(resolvePageCommand('Qabul sahifasini ochma')).toBeNull();
  expect(resolvePageCommand('Qabul sahifasiga kirma')).toBeNull();
  expect(resolvePageCommand('Yangiliklarga o‘tma')).toBeNull();
  expect(resolvePageCommand('Yangiliklar sahifasiga qanday kirish mumkin?')).toBeNull();
  expect(resolvePageCommand('Savolim bor')).toBeNull();
  expect(resolvePageCommand('Meni noma’lum sahifaga olib bor')).toEqual({ type: 'missing' });
  expect(resolvePageCommand('Noma’lum sahifani och')).toEqual({ type: 'missing' });
});
