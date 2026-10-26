import React, { useEffect, useMemo, useState } from 'react';
import '../assets/styles/PartnersPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getTranslatedField } from '../utils/cms';

const LABELS = {
  uz: { search: 'Hamkorlarni qidirish...', empty: 'Hamkorlar topilmadi', loading: 'Ma’lumotlar yuklanmoqda...', clear: 'Qidiruvni tozalash', unavailable: 'Rasmiy sayt ko‘rsatilmagan' },
  ru: { search: 'Поиск партнёров...', empty: 'Партнёры не найдены', loading: 'Загрузка...', clear: 'Очистить поиск', unavailable: 'Официальный сайт не указан' },
  en: { search: 'Search partners...', empty: 'No partners found', loading: 'Loading...', clear: 'Clear search', unavailable: 'Official website not provided' }
};

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <path d="M7 17 17 7M8 7h9v9" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18"/></>,
    network: <><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.globe}</svg>;
}

function PartnerLogo({ src, title }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img src={src} alt={title} loading="lazy" decoding="async" draggable={false} onError={() => setFailed(true)} />
  ) : (
    <span className="pp-logo-fallback"><Icon name="globe" size={38} /></span>
  );
}

function PartnerCard({ partner, index, texts, labels }) {
  const title = String(getTranslatedField(partner, 'title', partner.title || 'Partner'));
  const link = typeof partner.link === 'string' ? partner.link.trim() : '';
  const validLink = /^https?:\/\//i.test(link);
  let domain = '';
  if (validLink) {
    try { domain = new URL(link).hostname.replace(/^www\./, ''); } catch { /* Invalid URL */ }
  }
  return (
    <article className="pp-card" style={{ '--pp-index': Math.min(index, 10) }}>
      <div className="pp-card-top">
        <span className="pp-card-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="pp-card-symbol"><Icon name="network" size={17}/></span>
      </div>
      <div className="pp-card-logo"><div className="pp-card-logo-inner"><PartnerLogo src={partner.image} title={title}/></div></div>
      <div className="pp-card-info">
        <span className="pp-card-eyebrow"><span className="pp-status-dot"/>{texts.partnerBadge}</span>
        <h3 className="pp-card-title" title={title}>{title}</h3>
        {domain && <p className="pp-card-domain" title={domain}>{domain}</p>}
      </div>
      <div className="pp-card-footer">
        {validLink ? (
          <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`${title} — ${texts.officialSite}`}>
            <span>{texts.officialSite}</span><span className="pp-card-link-icon"><Icon name="arrow" size={17}/></span>
          </a>
        ) : <span className="pp-card-no-link">{labels.unavailable}</span>}
      </div>
      <span className="pp-card-sheen" aria-hidden="true" />
    </article>
  );
}

export default function PartnersPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = useMemo(() => getSiteMessages(currentLanguageCode).pages.partnersPage, [currentLanguageCode]);
  const labels = LABELS[currentLanguageCode] || LABELS.uz;
  const { items: rawPartners = [], loading } = useContentList('partners', { revalidate: true });
  const [search, setSearch] = useState('');
  const partners = useMemo(() => (Array.isArray(rawPartners) ? rawPartners.filter(Boolean) : []), [rawPartners]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return partners;
    return partners.filter(partner => {
      const title = getTranslatedField(partner, 'title', partner.title || '');
      return `${title} ${partner.link || ''}`.toLocaleLowerCase().includes(query);
    });
  }, [partners, search, currentLanguageCode]);

  return (
    <main className="partners-page" id="xalqaro">
      <section className="pp-content" id="partners-grid">
        <header className="pp-section-heading">
          <div className="pp-heading-main">
            <div className="pp-eyebrow"><span/>{texts.listEyebrow}</div>
            <h1>{texts.listTitle}</h1>
            <p>{texts.listDescription}</p>
          </div>
          <div className="pp-result-count" aria-live="polite"><Icon name="grid" size={17}/><strong>{filtered.length}</strong><span>/ {partners.length}</span></div>
        </header>
        <div className="pp-toolbar">
          <label className="pp-search"><Icon name="search" size={19}/><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={labels.search} aria-label={labels.search}/></label>
          {search && <button className="pp-clear" type="button" onClick={() => setSearch('')} aria-label={labels.clear}><Icon name="close" size={16}/></button>}
          <div className="pp-toolbar-meta"><span className="pp-live-dot"/><span>{filtered.length} / {partners.length}</span></div>
        </div>
        {filtered.length ? (
          <div className="pp-grid">
            {filtered.map((partner, index) => <PartnerCard key={partner.id ?? index} partner={partner} index={index} texts={texts} labels={labels}/>)}
          </div>
        ) : (
          <div className="pp-empty" aria-live="polite"><Icon name="search" size={32}/><strong>{loading ? labels.loading : labels.empty}</strong></div>
        )}
      </section>
    </main>
  );
}
