import React from 'react';
import { Link } from 'react-router-dom';

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

function AppLink({ children, href, to, ...props }) {
  const destination = to ?? href ?? '/';

  if (isExternalHref(destination)) {
    return (
      <a href={destination} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link to={normalizeHref(destination)} {...props}>
      {children}
    </Link>
  );
}

export default AppLink;
