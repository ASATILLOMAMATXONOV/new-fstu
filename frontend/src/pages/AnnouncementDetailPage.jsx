import React from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import AnnouncementImage from '../components/common/AnnouncementImage';
import '../assets/styles/AnnouncementDetailPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, formatCmsDate, getTranslatedField } from '../utils/cms';

function AnnouncementDetailPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.announcementDetail,
    [currentLanguageCode]
  );
  const { item, loading } = useContentItem('announcements', id);

  if (loading) {
    return <main className="ann-detail-page" />;
  }

  if (!item) {
    return (
      <main className="ann-detail-page">
        <div className="ann-not-found">
          <h1>{texts.notFoundTitle}</h1>
          <Link to="/announcements">← {texts.backToList}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ann-detail-page">
      <div className="ann-detail-layout">
        <article className="ann-detail-card">
          <div className="ann-detail-top">
            <Link to="/announcements" className="ann-detail-back">
              ← {texts.backToList}
            </Link>

            <span className="ann-detail-date">{formatCmsDate(item.createdAt)}</span>
          </div>

          <div className="ann-detail-image-wrap">
            <AnnouncementImage
              src={item.image}
              alt={getTranslatedField(item, 'title', item.title)}
              priority
            />
          </div>

          <div className="ann-detail-content">
            <span className="ann-detail-label">{texts.label}</span>
            <h1>{getTranslatedField(item, 'title', item.title)}</h1>

            <div
              dangerouslySetInnerHTML={createSafeMarkup(
                getTranslatedField(item, 'content'),
                `<p>${texts.emptyContent}</p>`
              )}
            />
          </div>
        </article>

        <aside className="ann-detail-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default AnnouncementDetailPage;
