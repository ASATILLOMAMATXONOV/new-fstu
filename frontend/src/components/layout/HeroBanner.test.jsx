import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import HeroBanner from './HeroBanner';
import { useContentList } from '../../hooks/useContentList';

jest.mock('../../hooks/useContentList', () => ({ useContentList: jest.fn() }));
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguageCode: 'uz' })
}));
jest.mock('../../locales/site', () => ({
  getSiteMessages: () => ({ home: { heroBanner: {
    previousSlide: 'Oldingi banner', nextSlide: 'Keyingi banner'
  } } })
}));

const banners = [1, 2].map(id => ({
  id, image: `/banner-${id}.jpg`, order: id,
  uz: { title: `Banner ${id}`, primaryButtonText: 'Batafsil' },
  primaryButtonLink: `/page/${id}`
}));

function finish(track) {
  const event = new Event('transitionend', { bubbles: true });
  Object.assign(event, { propertyName: 'transform' });
  fireEvent(track, event);
}

async function loadImages(container) {
  await act(async () => {
    container.querySelectorAll('img').forEach(image => fireEvent.load(image));
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  window.matchMedia = jest.fn(() => ({
    matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn()
  }));
  useContentList.mockReturnValue({ items: banners });
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('waits for image decoding and keeps the same images mounted through forward and backward loops', async () => {
  const { container } = render(<HeroBanner />);
  const track = container.querySelector('.hero-track');
  const images = [...container.querySelectorAll('img')];
  const next = screen.getByRole('button', { name: 'Keyingi banner' });
  const previous = screen.getByRole('button', { name: 'Oldingi banner' });
  let decoded;
  images[2].decode = () => new Promise(resolve => { decoded = resolve; });

  fireEvent.load(images[2]);
  expect(next.disabled).toBe(true);
  await act(async () => decoded());
  expect(next.disabled).toBe(false);
  await loadImages(container);

  fireEvent.click(next);
  expect(screen.getByRole('heading').textContent).toBe('Banner 2');
  expect(next.disabled).toBe(true);
  finish(track);
  fireEvent.click(next);
  expect(track.style.transform).toBe('translate3d(-300%, 0, 0)');
  finish(track);
  expect(track.style.transform).toBe('translate3d(-100%, 0, 0)');
  expect(screen.getByRole('heading').textContent).toBe('Banner 1');

  fireEvent.click(previous);
  expect(track.style.transform).toBe('translate3d(-0%, 0, 0)');
  finish(track);
  expect(track.style.transform).toBe('translate3d(-200%, 0, 0)');
  expect([...container.querySelectorAll('img')]).toEqual(images);
});

test('autoplay waits for the next image and advances after a seven second pause', async () => {
  const { container } = render(<HeroBanner />);
  act(() => jest.advanceTimersByTime(20000));
  expect(screen.getByRole('heading').textContent).toBe('Banner 1');
  await loadImages(container);
  act(() => jest.advanceTimersByTime(7000));
  expect(screen.getByRole('heading').textContent).toBe('Banner 2');
  act(() => jest.advanceTimersByTime(1700));
  expect(container.querySelector('.hero-track').classList.contains('is-moving')).toBe(false);
  act(() => jest.advanceTimersByTime(7000));
  expect(screen.getByRole('heading').textContent).toBe('Banner 1');
});

test('reduced motion stops autoplay and lets controls change slides immediately', async () => {
  window.matchMedia.mockReturnValue({
    matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn()
  });
  const { container } = render(<HeroBanner />);
  await loadImages(container);
  act(() => jest.advanceTimersByTime(20000));
  expect(screen.getByRole('heading').textContent).toBe('Banner 1');
  fireEvent.click(screen.getByRole('button', { name: 'Oldingi banner' }));
  expect(screen.getByRole('heading').textContent).toBe('Banner 2');
  expect(container.querySelector('.hero-track').classList.contains('is-moving')).toBe(false);
});
