
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementImage from '../common/AnnouncementImage';

import '../../assets/styles/AnnouncementsSection.css';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';

import {
  formatCmsDate,
  getTranslatedField,
  sortContentByNewest
} from '../../utils/cms';

const MAX_ANNOUNCEMENTS = 20;
const AUTOPLAY_DELAY = 4500;
const CAROUSEL_LABELS = {
  uz: { previous: 'Oldingi e’lon', next: 'Keyingi e’lon', pause: 'Avtomatik aylanishni to‘xtatish', play: 'Avtomatik aylanishni yoqish' },
  ru: { previous: 'Предыдущее объявление', next: 'Следующее объявление', pause: 'Остановить автопрокрутку', play: 'Включить автопрокрутку' },
  en: { previous: 'Previous announcement', next: 'Next announcement', pause: 'Pause autoplay', play: 'Start autoplay' }
};
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* =========================================
   TEXT HELPERS
========================================= */

function cleanText(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTitle(item) {
  return getTranslatedField(
    item,
    'title',
    item.title || ''
  );
}

function getDescription(item) {
  const fields = [
    'content',
    'description',
    'excerpt',
    'summary'
  ];

  for (const field of fields) {
    const value = getTranslatedField(
      item,
      field,
      item[field] || ''
    );

    const result = cleanText(value);

    if (result) return result;
  }

  return '';
}

function getDate(item, languageCode) {
  const date =
    item.createdAt ||
    item.publishedAt ||
    item.date;

  if (!date) return '';

  const parsed = new Date(date);
  // Some browsers have incomplete Uzbek month names in their Intl locale data.
  if (languageCode === 'uz' && !Number.isNaN(parsed.getTime())) {
    return `${parsed.getDate()} ${UZ_MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  return formatCmsDate(date);
}

/* =========================================
   COMPACT ANNOUNCEMENT
========================================= */

function AnnouncementCard({ item, index, detailsText, latestText, languageCode, isClone = false }) {
  const title = getTitle(item);
  const description = getDescription(item);
  const date = getDate(item, languageCode);
  const url = `/announcements/page/${item.id}`;

  return (
    <article
      className={`ann-compact-card${index === 0 ? ' ann-compact-card--latest' : ''}`}
      data-announcement-id={String(item.id)}
      data-announcement-clone={isClone || undefined}
      aria-hidden={isClone || undefined}
      data-announcement-index={index}
    >
      <Link
        to={url}
        className="ann-compact-image"
        aria-label={title}
        tabIndex={isClone ? -1 : undefined}
      >
        <AnnouncementImage
          src={item.image}
          alt={title}
          priority={!isClone && index < 4}
          naturalSize
        />
        {index === 0 && <span className="ann-latest-badge">{latestText}</span>}
      </Link>

      <div className="ann-compact-content">
        <div className="ann-compact-meta">
          {date && (
            <time className="ann-compact-date" dateTime={item.createdAt || item.publishedAt || item.date}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6.5 3v3M13.5 3v3M3 8.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {date}
            </time>
          )}
        </div>

        <h3 className="ann-compact-title">
          <Link to={url} title={title} tabIndex={isClone ? -1 : undefined}>
            {title}
          </Link>
        </h3>

        {description && (
          <p className="ann-compact-description">
            {description}
          </p>
        )}

        <div className="ann-card-footer">
          <Link to={url} className="ann-compact-more" tabIndex={isClone ? -1 : undefined}>
            {detailsText || 'Batafsil'}
            <span className="ann-link-arrow"><ArrowIcon /></span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function AnnouncementsCarousel({ items, texts, languageCode }) {
  const viewportRef = useRef(null);
  const moving = useRef(false);
  const swipeStart = useRef(null);
  const swallowClick = useRef(false);
  const buffer = Math.min(4, items.length);
  const [slide, setSlide] = useState({ index: buffer, animate: false });
  const [visibleCount, setVisibleCount] = useState(4);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const labels = CAROUSEL_LABELS[languageCode] || CAROUSEL_LABELS.uz;
  const canSlide = items.length > visibleCount;

  useEffect(() => {
    moving.current = false;
    setSlide(current => ({
      index: buffer + ((current.index - buffer + items.length) % items.length),
      animate: false
    }));
  }, [buffer, items.length, reducedMotion, visibleCount]);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 600px)');
    const tablet = window.matchMedia('(max-width: 1200px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setVisibleCount(mobile.matches ? 1 : tablet.matches ? 2 : 4);
      setReducedMotion(motion.matches);
    };
    update();
    [mobile, tablet, motion].forEach(query => query.addEventListener('change', update));
    return () => [mobile, tablet, motion].forEach(query => query.removeEventListener('change', update));
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return () => document.removeEventListener('visibilitychange', updateVisibility);
    }
    const observer = new IntersectionObserver(entries => {
      setInView(entries.some(entry => entry.isIntersecting));
    }, { threshold: .1 });
    observer.observe(viewportRef.current);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!canSlide || reducedMotion || !inView || !pageVisible || paused || focused) return;
    const timer = setTimeout(() => {
      if (moving.current) return;
      moving.current = true;
      setSlide(current => ({ index: current.index + 1, animate: true }));
    }, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [canSlide, reducedMotion, inView, pageVisible, paused, focused, slide.index]);

  function move(direction) {
    if (!canSlide || moving.current) return;
    const next = slide.index + direction;
    if (reducedMotion) {
      setSlide({ index: buffer + ((next - buffer + items.length) % items.length), animate: false });
      return;
    }
    moving.current = true;
    setSlide({ index: next, animate: true });
  }

  function finishSlide(event) {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    moving.current = false;
    // Identical end copies allow the loop to reset without a visible rewind.
    if (slide.index >= buffer + items.length) setSlide({ index: buffer, animate: false });
    else if (slide.index < buffer) setSlide({ index: buffer + items.length - 1, animate: false });
  }

  const renderCard = (item, index, copy = '') => (
    <AnnouncementCard key={`${copy}${item.id}`} item={item} index={index}
      detailsText={texts.details} latestText={texts.latestAnnouncement}
      languageCode={languageCode} isClone={Boolean(copy)} />
  );

  return (
    <div className="ann-carousel" onFocusCapture={event => {
      const card = event.target.closest('[data-announcement-id]');
      setFocused(Boolean(card));
      if (!card || !canSlide) return;
      const index = Number(card.dataset.announcementIndex);
      const first = ((slide.index - buffer) % items.length + items.length) % items.length;
      if (index < first || index >= first + visibleCount) {
        moving.current = false;
        setSlide({ index: buffer + index, animate: false });
      }
    }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
      <div ref={viewportRef} className="ann-carousel-viewport"
        onPointerDown={event => {
          swallowClick.current = false;
          if (event.pointerType === 'touch' || event.pointerType === 'pen') {
            swipeStart.current = { x: event.clientX, y: event.clientY };
          }
        }}
        onPointerCancel={() => { swipeStart.current = null; }}
        onPointerUp={event => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const delta = event.clientX - start.x;
          if (Math.abs(delta) > 40 && Math.abs(delta) > Math.abs(event.clientY - start.y)) {
            swallowClick.current = true;
            move(delta < 0 ? 1 : -1);
          }
        }}
        onClickCapture={event => {
          if (swallowClick.current) {
            event.preventDefault();
            event.stopPropagation();
            swallowClick.current = false;
          }
        }}>
        <div className={`ann-compact-grid ann-carousel-track${slide.animate && !reducedMotion ? ' ann-carousel-track--moving' : ''}`}
          style={{ '--ann-position': canSlide ? slide.index : 0 }} onTransitionEnd={finishSlide}>
          {canSlide && items.slice(-buffer).map((item, index) => renderCard(item, items.length - buffer + index, 'before-'))}
          {items.map((item, index) => renderCard(item, index))}
          {canSlide && items.slice(0, buffer).map((item, index) => renderCard(item, index, 'after-'))}
        </div>
      </div>
      {canSlide && (
        <div className="ann-carousel-controls">
          <button type="button" className="ann-carousel-button" aria-label={labels.previous} onClick={() => move(-1)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {!reducedMotion && <button type="button" className="ann-carousel-button" aria-label={paused ? labels.play : labels.pause} onClick={() => setPaused(value => !value)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {paused ? <path d="m9 5 10 7-10 7V5Z" fill="currentColor" /> : <path d="M9 6v12M15 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </svg>
          </button>}
          <button type="button" className="ann-carousel-button" aria-label={labels.next} onClick={() => move(1)}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function AnnouncementsSection() {
  const { currentLanguageCode } = useLanguage();
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const texts = useMemo(
    () =>
      getSiteMessages(currentLanguageCode)
        .home.studentAnnouncementStats,
    [currentLanguageCode]
  );

  // MAVJUD BACKEND ULANISHI O'ZGARMAYDI
  const {
    items: announcementItems,
    loading,
    error
  } = useContentList('announcements', {
    limit: MAX_ANNOUNCEMENTS,
    orderBy: 'recent',
    revalidate: true
  });

  const announcements = useMemo(() => {
    return sortContentByNewest(
      Array.isArray(announcementItems)
        ? announcementItems
        : []
    ).slice(0, MAX_ANNOUNCEMENTS);
  }, [announcementItems]);

  return (
    <section ref={sectionRef} className={`ann-section${revealed ? ' ann-section--revealed' : ''}`} aria-labelledby="home-announcements-title">
      <div className="ann-container">

        {/* HEADER */}
        <header className="ann-header">
          <div className="ann-heading">
            <span className="ann-heading-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="m14 5 5-2v16l-5-2H6a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h8V5ZM7 17l1 5h4l-2-5M14 7v10M22 8v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>

            <h2 id="home-announcements-title">{texts.announcementsTitle}</h2>
          </div>

          <Link
            to="/announcements"
            className="ann-see-all"
          >
            {texts.seeAll}
            <span className="ann-link-arrow"><ArrowIcon /></span>
          </Link>
        </header>

        {/* LOADING */}
        {loading && announcements.length === 0 && (
          <div className="ann-status" role="status">
            E’lonlar yuklanmoqda...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && announcements.length === 0 && (
          <div className="ann-status" role="alert">
            E’lonlarni yuklashda xatolik yuz berdi.
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && announcements.length === 0 && (
          <div className="ann-status">
            <h3>{texts.announcementsEmptyTitle}</h3>
            <p>{texts.announcementsEmptyText}</p>
          </div>
        )}

        {/* CONTENT */}
        {announcements.length > 0 && (
          <AnnouncementsCarousel key={announcements.map(item => item.id).join('|')}
            items={announcements} texts={texts} languageCode={currentLanguageCode} />
        )}
      </div>
    </section>
  );
}
