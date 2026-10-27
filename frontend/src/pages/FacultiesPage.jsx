
import React, { useMemo, useState } from 'react';

import '../assets/styles/FacultiesPage.css';

import AppLink from '../components/common/AppLink';
import AcademicSidebar from '../components/layout/AcademicSidebar';

import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';

import {
  getHtmlExcerpt,
  getTranslatedField
} from '../utils/cms';

/* ===========================================
   ICONS
=========================================== */

function FacultyIcon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  const paths = {
    building: (
      <>
        <path d="m3 10 9-6 9 6" />
        <path d="M4 10h16M5 10v10m4-10v10m6-10v10m4-10v10M2 21h20" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    teacher: (
      <>
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M7 21h10M12 17v4M7 8h10M7 12h6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    book: (
      <>
        <path d="M12 7v14" />
        <path d="M3 18V4a1 1 0 0 1 1-1h5a3 3 0 0 1 3 3 3 3 0 0 1 3-3h5a1 1 0 0 1 1 1v14h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3Z" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    )
  };

  return <svg {...common}>{paths[name] || paths.building}</svg>;
}

/* ===========================================
   TRANSLATIONS
=========================================== */

const LABELS = {
  uz: {
    department: 'Kafedralar',
    students: 'Talabalar',
    teachers: 'O‘qituvchilar',
    details: 'Batafsil',
    noDescription: 'Fakultet haqida batafsil ma’lumot',
    noFaculties: 'Fakultetlar hali joylanmagan',
    statsTitle: 'Fakultet ko‘rsatkichlari'
  },
  ru: {
    department: 'Кафедры',
    students: 'Студенты',
    teachers: 'Преподаватели',
    details: 'Подробнее',
    noDescription: 'Подробная информация о факультете',
    noFaculties: 'Факультеты пока не добавлены',
    statsTitle: 'Показатели факультета'
  },
  en: {
    department: 'Departments',
    students: 'Students',
    teachers: 'Teachers',
    details: 'Explore faculty',
    noDescription: 'Detailed information about the faculty',
    noFaculties: 'No faculties available',
    statsTitle: 'Faculty statistics'
  }
};

/* ===========================================
   STATS HELPERS
   No invented statistics
=========================================== */

function firstNumericValue(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      return value.length;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value >= 0 ? value : null;
    }

    if (typeof value === 'string') {
      const cleaned = value
        .replace(/[\s\u00a0,]/g, '')
        .trim();

      if (/^\d+$/.test(cleaned)) {
        return Number(cleaned);
      }
    }
  }

  return null;
}

function getFacultyStats(faculty) {
  const stats = faculty?.statistics || faculty?.stats || {};

  const departments = firstNumericValue(
    faculty?.departmentsCount,
    faculty?.departmentCount,
    faculty?.departments_count,
    stats?.departmentsCount,
    stats?.departments,
    faculty?.departments
  );

  const students = firstNumericValue(
    faculty?.studentsCount,
    faculty?.studentCount,
    faculty?.students_count,
    faculty?.student_count,
    stats?.studentsCount,
    stats?.students,
    faculty?.studentTotal,
    faculty?.students
  );

  const teachers = firstNumericValue(
    faculty?.teachersCount,
    faculty?.teacherCount,
    faculty?.teachers_count,
    faculty?.staffCount,
    stats?.teachersCount,
    stats?.teachers,
    faculty?.teachers
  );

  return [
    {
      key: 'departments',
      icon: 'building',
      value: departments
    },
    {
      key: 'students',
      icon: 'users',
      value: students
    },
    {
      key: 'teachers',
      icon: 'teacher',
      value: teachers
    }
  ];
}

/* ===========================================
   SINGLE CARD
=========================================== */

