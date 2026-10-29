
import React, { useMemo, useState } from 'react';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/JournalIssuesPage.css';

// Namunaviy ma'lumotlar. Haqiqiy API bilan almashtiriladi.
const DEMO_ISSUES = [
  {
    id: 1,
    title: 'Scientific and Technical Journal',
    number: 4,
    year: 2026,
    type: 'regular',
    publishedAt: '2026-10-28',
    image: '/images/journals/2026-4.jpg',
    pdf: '/uploads/journals/2026-4.pdf'
  },
  {
    id: 2,
    title: 'Scientific and Technical Journal',
    number: 3,
    year: 2026,
    type: 'regular',
    publishedAt: '2026-07-15',
    image: '/images/journals/2026-3.jpg',
    pdf: '/uploads/journals/2026-3.pdf'
  },
  {
    id: 3,
    title: 'Scientific and Technical Journal',
    number: 1,
    year: 2026,
    type: 'special',
    publishedAt: '2026-06-05',
    image: '/images/journals/special-2026.jpg',
    pdf: '/uploads/journals/special-2026.pdf'
  },
  {
    id: 4,
    title: 'Scientific and Technical Journal',
    number: 4,
    year: 2025,
    type: 'regular',
    publishedAt: '2025-12-20',
    image: '/images/journals/2025-4.jpg',
    pdf: '/uploads/journals/2025-4.pdf'
  },
  {
    id: 5,
    title: 'Scientific and Technical Journal',
    number: 3,
    year: 2025,
    type: 'regular',
    publishedAt: '2025-09-10',
    image: '/images/journals/2025-3.jpg',
    pdf: '/uploads/journals/2025-3.pdf'
  },
  {
    id: 6,
    title: 'Scientific and Technical Journal',
    number: 1,
    year: 2025,
    type: 'special',
    publishedAt: '2025-06-01',
    image: '/images/journals/special-2025.jpg',
    pdf: '/uploads/journals/special-2025.pdf'
  },
  {
    id: 7,
    title: 'Scientific and Technical Journal',
    number: 4,
    year: 2024,
    type: 'regular',
    publishedAt: '2024-12-18',
    image: '/images/journals/2024-4.jpg',
    pdf: '/uploads/journals/2024-4.pdf'
  }
];

const ISSUE_TYPES = [
  { value: 'all', label: 'Barcha sonlar' },
  { value: 'regular', label: 'Asosiy sonlar' },
  { value: 'special', label: 'Maxsus sonlar' }
];

const getIssueName = (issue) =>
  issue.type === 'special'
    ? `Maxsus son №${issue.number}`
    : `${issue.number}-son`;

function JournalCover({ issue }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = issue.image && failedSrc !== issue.image;

  return (
    <div className="jar-cover">
      {showImage ? (
        <img
          src={issue.image}
          alt={`${issue.title} — ${getIssueName(issue)}`}
          loading="lazy"
          onError={() => setFailedSrc(issue.image)}
        />
      ) : (
        <div className="jar-cover-placeholder">
          <span>FSTU</span>
          <strong>SCIENTIFIC JOURNAL</strong>
          <small>{issue.year}</small>
        </div>
      )}
    </div>
  );
}

