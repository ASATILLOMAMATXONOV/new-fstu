import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import LeadershipPage from './LeadershipPage';
import { useContentList } from '../../hooks/useContentList';

let mockLanguage = 'uz';
jest.mock('../../context/LanguageContext', () => ({ useLanguage: () => ({ currentLanguageCode: mockLanguage }) }));
jest.mock('../../hooks/useContentList', () => ({ useContentList: jest.fn() }));
jest.mock('../../components/layout/AcademicSidebar', () => () => <div>Sidebar</div>);

const person = {
  id: 4, order: 2, active: true, image: '/portrait.jpg', email: 'rahbar@fstu.uz', phone: '+998 73 000 00 00',
  uz: { firstName: 'Ali', lastName: 'Valiyev', position: 'Prorektor', receptionTime: 'Qabul vaqti: Dushanba 14:00–16:00' },
  en: { fullName: 'Ali Valiev', position: 'Vice Rector', receptionTime: 'Monday 14:00–16:00' },
  socialLinks: { telegram: '@rahbar', linkedin: 'https://linkedin.com/in/rahbar', website: 'javascript:alert(1)' },
  sections: [{ id: 'bio', uz: { title: 'Tarjimai hol', content: '<p>To‘liq tarjimai hol.</p><script>alert(1)</script>' }, en: { title: 'Biography', content: '<p>Full biography.</p>' } }]
};

beforeEach(() => {
  mockLanguage = 'uz';
  useContentList.mockReturnValue({ items: [person], loading: false });
});

test('renders contacts and safe social links without opening details', () => {
  render(<LeadershipPage />);
  expect(screen.getByRole('heading', { name: 'Ali Valiyev' })).toBeTruthy();
  expect(screen.getByText('Dushanba 14:00–16:00')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'rahbar@fstu.uz' }).getAttribute('href')).toBe('mailto:rahbar@fstu.uz');
  expect(screen.getByRole('link', { name: 'Telegram' }).getAttribute('href')).toBe('https://t.me/rahbar');
  expect(screen.queryByRole('link', { name: 'Website' })).toBeNull();
  const toggle = screen.getByRole('button', { name: /Batafsil/ });
  fireEvent.click(screen.getByRole('link', { name: 'Telegram' }));
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(useContentList).toHaveBeenCalledWith('leadership', { activeOnly: true, summaryOnly: false });
});

test('opens and closes optional text below the card and sanitizes rich text', () => {
  const { container } = render(<LeadershipPage />);
  const toggle = screen.getByRole('button', { name: /Batafsil/ });
  expect(screen.queryByRole('region')).toBeNull();
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('region').id).toBe(toggle.getAttribute('aria-controls'));
  expect(screen.getByRole('heading', { name: 'Tarjimai hol' })).toBeTruthy();
  expect(container.querySelector('script')).toBeNull();
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByRole('region')).toBeNull();
});

test('uses translated identity and optional content after a language change', () => {
  const { rerender } = render(<LeadershipPage />);
  fireEvent.click(screen.getByRole('button', { name: /Batafsil/ }));
  mockLanguage = 'en';
  rerender(<LeadershipPage />);
  expect(screen.getByRole('heading', { name: 'Ali Valiev' })).toBeTruthy();
  expect(screen.getByText('Vice Rector')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Biography' })).toBeTruthy();
  expect(screen.getByText('Full biography.')).toBeTruthy();
});

test('sorts active leaders and omits disclosure for empty optional text', () => {
  useContentList.mockReturnValue({ items: [person,
    { id: 5, order: 1, fullName: 'Birinchi rahbar', sections: [{ content: '<p>&nbsp;</p>' }] },
    { id: 6, order: 0, fullName: 'Yashirin rahbar', active: false }
  ], loading: false });
  render(<LeadershipPage />);
  expect(screen.getAllByRole('heading', { level: 2 }).map((element) => element.textContent)).toEqual(['Birinchi rahbar', 'Ali Valiyev']);
  expect(screen.getAllByRole('button')).toHaveLength(1);
});

test('shows loading and empty states', () => {
  useContentList.mockReturnValue({ items: [], loading: true });
  const { container, rerender } = render(<LeadershipPage />);
  expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  useContentList.mockReturnValue({ items: [], loading: false });
  rerender(<LeadershipPage />);
  expect(screen.getByText('Ma’muriyat ma’lumotlari hozircha mavjud emas')).toBeTruthy();
});
