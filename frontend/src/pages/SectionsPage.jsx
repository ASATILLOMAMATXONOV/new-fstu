
import React, { useEffect, useMemo, useState } from 'react';

import '../assets/styles/SectionsPage.css';
import AppLink from '../components/common/AppLink';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getTranslatedField } from '../utils/cms';

const ITEMS_PER_PAGE = 6;

function Icon({ name, size = 20 }) {
  const paths = {
    building: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 21v-5h6v5M8 8h2m4 0h2M8 12h2m4 0h2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    close: <path d="M18 6 6 18M6 6l12 12" />
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function SectionsPage() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages.sectionsList,
    [currentLanguageCode]
  );

  const { items: rawSections = [], loading } = useContentList(
    'faculties',
    { entityType: 'section' }
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const sections = useMemo(() => {
    const list = Array.isArray(rawSections) ? rawSections : [];

    return list.map((section, index) => ({
      ...section,
      _key: String(section.id ?? `section-${index}`),
      displayTitle:
        getTranslatedField(
          section,
          'title',
          section.title || ''
        ) || '',
      displayImage: section.image || ''
    }));
  }, [rawSections, currentLanguageCode]);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return sections;

    return sections.filter((section) =>
      section.displayTitle.toLocaleLowerCase().includes(query)
    );
  }, [sections, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSections.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const currentPage = Math.min(page, totalPages);

  const currentSections = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredSections.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredSections, currentPage]);

  const handlePageChange = (nextPage) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  };

  const firstVisible = filteredSections.length
    ? (currentPage - 1) * ITEMS_PER_PAGE + 1
    : 0;

  const lastVisible = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredSections.length
  );

  return (
    <main className="sections-page">
      <div className="sections-layout">

        {/* ASOSIY QISM */}
        <section className="sections-main">

          {/* QIDIRUV VA RO‘YXAT SARLAVHASI */}
          <div className="sections-toolbar">
            <div className="sections-toolbar__info">
              <span className="sections-toolbar__label">
                BO‘LIMLAR RO‘YXATI
              </span>
            </div>

            <div className="sections-search">
              <Icon name="search" size={18} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Bo‘lim nomini qidirish..."
                aria-label="Bo‘lim nomini qidirish"
              />

              {search && (
                <button
                  type="button"
                  className="sections-search__clear"
                  onClick={() => setSearch('')}
                  aria-label="Qidiruvni tozalash"
                >
                  <Icon name="close" size={15} />
                </button>
              )}
            </div>
          </div>

          {/* YUKLANISH HOLATI */}
          {loading ? (
            <div className="sections-grid" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="sections-card sections-card--skeleton"
                  key={index}
                >
                  <div className="sections-skeleton__image" />

                  <div className="sections-skeleton__body">
                    <div className="sections-skeleton__line short" />
                    <div className="sections-skeleton__line" />
                    <div className="sections-skeleton__line medium" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSections.length === 0 ? (
            /* BO‘SH HOLAT */
            <div className="sections-empty-state">
              <span className="sections-empty-state__icon">
                <Icon name="search" size={28} />
              </span>

              <h2>
                {search.trim()
                  ? 'Bo‘lim topilmadi'
                  : texts.emptyTitle}
              </h2>

              <p>
                {search.trim()
                  ? 'Boshqa nom bilan qidirib ko‘ring.'
                  : texts.emptyText}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                >
                  Qidiruvni tozalash
                </button>
              )}
            </div>
          ) : (
            <>
              {/* BO‘LIM KARTOCHKALARI */}
              <div
                className="sections-grid"
                key={`${currentPage}-${search}`}
              >
                {currentSections.map((section, index) => (
                  <AppLink
                    key={section._key}
                    href={`/sections/${section.id}`}
                    className="sections-card"
                    style={{
                      animationDelay: `${index * 0.065}s`
                    }}
                  >
                    {/* KATTALASHTIRILGAN RASM */}
                    <div className="sections-card__media">
                      {section.displayImage ? (
                        <img
                          src={section.displayImage}
                          alt={section.displayTitle}
                          loading="lazy"
                        />
                      ) : (
                        <div className="sections-card__placeholder">
                          <Icon name="building" size={35} />
                        </div>
                      )}
                    </div>

                    {/* BO‘LIM NOMI */}
                    <div className="sections-card__content">
                      <h3>{section.displayTitle}</h3>

                      <div className="sections-card__footer">
                        <span>{texts.details}</span>

                        <span className="sections-card__arrow">
                          <Icon name="arrow" size={18} />
                        </span>
                      </div>
                    </div>

                    <span
                      className="sections-card__accent"
                      aria-hidden="true"
                    />
                  </AppLink>
                ))}
              </div>

              {/* SAHIFALASH */}
              <div className="sections-list-footer">
                <span className="sections-list-footer__info">
                  {firstVisible}–{lastVisible} /{' '}
                  {filteredSections.length}
                </span>

                {totalPages > 1 && (
                  <nav
                    className="sections-pagination"
                    aria-label="Sahifalar"
                  >
                    <button
                      type="button"
                      className="sections-pagination__arrow"
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(currentPage - 1)
                      }
                      aria-label={texts.previous}
                    >
                      <Icon name="chevronLeft" size={17} />
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((number) => (
                      <button
                        type="button"
                        key={number}
                        className={
                          currentPage === number
                            ? 'is-active'
                            : ''
                        }
                        aria-current={
                          currentPage === number
                            ? 'page'
                            : undefined
                        }
                        onClick={() =>
                          handlePageChange(number)
                        }
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="sections-pagination__arrow"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        handlePageChange(currentPage + 1)
                      }
                      aria-label={texts.next}
                    >
                      <Icon name="chevronRight" size={17} />
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </section>

        {/* O‘NG TOMONDAGI MENYU */}
        <aside className="sections-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default SectionsPage;
