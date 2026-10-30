import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ScrollManager() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    if (location.pathname === '/' && location.hash === '#news') {
      navigate('/news', { replace: true });
      return undefined;
    }

    const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    reset();
    const frame = window.requestAnimationFrame(reset);
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, location.pathname, location.search, location.hash, navigate]);

  return null;
}
