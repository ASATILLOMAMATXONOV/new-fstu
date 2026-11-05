import React, { Suspense, useEffect, useRef, useState } from 'react';

import { RevealSlot } from './RevealSequence';

function MountSignal({ onMount }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return null;
}

export default function DeferredSection({ children, minHeight = 320, revealIndex = -1 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const handleMount = React.useCallback(() => setMounted(true), []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '600px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const fallback = <div className={`section-fallback${visible ? '' : ' section-fallback--deferred'}`} style={{ minHeight }} aria-hidden="true" />;
  return (
    <RevealSlot index={revealIndex} active={mounted}>
      <div ref={ref}>
        {visible ? (
          <Suspense fallback={fallback}>
            {children}
            <MountSignal onMount={handleMount} />
          </Suspense>
        ) : fallback}
      </div>
    </RevealSlot>
  );
}
