import React, { useEffect, useMemo, useState } from 'react';

import '../../assets/styles/HomeFacultyConstellation.css';
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name] || iconPaths.university}
    </svg>
  );
}

function NodeVisual({ item }) {
  const [failed, setFailed] = useState(false);

  return item.logo && !failed
    ? <img src={item.logo} alt="" onError={() => setFailed(true)} />
    : <AcademicIcon name={item.icon} />;
}

function HexNode({ item, index, side, level, onOpen }) {
  const count = level === 0 ? item.departments?.length || 0
    : level === 1 ? item.programs?.length || 0 : null;
  const title = (
    <>
      <span className="ui-hex-core"><NodeVisual item={item} /></span>
      <span className="ui-hex-hint" aria-hidden="true">{'\u2197'}</span>
    </>
  );

  return (
    <div className={`ui-entry ui-entry--${side}`} style={{ '--order': index }}>
      {side === 'left' && (
        <div className="ui-entry-copy">
          <strong>{item.name}</strong>
          <span>{level === 0 ? `${count} ta kafedra` : level === 1 ? `${count} ta yo'nalish` : "Ta'lim yo'nalishi"}</span>
        </div>
      )}

      <div className="ui-hex-entrance">
        {level === 2 && item.url
          ? <a className="ui-hex" href={item.url} aria-label={item.name}>{title}</a>
          : level === 2
            ? <div className="ui-hex ui-hex--static" aria-label={item.name}>{title}</div>
            : <button type="button" className="ui-hex" onClick={() => onOpen(item)} aria-label={`${item.name} - batafsil`}>{title}</button>}
      </div>

      {side === 'right' && (
        <div className="ui-entry-copy">
          <strong>{item.name}</strong>
          <span>{level === 0 ? `${count} ta kafedra` : level === 1 ? `${count} ta yo'nalish` : "Ta'lim yo'nalishi"}</span>
        </div>
      )}
    </div>
  );
}

export default function HomeFacultyConstellation({ data: providedData }) {
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
  const items = level === 0 ? current.faculties || []
    : level === 1 ? current.departments || [] : current.programs || [];
  const left = items.filter((_, index) => index % 2 === 0);
  const right = items.filter((_, index) => index % 2 === 1);
  const rows = Math.max(left.length, right.length, 1);
  const goHome = () => setHistory([]);
  const openItem = (item) => {
    if (level < 2) {
      setHistory((previous) => [...previous, item]);
    }
  };
  const next = ['Fakultetlar', 'Kafedralar', "Ta'lim yo'nalishlari"];

  return (
    <section className="ui-section" aria-labelledby="ui-title">
      <div className="ui-container">
        <div className="ui-heading">
          <span className="ui-eyebrow">UNIVERSITY STRUCTURE</span>
          <h2 id="ui-title">Fakultetlar va kafedralar</h2>
          <p>Akademik tuzilma bilan tanishing - davom etish uchun olti burchakni tanlang.</p>
        </div>

        <nav className="ui-breadcrumb" aria-label="Akademik tuzilma">
          <button type="button" onClick={goHome}>Universitet</button>
          {history.map((node, index) => (
            <React.Fragment key={`${node.id}-${index}`}>
              <span> / </span>
              <button type="button" onClick={() => setHistory((previous) => previous.slice(0, index + 1))}>
                {node.name}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="ui-stage" key={`${level}-${current.id}`} style={{ '--rows': rows }}>
          <div className="ui-side ui-side--left">
            {left.map((item, index) => (
              <HexNode key={item.id} item={item} index={index} level={level} side="left" onOpen={openItem} />
            ))}
          </div>

          <div className="ui-hub-wrap">
            <div className="ui-hub" tabIndex={0} aria-label={`${current.name}. Orqa tomondagi rasmni ko'rish uchun kursorni olib boring yoki fokuslang.`}>
              <div className="ui-hub-flip">
                <div className="ui-hub-face ui-hub-front">
                  <div className="ui-hub-inner">
                    <div className="ui-hub-logo"><NodeVisual key={current.id} item={current} /></div>
                    <small>{['UNIVERSITET', 'FAKULTET', 'KAFEDRA'][level]}</small>
                    <h3>{current.name}</h3>
                    <span className="ui-hub-rule" />
                    <span className="ui-hub-count">{items.length} ta {next[level].toLowerCase()}</span>
                  </div>
                </div>

                <div className="ui-hub-face ui-hub-back">
                  <img
                    src={current.backImage || data.backImage}
                    alt={`${current.name} binosi`}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="ui-hub-back-title">{current.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ui-side ui-side--right">
            {right.map((item, index) => (
              <HexNode key={item.id} item={item} index={index} level={level} side="right" onOpen={openItem} />
            ))}
          </div>
        </div>

        {!items.length && (
          <p className="ui-empty">
            {loading ? "Ma'lumotlar yuklanmoqda..." : "Hozircha ma'lumot mavjud emas."}
          </p>
        )}

        {level > 0 && (
          <div className="ui-actions">
            <button type="button" onClick={() => setHistory((previous) => previous.slice(0, -1))}>{'\u2190'} Orqaga</button>
            <button type="button" onClick={goHome}>Bosh sahifaga qaytish {'\u2197'}</button>
          </div>
        )}
      </div>
    </section>
  );
}
