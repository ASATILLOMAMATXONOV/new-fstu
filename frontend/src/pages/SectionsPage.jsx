import React from 'react';

import '../assets/styles/SectionsPage.css';
import AppLink from '../components/common/AppLink';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getTranslatedField } from '../utils/cms';

const ITEMS_PER_PAGE = 6;

function SectionBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 4.75A2.75 2.75 0 0 1 7.75 2h8.5A2.75 2.75 0 0 1 19 4.75v14.5A2.75 2.75 0 0 1 16.25 22h-8.5A2.75 2.75 0 0 1 5 19.25V4.75Zm2.75-1a1 1 0 0 0-1 1v14.5a1 1 0 0 0 1 1h8.5a1 1 0 0 0 1-1V4.75a1 1 0 0 0-1-1h-8.5ZM9 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 9 8.25Zm0 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 9 12.25Zm0 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 9 16.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.47 5.97a.75.75 0 0 1 1.06 0l5.5 5.5a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 1 1-1.06-1.06L13.44 12 8.47 7.03a.75.75 0 0 1 0-1.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SectionsPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.sectionsList,
    [currentLanguageCode]
  );
  const { items: sections, loading } = useContentList('faculties', {
    entityType: 'section'
  });
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(sections.length / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const currentSections = React.useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sections.slice(start, start + ITEMS_PER_PAGE);
  }, [page, sections]);

  return (
    <main className="sections-page">
      <div className="sections-layout">
        <section className="sections-main">
          <div className="sections-head">
            <span>{texts.eyebrow}</span>
            <h1>{texts.title}</h1>
            <p>{texts.description}</p>
          </div>

          {!loading && !sections.length ? (
            <div className="sections-empty-state">
              <h2>{texts.emptyTitle}</h2>
              <p>{texts.emptyText}</p>
            </div>
          ) : (
            <>
              <div className="sections-grid">
                {currentSections.map((section, index) => {
                  const sectionNumber = String((page - 1) * ITEMS_PER_PAGE + index + 1).padStart(
                    2,
                    '0'
                  );

                  return (
                    <AppLink
                      key={section.id}
                      href={`/sections/${section.id}`}
                      className="sections-card"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <div className="sections-card-media">
                        {section.image ? (
                          <img
                            src={section.image}
                            alt={getTranslatedField(section, 'title', section.title)}
                          />
                        ) : (
                          <div className="sections-card-placeholder">
                            <SectionBadgeIcon />
                            <span>{texts.placeholder}</span>
                          </div>
                        )}
                      </div>

                      <div className="sections-card-content">
                        <div className="sections-card-meta">
                          <div className="sections-card-badge">
                            <SectionBadgeIcon />
                            <span>{texts.badge}</span>
                          </div>

                          <div className="sections-card-order">{sectionNumber}</div>
                        </div>

                        <h3>{getTranslatedField(section, 'title', section.title)}</h3>

                        <div className="sections-card-action">
                          <span>{texts.details}</span>
                          <ArrowIcon />
                        </div>
                      </div>
                    </AppLink>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="sections-pagination">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    {texts.previous}
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      className={page === index + 1 ? 'active' : ''}
                      onClick={() => setPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    {texts.next}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="sections-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default SectionsPage;
