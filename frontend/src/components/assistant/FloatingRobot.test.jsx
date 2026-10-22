import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FloatingRobot, { clampRobotPosition, robotDimensions } from './FloatingRobot';

jest.mock('./RobotAvatar', () => ({ __esModule: true, default: ({ state, reducedMotion }) => <div data-testid="floating-model" data-state={state} data-reduced-motion={reducedMotion} /> }));

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  window.matchMedia = jest.fn(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
});

test('the whole actor stays inside portrait, landscape and resized viewport boundaries', () => {
  for (const viewport of [{ width: 320, height: 568, left: 0, top: 0 }, { width: 1920, height: 1080, left: 0, top: 0 }, { width: 740, height: 360, left: 0, top: 0 }, { width: 360, height: 300, left: 0, top: 160 }, { width: 180, height: 640, left: 0, top: 0 }]) {
    const size = robotDimensions(viewport);
    for (const point of [{ x: -2000, y: -2000 }, { x: 10000, y: 10000 }]) {
      const result = clampRobotPosition(point, viewport, size);
      expect(result.x).toBeGreaterThanOrEqual(viewport.left);
      expect(result.y).toBeGreaterThanOrEqual(viewport.top);
      expect(result.x + size.width).toBeLessThanOrEqual(viewport.left + viewport.width);
      expect(result.y + size.height).toBeLessThanOrEqual(viewport.top + viewport.height);
    }
  }
});

test('renders independently of chat and supports moving by keyboard, resizing and cleanup', async () => {
  const view = render(<div data-testid="chat"><FloatingRobot state="idle" /></div>);
  await screen.findByTestId('floating-model');
  const actor = document.querySelector('.fstu-robot-actor');
  expect(screen.getByTestId('chat').contains(actor)).toBe(false);
  view.rerender(<div data-testid="chat"><FloatingRobot state="explaining" /></div>);
  expect(actor.classList.contains('is-explaining')).toBe(true);
  expect(screen.getByTestId('floating-model').getAttribute('data-state')).toBe('explaining');
  const move = screen.getByRole('button', { name: 'Robotni ko‘chirish' });
  const x = Number.parseFloat(actor.style.left);
  fireEvent.keyDown(move, { key: 'ArrowLeft' });
  expect(Number.parseFloat(actor.style.left)).toBe(x - 32);
  for (let index = 0; index < 60; index += 1) fireEvent.keyDown(move, { key: 'ArrowUp' });
  expect(Number.parseFloat(actor.style.top)).toBe(8);
  Object.defineProperty(window, 'innerWidth', { value: 320 });
  Object.defineProperty(window, 'innerHeight', { value: 568 });
  fireEvent(window, new Event('resize'));
  expect(Number.parseFloat(actor.style.left) + Number.parseFloat(actor.style.width)).toBeLessThanOrEqual(320);
  view.unmount();
  expect(document.querySelector('.fstu-robot-world')).toBeNull();
});

test('dragging switches to walking, clamps the actor and stops on pointer cancellation', async () => {
  const originalPointerEvent = window.PointerEvent;
  window.PointerEvent = MouseEvent;
  const onActivate = jest.fn();
  render(<FloatingRobot state="idle" onActivate={onActivate} />);
  const model = await screen.findByTestId('floating-model');
  const move = screen.getByRole('button', { name: 'Robotni ko‘chirish' });
  move.setPointerCapture = jest.fn();
  fireEvent.pointerDown(move, { button: 0, clientX: 58, clientY: 452 });
  expect(model.getAttribute('data-state')).toBe('walking');
  fireEvent.pointerMove(move, { clientX: 500, clientY: 300 });
  const actor = document.querySelector('.fstu-robot-actor');
  expect(Number.parseFloat(actor.style.left)).toBe(490);
  expect(Number.parseFloat(actor.style.top)).toBe(290);
  fireEvent.pointerMove(move, { clientX: -500, clientY: -500 });
  expect(Number.parseFloat(actor.style.left)).toBe(8);
  expect(Number.parseFloat(actor.style.top)).toBe(8);
  fireEvent.pointerCancel(move);
  expect(model.getAttribute('data-state')).toBe('idle');
  expect(onActivate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Universitet AI roboti bilan suhbatlashish' }));
  expect(onActivate).toHaveBeenCalledTimes(1);
  expect(document.querySelector('.fstu-robot-world img')).toBeNull();
  window.PointerEvent = originalPointerEvent;
});

test('passes the reduced motion preference to the animated model', async () => {
  window.matchMedia.mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  render(<FloatingRobot state="greeting" />);
  expect((await screen.findByTestId('floating-model')).getAttribute('data-reduced-motion')).toBe('true');
});
