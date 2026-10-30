
import React, { useEffect, useMemo, useState } from 'react';

import '../assets/styles/DepartmentsPage.css';
import AppLink from '../components/common/AppLink';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getTranslatedField } from '../utils/cms';

function Icon({ name, size = 20 }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    building: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 21v-5h6v5M8 7h1m6 0h1M8 11h1m6 0h1" />
      </>
    ),
    book: (
      <>
        <path d="M12 7v14M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13" />
        <path d="M3 18h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5" />
      </>
    ),
    close: <path d="M18 6 6 18M6 6l12 12" />,
    external: (
      <>
        <path d="M13 5h6v6M19 5l-9 9" />
        <path d="M19 13v6H5V5h6" />
      </>
    )
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

export default function DepartmentsPage() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages.departmentsList,
    [currentLanguageCode]
  );

  const { items: rawFaculties = [] } = useContentList('faculties', {
    entityType: 'faculty'
  });

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  const faculties = useMemo(
    () =>
      rawFaculties.map((faculty, index) => ({
        ...faculty,
        _key: String(faculty.id ?? `faculty-${index}`),
        displayTitle: getTranslatedField(
          faculty,
          'title',
          faculty.title || '',
          currentLanguageCode
        ),
        departments: Array.isArray(faculty.departments)
          ? faculty.departments
          : []
      })),
    [rawFaculties, currentLanguageCode]
  );

  const totalDepartments = useMemo(
    () =>
      faculties.reduce(
        (total, faculty) => total + faculty.departments.length,
        0
      ),
    [faculties]
  );

  const query = search.trim().toLocaleLowerCase();

  const titleOf = (item) =>
    getTranslatedField(item, 'title', item?.title || '');

  const filteredFaculties = useMemo(() => {
    if (!query) return faculties;

    return faculties
      .map((faculty) => {
        const facultyMatches = faculty.displayTitle
          .toLocaleLowerCase()
          .includes(query);

        if (facultyMatches) return faculty;

        return {
          ...faculty,
          departments: faculty.departments.filter((department) =>
            getTranslatedField(
              department,
              'title',
              department.title || '',
              currentLanguageCode
            )
              .toLocaleLowerCase()
              .includes(query)
          )
        };
      })
      .filter(
        (faculty) =>
          faculty.displayTitle.toLocaleLowerCase().includes(query) ||
          faculty.departments.length > 0
      );
  }, [faculties, query, currentLanguageCode]);

  useEffect(() => {
    if (!filteredFaculties.length) {
      setSelectedId(null);
      return;
    }

    if (!filteredFaculties.some((faculty) => faculty._key === selectedId)) {
      setSelectedId(filteredFaculties[0]._key);
    }
  }, [filteredFaculties, selectedId]);

  const activeFaculty =
    filteredFaculties.find((faculty) => faculty._key === selectedId) ||
    filteredFaculties[0] ||
    null;

  const activeIndex = faculties.findIndex(
    (faculty) => faculty._key === activeFaculty?._key
  );

  return (
    <main className="departments-page">
      <div className="departments-container">

        {/* HEADER */}

        <header className="dp-header">
          <div className="dp-header-copy">
            <span className="dp-eyebrow">
              <span className="dp-eyebrow-dot" />
              AKADEMIK TUZILMA
            </span>

            <h1>Fakultetlar va kafedralar</h1>

            <p>
              Fakultetni tanlang va uning tarkibidagi
              kafedralar bilan tanishing.
            </p>
          </div>

          <div className="dp-summary">
            <div className="dp-summary-item">
              <strong>{faculties.length}</strong>
              <span>Fakultet</span>
            </div>

            <div className="dp-summary-divider" />

            <div className="dp-summary-item">
              <strong>{totalDepartments}</strong>
              <span>Kafedra</span>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT */}

        <div className="dp-page-layout">
          <section className="dp-main">
            <div className="dp-explorer">

              {/* LEFT NAVIGATION */}

              <div className="dp-navigation">
                <div className="dp-navigation-header">
                  <span>FAKULTETLAR</span>
                  <span className="dp-count">{faculties.length}</span>
                </div>

                <div className="dp-search">
                  <Icon name="search" size={18} />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Qidirish..."
                    aria-label="Fakultet va kafedralarni qidirish"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Qidiruvni tozalash"
                    >
                      <Icon name="close" size={15} />
                    </button>
                  )}
                </div>

                <div className="dp-navigation-list">
                  {filteredFaculties.map((faculty) => {
                    const isActive =
                      activeFaculty?._key === faculty._key;

                    return (
                      <button
                        type="button"
                        key={faculty._key}
                        className={`dp-nav-item ${
                          isActive ? 'active' : ''
                        }`}
                        onClick={() => setSelectedId(faculty._key)}
                        aria-pressed={isActive}
                      >
                        <span className="dp-nav-accent" />

                        <div className="dp-nav-logo">
                          {faculty.image ? (
                            <img
                              src={faculty.image}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <Icon name="building" size={20} />
                          )}
                        </div>

                        <div className="dp-nav-info">
                          <div className="dp-nav-top">
                            <h3 className="dp-nav-title">
                              {faculty.displayTitle}
                            </h3>

                            <span className="dp-nav-arrow">
                              <Icon name="chevron" size={15} />
                            </span>
                          </div>

                          <div className="dp-nav-bottom">
                            <span className="dp-nav-subtitle">
                              {faculty.departments.length} ta kafedra
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {filteredFaculties.length === 0 && (
                    <p className="dp-no-results">
                      Natija topilmadi.
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT CONTENT */}

              <div className="dp-content">
                {activeFaculty ? (
                  <div
                    className="dp-content-inner"
                    key={activeFaculty._key}
                  >
                    <div className="dp-content-topline">
                      <span>
                        FAKULTET /{' '}
                        {String(activeIndex + 1).padStart(2, '0')}
                      </span>

                      <span className="dp-active-indicator">
                        <span />
                        Tanlangan fakultet
                      </span>
                    </div>

                    <div className="dp-faculty-profile">
                      <div className="dp-profile-logo">
                        {activeFaculty.image ? (
                          <img
                            src={activeFaculty.image}
                            alt=""
                          />
                        ) : (
                          <Icon name="building" size={34} />
                        )}
                      </div>

                      <div className="dp-profile-info">
                        <h2>{activeFaculty.displayTitle}</h2>

                        <p>
                          {texts.departmentsCount(
                            activeFaculty.departments.length
                          )}
                        </p>
                      </div>
                    </div>

                    <AppLink
                      href={`/faculties/${activeFaculty.id}`}
                      className="dp-faculty-link"
                    >
                      {texts.openFaculty}
                      <Icon name="external" size={15} />
                    </AppLink>

                    <div className="dp-content-divider" />

                    <div className="dp-department-heading">
                      <div>
                        <span className="dp-section-caption">
                          AKADEMIK BO‘LINMALAR
                        </span>
                        <h3>Kafedralar</h3>
                      </div>

                      <span className="dp-department-count">
                        {activeFaculty.departments.length} ta
                      </span>
                    </div>

                    <div className="dp-department-list">
                      {activeFaculty.departments.map(
                        (department, index) => {
                          const departmentContent = (
                            <>
                              <span className="dp-department-index">
                                {String(index + 1).padStart(2, '0')}
                              </span>

                              <div className="dp-department-info">
                                <h4>{titleOf(department)}</h4>
                                <p>{texts.openDepartment}</p>
                              </div>

                              {department.id && (
                                <span className="dp-department-arrow">
                                  <Icon name="arrow" size={18} />
                                </span>
                              )}
                            </>
                          );

                          return department.id ? (
                            <AppLink
                              key={department.id}
                              href={`/departments/${activeFaculty.id}/${department.id}`}
                              className="dp-department-item"
                            >
                              {departmentContent}
                            </AppLink>
                          ) : (
                            <div
                              key={`department-${index}`}
                              className="dp-department-item dp-disabled"
                            >
                              {departmentContent}
                            </div>
                          );
                        }
                      )}

                      {activeFaculty.departments.length === 0 && (
                        <div className="dp-empty">
                          <Icon name="book" size={26} />
                          <p>Kafedralar mavjud emas.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="dp-empty dp-empty-main">
                    <Icon name="search" size={30} />
                    <h3>Natija topilmadi</h3>
                    <p>Boshqa nom bilan qidirib ko‘ring.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="dp-sidebar">
            <AcademicSidebar />
          </aside>
        </div>
      </div>
    </main>
  );
}
