import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '../assets/styles/AnnouncementsPage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import AnnouncementImage from '../components/common/AnnouncementImage';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { formatCmsDate, getTranslatedField, sortContentByNewest } from '../utils/cms';

function AnnouncementsPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.announcementsList,
    [currentLanguageCode]
  );
  const { items } = useContentList('announcements', {
    orderBy: 'recent'
  });
  const [page, setPage] = useState(1);
  const perPage = 6;
  const sortedItems = useMemo(() => sortContentByNewest(items), [items]);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / perPage));

  const currentAnnouncements = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedItems.slice(start, start + perPage);
  }, [page, sortedItems]);

  return (
    <main className="ann-page">
      <div className="ann-layout">
        <section className="ann-main">
          <div className="ann-header">
            <div>
              <span>{texts.eyebrow}</span>
              <h1>{texts.title}</h1>
            </div>

            <p>{texts.description}</p>
          </div>

          <div className="ann-grid">
            {currentAnnouncements.map((item, index) => (
              <article
                className="ann-card"
                key={item.id}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <Link to={`/announcements/page/${item.id}`} className="ann-image">
                  <AnnouncementImage src={item.image} alt={getTranslatedField(item, 'title', item.title)} />
                </Link>

                <div className="ann-body">
                  <span className="ann-date">{formatCmsDate(item.createdAt)}</span>

                  <h3>
                    <Link to={`/announcements/page/${item.id}`} className="ann-title-link">
                      {getTranslatedField(item, 'title', item.title)}
                    </Link>
                  </h3>

                  <Link to={`/announcements/page/${item.id}`} className="ann-btn">
                    {texts.details}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="ann-pagination">
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

        <aside className="ann-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default AnnouncementsPage;
