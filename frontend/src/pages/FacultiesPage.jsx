import React from 'react';

import '../assets/styles/FacultiesPage.css';
import AppLink from '../components/common/AppLink';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getHtmlExcerpt, getTranslatedField } from '../utils/cms';

function FacultiesPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.facultiesList,
    [currentLanguageCode]
  );
  const { items: faculties } = useContentList('faculties', {
    entityType: 'faculty'
  });

  return (
    <main className="faculties-page">
      <div className="faculties-layout">
        <section className="faculties-section">
          {faculties.map((faculty, index) => (
            <article
              className="faculties-card"
              key={faculty.id}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="faculties-card-image">
                <img src={faculty.image} alt={getTranslatedField(faculty, 'title', faculty.title)} />
              </div>

              <div className="faculties-card-body">
                <span>{texts.itemPrefix} #{index + 1}</span>
                <h3>{getTranslatedField(faculty, 'title', faculty.title)}</h3>
                <p>{getHtmlExcerpt(getTranslatedField(faculty, 'content') || '', 140)}</p>

                <AppLink href={`/faculties/${faculty.id}`} className="faculties-card-link">
                  {texts.details} →
                </AppLink>
              </div>
            </article>
          ))}

        </section>

        <AcademicSidebar />
      </div>
    </main>
  );
}

export default FacultiesPage;
