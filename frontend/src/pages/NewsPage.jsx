
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { Link } from 'react-router-dom';

import '../assets/styles/NewsPage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';

import {
  formatCmsDate,
  getTranslatedField,
  sortContentByNewest
} from '../utils/cms';

const PER_PAGE = 6;

/* =====================================
   HELPERS
===================================== */

function stripHtml(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getNewsTitle(item) {
  return getTranslatedField(
    item,
    'title',
    item.title || ''
  );
}

function getNewsDescription(item) {
  const fields = [
    'excerpt',
    'description',
    'summary',
    'content'
  ];

  for (const field of fields) {
    const translated = getTranslatedField(
      item,
      field,
      item[field] || ''
    );

    const text = stripHtml(translated);

    if (text) return text;
  }

  return '';
}

function getNewsCategory(item) {
  const category = getTranslatedField(
    item,
    'category',
    item.category || ''
  );

  if (typeof category === 'object' && category !== null) {
    return category.name || category.title || '';
  }

  return typeof category === 'string' ? category : '';
}

function getNewsDate(item) {
  return (
    item.createdAt ||
    item.publishedAt ||
    item.date ||
    ''
  );
}

/* =====================================
   NEWS IMAGE
===================================== */

function NewsImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="all-news-image-inner">
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="all-news-placeholder">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="8"
              y="12"
              width="48"
              height="40"
              rx="3"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="23"
              cy="25"
              r="5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m10 46 14-13 11 10 9-9 10 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/* =====================================
   NEWS CARD
===================================== */

function NewsCard({ item, index, detailsText }) {
  const title = getNewsTitle(item);
  const description = getNewsDescription(item);
  const category = getNewsCategory(item);
  const date = getNewsDate(item);

  const url = `/news/page/${item.id}`;

  return (
    <article
      className="all-news-card"
      style={{ '--news-index': index }}
    >
      <Link
        to={url}
        className="all-news-image"
        aria-label={title}
      >
        <NewsImage
          src={item.image}
          alt={title}
        />
      </Link>

      <div className="all-news-body">

        <div className="all-news-meta">
          {category && (
            <span className="all-news-category">
              {category}
            </span>
          )}

          {date && (
            <time className="all-news-date">
              {formatCmsDate(date)}
            </time>
          )}
        </div>

        <h3 className="all-news-card-title">
          <Link
            to={url}
            className="all-news-title-link"
          >
            {title}
          </Link>
        </h3>

        {description && (
          <p className="all-news-description">
            {description}
          </p>
        )}

        <div className="all-news-card-footer">
          <Link
            to={url}
            className="all-news-btn"
          >
            {detailsText || 'Batafsil'}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

      </div>
    </article>
  );
}

/* =====================================
   PAGINATION
===================================== */

function NewsPagination({
  page,
  totalPages,
  onChange,
  previous,
  next
}) {
  if (totalPages <= 1) return null;

  const pages = [];

  for (let number = 1; number <= totalPages; number++) {
    if (
      number === 1 ||
      number === totalPages ||
      Math.abs(number - page) <= 1
    ) {
      pages.push(number);
    }
  }

  const paginationItems = [];

  pages.forEach((number, index) => {
    if (index > 0 && number - pages[index - 1] > 1) {
      paginationItems.push(`dots-${number}`);
    }

    paginationItems.push(number);
  });

  return (
    <nav
      className="all-news-pagination"
      aria-label="Yangiliklar sahifalari"
    >
      <button
        type="button"
        className="all-news-page-arrow"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <span aria-hidden="true">←</span>
        <span>{previous || 'Oldingi'}</span>
      </button>

      <div className="all-news-page-numbers">
        {paginationItems.map(number => {
          if (typeof number === 'string') {
            return (
              <span
                key={number}
                className="all-news-page-dots"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={number}
              type="button"
              className={page === number ? 'active' : ''}
              aria-current={
                page === number ? 'page' : undefined
              }
              aria-label={`${number}-sahifa`}
              onClick={() => onChange(number)}
            >
              {number}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="all-news-page-arrow"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span>{next || 'Keyingi'}</span>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}

/* =====================================
   MAIN NEWS PAGE
===================================== */

function NewsPage() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages.newsList,
    [currentLanguageCode]
  );

  // MAVJUD BACKEND ULANISHI
  const { items, loading, error } = useContentList('news', {
    orderBy: 'recent',
    revalidate: true
  });

  const [page, setPage] = useState(1);
  const contentRef = useRef(null);

  // Eng yangi yangiliklar birinchi
  const sortedItems = useMemo(() => {
    return sortContentByNewest(
      Array.isArray(items) ? items : []
    );
  }, [items]);

  const totalItems = sortedItems.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const currentNews = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;

    return sortedItems.slice(
      start,
      start + PER_PAGE
    );
  }, [currentPage, sortedItems]);

  // Til o'zgarganda birinchi sahifaga qaytish
  useEffect(() => {
    setPage(1);
  }, [currentLanguageCode]);

  function handlePageChange(nextPage) {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === currentPage
    ) {
      return;
    }

    setPage(nextPage);

    if (contentRef.current) {
      const top =
        contentRef.current.getBoundingClientRect().top +
        window.scrollY -
        95;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches
          ? 'auto'
          : 'smooth'
      });
    }
  }

  return (
    <main className="all-news-page">

      <div className="all-news-layout">

        {/* ========== NEWS CONTENT ========== */}

        <section
          className="all-news-main"
          ref={contentRef}
        >
          <div className="all-news-section-head">

            <div className="all-news-section-title">
              <span
                className="all-news-section-line"
                aria-hidden="true"
              />

              <div>
                <p>FSTU AXBOROT MARKAZI</p>
                <h1>Barcha materiallar</h1>
              </div>
            </div>

            <span className="all-news-total">
              {String(totalItems).padStart(2, '0')}
            </span>

          </div>

          {/* NEWS COUNT */}

          {!loading && !error && totalItems > 0 && (
            <div className="all-news-results">
              <span>
                Jami {totalItems} ta yangilik
              </span>

              <span>
                {currentPage} / {totalPages} sahifa
              </span>
            </div>
          )}

          {/* LOADING */}

          {loading && totalItems === 0 && (
            <div
              className="all-news-loading"
              role="status"
            >
              Yangiliklar yuklanmoqda...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && totalItems === 0 && (
            <div
              className="all-news-empty"
              role="alert"
            >
              Yangiliklarni yuklashda xatolik yuz berdi.
            </div>
          )}

          {/* ALL NEWS GRID */}

          {currentNews.length > 0 && (
            <div
              className="all-news-grid"
              key={currentPage}
            >
              {currentNews.map((item, index) => (
                <NewsCard
                  key={item.id ?? index}
                  item={item}
                  index={index}
                  detailsText={texts.details}
                />
              ))}
            </div>
          )}

          {/* EMPTY */}

          {!loading && !error && totalItems === 0 && (
            <div className="all-news-empty">
              <h3>Yangiliklar mavjud emas</h3>
              <p>
                Hozircha universitet yangiliklari
                joylashtirilmagan.
              </p>
            </div>
          )}

          {/* PAGINATION */}

          {totalItems > 0 && (
            <NewsPagination
              page={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
              previous={texts.previous}
              next={texts.next}
            />
          )}

        </section>

        {/* ========== SIDEBAR ========== */}

        <aside className="all-news-sidebar">
          <AcademicSidebar />
        </aside>

      </div>
    </main>
  );
}

export default NewsPage;
