import React from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/NewsDetailPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, formatCmsDate, getTranslatedField } from '../utils/cms';

function NewsDetailPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.newsDetail,
    [currentLanguageCode]
  );
  const { item, loading } = useContentItem('news', id);

  if (loading) {
    return <main className="news-detail-page" />;
  }

  if (!item) {
    return (
      <main className="news-detail-page">
        <div className="news-not-found">
          <h1>{texts.notFoundTitle}</h1>
          <Link to="/news">← {texts.backToList}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="news-detail-page">
      <div className="news-detail-layout">
        <article className="news-detail-main">
          <div className="news-detail-hero">
            <img src={item.image} alt={getTranslatedField(item, 'title', item.title)} />

            <div className="news-detail-hero-overlay">
              <Link to="/news" className="news-back">
                ← {texts.backToList}
              </Link>

              <span className="news-detail-label">{texts.label}</span>
              <h1>{getTranslatedField(item, 'title', item.title)}</h1>

              <div className="news-detail-date">{formatCmsDate(item.createdAt)}</div>
            </div>
          </div>

          <div
            className="news-detail-body"
            dangerouslySetInnerHTML={createSafeMarkup(
              getTranslatedField(item, 'content'),
              `<p>${texts.emptyContent}</p>`
            )}
          />
        </article>

        <aside className="news-detail-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default NewsDetailPage;
