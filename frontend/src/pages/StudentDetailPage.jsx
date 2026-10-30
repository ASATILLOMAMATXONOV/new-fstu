
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/StudentDetailPage.css';

import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';

const Icon = ({ name, size = 20 }) => {
  const paths = {
    back: <path d="M19 12H5m7 7-7-7 7-7" />,
    arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" />
        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 11v6M12 7h.01" />
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
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const LABELS = {
  uz: {
    profile: 'TALABA PROFILI',
    back: 'Bizning talabalarimiz',
    about: 'Talaba haqida',
    direction: 'Ta’lim yo‘nalishi',
    loading: 'Ma’lumotlar yuklanmoqda...'
  },
  ru: {
    profile: 'ПРОФИЛЬ СТУДЕНТА',
    back: 'Наши студенты',
    about: 'О студенте',
    direction: 'Направление обучения',
    loading: 'Загрузка данных...'
  },
  en: {
    profile: 'STUDENT PROFILE',
    back: 'Our students',
    about: 'About the student',
    direction: 'Study program',
    loading: 'Loading information...'
  }
};

function StudentDetailPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages.studentsPage,
    [currentLanguageCode]
  );

  const ui = LABELS[currentLanguageCode] || LABELS.uz;

  const { item, loading } = useContentItem('students', id);

  const student = item?.active === false ? null : item;

  const studentTitle = getTranslatedField(
    student,
    'title',
    student?.title
  );

  const studentContent = getTranslatedField(student, 'content');

  const fullName = getTranslatedField(
    student,
    'fullName',
    student?.fullName
  );

  const direction = getTranslatedField(
    student,
    'direction',
    student?.direction
  );

  const studentName = fullName || studentTitle || texts.title;

  const subtitle =
    studentTitle && studentTitle !== studentName
      ? studentTitle
      : '';

  if (loading) {
    return (
      <main className="student-detail-page">
        <div className="student-detail-loading" role="status">
          <div className="student-detail-spinner" />
          <p>{ui.loading}</p>
        </div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="student-detail-page">
        <div className="student-detail-empty">
          <div className="student-detail-empty-icon">
            <Icon name="user" size={34} />
          </div>

          <h1>{texts.emptyTitle}</h1>
          <p>{texts.emptyText}</p>

          <Link to="/students" className="student-detail-return">
            <Icon name="back" size={18} />
            {ui.back}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="student-detail-page">
      <div className="student-detail-container">

        {/* NAVIGATION */}
        <nav className="student-detail-navigation">
          <Link to="/students" className="student-detail-back">
            <span className="student-detail-back-icon">
              <Icon name="back" size={18} />
            </span>
            {ui.back}
          </Link>

          <span className="student-detail-navigation-label">
            {ui.profile}
          </span>
        </nav>

        <div className="student-detail-shell">

          {/* MAIN */}
          <article className="student-detail-main">

            {/* STUDENT HEADER */}
            <header className="student-detail-hero">
              <div className="student-detail-eyebrow">
                <span className="student-detail-dot" />
                {ui.profile}
              </div>

              <h1>{studentName}</h1>

              {subtitle && (
                <p className="student-detail-subtitle">
                  {subtitle}
                </p>
              )}

              {direction && (
                <div className="student-detail-direction">
                  <div className="student-detail-direction-icon">
                    <Icon name="book" size={21} />
                  </div>

                  <div className="student-detail-direction-text">
                    <span>{ui.direction}</span>
                    <strong>{direction}</strong>
                  </div>
                </div>
              )}
            </header>

            {/* STUDENT CONTENT */}
            <section className="student-detail-content-card">
              <div className="student-detail-content-heading">
                <div className="student-detail-heading-icon">
                  <Icon name="info" size={22} />
                </div>

                <h2>{ui.about}</h2>
              </div>

              <div
                className="student-detail-content student-detail-content-body"
                dangerouslySetInnerHTML={createSafeMarkup(
                  studentContent,
                  `<p>${texts.emptyContent}</p>`
                )}
              />
            </section>

            {/* BOTTOM BACK BUTTON */}
            <Link to="/students" className="student-detail-return">
              <Icon name="back" size={18} />
              <span>{ui.back}</span>
            </Link>

          </article>

          {/* SIDEBAR */}
          <aside className="student-detail-sidebar">

            <div className="student-detail-profile-card">
              <div className="student-detail-photo">
                {student.image ? (
                  <img
                    src={student.image}
                    alt={studentName}
                  />
                ) : (
                  <div className="student-detail-photo-placeholder">
                    {studentName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="student-detail-profile-info">
                <span className="student-detail-profile-label">
                  {ui.profile}
                </span>

                <h3>{studentName}</h3>

                {direction && (
                  <p>{direction}</p>
                )}

                {!direction && subtitle && (
                  <p>{subtitle}</p>
                )}
              </div>
            </div>

            <AcademicSidebar />
          </aside>

        </div>
      </div>
    </main>
  );
}

export default StudentDetailPage;
