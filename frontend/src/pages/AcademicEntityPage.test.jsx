import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import AcademicEntityPage from './AcademicEntityPage';
import { useContentItem } from '../hooks/useContentItem';
import { useContentList } from '../hooks/useContentList';

let mockLocation;
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useParams: () => ({ facultyId: '75', departmentId: '75-dd-1' }),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
}), { virtual: true });
jest.mock('../components/layout/AcademicSidebar', () => () => <aside />);
jest.mock('../components/common/AppLink', () => ({ href, children, ...props }) => (
  <a href={href} {...props}>{children}</a>
));
jest.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguageCode: 'uz' })
}));
jest.mock('../hooks/useContentItem', () => ({ useContentItem: jest.fn() }));
jest.mock('../hooks/useContentList', () => ({ useContentList: jest.fn() }));

const facultyTitle = 'Jismoniy va yuridik shaxslarning murojaatlari bilan ishlash, nazorat va monitoring bo‘limi';
const departmentTitle = 'Ilmiy-tadqiqotlar, innovatsiyalar va ilmiy-pedagogik kadrlarni tayyorlash bo‘limi';
const directions = [
  { id: 'two', order: 2, uz: { title: 'Axborot tizimlari', content: '<p>Axborot tizimlari haqida ma’lumot</p>' } },
  { id: 'one', order: 1, uz: { title: 'Dasturiy injiniring', content: '<p>Dasturiy injiniring haqida ma’lumot</p>' } }
];
let currentDirections;
let currentMenus;
let directionsLoading;

beforeEach(() => {
  currentDirections = directions;
  currentMenus = [];
  directionsLoading = false;
  mockNavigate.mockClear();
  mockLocation = { pathname: '/departments/75/75-dd-1', search: '', hash: '#attached-directions' };
  useContentItem.mockReturnValue({ loading: false, item: {
    id: '75', uz: { title: facultyTitle },
    departments: [{ id: '75-dd-1', uz: { title: departmentTitle } }]
  } });
  useContentList.mockImplementation((resource) => ({
    loading: resource === 'directions' ? directionsLoading : false,
    items: resource === 'directions' ? currentDirections : resource === 'faculty-page-menus' ? currentMenus : []
  }));
});

test('yo‘nalishlar tartib bilan chiqadi, tanlanganda qolganlari yashirinadi va qaytish mumkin', () => {
  render(<AcademicEntityPage pageType="department" />);

  const list = screen.getByRole('group', { name: "Yo'nalishlar" });
  expect(within(list).getAllByRole('button').map((button) => button.title)).toEqual([
    'Dasturiy injiniring', 'Axborot tizimlari'
  ]);
  expect(screen.queryByText('Dasturiy injiniring haqida ma’lumot')).toBeNull();

  fireEvent.click(within(list).getByRole('button', { name: /Dasturiy injiniring/ }));
  expect(screen.queryByRole('group', { name: "Yo'nalishlar" })).toBeNull();
  expect(screen.queryByText('Axborot tizimlari')).toBeNull();
  expect(screen.getByText('Dasturiy injiniring haqida ma’lumot')).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Dasturiy injiniring' }));

  fireEvent.click(screen.getByRole('button', { name: 'Barcha yo‘nalishlar' }));
  expect(screen.queryByText('Dasturiy injiniring haqida ma’lumot')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Axborot tizimlari/ }));
  expect(screen.getByText('Axborot tizimlari haqida ma’lumot')).toBeTruthy();
  expect(screen.queryByText('Dasturiy injiniring')).toBeNull();
});

test('bitta yo‘nalish ham tanlanadi, havola tafsilotlar ichida saqlanadi', () => {
  currentDirections = [{ id: 'only', uz: { title: 'Yagona yo‘nalish' }, link: 'https://example.com/program' }];
  render(<AcademicEntityPage pageType="department" />);

  fireEvent.click(screen.getByRole('button', { name: /Yagona yo‘nalish/ }));
  expect(screen.getByRole('heading', { name: 'Yagona yo‘nalish' })).toBeTruthy();
  expect(screen.getByText("Bu yo'nalish uchun batafsil ma'lumot hali joylanmagan.")).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Havolani ochish' }).getAttribute('href')).toBe('https://example.com/program');
});

test('tanlangan yo‘nalish CMS ro‘yxatidan o‘chirilsa ro‘yxatga qaytadi', () => {
  const { rerender } = render(<AcademicEntityPage pageType="department" />);
  fireEvent.click(screen.getByRole('button', { name: /Dasturiy injiniring/ }));
  currentDirections = [directions[0]];
  rerender(<AcademicEntityPage pageType="department" />);

  expect(screen.queryByText('Dasturiy injiniring haqida ma’lumot')).toBeNull();
  expect(screen.getByRole('button', { name: /Axborot tizimlari/ })).toBeTruthy();
});

test('uzun navigatsiya nomlari to‘liq saqlanadi va ortiqcha ma’lumotlar bosqichi chiqmaydi', () => {
  render(<AcademicEntityPage pageType="department" />);
  const breadcrumb = screen.getByRole('navigation', { name: 'Sahifa navigatsiyasi' });

  expect(within(breadcrumb).getAllByRole('listitem')).toHaveLength(4);
  expect(within(breadcrumb).getByRole('link', { name: facultyTitle }).title).toBe(facultyTitle);
  expect(within(breadcrumb).getByRole('button', { name: departmentTitle }).title).toBe(departmentTitle);
  expect(within(breadcrumb).queryByText('Ma’lumotlar')).toBeNull();
  expect(within(breadcrumb).getByText("Yo'nalishlar").getAttribute('aria-current')).toBe('page');
});

