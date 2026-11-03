import React, { useId, useMemo, useState } from 'react';
import { FiCalendar, FiChevronDown, FiFacebook, FiGlobe, FiInstagram, FiLinkedin, FiMail, FiPhone, FiUser, FiYoutube } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import AcademicSidebar from '../../components/layout/AcademicSidebar';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { createSafeMarkup, getTranslatedField } from '../../utils/cms';
import '../../assets/styles/LeadershipPage.css';

const LABELS = {
  uz: {
    reception: 'Qabul vaqti', phone: 'Telefon', email: 'Elektron pochta', social: 'Ijtimoiy tarmoqlar',
    empty: 'Ma’muriyat ma’lumotlari hozircha mavjud emas', loading: 'Ma’lumotlar yuklanmoqda…',
    unspecified: 'Ma’lumot kiritilmagan', more: 'Batafsil ma’lumot', close: 'Yopish', about: 'Qo‘shimcha ma’lumot'
  },
  ru: {
    reception: 'Время приёма', phone: 'Телефон', email: 'Электронная почта', social: 'Социальные сети',
    empty: 'Информация об администрации пока отсутствует', loading: 'Загрузка данных…',
    unspecified: 'Не указано', more: 'Подробнее', close: 'Свернуть', about: 'Дополнительная информация'
  },
  en: {
    reception: 'Office hours', phone: 'Phone', email: 'Email', social: 'Social media',
    empty: 'No administration information available yet', loading: 'Loading information…',
    unspecified: 'Not specified', more: 'View details', close: 'Close details', about: 'Additional information'
  }
};
const SOCIALS = [
  ['telegram', 'Telegram', FaTelegramPlane], ['instagram', 'Instagram', FiInstagram],
  ['facebook', 'Facebook', FiFacebook], ['linkedin', 'LinkedIn', FiLinkedin],
  ['youtube', 'YouTube', FiYoutube], ['website', 'Website', FiGlobe]
];

function safeSocialUrl(value, platform) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (platform === 'telegram' && /^@[a-z\d_]+$/i.test(raw)) return `https://t.me/${raw.slice(1)}`;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname.includes('.') ? url.href : null;
  } catch {
    return null;
  }
}

function hasContent(value) {
  return Boolean(String(value || '').replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '')) || /<(img|table|hr)\b/i.test(value || '');
}