function JournalTableRow({ issue, index }) {
  return (
    <tr
      className="jar-table-row"
      style={{
        '--jar-delay': `${Math.min(index, 10) * 45}ms`
      }}
    >
      <td className="jar-cell-journal">
        <div className="jar-journal">
          <JournalCover issue={issue} />

          <div className="jar-journal-details">
            <h3>{getIssueName(issue)}</h3>
            <p>{issue.title}</p>
            <span>{issue.year}-yil · №{issue.number}</span>
          </div>
        </div>
      </td>

      <td className="jar-cell-type">
        <span
          className={
            'jar-type ' +
            (issue.type === 'special'
              ? 'jar-type-special'
              : 'jar-type-regular')
          }
        >
          {issue.type === 'special'
            ? 'Maxsus son'
            : 'Asosiy son'}
        </span>
      </td>

      <td className="jar-cell-pdf">
        {issue.pdf ? (
          <div className="jar-pdf-actions">
            <a
              href={issue.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="jar-pdf-open"
              aria-label={`${getIssueName(issue)} PDF ko‘rish`}
            >
              Ko‘rish
            </a>

            <a
              href={issue.pdf}
              download
              className="jar-pdf-download"
              aria-label={`${getIssueName(issue)} PDF yuklash`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M4 17v4h16v-4" />
              </svg>
              Yuklash
            </a>
          </div>
        ) : (
          <span className="jar-pdf-empty">
            PDF mavjud emas
          </span>
        )}
      </td>
    </tr>
  );
}

function JournalYearGroup({ year, issues }) {
  return (
    <section className="jar-year-group">
      <div className="jar-year-heading">
        <h2>{year}-yil</h2>
        <span className="jar-year-total">
          {issues.length} ta son
        </span>
      </div>

      <div className="jar-table-wrapper">
        <table className="jar-table">
          <thead>
            <tr>
              <th>Jurnal</th>
              <th>Son turi</th>
              <th>PDF fayl</th>
            </tr>
          </thead>

          <tbody>
            {issues.map((issue, index) => (
              <JournalTableRow
                key={issue.id}
                issue={issue}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function JournalIssuesPage({
  issues = DEMO_ISSUES
}) {
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return issues
      .filter((issue) => {
        const matchesType =
          type === 'all' || issue.type === type;

        const searchableText = [
          issue.title,
          issue.number,
          issue.year,
          getIssueName(issue),
          issue.type === 'special'
            ? 'maxsus son'
            : 'asosiy son'
        ].join(' ').toLocaleLowerCase();

        return matchesType &&
          (!query || searchableText.includes(query));
      })
      .sort((a, b) => {
        const yearDiff = Number(b.year) - Number(a.year);
        if (yearDiff !== 0) return yearDiff;

        const dateDiff =
          (Date.parse(b.publishedAt || '') || 0) -
          (Date.parse(a.publishedAt || '') || 0);

        return dateDiff || Number(b.number) - Number(a.number);
      });
  }, [issues, type, search]);

  const groupedIssues = useMemo(() => {
    const groups = new Map();

    filteredIssues.forEach((issue) => {
      const year = String(issue.year);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(issue);
    });

    return Array.from(groups.entries()).sort(
      ([a], [b]) => Number(b) - Number(a)
    );
  }, [filteredIssues]);

  return (
    <main className="jar-page">
      <div className="jar-layout">
        <section className="jar-main">
          <header className="jar-header">
            <div>
              <h1>Jurnal sonlari</h1>
              <p>Ilmiy jurnalning elektron arxivi</p>
            </div>
            <span className="jar-header-count">
              {filteredIssues.length} ta son
            </span>
          </header>

          <div className="jar-content">
            <div className="jar-toolbar">
              <div
                className="jar-tabs"
                role="group"
                aria-label="Jurnal soni turi"
              >
                {ISSUE_TYPES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    aria-pressed={type === item.value}
                    className={
                      'jar-tab ' +
                      (type === item.value ? 'active' : '')
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="jar-search">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Jurnalni qidirish..."
                  aria-label="Jurnalni qidirish"
                />
              </div>
            </div>

            {groupedIssues.length > 0 ? (
              <div className="jar-year-list">
                {groupedIssues.map(
                  ([year, yearIssues], index) => (
                    <React.Fragment key={year}>
                      {index > 0 && (
                        <hr className="jar-year-divider" />
                      )}

                      <JournalYearGroup
                        year={year}
                        issues={yearIssues}
                      />
                    </React.Fragment>
                  )
                )}
              </div>
            ) : (
              <div className="jar-empty">
                <h3>Jurnal sonlari topilmadi</h3>
                <p>Qidiruv yoki filtrni o‘zgartiring.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="jar-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}
