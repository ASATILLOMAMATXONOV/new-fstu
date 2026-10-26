
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '../assets/styles/AnnouncementsPage.css';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import AnnouncementImage from '../components/common/AnnouncementImage';

import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';

import {
  formatCmsDate,
  getTranslatedField,
  sortContentByNewest
} from '../utils/cms';

const ITEMS_PER_PAGE = 6;

function CalendarIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function AnnouncementCard({ item, index, detailsText }) {
  const title = getTranslatedField(
    item,
    'title',
    item.title
  );

  const detailPath = `/announcements/page/${item.id}`;

  return (
    <article
      className="ann-card"
      style={{
        animationDelay: `${index * 0.07}s`
      }}
    >
      <Link
        to={detailPath}
        className="ann-image"
        aria-label={title}
      >
        <div className="ann-image-inner">
          <AnnouncementImage
            src={item.image}
            alt={title}
          />
        </div>
      </Link>

      <div className="ann-body">
        <div className="ann-card-meta">
          <span className="ann-date">
            <CalendarIcon />
            <span>{formatCmsDate(item.createdAt)}</span>
          </span>
        </div>

        <h3 className="ann-card-title">
          <Link
            to={detailPath}
            className="ann-title-link"
          >
            {title}
          </Link>
        </h3>

        <Link to={detailPath} className="ann-btn">
          <span>{detailsText}</span>
          <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}

function AnnouncementsPage() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages.announcementsList,
    [currentLanguageCode]
  );

  const { items = [] } = useContentList('announcements', {
    orderBy: 'recent'
  });

  const [page, setPage] = useState(1);

  const sortedItems = useMemo(
    () => sortContentByNewest(items),
    [items]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedItems.length / ITEMS_PER_PAGE)
  );

  const activePage = Math.min(page, totalPages);

  const currentAnnouncements = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;

    return sortedItems.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [activePage, sortedItems]);

  useEffect(() => {
    setPage(1);
  }, [currentLanguageCode]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  return (
    <main className="ann-page">
      <div className="ann-layout">
        <section className="ann-main">

          {/* HEADER */}
          <header className="ann-header">
            <div className="ann-header-content">
              <span className="ann-eyebrow">
                {texts.eyebrow}
              </span>

              <h1>{texts.title}</h1>
            </div>

            <p className="ann-description">
              {texts.description}
            </p>
          </header>

          {/* ANNOUNCEMENTS */}
          <div className="ann-grid">
            {currentAnnouncements.map((item, index) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                index={index}
                detailsText={texts.details}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <nav
              className="ann-pagination"
              aria-label="Announcements pagination"
            >
              <button
                type="button"
                className="ann-pagination-nav"
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
              >
                {texts.previous}
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      className={
                        activePage === pageNumber
                          ? 'ann-page-number active'
                          : 'ann-page-number'
                      }
                      onClick={() => handlePageChange(pageNumber)}
                      aria-current={
                        activePage === pageNumber
                          ? 'page'
                          : undefined
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}

              <button
                type="button"
                className="ann-pagination-nav"
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
              >
                {texts.next}
              </button>
            </nav>
          )}
        </section>

        {/* SIDEBAR */}
        <aside className="ann-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default AnnouncementsPage;
