import React from 'react';
import { Link } from 'react-router-dom';

import '../../assets/styles/StudentAnnouncementStats.css';
import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { formatCmsDate, getTranslatedField, sortContentByNewest } from '../../utils/cms';

function StudentAnnouncementStats() {
  const { currentLanguageCode } = useLanguage();

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.studentAnnouncementStats,
    [currentLanguageCode]
  );

  const { items: studentItems, loading: studentsLoading } = useContentList('students', {
    limit: 4,
    orderBy: 'recent',
    revalidate: true
  });

  const { items: announcementItems, loading: announcementsLoading } = useContentList(
    'announcements',
    {
      limit: 3,
      orderBy: 'recent',
      revalidate: true
    }
  );

  const students = React.useMemo(() => sortContentByNewest(studentItems).slice(0, 4), [studentItems]);
  const announcements = React.useMemo(
    () => sortContentByNewest(announcementItems).slice(0, 3),
    [announcementItems]
  );

  return (
    <section className="sas-section">
      <div className="sas-grid">
        <div className="sas-card announcements-card">
          <div className="sas-header">
            <h3>{texts.announcementsTitle}</h3>
            <AppLink href="/announcements">{texts.seeAll} →</AppLink>
          </div>

          <div className="announcement-list">
            {!announcementsLoading && !announcements.length && (
              <div className="sas-empty-state">
                <h4>{texts.announcementsEmptyTitle}</h4>
                <p>{texts.announcementsEmptyText}</p>
              </div>
            )}

            {announcements.map((item) => {
              const dateText = formatCmsDate(item.createdAt);

              return (
                <Link
                  to={`/announcements/page/${item.id}`}
                  className="announcement-item"
                  key={item.id}
                >
                  <img
                    className="announcement-img"
                    src={item.image}
                    alt={getTranslatedField(item, 'title', item.title)}
                    width="164"
                    height="124"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="announcement-date">
                    <strong>{dateText.split(' ')[0] || ''}</strong>
                    <span>{dateText.split(' ').slice(1).join(' ')}</span>
                  </div>

                  <div className="announcement-text">
                    <h4>{getTranslatedField(item, 'title', item.title)}</h4>
                    <span>{texts.details} →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="sas-card students-section-card">
          <div className="sas-header">
            <h3>{texts.studentsTitle}</h3>
            <AppLink href="/students">{texts.seeAll} →</AppLink>
          </div>

          <div className="students-list students-achievement-grid">
            {!studentsLoading && !students.length && (
              <div className="sas-empty-state">
                <h4>{texts.studentsEmptyTitle}</h4>
                <p>{texts.studentsEmptyText}</p>
              </div>
            )}

          {students.map((student, index) => {
  const studentTitle = getTranslatedField(student, 'title', student.title);

  const studentName =
    student.fullName ||
    student.name ||
    studentTitle ||
    texts.studentsTitle;

  return (
    <AppLink
      href={`/students/${student.id}`}
      className="student-achievement-card"
      key={student.id}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="student-achievement-img-wrap">
        {student.image ? (
          <img
            src={student.image}
            alt={studentName}
            width="220"
            height="160"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="student-achievement-placeholder">
            {studentName.charAt(0)}
          </div>
        )}
      </div>

     <div className="student-achievement-content">
  <h4>{studentName}</h4>
</div>
    </AppLink>
  );
})}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentAnnouncementStats;
