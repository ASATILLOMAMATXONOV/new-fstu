import React, { Suspense, useEffect, useRef, useState } from 'react';

export default function DeferredSection({ children, minHeight = 320 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

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
    <div ref={ref}>
      {visible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
}
