
import React, { useMemo } from 'react';

import AppLink from '../common/AppLink';
import '../../assets/styles/HomePartnersSection.css';

import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';

const ExternalIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

function PartnerCard({ item, texts, isClone = false }) {
  const title = getTranslatedField(
    item,
    'title',
    item.title || 'Partner'
  );

  const hasLink = Boolean(item.link && item.link !== '#');

  const content = (
    <>
      <span className="home-partner-glow" aria-hidden="true" />

      <span className="home-partner-logo-wrap">
        {item.image ? (
          <img
            className="home-partner-logo"
            src={item.image}
            alt={isClone ? '' : `${title} ${texts.logoSuffix}`}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        ) : (
          <span className="home-partner-fallback">
            {title}
          </span>
        )}
      </span>

      <span className="home-partner-name" title={title}>
        {title}
      </span>

      <span className="home-partner-bottom">
        <span className="home-partner-indicator" />

        <span className="home-partner-visit">
          {hasLink ? texts.siteVisitSuffix : title}
        </span>

        {hasLink && <ExternalIcon />}
      </span>
    </>
  );

  const className = [
    'home-partner-item',
    hasLink ? 'home-partner-item--linked' : ''
  ].join(' ');

  if (!hasLink) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      className={className}
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        isClone
          ? undefined
          : `${title} ${texts.siteVisitSuffix}`
      }
      tabIndex={isClone ? -1 : 0}
    >
      {content}
    </a>
  );
}

function HomePartnersSection() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).home.partners,
    [currentLanguageCode]
  );

  const { items = [] } = useContentList('partners', {
    revalidate: true
  });

  const partners = useMemo(
    () => items.filter(Boolean),
    [items]
  );

  if (!partners.length) return null;

  const renderPartners = (isClone = false) =>
    partners.map((item, index) => (
      <PartnerCard
        key={`${item.id ?? index}-${isClone ? 'clone' : 'main'}`}
        item={item}
        texts={texts}
        isClone={isClone}
      />
    ));

  return (
    <section
      className="home-partners-section"
      aria-label={texts.ariaLabel}
    >
      <div className="home-partners-panel">
        <div className="home-partners-heading">
          <div className="home-partners-heading-left">
            <span className="home-partners-heading-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 17h7m-3.5-3.5v7" />
              </svg>
            </span>

            <div className="home-partners-heading-text">
              <span className="home-partners-eyebrow">
                FSTU / PARTNERS
              </span>
              <h2>{texts.sectionTitle}</h2>
            </div>
          </div>

          <AppLink
            href="/partners"
            className="home-partners-link"
          >
            <span>{texts.seeAll}</span>
            <ArrowIcon />
          </AppLink>
        </div>

        <div className="home-partners-divider" />

        <div className="home-partners-marquee">
          <div className="home-partners-track">
            <div className="home-partners-group">
              {renderPartners()}
            </div>

            <div
              className="home-partners-group"
              aria-hidden="true"
              inert=""
            >
              {renderPartners(true)}
            </div>
          </div>
        </div>

        <div className="home-partners-footer">
          <div className="home-partners-status">
            <span className="home-partners-status-dot" />
            <span>FSTU</span>
          </div>

          <div className="home-partners-progress">
            <span />
          </div>

          <span className="home-partners-total">
            {String(partners.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}

export default HomePartnersSection;
