import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/LaboratoryDetailPage.css';

import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';

const LABELS = {
  uz: {
    back: 'Laboratoriyalar',
    category: 'Laboratoriya',
    location: 'Joylashuvi',
    manager: 'Mas’ul xodim',
    loading: 'Laboratoriya yuklanmoqda...'
  },
  ru: {
    back: 'Лаборатории',
    category: 'Лаборатория',
    location: 'Расположение',
    manager: 'Ответственный',
    loading: 'Загрузка лаборатории...'
  },
  en: {
    back: 'Laboratories',
    category: 'Laboratory',
    location: 'Location',
    manager: 'Coordinator',
    loading: 'Loading laboratory...'
  }
};

function LaboratoryDetailPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();
  const ui = LABELS[currentLanguageCode] || LABELS.uz;
  const { item, loading } = useContentItem('laboratories', id);
  const laboratory = item?.active === false ? null : item;

  const panels = useMemo(
    () =>
      (Array.isArray(laboratory?.panels) ? laboratory.panels : [])
        .filter((panel) => panel?.active !== false)
        .sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0)),
    [laboratory?.panels]
  );

  if (loading) {
    return (
      <main className="laboratory-detail-page">
        <div className="laboratory-detail-state" role="status">
          <span className="laboratory-detail-spinner" />
          <p>{ui.loading}</p>
        </div>
      </main>
    );
  }

  if (!laboratory) {
    return <Navigate to="/laboratories" replace />;
  }

  const title = getTranslatedField(laboratory, 'title', laboratory.title, currentLanguageCode);
  const direction =
    getTranslatedField(laboratory, 'direction', '', currentLanguageCode) ||
    getTranslatedField(laboratory, 'category', ui.category, currentLanguageCode);
  const location = getTranslatedField(laboratory, 'location', '', currentLanguageCode);
  const manager = getTranslatedField(laboratory, 'manager', '', currentLanguageCode);

  return (
    <main className="laboratory-detail-page">
      <div className="laboratory-detail-layout">
        <article className="laboratory-detail-main">
          <Link to="/laboratories" className="laboratory-detail-back">
            ← {ui.back}
          </Link>

          <header className="laboratory-detail-hero">
            {laboratory.image && (
              <div className="laboratory-detail-image">
                <img
                  src={laboratory.image}
                  alt={title}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
            )}

            <div className="laboratory-detail-heading">
              <span>{direction}</span>
              <h1>{title}</h1>

              {(location || manager) && (
                <dl className="laboratory-detail-meta">
                  {location && (
                    <div>
                      <dt>{ui.location}</dt>
                      <dd>{location}</dd>
                    </div>
                  )}
                  {manager && (
                    <div>
                      <dt>{ui.manager}</dt>
                      <dd>{manager}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </header>

          <div className="laboratory-detail-panels">
            {panels.map((panel, index) => {
              const panelTitle = getTranslatedField(panel, 'title', '', currentLanguageCode);
              const panelContent = getTranslatedField(panel, 'content', '', currentLanguageCode);

              return (
                <section className="laboratory-detail-panel" key={panel.id || index}>
                  <h2>{panelTitle}</h2>
                  <div
                    className="laboratory-detail-content"
                    dangerouslySetInnerHTML={createSafeMarkup(panelContent)}
                  />
                </section>
              );
            })}
          </div>
        </article>

        <aside className="laboratory-detail-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default LaboratoryDetailPage;