function FacultyCard({
  faculty,
  index,
  texts,
  labels,
  language
}) {
  const [imageError, setImageError] = useState(false);

  const title =
    getTranslatedField(
      faculty,
      'title',
      faculty.title || ''
    ) || labels.noDescription;

  const description = getHtmlExcerpt(
    getTranslatedField(faculty, 'content') || '',
    155
  );

  const image =
    faculty.image ||
    faculty.cover ||
    faculty.bannerImage ||
    '';

  const stats = getFacultyStats(faculty);

  const availableStats = stats.filter(
    (stat) => stat.value !== null
  );

  const numberFormat = new Intl.NumberFormat(
    language === 'ru'
      ? 'ru-RU'
      : language === 'en'
        ? 'en-US'
        : 'uz-UZ'
  );

  return (
    <article
      className="faculty-modern-card"
      style={{
        '--faculty-delay': `${Math.min(index, 8) * 70}ms`
      }}
    >
      {/* IMAGE */}

      <div className="faculty-modern-media">
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="faculty-modern-image-empty">
            <FacultyIcon name="image" size={42} />
          </div>
        )}

        <span className="faculty-modern-index">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="faculty-modern-media-shade" />

        {/* STATISTICS HOVER PANEL */}

        {availableStats.length > 0 && (
          <div
            className="faculty-modern-stat-overlay"
            aria-label={labels.statsTitle}
          >
            <div className="faculty-modern-stat-heading">
              <FacultyIcon name="book" size={16} />
              <span>{labels.statsTitle}</span>
            </div>

            <div className="faculty-modern-stats">
              {availableStats.map((stat) => (
                <div
                  className="faculty-modern-stat"
                  key={stat.key}
                >
                  <span className="faculty-modern-stat-icon">
                    <FacultyIcon name={stat.icon} size={17} />
                  </span>

                  <strong>
                    {numberFormat.format(stat.value)}
                  </strong>

                  <small>{labels[stat.key === 'departments' ? 'department' : stat.key]}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BODY */}

      <div className="faculty-modern-body">
        <div className="faculty-modern-meta">
          <span className="faculty-modern-line" />

          <span>
            {texts.itemPrefix} #{index + 1}
          </span>
        </div>

        <h3 title={title}>{title}</h3>

        <p title={description}>
          {description || labels.noDescription}
        </p>

        <div className="faculty-modern-footer">
          <AppLink
            href={`/faculties/${faculty.id}`}
            className="faculty-modern-link"
          >
            <span>{texts.details || labels.details}</span>
            <span className="faculty-modern-arrow">
              <FacultyIcon name="arrow" size={17} />
            </span>
          </AppLink>

          {availableStats.length > 0 && (
            <span className="faculty-modern-stat-hint">
              {availableStats.length} / 3
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ===========================================
   FACULTIES PAGE
=========================================== */

function FacultiesPage() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(
      currentLanguageCode
    ).pages.facultiesList,
    [currentLanguageCode]
  );

  const labels =
    LABELS[currentLanguageCode] || LABELS.uz;

  const { items: rawFaculties = [] } = useContentList(
    'faculties',
    {
      entityType: 'faculty'
    }
  );

  const faculties = useMemo(
    () => Array.isArray(rawFaculties)
      ? rawFaculties.filter(Boolean)
      : [],
    [rawFaculties]
  );

  return (
    <main className="faculties-page">
      <div className="faculties-layout">
        <section
          className="faculties-section"
          aria-label={texts.title || labels.noFaculties}
        >
          {faculties.length > 0 ? (
            <div className="faculties-grid">
              {faculties.map((faculty, index) => (
                <FacultyCard
                  key={faculty.id || index}
                  faculty={faculty}
                  index={index}
                  texts={texts}
                  labels={labels}
                  language={currentLanguageCode}
                />
              ))}
            </div>
          ) : (
            <div className="faculties-empty">
              <FacultyIcon name="building" size={36} />
              <p>{labels.noFaculties}</p>
            </div>
          )}
        </section>

        <aside className="faculties-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default FacultiesPage;
