import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import HomeFacultyConstellation from './HomeFacultyConstellation';
import { useSetting } from '../../hooks/useSetting';
import { useContentList } from '../../hooks/useContentList';

jest.mock('../../hooks/useSetting', () => ({ useSetting: jest.fn() }));
jest.mock('../../hooks/useContentList', () => ({ useContentList: jest.fn() }));

const facultyItems = [
  { id: 1, entityType: 'faculty', uz: { title: 'Muhandislik' }, en: { title: 'Engineering' }, departments: [
    { id: 'd1', uz: { title: 'Mexanika' }, en: { title: 'Mechanics' } },
    { id: 'd2', uz: { title: 'Yashirin kafedra' }, active: false }
  ] },
  { id: 2, entityType: 'section', uz: { title: 'Xalqaro aloqalar' }, en: { title: 'International relations' } },
  { id: 3, entityType: 'faculty', uz: { title: 'Yashirin fakultet' }, active: false },
  { id: 4, entityType: 'section', uz: { title: 'Yashirin bo‘lim' }, active: false }
];
const directionItems = [{ id: 7, facultyId: 1, departmentId: 'd1', uz: { title: 'Mashinasozlik' }, link: '/programs/mechanical' }];
const emptyItems = [];
const resourceItems = {
  news: [{ id: 21, uz: { title: 'Universitet yangiligi' } }, { id: 22, title: 'Hidden news', active: false }],
  announcements: [{ id: 31, uz: { title: 'Qabul e’loni' } }],
  students: [{ id: 41, fullName: 'Ali Valiyev' }],
  menus: [
    { id: 100, uz: { title: 'Barcha yangiliklar' }, url: '/news' },
    { id: 101, uz: { title: 'Maxsus sahifa', content: '<p>Menyudagi batafsil matn</p>' } },
    { id: 102, parentId: 101, uz: { title: 'Ichki sahifa' }, url: '/pages/15' },
    { id: 103, active: false, uz: { title: 'Yashirin menyu' } }
  ]
};
const setting = {
  title: { uz: 'Akademik tuzilma', en: 'Academic structure' },
  universityName: { uz: 'Universitet nomi' }, universitySubtitle: { uz: 'Akademik katalog' },
  logo: '/university-logo.png', image: '/university-banner.png',
  mapTitle: { uz: 'TUZILMA XARITASI' },
  menus: [
    { id: 'sections', title: { uz: 'Bo‘limlar', en: 'Sections' }, sourceType: 'section', order: 2 },
    { id: 'faculties', title: { uz: 'Fakultetlar', en: 'Faculties' }, sourceType: 'faculty', order: 1 },
    { id: 'departments', title: { uz: 'Kafedralar' }, sourceType: 'department', order: 3 },
    { id: 'directions', title: { uz: 'Yo‘nalishlar' }, sourceType: 'direction', order: 4 },
    { id: 'hidden', title: { uz: 'Yashirin menyu' }, sourceType: 'faculty', active: false }
  ]
};
const sidebar = () => screen.getByRole('region', { name: 'Akademik navigatsiya' });
const selectMenu = (name) => fireEvent.click(within(sidebar()).getByRole('button', { name: new RegExp(name) }));

beforeEach(() => {
  useSetting.mockReturnValue({ item: setting, currentLanguageCode: 'uz' });
  useContentList.mockImplementation(resource => ({ items: resource === 'faculties' ? facultyItems : resource === 'directions' ? directionItems : resourceItems[resource] || emptyItems, loading: false }));
});

test('uses configured menu order, branding and active faculties', () => {
  const { container } = render(<HomeFacultyConstellation />);
  expect(useSetting).toHaveBeenCalledWith('academic-structure');
  const buttons = within(sidebar()).getAllByRole('button');
  expect(container.querySelector('.ae-nav-number')).toBeNull();
  expect(buttons[0].textContent).toBe('Fakultetlar');
  expect(buttons.length).toBe(4);
  expect(buttons[0].textContent).toContain('Fakultetlar');
  expect(buttons[1].textContent).toContain('Bo‘limlar');
  const list = screen.getByRole('region', { name: 'Fakultetlar ro‘yxati' });
  expect(within(list).getByText('Muhandislik')).toBeTruthy();
  expect(screen.queryByText('Yashirin fakultet')).toBeNull();
  expect(container.querySelector('.ae-brand-logo img').getAttribute('src')).toBe('/university-logo.png');
  expect(container.querySelector('.ae-banner-image').getAttribute('src')).toBe('/university-banner.png');
});

test.each([
  ['news', 'Yangiliklar', 'Universitet yangiligi', '/news/page/21'],
  ['announcements', 'E’lonlar', 'Qabul e’loni', '/announcements/page/31'],
  ['students', 'Talabalar', 'Ali Valiyev', '/students/41']
])('shows linked %s data with an automatic menu name', (sourceType, title, itemTitle, href) => {
  useSetting.mockReturnValue({ item: { menus: [{ id: sourceType, sourceType }] }, currentLanguageCode: 'uz' });
  render(<HomeFacultyConstellation />);
  expect(within(sidebar()).getByRole('button', { name: title })).toBeTruthy();
  expect(screen.getByRole('link', { name: `${itemTitle} sahifasiga o‘tish` }).getAttribute('href')).toBe(href);
  expect(screen.queryByText('Hidden news')).toBeNull();
});

