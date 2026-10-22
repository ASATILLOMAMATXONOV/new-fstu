import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCpu, FiMove, FiX } from 'react-icons/fi';

const RobotAvatar = lazy(() => import('./RobotAvatar'));

function viewportBounds() {
  const viewport = window.visualViewport;
  return {
    width: viewport?.width || window.innerWidth,
    height: viewport?.height || window.innerHeight,
    left: viewport?.offsetLeft || 0,
    top: viewport?.offsetTop || 0
  };
}

export function robotDimensions(viewport) {
  const height = Math.min(viewport.width < 820 ? 240 : 350, viewport.height * .6, (viewport.width - 16) / .95);
  return { width: height * .95, height };
}

export function clampRobotPosition(point, viewport, size) {
  return {
    x: Math.max(viewport.left + 8, Math.min(point.x, viewport.left + viewport.width - size.width - 8)),
    y: Math.max(viewport.top + 8, Math.min(point.y, viewport.top + viewport.height - size.height - 8))
  };
}

export default function FloatingRobot({ state = 'idle', onActivate, onHide }) {
  const [viewport, setViewport] = useState(viewportBounds);
  const [position, setPosition] = useState(() => {
    const bounds = viewportBounds();
    const size = robotDimensions(bounds);
    return clampRobotPosition({ x: bounds.width < 820 ? 8 : 48, y: bounds.top + bounds.height - size.height - 8 }, bounds, size);
  });
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const drag = useRef(null);
  const size = robotDimensions(viewport);

  useEffect(() => {
    const resize = () => {
      const bounds = viewportBounds();
      setViewport(bounds);
      setPosition((current) => clampRobotPosition(current, bounds, robotDimensions(bounds)));
    };
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(Boolean(media?.matches));
    updateMotion();
    media?.addEventListener?.('change', updateMotion);
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('scroll', resize);
    return () => {
      media?.removeEventListener?.('change', updateMotion);
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('scroll', resize);
    };
  }, []);

  const stopDrag = () => {
    drag.current = null;
    setDragging(false);
  };
  const fallback = <span className="fstu-robot-actor__fallback"><FiCpu />AI yordamchi</span>;

  return createPortal(
    <div className="fstu-robot-world">
      <div
        className={`fstu-robot-actor is-${state}${dragging ? ' is-dragging' : ''}`}
        style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
      >
        <button
          type="button"
          className="fstu-robot-actor__figure"
          onClick={onActivate}
          aria-label="Universitet AI roboti bilan suhbatlashish"
          title="AI yordamchi bilan suhbatlashish"
        >
          <Suspense fallback={fallback}>
            <RobotAvatar state={dragging ? 'walking' : state} reducedMotion={reducedMotion} fallback={fallback} />
          </Suspense>
        </button>
        <button
          type="button"
          className="fstu-robot-actor__move"
          aria-label="Robotni ko‘chirish"
          title="Sudrab yoki yo‘nalish tugmalari bilan ko‘chiring"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX - position.x, y: event.clientY - position.y };
            setDragging(true);
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            setPosition(clampRobotPosition({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y }, viewport, size));
          }}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onLostPointerCapture={stopDrag}
          onKeyDown={(event) => {
            const steps = { ArrowLeft: [-32, 0], ArrowRight: [32, 0], ArrowUp: [0, -32], ArrowDown: [0, 32] };
            const step = steps[event.key];
            if (!step) return;
            event.preventDefault();
            setPosition((current) => clampRobotPosition({ x: current.x + step[0], y: current.y + step[1] }, viewport, size));
          }}
        ><FiMove /></button>
        <button type="button" className="fstu-robot-actor__hide" onClick={onHide} aria-label="Robotni yashirish" title="Yashirish"><FiX /></button>
      </div>
    </div>,
    document.body
  );
}
