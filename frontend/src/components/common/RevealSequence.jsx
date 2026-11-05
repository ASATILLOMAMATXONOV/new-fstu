import React from 'react';

import { isCmsContentLoading, subscribeToCmsLoading } from '../../api/cms';

// Reveals page sections top-down: a section becomes visible only once every
// section above it has finished loading and stopped resizing. Sections that are
// still hidden can grow freely without shifting visible content, which keeps
// Cumulative Layout Shift close to zero while CMS data streams in.

const RevealContext = React.createContext(null);
const QUIET_MS = 180;
const MAX_WAIT_MS = 5000;

export function RevealSequence({ children }) {
  const stableRef = React.useRef(new Set());
  const [revealedCount, setRevealedCount] = React.useState(0);

  const markStable = React.useCallback((index) => {
    stableRef.current.add(index);
    setRevealedCount((current) => {
      let next = current;
      while (stableRef.current.has(next)) next += 1;
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ revealedCount, markStable }), [revealedCount, markStable]);
  return <RevealContext.Provider value={value}>{children}</RevealContext.Provider>;
}

function useStableSignal(index, ref, active, markStable) {
  React.useEffect(() => {
    if (!markStable || !active || !ref.current) return undefined;

    let done = false;
    let quietTimer = null;
    const finish = () => {
      if (done) return;
      done = true;
      markStable(index);
    };
    const schedule = () => {
      window.clearTimeout(quietTimer);
      if (isCmsContentLoading()) return;
      quietTimer = window.setTimeout(() => {
        if (!isCmsContentLoading()) finish();
      }, QUIET_MS);
    };

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    resizeObserver?.observe(ref.current);
    const unsubscribe = subscribeToCmsLoading(schedule);
    const maxTimer = window.setTimeout(finish, MAX_WAIT_MS);
    schedule();

    return () => {
      done = true;
      window.clearTimeout(quietTimer);
      window.clearTimeout(maxTimer);
      resizeObserver?.disconnect();
      unsubscribe();
    };
  }, [active, index, markStable, ref]);
}

/**
 * Wraps one section of a RevealSequence. `active` should become true once the
 * section's real content has been mounted. Without a surrounding sequence the
 * slot renders its children normally.
 */
export function RevealSlot({ index, active = true, alwaysVisible = false, children, ...rest }) {
  const context = React.useContext(RevealContext);
  const ref = React.useRef(null);
  const isRevealed = !context || alwaysVisible || index < context.revealedCount;

  useStableSignal(index, ref, active && context && index >= 0, context?.markStable);

  return (
    <div
      {...rest}
      ref={ref}
      className={`reveal-slot${isRevealed ? '' : ' reveal-slot--pending'}`}
    >
      {children}
    </div>
  );
}
