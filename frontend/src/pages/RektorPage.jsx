
import React, { useMemo } from 'react';

import '../assets/styles/RektorPage.css';

import { useLanguage } from '../context/LanguageContext';
import { useSetting } from '../hooks/useSetting';

import {
  createSafeMarkup,
  getLocalizedValue,
  normalizeRectorSpeechData
} from '../utils/cms';

import { getSiteMessages } from '../locales/site';

import rectorImg from '../assets/optimized/rectok.jpg';

/* =========================================
   CONTACT ICON
========================================= */

function ContactIcon({ type }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (type) {
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" />
        </svg>
      );

    case 'website':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 4 5.6 4 9s-1.5 6.5-4 9M12 3c-2.5 2.5-4 5.6-4 9s1.5 6.5 4 9" />
        </svg>
      );

    case 'address':
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================
   CONTACTS
========================================= */

function RectorContacts({ items }) {
  if (!items.length) return null;

  return (
    <div className="rector-profile-contacts">
      {items.map((item) => {
        const content = (
          <>
            <span className="rector-contact-icon">
              <ContactIcon type={item.type} />
            </span>

            <span className="rector-contact-text">
              {item.text}
            </span>
          </>
        );

        return item.href ? (
          <a
            key={item.type}
            href={item.href}
            className="rector-contact-item"
            {...(
              item.type === 'website'
                ? {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  }
                : {}
            )}
          >
            {content}
          </a>
        ) : (
          <div
            key={item.type}
            className="rector-contact-item"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */

function RektorPage() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).home.rector,
    [currentLanguageCode]
  );

  const { item } = useSetting('rector-speech', {
    revalidate: true
  });

  const data = useMemo(
    () => item
      ? normalizeRectorSpeechData(item)
      : null,
    [item]
  );

  const isActive = Boolean(data?.active);

  const title = isActive
    ? getLocalizedValue(data.title, texts.defaultTitle)
    : texts.defaultTitle;

  const content = isActive
    ? getLocalizedValue(data.content)
    : '';

  const rectorName = isActive
    ? getLocalizedValue(data.rectorName, texts.defaultName)
    : texts.defaultName;

  const rectorPosition = isActive
    ? getLocalizedValue(data.position)
    : '';

  const rectorImage = isActive
    ? data.image || rectorImg
    : rectorImg;

  /* Contact fields from CMS */
  const contactSource = item || {};

  const phone = String(
    contactSource.phone || data?.phone || ''
  ).trim();

  const website = String(
    contactSource.website || data?.website || ''
  ).trim();

  const address = isActive
    ? getLocalizedValue(
        contactSource.address || data?.address
      )
    : '';

  const receptionHours = isActive
    ? getLocalizedValue(
        contactSource.receptionHours ||
        data?.receptionHours
      )
    : '';

  const websiteUrl = website
    ? (
        /^https?:\/\//i.test(website)
          ? website
          : `https://${website}`
      )
    : '';

  const phoneHref = phone
    ? `tel:${phone.replace(/[^\d+]/g, '')}`
    : '';

  const contacts = [
    phone && {
      type: 'phone',
      text: phone,
      href: phoneHref
    },
    website && {
      type: 'website',
      text: website,
      href: websiteUrl
    },
    address && {
      type: 'address',
      text: address
    },
    receptionHours && {
      type: 'clock',
      text: receptionHours
    }
  ].filter(Boolean);

  return (
    <main className="rector-page">

      {/* TOP PROFILE */}

      {isActive && (
        <section
          className="rector-profile-section"
          aria-labelledby="rector-profile-name"
        >
          <div className="rector-profile-card">

            {/* PHOTO */}

            <div className="rector-profile-photo">
              <div className="rector-profile-photo-frame">
                <img
                  src={rectorImage}
                  alt={rectorName}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
            </div>

            {/* PERSON INFO */}

            <div className="rector-profile-info">
              <span className="rector-profile-label">
                {texts.miniTitle}
              </span>

              <h1 id="rector-profile-name">
                {rectorName}
              </h1>

              {rectorPosition && (
                <p className="rector-profile-position">
                  {rectorPosition}
                </p>
              )}
            </div>

            {/* CONTACT DETAILS */}

            <RectorContacts items={contacts} />

          </div>
        </section>
      )}

      {/* FULL MESSAGE */}

      <section
        className="rector-message-section"
        aria-labelledby="rector-message-title"
      >
        <div className="rector-message-container">

          <header className="rector-message-header">
            <div className="rector-message-eyebrow">
              <span className="rector-message-line" />
              <span>{texts.miniTitle}</span>
            </div>

            <h2 id="rector-message-title">
              {title}
            </h2>
          </header>

          <article className="rector-message-article">
            {isActive && content ? (
              <div
                className="rector-rich-content"
                dangerouslySetInnerHTML={createSafeMarkup(
                  content,
                  ''
                )}
              />
            ) : (
              <p>{texts.defaultExcerpt}</p>
            )}
          </article>

          <div className="rector-message-footer">
            <span className="rector-message-footer-line" />
            <span>FSTU</span>
          </div>

        </div>
      </section>
    </main>
  );
}

export default RektorPage;
