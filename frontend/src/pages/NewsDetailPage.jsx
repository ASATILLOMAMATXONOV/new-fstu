
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';

import '../assets/styles/NewsDetailPage.css';

import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';

import {
  createSafeMarkup,
  getTranslatedField
} from '../utils/cms';

/* ============================================
   NEWS DETAIL PAGE
============================================ */

function NewsDetailPage() {
  const { id } = useParams();

  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () =>
      getSiteMessages(currentLanguageCode).pages.newsDetail,
    [currentLanguageCode]
  );

  const { item, loading } = useContentItem('news', id);

  /* LOADING */

  if (loading) {
    return (
      <main className="news-detail-page">
        <div className="news-detail-loading">
          <div className="news-detail-loading-image" />
          <div className="news-detail-loading-text" />
          <div className="news-detail-loading-text short" />
        </div>
      </main>
    );
  }

  /* NOT FOUND */

  if (!item) {
    return (
      <main className="news-detail-page">
        <div className="news-not-found">
          <h1>{texts.notFoundTitle}</h1>

          <Link to="/news">
            ← {texts.backToList}
          </Link>
        </div>
      </main>
    );
  }

  /* CMS DATA */

  const title = getTranslatedField(
    item,
    'title',
    item.title || ''
  );

  const image =
    item.image ||
    item.cover ||
    item.photo ||
    '';

  const content = getTranslatedField(
    item,
    'content',
    ''
  );

  return (
    <main className="news-detail-page">
      <div className="news-detail-layout">

        {/* MAIN NEWS */}

        <article className="news-detail-main">

          {/* FIXED HEIGHT IMAGE */}

          {image && (
            <figure className="news-detail-image">
              <img
                src={image}
                alt={title || texts.label}
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </figure>
          )}

          {/* NEWS CONTENT — NO TITLE */}

          <div
            className="news-detail-body"
            dangerouslySetInnerHTML={createSafeMarkup(
              content,
              `<p>${texts.emptyContent}</p>`
            )}
          />

        </article>

        {/* SIDEBAR */}

        <aside className="news-detail-sidebar">
          <AcademicSidebar />
        </aside>

      </div>
    </main>
  );
}

export default NewsDetailPage;
