import React from 'react';
import { render, screen } from '@testing-library/react';
import InnerPageBanner from './InnerPageBanner';
import { useContentItem } from '../../hooks/useContentItem';
import { useMenuTree } from '../../hooks/useMenuTree';
import { useSetting } from '../../hooks/useSetting';
import { syncCurrentLanguageCode } from '../../utils/language';

let mockPathname;
let mockLanguage;
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
  matchPath: (pattern, pathname) => {
    const names = [];
    const expression = pattern.replace(/:([^/]+)/g, (_, name) => {
      names.push(name);
      return '([^/]+)';
    });
    const match = pathname.match(new RegExp(`^${expression}/*$`));
    return match ? { params: Object.fromEntries(names.map((name, i) => [name, match[i + 1]])) } : null;
  }
}), { virtual: true });
jest.mock('../common/AppLink', () => ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>);
jest.mock('../../context/LanguageContext', () => ({ useLanguage: () => ({ currentLanguageCode: mockLanguage }) }));
jest.mock('../../hooks/useContentItem', () => ({ useContentItem: jest.fn() }));
jest.mock('../../hooks/useContentList', () => ({ useContentList: () => ({ items: [] }) }));
jest.mock('../../hooks/useMenuTree', () => ({ useMenuTree: jest.fn() }));
jest.mock('../../hooks/useSetting', () => ({ useSetting: jest.fn() }));
jest.mock('../../hooks/useEmployeePortfolioBySlug', () => ({ useEmployeePortfolioBySlug: () => ({ item: null }) }));

beforeEach(() => {
  mockPathname = '/news';
  mockLanguage = 'uz';
  syncCurrentLanguageCode('uz');
  useContentItem.mockReturnValue({ item: null });
  useMenuTree.mockReturnValue({ menus: [] });
  useSetting.mockReturnValue({ item: null });
});

test.each([
  ['/news', 'Barcha yangiliklar'], ['/announcements', 'Barcha e’lonlar'],
  ['/faculties', 'Barcha fakultetlar'], ['/departments', 'Fakultetlar va kafedralar'],
  ['/sections', 'Barcha bo‘limlar'], ['/students', 'Bizning talabalarimiz'],
  ['/journals', 'Ilmiy jurnal sonlari'], ['/leadership', 'Rahbariyat']
])('%s shows its page title', (pathname, title) => {
  mockPathname = pathname;
  render(<InnerPageBanner />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(title);
});

test('student profile uses the full name and changes language', () => {
  mockPathname = '/students/9';
  useContentItem.mockImplementation((resource) => ({ item: resource === 'students'
    ? { uz: { fullName: 'Ali Valiyev' }, en: { fullName: 'Ali Valiev' } } : null }));
  const { rerender } = render(<InnerPageBanner />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Ali Valiyev');
  mockLanguage = 'en';
  syncCurrentLanguageCode('en');
  rerender(<InnerPageBanner />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Ali Valiev');
});

test('academic menu uses the same tree as the menu content page', () => {
  mockPathname = '/menu/8';
  useMenuTree.mockImplementation((resource) => ({ menus: resource === 'academic-menus'
    ? [{ id: 8, uz: { title: 'Ilmiy faoliyat' } }] : [] }));
  render(<InnerPageBanner />);
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Ilmiy faoliyat');
});

test('unrelated pages do not load admission settings', () => {
  render(<InnerPageBanner />);
  expect(useSetting).toHaveBeenCalledWith('admission-cta', { enabled: false });
});
