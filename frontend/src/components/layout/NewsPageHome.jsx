import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContentList } from '../../hooks/useContentList';
import { formatCmsDate, getHtmlExcerpt, getTranslatedField } from '../../utils/cms';
import '../../assets/styles/NewsPageHome.css';

const DEFAULT_PAGE_SIZE = 8;

// Yangilik sanasini timestamp ga aylantirish
function getNewsTime(item) {
  const date = item.createdAt || item.publishedAt || item.date;

  if (!date) return 0;

  // DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
    const [day, month, year] = date.split('.').map(Number);
    return new Date(year, month - 1, day).getTime();
  }

  const timestamp = new Date(date).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// Rasm komponenti
function NewsImage({ src, alt }) {
  const [broken, setBroken] = useState(false);

  return (
    <div
      className={`np-photo ${
        broken || !src ? 'np-photo--placeholder' : ''
      }`}
    >
      {!broken && src ? (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <svg
          className="np-placeholder-icon"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="8"
            y="13"
            width="48"
            height="38"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
          />

          <circle
            cx="23"
            cy="26"
            r="5"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="m11 46 13-12 10 9 9-8 10 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <span className="np-image-shine" aria-hidden="true" />
    </div>
  );
}

// Yangilik kartasi
function NewsCard({ item, index }) {
  const newsUrl = item.url || `/news/page/${item.id}`;

  return (
    <article
      className="np-card"
      style={{ '--np-index': index }}
    >
      <Link
        to={newsUrl}
        className="np-image-link"
        aria-label={`${item.title} — batafsil`}
      >
        <NewsImage
          key={item.image}
          src={item.image}
          alt={item.title}
        />
      </Link>

      <div className="np-card-content">
        <div className="np-meta">
          {item.category && (
            <span className="np-category">
              {item.category}
            </span>
          )}

          <time>
            {item.date}
          </time>
        </div>

        <h2 className="np-card-title">
          <Link to={newsUrl}>
            {item.title}
          </Link>
        </h2>

        {item.excerpt && (
          <p className="np-excerpt">
            {item.excerpt}
          </p>
        )}

        <div className="np-card-footer">
          <Link
            className="np-more"
            to={newsUrl}
          >
            Batafsil
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

// HOME YANGILIKLAR KOMPONENTI
export default function NewsPageHome({
  news,
  pageSize = DEFAULT_PAGE_SIZE,
  showFilters = false
}) {
  const hasProvidedNews = Array.isArray(news);
  const visibleLimit = Math.min(DEFAULT_PAGE_SIZE, Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE));
  const { items, loading } = useContentList('news', {
    enabled: !hasProvidedNews,
    orderBy: 'recent',
    limit: showFilters ? undefined : visibleLimit,
    revalidate: true
  });
  const newsItems = hasProvidedNews ? news : items;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');

  // Eng oxirgi qo'shilgan yangiliklar birinchi chiqadi
  const sortedNews = useMemo(() => {
    return [...newsItems].sort(
      (a, b) => getNewsTime(b) - getNewsTime(a) || Number(b.id) - Number(a.id)
    );
  }, [newsItems]);

  const localizedNews = sortedNews.map(item => ({
    ...item,
    title: getTranslatedField(item, 'title', item.title),
    excerpt: getHtmlExcerpt(
      getTranslatedField(item, 'excerpt', item.excerpt) ||
      getTranslatedField(item, 'content', item.content)
    ),
    date: formatCmsDate(item.createdAt || item.publishedAt || item.date)
  }));

  // Kategoriyalar
  const categories = useMemo(() => {
    return [
      'Barchasi',
      ...new Set(
        sortedNews
          .map(item => item.category)
          .filter(Boolean)
      )
    ];
  }, [sortedNews]);

  // Qidiruv va kategoriya filtri
  const filteredNews = localizedNews.filter(item => {
    const categoryMatch =
      category === 'Barchasi' ||
      item.category === category;

    const searchText = `
      ${item.title || ''}
      ${item.excerpt || ''}
      ${item.category || ''}
    `.toLocaleLowerCase('uz');

    const searchMatch = searchText.includes(
      search.toLocaleLowerCase('uz').trim()
    );

    return categoryMatch && searchMatch;
  });

  // HOME: maksimum 8 ta; kichik ekranlarda CSS ikki qatorni ko'rsatadi.
  const visibleNews = filteredNews.slice(
    0,
    visibleLimit
  );

  return (
    <section className="np-page" aria-busy={loading}>
      <div className="np-shell">

        {/* HEADER */}
        <header className="np-header">
          <div
            className="np-header-rule"
            aria-hidden="true"
          >
            <span />
            <span />
          </div>

          <p className="np-eyebrow">
            UNIVERSITET AXBOROT MARKAZI
          </p>

          <h1>Yangiliklar</h1>

          <p className="np-intro">
            Universitet hayotidagi so‘nggi yangiliklar,
            tadbirlar va muhim e’lonlar.
          </p>
        </header>

        {/* FILTER - kerak bo'lganda */}
        {showFilters && (
          <div className="np-toolbar">
            <div
              className="np-filters"
              role="group"
              aria-label="Yangiliklar kategoriyasi"
            >
              {categories.map(name => (
                <button
                  key={name}
                  type="button"
                  className={`np-filter ${
                    category === name ? 'is-active' : ''
                  }`}
                  aria-pressed={category === name}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <label className="np-search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 5 5" />
              </svg>

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Yangiliklarni qidirish..."
                aria-label="Yangiliklarni qidirish"
              />
            </label>
          </div>
        )}

        {/* EKRAN KENGLIGIGA MOS ENG YANGI YANGILIKLAR */}
        <div className="np-grid">
          {visibleNews.map((item, index) => (
            <NewsCard
              key={item.id || item.slug || index}
              item={item}
              index={index}
            />
          ))}
        </div>

        {visibleNews.length === 0 && (
          <p className="np-empty" role="status">
            {loading
              ? 'Yangiliklar yuklanmoqda...'
              : 'Hozircha yangiliklar mavjud emas.'}
          </p>
        )}

        {/* BATAFSIL — /news GA O'TADI */}
        {sortedNews.length > 0 && (
          <div className="np-bottom">
            <Link
              to="/news"
              className="np-load-more"
            >
              Batafsil
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
