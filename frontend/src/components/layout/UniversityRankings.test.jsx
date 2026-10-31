import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import UniversityRankings from './UniversityRankings';
import { useSetting } from '../../hooks/useSetting';

jest.mock('../../hooks/useSetting', () => ({ useSetting: jest.fn() }));

beforeEach(() => {
  window.matchMedia = jest.fn(() => ({ matches: true }));
  useSetting.mockReturnValue({ item: null, currentLanguageCode: 'uz' });
});

const savedSetting = {
  title: { uz: 'Bizning', en: 'Our' },
  titleAccent: { uz: 'reytinglar', en: 'rankings' },
  description: { uz: 'Yangi bo‘lim matni', en: 'Updated description' },
  heroTitle: { uz: 'Universitet yutuqlari' },
  heroTitleAccent: { uz: 'Xalqaro natijalar' },
  heroDescription: { uz: 'Chapdagi yangi matn' },
  rankings: [
    { id: 'qs', title: { uz: 'QS reytingi', en: 'QS ranking' }, result: { uz: 'TOP 50' }, image: '/logo.png', sourceUrl: 'https://example.com/ranking' },
    { id: 'local', title: { uz: 'Milliy reyting' }, result: { uz: 'TOP 3' }, image: '', sourceUrl: '/rankings/national' },
    { id: 'hidden', title: { uz: 'Yashirin reyting' }, result: { uz: 'TOP 10' }, active: false }
  ]
};

test('shows saved headings, text, logos and full-card external and internal links', () => {
  useSetting.mockReturnValue({ item: savedSetting, currentLanguageCode: 'uz' });
  const { container } = render(<UniversityRankings />);
  expect(useSetting).toHaveBeenCalledWith('university-rankings');
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Bizning reytinglar');
  expect(screen.getByText('Yangi bo‘lim matni')).toBeTruthy();
  expect(screen.getByText('Chapdagi yangi matn')).toBeTruthy();
  expect(screen.getByText('Xalqaro natijalar')).toBeTruthy();
  const external = screen.getByRole('link', { name: 'QS reytingi: TOP 50' });
  expect(external.getAttribute('href')).toBe('https://example.com/ranking');
  expect(external.getAttribute('target')).toBe('_blank');
  expect(external.querySelector('img').getAttribute('src')).toBe('/logo.png');
  expect(external.querySelector('.pr-card-info')).toBeTruthy();
  const internal = screen.getByRole('link', { name: 'Milliy reyting: TOP 3' });
  expect(internal.getAttribute('href')).toBe('/rankings/national');
  expect(internal.hasAttribute('target')).toBe(false);
  expect(screen.queryByText('Yashirin reyting')).toBeNull();
  expect(container.querySelectorAll('.pr-card').length).toBe(2);
  fireEvent.error(external.querySelector('img'));
  expect(external.querySelector('.pr-logo-fallback').textContent).toBe('QR');
});

test('changes language and uses Uzbek fallback for missing translations', () => {
  useSetting.mockReturnValue({ item: savedSetting, currentLanguageCode: 'uz' });
  const view = render(<UniversityRankings />);
  useSetting.mockReturnValue({ item: savedSetting, currentLanguageCode: 'en' });
  view.rerender(<UniversityRankings />);
  expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Our rankings');
  expect(screen.getByText('Updated description')).toBeTruthy();
  expect(screen.getByText('Chapdagi yangi matn')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'QS ranking: TOP 50' })).toBeTruthy();
});

test.each([
  ['missing setting', null],
  ['empty setting', {}],
  ['section text without cards', { ...savedSetting, rankings: [] }],
  ['inactive section', { ...savedSetting, active: false }],
  ['all cards hidden', { ...savedSetting, rankings: savedSetting.rankings.map(card => ({ ...card, active: false })) }],
  ['incomplete cards', { ...savedSetting, rankings: [null, { title: { uz: 'Incomplete' } }, { result: { uz: 'TOP 5' } }] }]
])('renders no section or placeholder for %s', (_name, item) => {
  useSetting.mockReturnValue({ item, currentLanguageCode: 'uz' });
  const { container } = render(<UniversityRankings />);
  expect(container.innerHTML).toBe('');
});

test('appears when backend data arrives and disappears when cards are deleted', () => {
  useSetting.mockReturnValue({ item: null, loading: true, currentLanguageCode: 'uz' });
  const view = render(<UniversityRankings />);
  expect(view.container.innerHTML).toBe('');
  useSetting.mockReturnValue({ item: savedSetting, loading: false, currentLanguageCode: 'uz' });
  view.rerender(<UniversityRankings />);
  expect(view.container.querySelectorAll('.pr-card').length).toBe(2);
  useSetting.mockReturnValue({ item: { ...savedSetting, rankings: [] }, currentLanguageCode: 'uz' });
  view.rerender(<UniversityRankings />);
  expect(view.container.innerHTML).toBe('');
});

test('does not invent headings or text when only cards were saved', () => {
  useSetting.mockReturnValue({ item: { rankings: savedSetting.rankings }, currentLanguageCode: 'uz' });
  const { container } = render(<UniversityRankings />);
  expect(container.querySelector('.pr-header')).toBeNull();
  expect(container.querySelector('.pr-hero')).toBeNull();
  expect(container.querySelector('.pr-layout--cards-only')).toBeTruthy();
  expect(container.querySelector('section').hasAttribute('aria-labelledby')).toBe(false);
  expect(container.querySelectorAll('.pr-card').length).toBe(2);
});

test('unlinked cards and unsafe links render without navigation', () => {
  useSetting.mockReturnValue({ item: { rankings: [
    { id: 'empty', title: 'No link', result: 'TOP 1' },
    { id: 'unsafe', title: 'Unsafe link', result: 'TOP 2', sourceUrl: 'javascript:alert(1)' },
    { id: 'unsafe-data', title: 'Data link', result: 'TOP 3', sourceUrl: 'data:text/html,test' }
  ] }, currentLanguageCode: 'uz' });
  const { container } = render(<UniversityRankings />);
  expect(useSetting).toHaveBeenCalledWith('university-rankings');
  expect(screen.queryByRole('link')).toBeNull();
  expect(container.querySelectorAll('article.pr-card').length).toBe(3);
});
