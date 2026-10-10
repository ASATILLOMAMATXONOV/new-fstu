import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/StudentsPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getHtmlExcerpt, getTranslatedField, sortContentByNewest } from '../utils/cms';

const PER_PAGE = 6;
function getStudentOverview(student, texts) {
  const studentTitle = getTranslatedField(student, 'title', student.title);

  return {
    name: student.fullName || studentTitle,
    title: studentTitle || '',
    direction: student.direction || studentTitle || texts.title,
    excerpt: getHtmlExcerpt(getTranslatedField(student, 'content'), 160) || texts.previewFallback
  };
}

function StudentsPage() {
  const navigate = useNavigate();
  const { currentLanguageCode } = useLanguage();

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.studentsPage,
    [currentLanguageCode]
  );

  const { items: students, loading } = useContentList('students', {
    orderBy: 'recent'
  });
  const [page, setPage] = useState(1);
  const sortedStudents = useMemo(() => sortContentByNewest(students), [students]);

  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / PER_PAGE));

  const visibleStudents = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedStudents.slice(start, start + PER_PAGE);
  }, [page, sortedStudents]);
  const openStudentPage = (student) => {
    navigate(`/students/${student.id}`);
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="students-page">
      <div className="students-layout">
        <section className="students-main">
          {!loading && !students.length ? (
            <div className="students-empty-state">
              <h2>{texts.emptyTitle}</h2>
              <p>{texts.emptyText}</p>
            </div>
          ) : (
            <>
              <section className="students-grid">
                {visibleStudents.map((student, index) => {
                  const overview = getStudentOverview(student, texts);

                  return (
                    <button
                      type="button"
                      className="students-grid-card"
                      key={student.id}
                      style={{ animationDelay: `${index * 0.08}s` }}
                      onClick={() => openStudentPage(student)}
                    >
                      <div className="students-grid-card-media">
                        {student.image ? (
                          <img src={student.image} alt={overview.name} />
                        ) : (
                          <div className="students-grid-card-placeholder">
                            {overview.name?.charAt(0) || 'T'}
                          </div>
                        )}
                      </div>

                      <div className="students-grid-card-body">
                        <span>{overview.direction}</span>
                        <h2>{overview.name}</h2>
                        {overview.title && overview.title !== overview.name ? (
                          <p>{overview.title}</p>
                        ) : null}
                        <strong>{texts.openProfileLabel} →</strong>
                      </div>
                    </button>
                  );
                })}
              </section>

              {totalPages > 1 ? (
                <div className="students-pagination">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => changePage(page - 1)}
                  >
                    Oldingi
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className={page === pageNumber ? 'active' : ''}
                        onClick={() => changePage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => changePage(page + 1)}
                  >
                    Keyingi
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <aside className="students-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default StudentsPage;
