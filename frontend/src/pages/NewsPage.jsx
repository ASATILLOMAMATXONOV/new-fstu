import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '../assets/styles/NewsPage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { formatCmsDate, getTranslatedField, sortContentByNewest } from '../utils/cms';

function NewsPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.newsList,
    [currentLanguageCode]
  );
  const { items } = useContentList('news', {
    orderBy: 'recent',
    revalidate: true
  });
  const [page, setPage] = useState(1);
  const perPage = 6;
  const sortedItems = useMemo(() => sortContentByNewest(items), [items]);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / perPage));
  const featuredItem = sortedItems[0];

  const currentNews = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedItems.slice(start, start + perPage);
  }, [page, sortedItems]);

  return (
    <main className="all-news-page">
      <section className="all-news-hero">
        <div className="all-news-hero-copy">
          <span>FSTU MEDIA</span>
          <h1>Universitet yangiliklari</h1>
          <p>
            Kampusdagi eng so‘nggi xabarlar, e’lonlar va muhim voqealar bitta sahifada.
          </p>
        </div>

        {featuredItem ? (
          <Link to={`/news/page/${featuredItem.id}`} className="all-news-featured">
            <img
              src={featuredItem.image}
              alt={getTranslatedField(featuredItem, 'title', featuredItem.title)}
            />
            <span>{formatCmsDate(featuredItem.createdAt)}</span>
            <strong>{getTranslatedField(featuredItem, 'title', featuredItem.title)}</strong>
          </Link>
        ) : null}
      </section>

      <div className="all-news-layout">
        <section className="all-news-main">
          <div className="all-news-section-head">
            <span>{String(sortedItems.length).padStart(2, '0')}</span>
            <h2>Barcha materiallar</h2>
          </div>

          <div className="all-news-grid">
            {currentNews.map((item, index) => (
              <article
                className="all-news-card"
                key={item.id}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <Link to={`/news/page/${item.id}`} className="all-news-image">
                  <img src={item.image} alt={getTranslatedField(item, 'title', item.title)} />
                </Link>

                <div className="all-news-body">
                  <span className="all-news-date">{formatCmsDate(item.createdAt)}</span>

                  <h3>
                    <Link to={`/news/page/${item.id}`} className="all-news-title-link">
                      {getTranslatedField(item, 'title', item.title)}
                    </Link>
                  </h3>

                  <Link to={`/news/page/${item.id}`} className="all-news-btn">
                    {texts.details}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="all-news-pagination">
              <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                {texts.previous}
              </button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={page === index + 1 ? 'active' : ''}
                  onClick={() => setPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
                {texts.next}
              </button>
            </div>
          )}
        </section>

        <aside className="all-news-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default NewsPage;
