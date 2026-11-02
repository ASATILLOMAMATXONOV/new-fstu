import React from 'react';
import { render, screen } from '@testing-library/react';

import LaboratoryDetailPage from './LaboratoryDetailPage';
import { useContentItem } from '../hooks/useContentItem';

jest.mock(
  'react-router-dom',
  () => ({
    useParams: () => ({ id: '7' }),
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    )
  }),
  { virtual: true }
);
jest.mock('../components/layout/AcademicSidebar', () => () => <div>Academic sidebar</div>);
jest.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguageCode: 'uz' })
}));
jest.mock('../hooks/useContentItem', () => ({ useContentItem: jest.fn() }));

test('laboratoriya panellarini tartib bilan chiqarib, nofaolini yashiradi', () => {
  useContentItem.mockReturnValue({
    loading: false,
    item: {
      id: 7,
      image: '/laboratory.jpg',
      active: true,
      uz: {
        title: 'Robototexnika laboratoriyasi',
        direction: 'Muhandislik',
        location: 'B bino',
        manager: 'A. Karimov'
      },
      panels: [
        { id: 'second', order: 2, active: true, uz: { title: 'Uskunalar', content: '<p>Robot qo‘llari</p>' } },
        { id: 'hidden', order: 3, active: false, uz: { title: 'Yashirin panel', content: '<p>Yashirin</p>' } },
        { id: 'first', order: 1, active: true, uz: { title: 'Laboratoriya haqida', content: '<p>Asosiy ma’lumot</p>' } }
      ]
    }
  });

  render(<LaboratoryDetailPage />);

  expect(useContentItem).toHaveBeenCalledWith('laboratories', '7');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Robototexnika laboratoriyasi');
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
    'Laboratoriya haqida',
    'Uskunalar'
  ]);
  expect(screen.getByText('Asosiy ma’lumot')).toBeTruthy();
  expect(screen.queryByText('Yashirin panel')).toBeNull();
});
