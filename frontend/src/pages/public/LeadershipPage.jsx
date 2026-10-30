
import React, { useMemo } from 'react';

import AcademicSidebar from '../../components/layout/AcademicSidebar';
import '../../assets/styles/LeadershipPage.css';

import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getTranslatedField } from '../../utils/cms';

/* ==========================================
   ICON COMPONENT
========================================== */

const ICONS = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6.9 6.9l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  telegram: (
    <path d="m22 3-4 18-6-5-3 3 1-6 12-10L3 11l6 2" />
  ),
  facebook: (
    <path d="M15 21v-8h3l.5-4H15V7c0-1.2.4-2 2-2h2V2.2A25 25 0 0 0 16 2c-3 0-5 1.8-5 5v2H8v4h3v8" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-7m0 3a3 3 0 0 1 6 0v4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  )
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name] || ICONS.globe}
    </svg>
  );
}

/* ==========================================
   TRANSLATIONS
========================================== */

const LABELS = {
  uz: {
    reception: 'Qabul vaqti',
    phone: 'Telefon',
    email: 'Elektron pochta',
    social: 'Ijtimoiy tarmoqlar',
    empty: 'Rahbariyat ma’lumotlari mavjud emas',
    loading: 'Ma’lumotlar yuklanmoqda...',
    unspecified: 'Ma’lumot kiritilmagan'
  },
  ru: {
    reception: 'Время приёма',
    phone: 'Телефон',
    email: 'Электронная почта',
    social: 'Социальные сети',
    empty: 'Информация отсутствует',
    loading: 'Загрузка данных...',
    unspecified: 'Не указано'
  },
  en: {
    reception: 'Office hours',
    phone: 'Phone',
    email: 'Email',
    social: 'Social media',
    empty: 'No leadership information available',
    loading: 'Loading information...',
    unspecified: 'Not specified'
  }
};

/* ==========================================
   SAFE SOCIAL LINKS
========================================== */

function safeUrl(value, platform) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const raw = value.trim();

  if (platform === 'telegram' && raw.startsWith('@')) {
    return `https://t.me/${raw.slice(1)}`;
  }

  try {
    const url = new URL(
      /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    );

    return ['https:', 'http:'].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getSocialLinks(person) {
  const social = person.socialLinks || person.socials || {};

  const sources = [
    ['telegram', person.telegram || social.telegram],
    ['facebook', person.facebook || social.facebook],
    ['instagram', person.instagram || social.instagram],
    ['linkedin', person.linkedin || social.linkedin],
    ['globe', person.website || social.website]
  ];

  return sources
    .map(([name, value]) => ({
      name,
      url: safeUrl(value, name)
    }))
    .filter((item) => Boolean(item.url));
}

/* ==========================================
   NORMALIZE CMS DATA
========================================== */

function getPersonData(person, ui) {
  const read = (key) =>
    getTranslatedField(person, key, person?.[key]) || '';

  const fullName =
    read('fullName') ||
    [read('firstName'), read('lastName')]
      .filter(Boolean)
      .join(' ') ||
    read('name') ||
    read('title') ||
    ui.unspecified;

  const position =
    read('position') ||
    read('jobTitle') ||
    read('title');

  const reception =
    read('receptionTime') ||
    read('receptionHours') ||
    read('reception');

  return {
    fullName,
    position,
    reception,
    phone: person.phone || person.phoneNumber || '',
    email: person.email || '',
    image: person.image || person.photo || '',
    socials: getSocialLinks(person)
  };
}

/* ==========================================
   LEADERSHIP CARD
========================================== */

function LeadershipCard({ person, index, ui }) {
  const data = getPersonData(person, ui);

  const phoneHref = data.phone
    ? `tel:${String(data.phone).replace(/[^\d+]/g, '')}`
    : null;

  const emailHref = data.email
    ? `mailto:${data.email}`
    : null;

  return (
    <article
      className="leadership-card"
      style={{
        '--card-delay': `${Math.min(index, 8) * 0.07}s`
      }}
    >
      {/* IMAGE */}
      <div className="leadership-card-photo">
        {data.image ? (
          <img
            src={data.image}
            alt={data.fullName}
            loading={index < 2 ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="leadership-photo-placeholder">
            <Icon name="user" size={58} />
          </div>
        )}
        <div className="leadership-photo-gradient" />
      </div>

      {/* INFORMATION */}
      <div className="leadership-card-details">
        <div className="leadership-card-identity">
          <h2>{data.fullName}</h2>

          {data.position && (
            <p className="leadership-position">
              {data.position}
            </p>
          )}
        </div>

        <div className="leadership-information">
          {data.reception && (
            <div className="leadership-info-item">
              <div className="leadership-info-icon">
                <Icon name="calendar" />
              </div>

              <div>
                <span>{ui.reception}</span>
                <strong>{data.reception}</strong>
              </div>
            </div>
          )}

          {data.phone && (
            <div className="leadership-info-item">
              <div className="leadership-info-icon">
                <Icon name="phone" />
              </div>

              <div>
                <span>{ui.phone}</span>
                <a href={phoneHref}>
                  {data.phone}
                </a>
              </div>
            </div>
          )}

          {data.email && (
            <div className="leadership-info-item">
              <div className="leadership-info-icon">
                <Icon name="mail" />
              </div>

              <div>
                <span>{ui.email}</span>
                <a href={emailHref}>
                  {data.email}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* SOCIAL MEDIA */}
        {data.socials.length > 0 && (
          <div className="leadership-card-social">
            <span className="leadership-social-label">
              {ui.social}
            </span>

            <div className="leadership-social-links">
              {data.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leadership-social-button"
                  aria-label={social.name}
                  title={social.name}
                >
                  <Icon name={social.name} size={17} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* ==========================================
   MAIN PAGE
========================================== */

function LeadershipPage() {
  const { currentLanguageCode } = useLanguage();
  const ui = LABELS[currentLanguageCode] || LABELS.uz;

  const { items = [], loading } = useContentList(
    'leadership',
    { orderBy: 'recent' }
  );

  const leaders = useMemo(() => {
    return [...items]
      .filter((item) => item && item.active !== false)
      .sort((a, b) => {
        const aOrder = Number(
          a.sortOrder ?? a.order ?? 999999
        );
        const bOrder = Number(
          b.sortOrder ?? b.order ?? 999999
        );

        return aOrder - bOrder;
      });
  }, [items]);

  return (
    <main className="leadership-page">
      <div className="leadership-layout">

        <section className="leadership-main">

          {/* HEADER REMOVED — CARDS FIRST */}

          {loading ? (
            <div
              className="leadership-grid"
              aria-busy="true"
              aria-label={ui.loading}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="leadership-skeleton"
                  key={index}
                >
                  <div className="leadership-skeleton-photo" />

                  <div className="leadership-skeleton-info">
                    <div className="leadership-skeleton-line" />
                    <div className="leadership-skeleton-line short" />
                    <div className="leadership-skeleton-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div className="leadership-empty">
              <Icon name="user" size={38} />
              <h2>{ui.empty}</h2>
            </div>
          ) : (
            <div className="leadership-grid">
              {leaders.map((person, index) => (
                <LeadershipCard
                  key={person.id ?? index}
                  person={person}
                  index={index}
                  ui={ui}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="leadership-sidebar">
          <AcademicSidebar />
        </aside>

      </div>
    </main>
  );
}

export default LeadershipPage;