test('yo‘nalish logosi ro‘yxatda ham, tanlangan yo‘nalish tafsilotlarida ham chiqadi', () => {
  currentDirections = [{ ...directions[1], image: '/program-logo.webp' }, directions[0]];
  render(<AcademicEntityPage pageType="department" />);
  const directionButton = screen.getByRole('button', { name: /Dasturiy injiniring/ });
  expect(directionButton.querySelector('img').getAttribute('src')).toBe('/program-logo.webp');
  expect(screen.getByRole('button', { name: /Axborot tizimlari/ }).querySelector('img')).toBeNull();

  fireEvent.click(directionButton);
  expect(screen.getByRole('region', { name: 'Dasturiy injiniring' }).querySelector('img').getAttribute('src')).toBe('/program-logo.webp');

  fireEvent.click(screen.getByRole('button', { name: 'Barcha yo‘nalishlar' }));
  expect(screen.getByRole('button', { name: /Dasturiy injiniring/ }).querySelector('img')).toBeTruthy();
});

test('logo yuklanmasa standart belgi chiqadi va yo‘nalish ochilaveradi', () => {
  currentDirections = [{ ...directions[1], imageUrl: '/missing-logo.png' }];
  render(<AcademicEntityPage pageType="department" />);
  const directionButton = screen.getByRole('button', { name: /Dasturiy injiniring/ });
  fireEvent.error(directionButton.querySelector('img'));
  expect(directionButton.querySelector('img')).toBeNull();
  expect(directionButton.querySelector('.academic-direction-item-icon svg')).toBeTruthy();

  fireEvent.click(directionButton);
  expect(screen.getByText('Dasturiy injiniring haqida ma’lumot')).toBeTruthy();
});

test('admin havolasi aynan kerakli yo‘nalish tafsilotlarini ochadi', () => {
  mockLocation.search = '?direction=two';
  render(<AcademicEntityPage pageType="department" />);

  expect(screen.getByRole('heading', { name: 'Axborot tizimlari' })).toBeTruthy();
  expect(screen.getByText('Axborot tizimlari haqida ma’lumot')).toBeTruthy();
  expect(screen.queryByRole('group', { name: "Yo'nalishlar" })).toBeNull();
  expect(screen.queryByText('Dasturiy injiniring')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Barcha yo‘nalishlar' }));
  expect(screen.getByRole('group', { name: "Yo'nalishlar" })).toBeTruthy();
  expect(mockNavigate).toHaveBeenLastCalledWith({
    pathname: mockLocation.pathname, search: '', hash: '#attached-directions'
  }, { preventScrollReset: true });
});

test('yo‘nalish tanlanganda havola yangilanadi va boshqa query parametrlari saqlanadi', () => {
  mockLocation.search = '?lang=uz';
  render(<AcademicEntityPage pageType="department" />);
  fireEvent.click(screen.getByRole('button', { name: /Dasturiy injiniring/ }));

  expect(mockNavigate).toHaveBeenLastCalledWith({
    pathname: mockLocation.pathname, search: '?lang=uz&direction=one', hash: '#attached-directions'
  }, { preventScrollReset: true });
});

test('CMS yuklanishini kutib, maxsus nomli yo‘nalish panelini ham havoladan ochadi', () => {
  mockLocation.search = '?direction=two';
  directionsLoading = true;
  currentDirections = [];
  const { rerender } = render(<AcademicEntityPage pageType="department" />);

  directionsLoading = false;
  currentDirections = directions;
  currentMenus = [{
    id: 'menu-one', pageType: 'department', facultyId: '75', departmentId: '75-dd-1',
    sectionKey: 'yonalishlar', uz: { title: 'Ta’lim yo‘nalishlari' }
  }];
  rerender(<AcademicEntityPage pageType="department" />);

  expect(screen.getByRole('heading', { name: 'Axborot tizimlari' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Ta’lim yo‘nalishlari' })).toBeTruthy();
});

test('brauzer navigatsiyasida yo‘nalish almashadi, noto‘g‘ri ID esa ro‘yxatni ochadi', () => {
  mockLocation.search = '?direction=one';
  const { rerender } = render(<AcademicEntityPage pageType="department" />);
  expect(screen.getByRole('heading', { name: 'Dasturiy injiniring' })).toBeTruthy();

  mockLocation = { ...mockLocation, search: '?direction=two' };
  rerender(<AcademicEntityPage pageType="department" />);
  expect(screen.getByRole('heading', { name: 'Axborot tizimlari' })).toBeTruthy();

  mockLocation = { ...mockLocation, search: '?direction=missing' };
  rerender(<AcademicEntityPage pageType="department" />);
  expect(screen.getByRole('group', { name: "Yo'nalishlar" })).toBeTruthy();
  expect(screen.queryByText('Axborot tizimlari haqida ma’lumot')).toBeNull();
});

test('keshdagi bo‘sh ro‘yxat yangilanganda havoladagi yo‘nalish ochiladi', () => {
  mockLocation.search = '?direction=two';
  currentDirections = [];
  const { rerender } = render(<AcademicEntityPage pageType="department" />);

  currentDirections = directions;
  rerender(<AcademicEntityPage pageType="department" />);
  expect(screen.getByRole('heading', { name: 'Axborot tizimlari' })).toBeTruthy();
});

test('CMS panelining kaliti ham attached-directions bo‘lsa qaytish havolasi saqlanadi', () => {
  currentMenus = [{
    id: 'menu-one', pageType: 'department', facultyId: '75', departmentId: '75-dd-1',
    sectionKey: 'attached-directions', uz: { title: 'Ta’lim yo‘nalishlari' }
  }];
  render(<AcademicEntityPage pageType="department" />);
  expect(screen.getByRole('group', { name: "Yo'nalishlar" })).toBeTruthy();
  expect(mockNavigate).not.toHaveBeenCalled();
});
