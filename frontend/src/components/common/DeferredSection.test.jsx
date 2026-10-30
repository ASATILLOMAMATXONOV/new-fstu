import React from 'react';
import { act, render, screen } from '@testing-library/react';
import DeferredSection from './DeferredSection';

test('mounts content only when approaching the viewport and releases the observer', () => {
  const original = global.IntersectionObserver;
  let notify;
  const disconnect = jest.fn();
  global.IntersectionObserver = jest.fn(callback => {
    notify = callback;
    return { observe: jest.fn(), disconnect };
  });
  try {
    const { unmount } = render(<DeferredSection><p>Below fold content</p></DeferredSection>);
    expect(screen.queryByText('Below fold content')).toBeNull();
    act(() => notify([{ isIntersecting: false }]));
    expect(screen.queryByText('Below fold content')).toBeNull();
    act(() => notify([{ isIntersecting: true }]));
    expect(screen.getByText('Below fold content')).toBeTruthy();
    expect(disconnect).toHaveBeenCalledTimes(1);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  } finally {
    global.IntersectionObserver = original;
  }
});
