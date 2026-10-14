
import React, { useMemo } from 'react';
import '../../assets/styles/HomeInfoSection.css';

import AppLink from '../common/AppLink';
import { useContentList } from '../../hooks/useContentList';
import { getTranslatedField } from '../../utils/cms';

function QuickLinkIcon({ name }) {
  const common = {
    width: 34,
    height: 34,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.65,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (name) {
    case 'BankOutlined':
    case 'university':
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7M5 10v10m4-10v10m6-10v10m4-10v10M3 21h18M3 10h18" />
        </svg>
      );

    case 'ReadOutlined':
    case 'book':
      return (
        <svg {...common}>
          <path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1m0-14v14" />
        </svg>
      );

    case 'graduation':
      return (
        <svg {...common}>
          <path d="m2 9 10-5 10 5-10 5L2 9Zm5 3v5c3 3 7 3 10 0v-5M22 9v7" />
        </svg>
      );

    case 'TeamOutlined':
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm13-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5v1h-4" />
        </svg>
      );

    case 'GlobalOutlined':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.1 2.5 3.1 5.5 3.1 9S14.1 18.5 12 21M12 3c-2.1 2.5-3.1 5.5-3.1 9S9.9 18.5 12 21" />
        </svg>
      );

    case 'SettingOutlined':
      return (
        <svg {...common}>
          <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z" />
          <path d="M12 2.5v2.1m0 14.8v2.1m7.1-17.6-1.5 1.5M6.4 17.6l-1.5 1.5m16.6-7.1h-2.1M4.6 12H2.5m16.6 7.1-1.5-1.5M6.4 6.4 4.9 4.9" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4m10-4v4M3 10h18m-13 4h3m3 0h2" />
        </svg>
      );
  }
}

function isExternalHref(href = '') {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function HomeInfoSection() {
  const { items } = useContentList('advantages', {
    revalidate: true
  });

  const links = useMemo(() => {
    return (items || [])
      .filter((item) => item?.active !== false)
      .map((item, index) => {
        const title = getTranslatedField(
          item,
          'title',
          item.title || ''
        );

        const description = getTranslatedField(
          item,
          'description',
          item.description || item.subtitle || ''
        );

        return {
          ...item,
          id: item.id ?? item._id ?? index,
          title,
          description,
          href: item.link || '',
          featured: Boolean(
            item.featured || item.metadata?.featured
          )
        };
      })
      .filter((item) => item.title)
      .sort(
        (left, right) =>
          Number(left.order || 0) - Number(right.order || 0)
      );
  }, [items]);

  if (!links.length) {
    return null;
  }

  return (
    <section
      className="home-info-section"
      aria-label="Tezkor havolalar"
    >
      <nav
        className="home-info-links"
        aria-label="Asosiy bo‘limlar"
        style={{
          '--home-info-columns': Math.min(links.length, 5)
        }}
      >
        {links.map((item) => {
          const className = [
            'home-info-link',
            item.featured ? 'is-featured' : ''
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <>
              <span className="home-info-icon">
                {item.mediaType === 'image' && item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    width="34"
                    height="34"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <QuickLinkIcon name={item.icon} />
                )}
              </span>

              <span className="home-info-title">
                {item.title}
              </span>

              {item.description && (
                <span className="home-info-desc">
                  {item.description}
                </span>
              )}

              {item.featured && (
                <span
                  className="home-info-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              )}
            </>
          );

          if (!item.href) {
            return (
              <article
                key={item.id}
                className={className}
              >
                {content}
              </article>
            );
          }

          return (
            <AppLink
              key={item.id}
              href={item.href}
              className={className}
              {...(
                isExternalHref(item.href)
                  ? {
                      target: '_blank',
                      rel: 'noopener noreferrer'
                    }
                  : {}
              )}
            >
              {content}
            </AppLink>
          );
        })}
      </nav>
    </section>
  );
}

export default HomeInfoSection;
