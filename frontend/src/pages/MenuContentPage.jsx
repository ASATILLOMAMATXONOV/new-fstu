import React from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import AttachedFilesList from '../components/common/AttachedFilesList';
import '../assets/styles/DynamicPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useMenuTree } from '../hooks/useMenuTree';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';
import { findMenuPathById, getMenuNodeTitle } from '../utils/menu';

function MenuContentPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.menuContent,
    [currentLanguageCode]
  );
  const { menus, loading } = useMenuTree();
  const { menus: academicMenus, loading: academicLoading } = useMenuTree('academic-menus');
  const regularMenuPath = findMenuPathById(menus, id);
  const academicMenuPath = findMenuPathById(academicMenus, id);
  const menuPath = academicMenuPath.length ? academicMenuPath : regularMenuPath;
  const currentNode = menuPath[menuPath.length - 1] || null;

  if (loading || academicLoading) {
    return <main className="dynamic-page" />;
  }

  if (!currentNode || currentNode.active === false) {
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
            <AcademicSidebar activeKey={id} />
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
            <h2>{getMenuNodeTitle(currentNode)}</h2>
            {texts.intro ? <p>{texts.intro}</p> : null}
          </header>

          <div className="dynamic-page-content-wrap">
            <div className="dynamic-page-content-stack">
              <div
                className="dynamic-page-body"
                dangerouslySetInnerHTML={createSafeMarkup(
                  getTranslatedField(currentNode, 'content'),
                  `<p>${texts.emptyContent}</p>`
                )}
              />

              <AttachedFilesList items={currentNode.files} />
            </div>
          </div>
        </article>

        <aside className="dynamic-page-sidebar">
          <AcademicSidebar activeKey={id} />
        </aside>
      </div>
    </main>
  );
}

export default MenuContentPage;
