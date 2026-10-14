import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '../../assets/styles/NewsPages.css';
import { useContentList } from '../../hooks/useContentList';
import { formatCmsDate, getHtmlExcerpt, getTranslatedField, sortContentByNewest } from '../../utils/cms';

function NewsImage({ src, alt }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className={`np-photo ${broken || !src ? 'np-photo--placeholder' : ''}`}>
      {!broken && src ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <svg className="np-placeholder-icon" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="8" y="13" width="48" height="38" rx="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="23" cy="26" r="5" stroke="currentColor" strokeWidth="2" />
          <path d="m11 46 13-12 10 9 9-8 10 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="np-image-shine" aria-hidden="true" />
    </div>
  );
}

function NewsCard({ item, index }) {
  return (
    <article className="np-card" style={{ '--np-index': index }}>
      <Link to={item.url} className="np-image-link" aria-label={`${item.title} - batafsil`}>
        <NewsImage src={item.image} alt={item.title} />
      </Link>

      <div className="np-card-content">
        <div className="np-meta">
          <span className="np-category">{item.category}</span>
          <time dateTime={item.dateTime}>{item.date}</time>
        </div>
        <h2 className="np-card-title">
          <Link to={item.url}>{item.title}</Link>
        </h2>
        <p className="np-excerpt">{item.excerpt}</p>
        <div className="np-card-footer">
          <Link className="np-more" to={item.url}>Batafsil <span aria-hidden="true">&gt;</span></Link>
          <span className="np-dots" aria-hidden="true"><i/><i/><i/></span>
        </div>
      </div>
    </article>
  );
}

function normalizeNewsItem(item = {}) {
  const title = getTranslatedField(item, 'title', item.title || 'Yangilik');
  const content = getTranslatedField(item, 'content', item.content || item.excerpt || '');
  const createdAt = item.createdAt || item.date || item.updatedAt;
  const dateValue = createdAt ? new Date(createdAt) : null;
  const dateTime = dateValue && !Number.isNaN(dateValue.getTime()) ? dateValue.toISOString() : undefined;

  return {
    id: item.id,
    category: getTranslatedField(item, 'category', item.category || 'Yangilik'),
    date: formatCmsDate(createdAt),
    dateTime,
    title,
    excerpt: getHtmlExcerpt(content, 150),
    image: item.image,
    url: item.url || `/news/page/${item.id}`
  };
}

export default function NewsPage({ news, pageSize = 6 }) {
  const shouldLoadFromServer = !Array.isArray(news);
  const { items, loading } = useContentList('news', {
    enabled: shouldLoadFromServer,
    orderBy: 'recent',
    revalidate: true
  });
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const normalizedNews = useMemo(
    () => (Array.isArray(news) ? news : sortContentByNewest(items)).map(normalizeNewsItem),
    [items, news]
  );
  const visible = normalizedNews.slice(0, visibleCount);

  return (
    <main className="np-page">
      <div className="np-shell">
        <header className="np-header">
          <div className="np-header-rule" aria-hidden="true"><span/><span/></div>
          <p className="np-eyebrow">UNIVERSITET AXBOROT MARKAZI</p>
          <h1>Yangiliklar</h1>
          <p className="np-intro">Universitet hayotidagi so'nggi yangiliklar, tadbirlar va muhim e'lonlar.</p>
        </header>

        <div className="np-grid">
          {visible.map((item, index) => <NewsCard key={item.id} item={item} index={index} />)}
        </div>

        {!normalizedNews.length && (
          <p className="np-empty">
            {loading ? "Yangiliklar yuklanmoqda..." : "Hozircha yangiliklar mavjud emas."}
          </p>
        )}

        {visibleCount < normalizedNews.length && (
          <div className="np-bottom">
            <button type="button" className="np-load-more" onClick={() => setVisibleCount((count) => count + pageSize)}>
              Yana yangiliklar <span aria-hidden="true">{'\u2193'}</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
