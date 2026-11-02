import React from 'react';
import { Link } from 'react-router-dom';
import { prefetchRoute } from '../../utils/routePrefetch';

function isExternalHref(href) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

function normalizeHref(href) {
  if (!href) {
    return '/';
  }

  if (href.startsWith('#')) {
    return `/${href}`;
  }

  if (!href.startsWith('/')) {
    return `/${href}`;
  }

  return href;
}

function AppLink({
  children,
  href,
  to,
  onFocus,
  onMouseEnter,
  onTouchStart,
  ...props
}) {
  const destination = to ?? href ?? '/';

  if (isExternalHref(destination)) {
    return (
      <a
        href={destination}
        onFocus={onFocus}
        onMouseEnter={onMouseEnter}
        onTouchStart={onTouchStart}
        {...props}
      >
        {children}
      </a>
    );
  }

  const normalizedDestination = normalizeHref(destination);
  const handleIntent = (handler) => (event) => {
    prefetchRoute(normalizedDestination);
    handler?.(event);
  };

  return (
    <Link
      to={normalizedDestination}
      onFocus={handleIntent(onFocus)}
      onMouseEnter={handleIntent(onMouseEnter)}
      onTouchStart={handleIntent(onTouchStart)}
      {...props}
    >
      {children}
    </Link>
  );
}

export default AppLink;
