import React from 'react';
import { Link, useParams } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/StudentDetailPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, formatCmsDate, getTranslatedField } from '../utils/cms';

function StudentDetailPage() {
  const { id } = useParams();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.studentsPage,
    [currentLanguageCode]
  );
  const { item, loading } = useContentItem('students', id);

  const student = item?.active === false ? null : item;
  const studentTitle = getTranslatedField(student, 'title', student?.title);
  const studentContent = getTranslatedField(student, 'content');
  const studentName = student?.fullName || studentTitle || texts.title;
  const studentSubtitle =
    studentTitle && studentTitle !== (student?.fullName || '') ? studentTitle : '';
  const metaItems = [
    student?.direction ? { key: 'direction', value: student.direction } : null,
    student?.createdAt ? { key: 'date', value: formatCmsDate(student.createdAt) } : null
  ].filter(Boolean);

  if (loading) {
    return <main className="student-detail-page" />;
  }

  if (!student) {
    return (
      <main className="student-detail-page">
        <div className="student-detail-shell">
          <section className="student-detail-empty">
            <span>{texts.eyebrow}</span>
            <h1>{texts.emptyTitle}</h1>
            <p>{texts.emptyText}</p>
            <Link to="/students" className="student-detail-back">
              ← {texts.title}
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="student-detail-page">
      <div className="student-detail-shell">
        <article className="student-detail-main">
          <section className="student-detail-content-card">
            <div className="student-detail-content-head">
              <Link to="/students" className="student-detail-back student-detail-back--content">
                ← {texts.title}
              </Link>
              <h3>{studentName}</h3>
              {studentSubtitle ? <p>{studentSubtitle}</p> : null}
              {metaItems.length ? (
                <div className="student-detail-content-meta">
                  {metaItems.map((item) => (
                    <span key={item.key}>{item.value}</span>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              className="student-detail-content student-detail-content-body"
              dangerouslySetInnerHTML={createSafeMarkup(
                studentContent,
                `<p>${texts.emptyContent}</p>`
              )}
            />
          </section>
        </article>

        <aside className="student-detail-sidebar">
          <div className="student-detail-profile-card">
            <div className="student-detail-photo">
              {student.image ? (
                <img src={student.image} alt={studentName} />
              ) : (
                <div className="student-detail-photo-placeholder">
                  {studentName.charAt(0)}
                </div>
              )}
            </div>

            <div className="student-detail-profile-copy">
              <h3>{studentName}</h3>
              {studentSubtitle ? <p>{studentSubtitle}</p> : null}
            </div>
          </div>

          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default StudentDetailPage;
