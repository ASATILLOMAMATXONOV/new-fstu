import React, { useEffect, useMemo, useState } from 'react';

import '../../assets/styles/HomeFacultyOrbit.css';
import { useContentList } from '../../hooks/useContentList';
import { buildAcademicTree } from '../../utils/academicTree';

const iconPaths = {
  university: <><path d="m3 10 9-6 9 6M3 10h18M5 10v10m4-10v10m6-10v10m4-10v10M2 21h20"/></>,
  monitor: <><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4M7 9h10"/></>,
  code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16"/></>,
  shield: <><path d="m12 2 8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/></>,
  cpu: <><rect x="5" y="5" width="14" height="14" rx="3"/><circle cx="12" cy="12" r="3"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m14 0h3"/></>,
  chart: <><path d="M3 21h18M6 18v-7m4 7V5m4 13v-5m4 5V8"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm13-15a3 3 0 0 1 0 6"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></>,
  graduation: <><path d="m2 9 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 9v7"/></>,
  book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1M12 6v14"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18"/></>,
  science: <><path d="M9 3h6m-5 0v7L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 16h8"/></>
};

function AcademicIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name] || iconPaths.university}
    </svg>
  );
}

function NodeVisual({ item }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="ac-visual">
      {item.logo && !failed ? (
        <img src={item.logo} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <AcademicIcon name={item.icon} />
      )}
    </span>
  );
}

function AcademicCard({ item, index, level, onOpen }) {
  const content = (
    <>
      <NodeVisual key={`${item.id}-${item.logo || ''}`} item={item} />

      <span className="ac-card-copy">
        <span className="ac-card-name">{item.name}</span>
        <span className="ac-card-meta">
          {level === 0
            ? `${item.departments?.length || 0} ta kafedra`
            : level === 1
              ? `${item.programs?.length || 0} ta yo'nalish`
              : "Ta'lim yo'nalishi"}
        </span>
      </span>

      <span className="ac-card-arrow" aria-hidden="true">{'\u2197'}</span>
    </>
  );

  const props = {
    className: 'ac-card',
    style: { '--ac-index': index }
  };

  if (level === 2 && item.url) {
    return <a {...props} href={item.url}>{content}</a>;
  }

  if (level === 2) {
    return <div {...props}>{content}</div>;
  }

  return (
    <button {...props} type="button" onClick={() => onOpen(item)}>
      {content}
    </button>
  );
}

export default function HomeFacultyOrbit({ data: providedData }) {
  const shouldLoadFromServer = !providedData;
  const { items: facultyItems, loading: facultiesLoading } = useContentList('faculties', {
    enabled: shouldLoadFromServer,
    revalidate: true
  });
  const { items: directionItems, loading: directionsLoading } = useContentList('directions', {
    enabled: shouldLoadFromServer,
    revalidate: true
  });
  const data = useMemo(
    () => providedData || buildAcademicTree(facultyItems, directionItems),
    [directionItems, facultyItems, providedData]
  );
  const [history, setHistory] = useState([]);
  const loading = shouldLoadFromServer && (facultiesLoading || directionsLoading);

  useEffect(() => {
    setHistory([]);
  }, [data]);

  const level = history.length;
  const current = history[level - 1] || data;
  const items = level === 0
    ? current.faculties || []
    : level === 1
      ? current.departments || []
      : current.programs || [];

  const left = items.filter((_, index) => index % 2 === 0);
  const right = items.filter((_, index) => index % 2 === 1);

  const goHome = () => setHistory([]);
  const goBack = () => setHistory((previous) => previous.slice(0, -1));
  const openItem = (item) => {
    if (level < 2) {
      setHistory((previous) => [...previous, item]);
    }
  };

  const labels = ['UNIVERSITET', 'FAKULTET', 'KAFEDRA'];
  const nextLabels = ['Fakultetlar', 'Kafedralar', "Ta'lim yo'nalishlari"];

  return (
    <section className="ac-section" aria-labelledby="ac-heading">
      <div className="ac-container">
        <header className="ac-header">
          <span className="ac-eyebrow">ACADEMIC STRUCTURE</span>
          <h2 id="ac-heading">Fakultetlar va kafedralar</h2>
          <p>Universitet akademik tuzilmasi bilan tanishing.</p>
        </header>

        <div className="ac-navigation">
          <nav className="ac-breadcrumb" aria-label="Akademik tuzilma">
            <button type="button" onClick={goHome}>Universitet</button>

            {history.map((item, index) => (
              <React.Fragment key={`${index}-${item.id}`}>
                <span aria-hidden="true">/</span>
                <button
                  type="button"
                  aria-current={index === history.length - 1 ? 'page' : undefined}
                  onClick={() => setHistory(history.slice(0, index + 1))}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {level > 0 && (
            <button className="ac-back" type="button" onClick={goBack}>
              {'\u2190'} Orqaga
            </button>
          )}
        </div>

        <div className="ac-layout" key={`${level}-${current.id}`}>
          <div className="ac-column ac-column-left">
            {left.map((item, index) => (
              <AcademicCard key={item.id} item={item} level={level} index={index * 2} onOpen={openItem} />
            ))}
          </div>

          <div className="ac-center">
            <div className="ac-center-decoration" />

            <span className="ac-center-visual">
              <NodeVisual key={`${current.id}-${current.logo || ''}`} item={current} />
            </span>

            <span className="ac-center-eyebrow">{labels[level]}</span>
            <h3>{current.name}</h3>
            <div className="ac-center-divider" />

            <span className="ac-center-count">
              <strong>{items.length}</strong>
              <span>{nextLabels[level]}</span>
            </span>

            {level > 0 && (
              <button type="button" className="ac-center-home" onClick={goHome}>
                Boshiga qaytish {'\u2197'}
              </button>
            )}
          </div>

          <div className="ac-column ac-column-right">
            {right.map((item, index) => (
              <AcademicCard key={item.id} item={item} level={level} index={index * 2 + 1} onOpen={openItem} />
            ))}
          </div>
        </div>

        {items.length === 0 && (
          <p className="ac-empty">
            {loading ? "Ma'lumotlar yuklanmoqda..." : "Hozircha ma'lumot mavjud emas."}
          </p>
        )}

        <footer className="ac-footer">
          <span className="ac-status-dot" />
          <span>{nextLabels[level]}</span>
          <span className="ac-footer-separator">-</span>
          <span>
            {level === 2
              ? "Yo'nalish haqida ma'lumot"
              : "Davom etish uchun bo'limni tanlang"}
          </span>
        </footer>
      </div>
    </section>
  );
}
