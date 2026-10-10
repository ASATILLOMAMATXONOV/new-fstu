import React from 'react';

import '../assets/styles/DepartmentsPage.css';
import AppLink from '../components/common/AppLink';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getTranslatedField } from '../utils/cms';

export default function DepartmentsPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.departmentsList,
    [currentLanguageCode]
  );
  const { items: faculties } = useContentList('faculties', {
    entityType: 'faculty'
  });

  return (
    <main className="departments-page">
      <div className="departments-layout">
        <section className="departments-section">
          {faculties.map((faculty, index) => {
            const panelId = `departments-panel-${index}`;
            const departments = faculty.departments || [];

            return (
              <article key={faculty.id} className="departments-faculty-card is-open">
                <AppLink
                  href={`/faculties/${faculty.id}`}
                  className="departments-faculty-trigger"
                >
                  <img
                    className="departments-faculty-image"
                    src={faculty.image}
                    alt={getTranslatedField(faculty, 'title', faculty.title)}
                  />

                  <div className="departments-faculty-meta">
                    <h2>{getTranslatedField(faculty, 'title', faculty.title)}</h2>
                    <p>{texts.departmentsCount(departments.length)}</p>
                  </div>
                </AppLink>

                <div className="departments-list" id={panelId}>
                  <AppLink href={`/faculties/${faculty.id}`} className="departments-panel-link">
                    {texts.openFaculty}
                  </AppLink>

                  {departments.map((item) => {
                    const departmentContent = (
                      <>
                        <div className="departments-item-logo">
                          <img
                            src={item.image || faculty.image}
                            alt={getTranslatedField(item, 'title', item.title)}
                          />
                        </div>

                        <div className="departments-item-content">
                          <h4>{getTranslatedField(item, 'title', item.title)}</h4>
                          <p>{texts.openDepartment}</p>
                        </div>
                      </>
                    );

                    if (!item.id) {
                      return (
                        <div className="departments-item" key={item.title}>
                          {departmentContent}
                        </div>
                      );
                    }

                    return (
                      <AppLink
                        href={`/departments/${faculty.id}/${item.id}`}
                        className="departments-item"
                        key={item.id}
                      >
                        {departmentContent}
                      </AppLink>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>

        <AcademicSidebar />
      </div>
    </main>
  );
}
