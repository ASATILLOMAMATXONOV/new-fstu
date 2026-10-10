import React from 'react';

import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';

import '../../assets/styles/HeroFeatures.css';

function FeatureIcon({ type }) {
  if (type === 'ReadOutlined') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 8L12 4L21 8L12 12L3 8Z" />
        <path d="M7 10.5V15.5C7 17 9.2 18.5 12 18.5C14.8 18.5 17 17 17 15.5V10.5" />
        <path d="M21 8V14" />
      </svg>
    );
  }

  if (type === 'TeamOutlined') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 11C10.2 11 12 9.2 12 7C12 4.8 10.2 3 8 3C5.8 3 4 4.8 4 7C4 9.2 5.8 11 8 11Z" />
        <path d="M16 11C18.2 11 20 9.2 20 7C20 4.8 18.2 3 16 3" />
        <path d="M2 21C2 17.7 4.7 15 8 15C11.3 15 14 17.7 14 21" />
        <path d="M14 15C17.3 15 20 17.7 20 21" />
      </svg>
    );
  }

  if (type === 'BankOutlined') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 21H20" />
        <path d="M6 21V8L12 4L18 8V21" />
        <path d="M9 21V13H15V21" />
        <path d="M9 9H10" />
        <path d="M14 9H15" />
      </svg>
    );
  }

  if (type === 'GlobalOutlined') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21C17 21 21 17 21 12C21 7 17 3 12 3C7 3 3 7 3 12C3 17 7 21 12 21Z" />
        <path d="M3 12H21" />
        <path d="M12 3C14 5.5 15 8.5 15 12C15 15.5 14 18.5 12 21" />
        <path d="M12 3C10 5.5 9 8.5 9 12C9 15.5 10 18.5 12 21" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15C14.2 15 16 13.2 16 11C16 8.8 14.2 7 12 7C9.8 7 8 8.8 8 11C8 13.2 9.8 15 12 15Z" />
      <path d="M12 2L14 5L17.5 4.5L18 8L21 10L18 12L17.5 15.5L14 15L12 18L10 15L6.5 15.5L6 12L3 10L6 8L6.5 4.5L10 5L12 2Z" />
    </svg>
  );
}

function isExternalHref(href = '') {
  return /^(https?:|mailto:|tel:)/.test(href);
}

function HeroFeatures() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.heroFeatures,
    [currentLanguageCode]
  );
  const { items } = useContentList('advantages', {
    revalidate: true
  });
  const features = items
    .map((item) => ({
      ...item,
      link: item.link || '',
      title: getTranslatedField(item, 'title', item.title || '')
    }))
    .filter((item) => item.title);

  if (!features.length) {
    return null;
  }

  return (
    <section className="hero-features-section" aria-label={texts.ariaLabel}>
      <div
        className="hero-features"
        style={{ '--hero-features-columns': Math.min(features.length || 1, 5) }}
      >
        {features.map((item) => {
          const content = (
            <>
              <div className="hero-feature-icon-shell">
                <div className="hero-feature-icon">
                  {item.mediaType === 'image' && item.image ? (
                    <img src={item.image} alt={item.title} width="30" height="30" />
                  ) : (
                    <FeatureIcon type={item.icon} />
                  )}
                </div>
              </div>

              <p className="hero-feature-title">{item.title}</p>
            </>
          );

          if (!item.link) {
            return (
              <article className="hero-feature-card" key={item.id || item.title}>
                {content}
              </article>
            );
          }

          return (
            <AppLink
              key={item.id || item.title}
              href={item.link}
              className="hero-feature-card hero-feature-card-link"
              {...(isExternalHref(item.link)
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
            >
              {content}
            </AppLink>
          );
        })}
      </div>
    </section>
  );
}

export default HeroFeatures;
