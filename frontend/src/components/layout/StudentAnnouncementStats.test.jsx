import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AnnouncementsSection from './StudentAnnouncementStats';
import { useContentList } from '../../hooks/useContentList';

jest.mock('../../hooks/useContentList', () => ({ useContentList: jest.fn() }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
}), { virtual: true });

function items(count = 22) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Announcement ${index + 1}`,
    description: 'Announcement details',
    createdAt: `2026-10-${String(index + 1).padStart(2, '0')}T10:00:00Z`
  }));
}

function setup() {
  const view = render(<AnnouncementsSection />);
  const track = view.container.querySelector('.ann-carousel-track');
  return {
    ...view,
    track,
    position: () => Number(track.style.getPropertyValue('--ann-position')),
    cards: () => [...track.querySelectorAll('[data-announcement-id]:not([data-announcement-clone])')]
  };
}

function finish(track) {
  const event = new Event('transitionend', { bubbles: true });
  Object.assign(event, { propertyName: 'transform' });
  fireEvent(track, event);
}

beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  window.matchMedia = jest.fn(query => ({
    matches: false, media: query,
    addEventListener: jest.fn(), removeEventListener: jest.fn()
  }));
  useContentList.mockReturnValue({ items: items(), loading: false, error: null });
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('requests and displays only the 20 newest announcements without card numbers', () => {
  const view = setup();
  expect(useContentList).toHaveBeenCalledWith('announcements', {
    limit: 20, orderBy: 'recent', revalidate: true
  });
  expect(view.cards().map(card => Number(card.dataset.announcementId))).toEqual(
    Array.from({ length: 20 }, (_, index) => 22 - index)
  );
  expect(view.container.querySelector('.ann-card-number')).toBeNull();
  expect(view.cards()[0].querySelector('.ann-latest-badge')).not.toBeNull();
  view.track.querySelectorAll('[data-announcement-clone] a').forEach(link => {
    expect(link.tabIndex).toBe(-1);
    expect(link.getAttribute('href')).toMatch(/^\/announcements\/page\//);
  });
});

test('autoplay visits all 20 items and loops seamlessly in either direction', () => {
  const view = setup();
  expect(view.position()).toBe(4);
  for (let step = 1; step <= 20; step += 1) {
    act(() => jest.advanceTimersByTime(4500));
    expect(view.position()).toBe(4 + step);
    finish(view.track);
  }
  expect(view.position()).toBe(4);
  expect(view.track.classList.contains('ann-carousel-track--moving')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Oldingi e’lon' }));
  expect(view.position()).toBe(3);
  finish(view.track);
  expect(view.position()).toBe(23);
  fireEvent.click(screen.getByRole('button', { name: 'Keyingi e’lon' }));
  finish(view.track);
  expect(view.position()).toBe(4);
});

test('pause, focused links and hidden tabs stop autoplay; unmount clears its timer', () => {
  const view = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Avtomatik aylanishni to‘xtatish' }));
  act(() => jest.advanceTimersByTime(9000));
  expect(view.position()).toBe(4);
  fireEvent.click(screen.getByRole('button', { name: 'Avtomatik aylanishni yoqish' }));
  act(() => view.cards()[0].querySelector('a').focus());
  act(() => jest.advanceTimersByTime(9000));
  expect(view.position()).toBe(4);
  act(() => document.activeElement.blur());
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  fireEvent(document, new Event('visibilitychange'));
  act(() => jest.advanceTimersByTime(9000));
  expect(view.position()).toBe(4);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  fireEvent(document, new Event('visibilitychange'));
  act(() => jest.advanceTimersByTime(4500));
  expect(view.position()).toBe(5);
  finish(view.track);
  view.unmount();
  expect(jest.getTimerCount()).toBe(0);
});

test('reduced motion disables autoplay and allows immediate manual navigation', () => {
  window.matchMedia.mockImplementation(query => ({
    matches: query.includes('prefers-reduced-motion'), media: query,
    addEventListener: jest.fn(), removeEventListener: jest.fn()
  }));
  const view = setup();
  act(() => jest.advanceTimersByTime(9000));
  expect(view.position()).toBe(4);
  fireEvent.click(screen.getByRole('button', { name: 'Oldingi e’lon' }));
  expect(view.position()).toBe(23);
  fireEvent.click(screen.getByRole('button', { name: 'Keyingi e’lon' }));
  expect(view.position()).toBe(4);
  expect(view.track.classList.contains('ann-carousel-track--moving')).toBe(false);
});