function LeadershipCard({ person, index, ui, language }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const read = (key) => getTranslatedField(person, key, person[key] || '', language);
  const localizedName = [language, 'uz', 'en', 'ru'].map((key) => {
    const value = person[key] || person.translations?.[key] || {};
    return value.fullName || [value.firstName, value.lastName].filter(Boolean).join(' ');
  }).find(Boolean);
  const name = localizedName || person.fullName || [person.firstName, person.lastName].filter(Boolean).join(' ') || read('name') || read('title') || ui.unspecified;
  const position = read('position') || read('jobTitle');
  const reception = String(read('receptionTime') || read('receptionHours') || read('reception'))
    .replace(/^(?:Qabul\s+vaqti|Время\s+при[её]ма|Office\s+hours)\s*:\s*/i, '').trim();
  const phone = person.phone || person.phoneNumber;
  const email = person.email;
  const socials = SOCIALS.map(([key, label, Icon]) => ({
    key, label, Icon, url: safeSocialUrl(person.socialLinks?.[key] || person.socials?.[key] || person[key], key)
  })).filter((item) => item.url);
  const sections = (Array.isArray(person.sections) ? person.sections : []).filter((item) => item.active !== false).map((item, sectionIndex) => ({
    id: item.id || sectionIndex,
    title: getTranslatedField(item, 'title', item.title || '', language),
    content: getTranslatedField(item, 'content', item.content || '', language)
  })).filter((item) => hasContent(item.content) || item.title);
  const legacyContent = read('content') || read('description') || read('about');
  if (hasContent(legacyContent)) sections.unshift({ id: 'intro', title: '', content: legacyContent });
  const expandable = sections.length > 0;

  return (
    <article className={`leadership-card${expanded && expandable ? ' is-expanded' : ''}`} style={{ '--card-delay': `${Math.min(index, 8) * 60}ms` }}>
      <div className="leadership-card-summary">
        {expandable && <button type="button" className="leadership-card-toggle" aria-expanded={expanded} aria-controls={panelId}
          aria-label={`${name}: ${expanded ? ui.close : ui.more}`} onClick={() => setExpanded((value) => !value)} />}
        <div className="leadership-card-photo">
          <div className="leadership-photo-placeholder"><FiUser size={58} aria-hidden="true" /></div>
          {(person.image || person.photo) && <img key={person.image || person.photo} src={person.image || person.photo} alt={name} loading={index < 2 ? 'eager' : 'lazy'}
            onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />}
        </div>
        <div className="leadership-card-details">
          <div className="leadership-card-identity">
            <h2>{name}</h2>
            {position && <p className="leadership-position">{position}</p>}
          </div>
          <dl className="leadership-information">
            {reception && <div className="leadership-info-item">
              <dt><span className="leadership-info-icon"><FiCalendar aria-hidden="true" /></span>{ui.reception}</dt>
              <dd>{reception}</dd>
            </div>}
            {email && <div className="leadership-info-item">
              <dt><span className="leadership-info-icon"><FiMail aria-hidden="true" /></span>{ui.email}</dt>
              <dd><a href={`mailto:${email}`}>{email}</a></dd>
            </div>}
            {phone && <div className="leadership-info-item">
              <dt><span className="leadership-info-icon"><FiPhone aria-hidden="true" /></span>{ui.phone}</dt>
              <dd><a href={`tel:${String(phone).replace(/[^\d+]/g, '')}`}>{phone}</a></dd>
            </div>}
          </dl>
          <div className="leadership-card-footer">
            {socials.length > 0 && <nav className="leadership-social-links" aria-label={`${name}: ${ui.social}`}>
              {socials.map(({ key, url, label, Icon }) => <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                className="leadership-social-button" aria-label={label} title={label}><Icon size={18} aria-hidden="true" /></a>)}
            </nav>}
            {expandable && <span className="leadership-more" aria-hidden="true">{expanded ? ui.close : ui.more}<FiChevronDown size={18} /></span>}
          </div>
        </div>
      </div>
      {expandable && <div id={panelId} role="region" aria-label={`${name}: ${ui.about}`} aria-hidden={!expanded} className="leadership-expanded">
        <div className="leadership-expanded-inner">
          <div className="leadership-expanded-content">
            {sections.map((item) => <section key={item.id} className="leadership-text-section">
              {item.title && <h3>{item.title}</h3>}
              {item.content && <div className="leadership-rich-text" dangerouslySetInnerHTML={createSafeMarkup(item.content)} />}
            </section>)}
          </div>
        </div>
      </div>}
    </article>
  );
}

export default function LeadershipPage() {
  const { currentLanguageCode } = useLanguage();
  const ui = LABELS[currentLanguageCode] || LABELS.uz;
  const { items = [], loading } = useContentList('leadership', { activeOnly: true, summaryOnly: false });
  const leaders = useMemo(() => [...items].filter((item) => item && item.active !== false)
    .sort((a, b) => Number(a.sortOrder ?? a.order ?? 0) - Number(b.sortOrder ?? b.order ?? 0)), [items]);

  return (
    <main className="leadership-page">
      <div className="leadership-layout">
        <section className="leadership-main">
          {loading ? <div className="leadership-grid" aria-busy="true" aria-label={ui.loading}>
            {[0, 1, 2].map((index) => <div className="leadership-skeleton" key={index}>
              <div className="leadership-skeleton-photo" /><div className="leadership-skeleton-info">
                <div className="leadership-skeleton-line short" /><div className="leadership-skeleton-line" /><div className="leadership-skeleton-line" />
              </div>
            </div>)}
          </div> : leaders.length === 0 ? <div className="leadership-empty"><FiUser size={38} aria-hidden="true" /><h2>{ui.empty}</h2></div>
            : <div className="leadership-grid">{leaders.map((person, index) => <LeadershipCard key={person.id ?? index} person={person} index={index} ui={ui} language={currentLanguageCode} />)}</div>}
        </section>
        <aside className="leadership-sidebar"><AcademicSidebar /></aside>
      </div>
    </main>
  );
}
