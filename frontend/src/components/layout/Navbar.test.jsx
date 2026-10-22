import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Navbar from './Navbar';
import { useMenuTree } from '../../hooks/useMenuTree';

jest.mock('../../hooks/useMenuTree', () => ({ useMenuTree: jest.fn() }));
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguageCode: 'uz', currentLanguage: { code: 'uz', label: 'UZ' },
    languageOptions: [{ code: 'uz', label: 'UZ', name: 'O‘zbekcha' }], setLanguage: jest.fn()
  })
}));
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/', hash: '' }),
  matchPath: () => null,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
}), { virtual: true });

const menus = [{ id: 1, uz: { title: 'Universitet haqida' }, children: [
  { id: 2, uz: { title: 'Rektor' }, url: '/rector' }
] }];
let viewportWidth;
let availableWidth;
let observers;

beforeEach(() => {
  jest.useFakeTimers();
  viewportWidth = 1200;
  availableWidth = 700;
  observers = new Set();
  window.matchMedia = jest.fn(() => ({ matches: viewportWidth <= 768 }));
  global.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observers.add(this); }
    observe() {}
    disconnect() { observers.delete(this); }
  };
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () {
    return this.closest('.fstu-header--measure') && this.classList.contains('nav-menu') ? availableWidth : 0;
  });
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    // Model the natural widths of translated menu labels, independent of the active layout.
    const width = this.classList.contains('nav-item') ? this.textContent.length * 8 + 24 : availableWidth;
    return { width, height: 108, top: 0, left: 0, right: width, bottom: 108 };
  });
  useMenuTree.mockReturnValue({ menus, loading: false });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
  delete global.ResizeObserver;
});

function resize() {
  act(() => {
    window.dispatchEvent(new Event('resize'));
    [...observers].forEach(observer => observer.callback());
  });
}

test('long labels switch a wide screen to a working hamburger menu', () => {
  const title = 'Universitetning juda uzun menyusi '.repeat(5);
  useMenuTree.mockReturnValue({ menus: [{ ...menus[0], uz: { title } }], loading: false });
  const { container } = render(<Navbar />);
  expect(container.querySelector('header').classList.contains('fstu-header--mobile')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
  expect(screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(container.querySelector('header .nav-link'));
  expect(container.querySelector('header .nav-item').classList.contains('submenu-open')).toBe(true);
  expect(container.querySelector('.stripe-dropdown-shell')).toBeNull();
});

test('resizing switches both ways and closes menus from the previous layout', () => {
  const { container } = render(<Navbar />);
  const header = container.querySelector('header');
  expect(header.classList.contains('fstu-header--mobile')).toBe(false);
  fireEvent.click(container.querySelector('header .nav-link'));
  expect(container.querySelector('.stripe-dropdown-shell')).not.toBeNull();

  availableWidth = 100;
  resize();
  expect(header.classList.contains('fstu-header--mobile')).toBe(true);
  expect(container.querySelector('.stripe-dropdown-shell')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

  availableWidth = 900;
  resize();
  expect(header.classList.contains('fstu-header--mobile')).toBe(false);
  expect(screen.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded')).toBe('false');
  resize();
  expect(header.classList.contains('fstu-header--mobile')).toBe(false);
});

test('adding CMS menus recalculates the layout without resizing the window', () => {
  const view = render(<Navbar />);
  const header = view.container.querySelector('header');
  expect(header.classList.contains('fstu-header--mobile')).toBe(false);
  useMenuTree.mockReturnValue({
    menus: Array.from({ length: 6 }, (_, index) => ({ ...menus[0], id: index + 10 })), loading: false
  });
  view.rerender(<Navbar />);
  expect(header.classList.contains('fstu-header--mobile')).toBe(true);
  useMenuTree.mockReturnValue({ menus, loading: false });
  view.rerender(<Navbar />);
  expect(header.classList.contains('fstu-header--mobile')).toBe(false);
});

test('phone widths use the mobile menu even when the labels fit', () => {
  viewportWidth = 600;
  availableWidth = 1000;
  const { container } = render(<Navbar />);
  expect(container.querySelector('header').classList.contains('fstu-header--mobile')).toBe(true);
});
