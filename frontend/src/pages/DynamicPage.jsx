import React from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import AttachedFilesList from '../components/common/AttachedFilesList';
import '../assets/styles/DynamicPage.css';
import LinkedInfoTable from '../components/common/LinkedInfoTable';
import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';

function DynamicPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.dynamicPage,
    [currentLanguageCode]
  );
  const { item: currentPage, loading } = useContentItem('pages', id);

  if (loading) {
    return <main className="dynamic-page" />;
  }

  if (!currentPage) {
    return (
      <main className="dynamic-page">
        <div className="dynamic-page-layout">
          <section className="dynamic-page-empty">
            <span>{texts.label}</span>
            <h1>{texts.notFoundTitle}</h1>
            <p>{texts.notFoundText}</p>
            <Link to="/" className="dynamic-page-back">
              {texts.backHome}
            </Link>
          </section>

          <aside className="dynamic-page-sidebar">
            <AcademicSidebar />
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="dynamic-page">
      <div className="dynamic-page-layout">
        <article className="dynamic-page-main">
          <header className="dynamic-page-main-head">
            <span className="dynamic-page-label">{texts.label}</span>
            <h2>{getTranslatedField(currentPage, 'title', currentPage.title)}</h2>
            <p>{texts.intro}</p>
          </header>

          <div className="dynamic-page-content-wrap">
            <div className="dynamic-page-content-stack">
              <LinkedInfoTable items={currentPage.linkTable} />

              <div
                className="dynamic-page-body"
                dangerouslySetInnerHTML={createSafeMarkup(
                  getTranslatedField(currentPage, 'content'),
                  `<p>${texts.emptyContent}</p>`
                )}
              />

              <AttachedFilesList items={currentPage.files} />
            </div>
          </div>
        </article>

        <aside className="dynamic-page-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default DynamicPage;
