import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import LaboratoryPage from './LaboratoryPage';
import { useContentList } from '../../hooks/useContentList';

const mockNavigate = jest.fn();

jest.mock(
  'react-router-dom',
  () => ({ useNavigate: () => mockNavigate }),
  { virtual: true }
);
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguageCode: 'uz' })
}));
jest.mock('../../hooks/useContentList', () => ({ useContentList: jest.fn() }));

beforeEach(() => {
  mockNavigate.mockClear();
  window.matchMedia = jest.fn(() => ({ matches: true }));
  useContentList.mockReturnValue({
    items: [
      {
        id: 42,
        order: 1,
        active: true,
        image: '/cms-laboratory.jpg',
        uz: { title: 'CMS laboratoriyasi' },
        panels: [
          {
            id: 'about',
            order: 1,
            active: true,
            uz: { content: '<p>Zamonaviy uskunalar mavjud.</p>' }
          }
        ]
      }
    ]
  });
});

test('bosh sahifadagi CMS laboratoriyasi batafsil sahifasiga o‘tadi', () => {
  render(<LaboratoryPage />);

  fireEvent.click(screen.getByRole('button', { name: 'CMS laboratoriyasi: batafsil' }));

  expect(useContentList).toHaveBeenCalledWith('laboratories', { orderBy: 'order' });
  expect(mockNavigate).toHaveBeenCalledWith('/laboratories/42');
});

test('laboratoriya ma’lumoti bo‘lmasa bosh sahifa bo‘limini yashiradi', () => {
  useContentList.mockReturnValue({ items: [] });

  const { container } = render(<LaboratoryPage />);

  expect(container.innerHTML).toBe('');
});

test('barcha laboratoriyalarni tartib bo‘yicha chapdan o‘ngga chiqaradi', () => {
  useContentList.mockReturnValue({
    items: [
      { id: 3, order: 3, active: true, uz: { title: 'Uchinchi' } },
      { id: 1, order: 1, active: true, uz: { title: 'Birinchi' } },
      { id: 5, order: 5, active: true, uz: { title: 'Beshinchi' } },
      { id: 2, order: 2, active: true, uz: { title: 'Ikkinchi' } },
      { id: 4, order: 4, active: true, uz: { title: 'To‘rtinchi' } }
    ]
  });

  render(<LaboratoryPage />);

  expect(
    screen.getAllByRole('button', { name: /: batafsil$/ }).map((button) => button.getAttribute('aria-label'))
  ).toEqual([
    'Birinchi: batafsil',
    'Ikkinchi: batafsil',
    'Uchinchi: batafsil',
    'To‘rtinchi: batafsil',
    'Beshinchi: batafsil'
  ]);
});
