import React from 'react';
import { act, render } from '@testing-library/react';
import ScrollManager from './ScrollManager';

let mockLocation;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate
}), { virtual: true });

beforeEach(() => {
  mockLocation = { key: 'first', pathname: '/news', search: '', hash: '' };
  window.history.scrollRestoration = 'auto';
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  mockNavigate.mockClear();
});

afterEach(() => jest.restoreAllMocks());

test('opens immediately at the top and disables native history restoration', () => {
  const { unmount } = render(<ScrollManager />);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  expect(window.history.scrollRestoration).toBe('manual');
  const reset = window.requestAnimationFrame.mock.calls[0][0];
  act(() => reset());
  expect(window.scrollTo).toHaveBeenCalledTimes(2);
  unmount();
  expect(window.history.scrollRestoration).toBe('auto');
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
});

test('resets on page, query, hash, and same-URL history entry changes', () => {
  const { rerender } = render(<ScrollManager />);
  for (const change of [
    { pathname: '/students/5' }, { search: '?page=2' },
    { hash: '#details' }, { key: 'back-forward-entry' }
  ]) {
    window.scrollTo.mockClear();
    mockLocation = { ...mockLocation, ...change };
    rerender(<ScrollManager />);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  }
});

test('preserves the legacy news link redirect', () => {
  mockLocation = { ...mockLocation, pathname: '/', hash: '#news' };
  render(<ScrollManager />);
  expect(mockNavigate).toHaveBeenCalledWith('/news', { replace: true });
});
