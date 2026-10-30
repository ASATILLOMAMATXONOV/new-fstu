
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import AttachedFilesList from '../components/common/AttachedFilesList';

import '../assets/styles/DynamicPage.css';

import { useLanguage } from '../context/LanguageContext';
import { useMenuTree } from '../hooks/useMenuTree';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';
import { findMenuPathById } from '../utils/menu';

function MenuContentPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages.menuContent,
    [currentLanguageCode]
  );

  const { menus, loading } = useMenuTree();

  const {
    menus: academicMenus,
    loading: academicLoading
  } = useMenuTree('academic-menus');

  const regularMenuPath = findMenuPathById(menus, id);
  const academicMenuPath = findMenuPathById(academicMenus, id);

  const menuPath = academicMenuPath.length
    ? academicMenuPath
    : regularMenuPath;

  const currentNode = menuPath[menuPath.length - 1] || null;

  const content = getTranslatedField(currentNode, 'content');

  const hasContent = Boolean(
    typeof content === 'string' &&
    content.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim()
  );

  const files = Array.isArray(currentNode?.files)
    ? currentNode.files
    : [];

  const hasFiles = files.length > 0;
  const hasData = hasContent || hasFiles;

  if (loading || academicLoading) {
    return (
      <main className="dynamic-page">
        <div className="dynamic-page-loading">
          <div className="dynamic-page-spinner" />
        </div>
      </main>
    );
  }

  if (!currentNode || currentNode.active === false) {
    return (
      <main className="dynamic-page">
        <div className="dynamic-page-layout">
          <section className="dynamic-page-empty">
            <h1>{texts.notFoundTitle}</h1>
            <p>{texts.notFoundText}</p>

            <Link to="/" className="dynamic-page-back">
              {texts.backHome}
            </Link>
          </section>

          <aside className="dynamic-page-sidebar">
            <AcademicSidebar activeKey={id} />
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="dynamic-page">
      <div
        className={`dynamic-page-layout ${
          !hasData ? 'dynamic-page-layout--empty' : ''
        }`}
      >
        {hasData && (
          <article className="dynamic-page-main">
            <div className="dynamic-page-content-wrap">
              <div className="dynamic-page-content-stack">

                {hasContent && (
                  <div
                    className="dynamic-page-body"
                    dangerouslySetInnerHTML={createSafeMarkup(content)}
                  />
                )}

                {hasFiles && (
                  <AttachedFilesList items={files} />
                )}

              </div>
            </div>
          </article>
        )}

        <aside className="dynamic-page-sidebar">
          <AcademicSidebar activeKey={id} />
        </aside>
      </div>
    </main>
  );
}

export default MenuContentPage;