test('switches between news, announcements and students without stale content or search', () => {
  useSetting.mockReturnValue({ item: { menus: ['news', 'announcements', 'students'].map(sourceType => ({ id: sourceType, sourceType })) }, currentLanguageCode: 'uz' });
  render(<HomeFacultyConstellation />);
  expect(screen.getByText('Universitet yangiligi')).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not found' } });
  selectMenu('Talabalar');
  expect(screen.getByRole('searchbox').value).toBe('');
  expect(screen.getByText('Ali Valiyev')).toBeTruthy();
  expect(screen.queryByText('Universitet yangiligi')).toBeNull();
  selectMenu('E’lonlar');
  expect(screen.getByText('Qabul e’loni')).toBeTruthy();
  expect(screen.queryByText('Ali Valiyev')).toBeNull();
});

test('uses the current name and content of a linked website menu', () => {
  useSetting.mockReturnValue({ item: { menus: [{ id: 'custom', sourceType: 'menu', menuId: 101, title: { uz: 'Old title' } }] }, currentLanguageCode: 'uz' });
  render(<HomeFacultyConstellation />);
  expect(within(sidebar()).getByRole('button', { name: 'Maxsus sahifa' })).toBeTruthy();
  expect(screen.getByText('Menyudagi batafsil matn')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Ichki sahifa sahifasiga o‘tish' }).getAttribute('href')).toBe('/pages/15');
  expect(screen.queryByText('Old title')).toBeNull();
});

test('a site menu linked to news displays the news collection', () => {
  useSetting.mockReturnValue({ item: { menus: [{ id: 'linked-news', sourceType: 'menu', menuId: 100 }] }, currentLanguageCode: 'uz' });
  render(<HomeFacultyConstellation />);
  expect(within(sidebar()).getByRole('button', { name: 'Barcha yangiliklar' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Universitet yangiligi sahifasiga o‘tish' })).toBeTruthy();
});

test('clicking sections shows sections on the right with their detail links', () => {
  render(<HomeFacultyConstellation />);
  selectMenu('Bo‘limlar');
  const list = screen.getByRole('region', { name: 'Bo‘limlar ro‘yxati' });
  expect(within(list).getByRole('link', { name: 'Xalqaro aloqalar sahifasiga o‘tish' }).getAttribute('href')).toBe('/sections/2');
  expect(screen.queryByText('Muhandislik')).toBeNull();
  expect(screen.queryByText('Yashirin bo‘lim')).toBeNull();
  expect(within(sidebar()).getByRole('button', { name: /Bo‘limlar/ }).getAttribute('aria-current')).toBe('step');
  selectMenu('Fakultetlar');
  expect(screen.getByRole('region', { name: 'Fakultetlar ro‘yxati' })).toBeTruthy();
});

test('faculty drilldown opens departments, directions and existing detail pages', () => {
  render(<HomeFacultyConstellation />);
  fireEvent.click(screen.getByRole('button', { name: 'Muhandislik bo‘limini ochish' }));
  expect(screen.getByRole('region', { name: 'Kafedralar ro‘yxati' })).toBeTruthy();
  expect(screen.queryByText('Yashirin kafedra')).toBeNull();
  expect(screen.getByRole('link', { name: 'Batafsil' }).getAttribute('href')).toBe('/faculties/1');
  fireEvent.click(screen.getByRole('button', { name: 'Mexanika bo‘limini ochish' }));
  expect(screen.getByRole('region', { name: 'Ta’lim yo‘nalishlari ro‘yxati' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Mashinasozlik sahifasiga o‘tish' }).getAttribute('href')).toBe('/programs/mechanical');
  selectMenu('Bo‘limlar');
  expect(screen.getByRole('region', { name: 'Bo‘limlar ro‘yxati' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Orqaga' })).toBeNull();
});

test('direct department and direction menus work and switching clears search', () => {
  render(<HomeFacultyConstellation />);
  selectMenu('Kafedralar');
  expect(screen.getByRole('button', { name: 'Mexanika bo‘limini ochish' })).toBeTruthy();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not found' } });
  expect(screen.getByText('Hech narsa topilmadi')).toBeTruthy();
  selectMenu('Yo‘nalishlar');
  expect(screen.getByRole('searchbox').value).toBe('');
  expect(screen.getByRole('link', { name: 'Mashinasozlik sahifasiga o‘tish' })).toBeTruthy();
});

test.each([null, {}, { menus: [] }, { ...setting, active: false }])('hides unconfigured or disabled structure: %j', item => {
  useSetting.mockReturnValue({ item, currentLanguageCode: 'uz' });
  const { container } = render(<HomeFacultyConstellation />);
  expect(container.innerHTML).toBe('');
});

test('updates translated menus and linked content when language changes', () => {
  const view = render(<HomeFacultyConstellation />);
  useSetting.mockReturnValue({ item: setting, currentLanguageCode: 'en' });
  view.rerender(<HomeFacultyConstellation />);
  expect(screen.getByRole('heading', { name: 'Academic structure' })).toBeTruthy();
  expect(screen.getByText('Engineering')).toBeTruthy();
  selectMenu('Sections');
  expect(screen.getByRole('link', { name: 'International relations sahifasiga o‘tish' })).toBeTruthy();
});
