import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import ThemeColorSwitcher from './ThemeColorSwitcher';
import { useSetting } from '../../hooks/useSetting';

jest.mock('../../hooks/useSetting', () => ({ useSetting: jest.fn() }));

const themeProperty = (name) => document.documentElement.style.getPropertyValue(name);

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('style');
  delete document.documentElement.dataset.themeColor;
  useSetting.mockReturnValue({ item: null });
});

afterEach(() => jest.restoreAllMocks());

test('rang bosilganda asosiy rang, sarlavha, fon, chegara va RGB effektlari birga almashadi', () => {
  render(<ThemeColorSwitcher />);
  const previousBorder = themeProperty('--surface-border');
  fireEvent.click(screen.getByRole('button', { name: 'Yashil' }));

  expect(document.documentElement.dataset.themeColor).toBe('green');
  expect(themeProperty('--brand-primary')).toBe('#079447');
  expect(themeProperty('--brand-primary-dark')).toBe('#047a3a');
  expect(themeProperty('--heading-color')).toBe('#052e16');
  expect(themeProperty('--theme-primary-rgb')).toBe('7, 148, 71');
  expect(themeProperty('--theme-soft-rgb')).toBe('220, 252, 231');
  expect(themeProperty('--theme-muted-rgb')).toBe('240, 253, 244');
  expect(themeProperty('--surface-border')).not.toBe(previousBorder);
  expect(themeProperty('--page-bg-end')).toBe('#f0fdf4');
  expect(screen.getByRole('button', { name: 'Yashil' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button', { name: "Ko'k" }).getAttribute('aria-pressed')).toBe('false');
});

test('tanlangan rang sahifa qayta ochilganda ham saqlanadi', () => {
  const { unmount } = render(<ThemeColorSwitcher />);
  fireEvent.click(screen.getByRole('button', { name: 'Moviy yashil' }));
  expect(window.localStorage.getItem('fstu-theme-color')).toBe('teal');

  unmount();
  render(<ThemeColorSwitcher />);
  expect(themeProperty('--brand-primary')).toBe('#14b8a6');
  expect(themeProperty('--heading-color')).toBe('#013f3a');
});

test('CMSda faqat asosiy rang kiritilsa ham unga mos butun palitra hosil bo‘ladi', () => {
  useSetting.mockReturnValue({ item: {
    data: { themes: [{ id: 'violet', label: 'Binafsha', primary: '#a855f7' }], defaultTheme: 'violet' }
  } });
  render(<ThemeColorSwitcher />);

  expect(themeProperty('--brand-primary')).toBe('#a855f7');
  expect(themeProperty('--theme-primary-rgb')).toBe('168, 85, 247');
  expect(themeProperty('--brand-primary-dark')).not.toBe('#1d4ed8');
  expect(themeProperty('--brand-primary-deep')).not.toBe('#172554');
  expect(themeProperty('--brand-primary-soft')).not.toBe('#dbeafe');
  expect(themeProperty('--brand-primary-muted')).not.toBe('#eff6ff');
});

test('CMS qayta yuklanganda foydalanuvchi tanlagan rang o‘zgarmaydi', () => {
  const { rerender } = render(<ThemeColorSwitcher />);
  fireEvent.click(screen.getByRole('button', { name: 'Yashil' }));
  useSetting.mockReturnValue({ item: { defaultTheme: 'blue' } });
  rerender(<ThemeColorSwitcher />);

  expect(themeProperty('--brand-primary')).toBe('#079447');
});

test('brauzer saqlashga ruxsat bermasa ham rang tanlash ishlaydi', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
  const { rerender } = render(<ThemeColorSwitcher />);
  fireEvent.click(screen.getByRole('button', { name: 'Yashil' }));
  useSetting.mockReturnValue({ item: { defaultTheme: 'blue' } });
  rerender(<ThemeColorSwitcher />);

  expect(document.documentElement.dataset.themeColor).toBe('green');
  expect(themeProperty('--brand-primary')).toBe('#079447');
});
