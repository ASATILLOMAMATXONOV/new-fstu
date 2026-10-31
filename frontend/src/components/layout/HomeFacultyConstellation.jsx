import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import '../../assets/styles/HomeFacultyConstellation.css';
import { useContentList } from '../../hooks/useContentList';
import { useSetting } from '../../hooks/useSetting';
import {
  ACADEMIC_SOURCE_LABELS,
  STRUCTURE_RESOURCE_MAP,
  academicText,
  buildAcademicCollections,
  buildLinkedMenuCollection,
  buildResourceCollection,
  getStructureMenus,
  structureSource
} from '../../utils/academicStructure';
import { createSafeMarkup, getTranslatedField, stripHtml } from '../../utils/cms';

/* ==========================================
   ICON LIBRARY
========================================== */

const ICON_PATHS = {
  university: <path d="m3 10 9-6 9 6M3 10h18M5 10v10m4-10v10m6-10v10m4-10v10M2 21h20" />,
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 22h8m-4-4v4M7 9h10" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-2-13-4 16" />,
  shield: (
    <>
      <path d="m12 2 8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6l8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  cpu: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <circle cx="12" cy="12" r="3" />
      <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m14 0h3" />
    </>
  ),
  chart: <path d="M3 21h18M6 18v-7m4 7V5m4 13v-5m4 5V8" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm13-15a3 3 0 0 1 0 6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
  graduation: (
    <>
      <path d="m2 9 10-5 10 5-10 5-10-5Z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5M22 9v7" />
    </>
  ),
  book: <path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1M12 6v14" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18" />
    </>
  ),
  science: <path d="M9 3h6m-5 0v7L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 16h8" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  back: <path d="M19 12H5m6 6-6-6 6-6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  home: <path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" />,
  link: <path d="M7 17 17 7M8 7h9v9" />,
  scroll: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="7" />
      <path d="M12 6v5m-2-2 2 2 2-2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />
};

function Icon({ name, className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name] || ICON_PATHS.university}
    </svg>
  );
}

/* ==========================================
   LOGO / FALLBACK
========================================== */

function NodeVisual({ item }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [item?.logo]);

  if (item?.logo && !failed) {
    return <img src={item.logo} alt="" loading="lazy" onError={() => setFailed(true)} />;
  }

  return <Icon name={item?.icon || 'university'} />;
}

/* ==========================================
   LEVEL CONFIG
========================================== */

function getChildren(item) {
  return item?.departments || item?.programs || [];
}

/* ==========================================
   ACADEMIC CARD
   CENTER LOGO / COMPLETE TITLE
========================================== */

function AcademicCard({ item, index, onOpen }) {
  const children = getChildren(item);
  const isLink = children.length === 0 && Boolean(item.url);
  const interactive = children.length > 0 || isLink;
  const longTitle = String(item?.name || '').length > 48;

  const className = [
    'ae-card',
    interactive ? 'ae-card--interactive' : 'ae-card--static',
    longTitle ? 'ae-card--long-title' : ''
  ].join(' ');

  const cardContent = (
    <>
      <span className="ae-card-number">{String(index + 1).padStart(2, '0')}</span>

      <span className="ae-card-image">
        <NodeVisual item={item} />
      </span>

      <span className="ae-card-content">
        <strong className="ae-card-title" title={item.name}>
          {item.name}
        </strong>

        <span className="ae-card-subtitle">
          {children.length > 0
            ? `${children.length} ta ${item.kind === 'faculty' ? 'kafedra' : 'yo‘nalish'}`
            : item.subtitle || (item.url ? 'Batafsil' : '')}
        </span>
      </span>

      {longTitle && (
        <span
          className="ae-card-full-title"
          aria-hidden="true"
          onClick={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          {item.name}
        </span>
      )}

      <span className="ae-card-bottom">
        <span className="ae-card-category">{ACADEMIC_SOURCE_LABELS[item.kind]?.singular.toLocaleUpperCase()}</span>

        {interactive && (
          <span className="ae-card-arrow">
            <Icon name={isLink ? 'link' : 'arrow'} />
          </span>
        )}
      </span>

      <span className="ae-card-accent" />
    </>
  );

  const style = {
    '--card-index': Math.min(index, 12)
  };

  if (isLink) {
    return (
      <a href={item.url} className={className} style={style} aria-label={`${item.name} sahifasiga o‘tish`}>
        {cardContent}
      </a>
    );
  }

  if (children.length > 0) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={() => onOpen(item)}
        aria-label={`${item.name} bo‘limini ochish`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={className} style={style}>
      {cardContent}
    </div>
  );
}

/* ==========================================
   UNIVERSITY BRAND
========================================== */

function UniversityBrand({ data }) {
  return (
    <div className="ae-brand-panel">
      <div className="ae-brand-logo">
        <NodeVisual item={data} />
      </div>

      <div className="ae-brand-text">
        <strong>{data?.name || 'Universitet'}</strong>
        {data?.subtitle && <span>{data.subtitle}</span>}
      </div>

      <span className="ae-brand-decoration" />
    </div>
  );
}

/* ==========================================
   NAVIGATION ITEM
========================================== */

function NavigationItem({ title, subtitle, active, onClick }) {
  return (
    <button
      type="button"
      className={`ae-nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'step' : undefined}
    >
      <span className="ae-nav-info">
        <strong>{title}</strong>
        {subtitle && <small title={subtitle}>{subtitle}</small>}
      </span>
    </button>
  );
}

/* ==========================================
   SIDEBAR WITH SCROLL
========================================== */

function AcademicSidebar({ menus, selectedId, text, loading, onSelect }) {
  return (
    <aside className="ae-sidebar">
      <div className="ae-sidebar-header">
        <span className="ae-sidebar-header-icon">
          <Icon name="layers" />
        </span>

        <span className="ae-sidebar-header-text">
          <strong>{text.mapTitle || 'TUZILMA XARITASI'}</strong>
          {text.mapSubtitle && <small>{text.mapSubtitle}</small>}
        </span>
      </div>

      <div className="ae-sidebar-scroll" role="region" aria-label="Akademik navigatsiya" tabIndex={0}>
        <nav className="ae-navigation">
          {menus.map((menu) => (
            <NavigationItem
              key={menu.id}
              title={menu.name}
              subtitle={menu.subtitle}
              active={menu.id === selectedId}
              onClick={() => onSelect(menu.id)}
            />
          ))}
        </nav>

        {(text.catalogTitle || text.catalogDescription) && (
          <div className="ae-sidebar-description">
            <span className="ae-description-line" />

            {text.catalogTitle && <strong>{text.catalogTitle}</strong>}

            {text.catalogDescription && <p>{text.catalogDescription}</p>}
          </div>
        )}

        <div className="ae-sidebar-status">
          <span className="ae-online-dot" />
          <span>Akademik ma’lumotlar</span>
          <strong>{loading ? 'Yuklanmoqda' : 'Faol'}</strong>
        </div>
      </div>
    </aside>
  );
}

/* ==========================================
   ANIMATED BANNER
========================================== */

function AcademicBanner({ current, rootData, title, description, count }) {
  const image = current?.backImage || rootData?.backImage;

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <div className="ae-banner">
      {image && !failed && <img className="ae-banner-image" src={image} alt="" onError={() => setFailed(true)} />}

      <div className="ae-banner-grid" aria-hidden="true" />
      <div className="ae-banner-orbit" aria-hidden="true" />

      <div className="ae-banner-content">
        <span className="ae-banner-eyebrow">
          <i />
          {current?.kind ? ACADEMIC_SOURCE_LABELS[current.kind]?.singular : title}
        </span>

        <div className="ae-banner-icon">
          <NodeVisual item={current} />
        </div>

        <h3>{current?.name || 'Universitet'}</h3>

        <p>{description}</p>
      </div>

      <div className="ae-banner-count">
        <strong>{String(count).padStart(2, '0')}</strong>
        <span>{title}</span>
      </div>
    </div>
  );
}

/* ==========================================
   SCROLL HOOK
========================================== */

function useOverflow(ref, dependencies) {
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      setHasOverflow(false);
      return undefined;
    }

    const check = () => {
      setHasOverflow(element.scrollHeight > element.clientHeight + 2);
    };

    check();

    window.addEventListener('resize', check);

    let observer;

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(check);
      observer.observe(element);
    }

    return () => {
      window.removeEventListener('resize', check);
      observer?.disconnect();
    };
  }, [ref, dependencies]);

  return hasOverflow;
}

/* ==========================================
   MAIN COMPONENT
========================================== */

export default function HomeFacultyConstellation() {
  const { item: setting, currentLanguageCode } = useSetting('academic-structure');
  const hasLinkedMenus =
    Array.isArray(setting?.menus) &&
    setting.active !== false &&
    setting.menus.some((menu) => menu?.active !== false && menu?.sourceType === 'menu');
  const { items: mainMenuItems } = useContentList('menus', {
    enabled: hasLinkedMenus,
    summaryOnly: false,
    revalidate: true
  });
  const { items: academicMenuItems } = useContentList('academic-menus', {
    enabled: hasLinkedMenus,
    summaryOnly: false,
    revalidate: true
  });
  const siteMenus = useMemo(() => [...mainMenuItems, ...academicMenuItems], [mainMenuItems, academicMenuItems]);
  const menus = useMemo(
    () => getStructureMenus(setting, currentLanguageCode, siteMenus),
    [setting, currentLanguageCode, siteMenus]
  );
  const [selectedId, setSelectedId] = useState(null);
  const selectedMenu = menus.find((menu) => menu.id === selectedId) || menus[0];
  if (!selectedMenu) return null;
  return (
    <AcademicWorkspace
      key={`${selectedMenu.id}:${structureSource(selectedMenu)}:${currentLanguageCode}`}
      setting={setting}
      currentLanguageCode={currentLanguageCode}
      menus={menus}
      selectedMenu={selectedMenu}
      siteMenus={siteMenus}
      onSelect={setSelectedId}
    />
  );
}

function AcademicWorkspace({ setting, currentLanguageCode, menus, selectedMenu, siteMenus, onSelect }) {
  const sourceType = structureSource(selectedMenu);
  const isAcademicSource = ['faculty', 'department', 'section', 'direction'].includes(sourceType);
  const { items: facultyItems, loading: facultiesLoading } = useContentList('faculties', {
    enabled: isAcademicSource,
    revalidate: true
  });
  const { items: directionItems, loading: directionsLoading } = useContentList('directions', {
    enabled: isAcademicSource,
    revalidate: true
  });
  const resource = STRUCTURE_RESOURCE_MAP[sourceType];
  const { items: resourceItems, loading: resourceLoading } = useContentList(resource || 'pages', {
    enabled: Boolean(resource),
    revalidate: true
  });
  const sourceItems = useMemo(
    () =>
      sourceType === 'menu'
        ? buildLinkedMenuCollection(selectedMenu, siteMenus, currentLanguageCode)
        : buildResourceCollection(sourceType, resourceItems, currentLanguageCode),
    [sourceType, resourceItems, selectedMenu, siteMenus, currentLanguageCode]
  );
  const panelContent =
    sourceType === 'menu' ? getTranslatedField(selectedMenu.node, 'content', '', currentLanguageCode) : '';
  const hasPanelContent = Boolean(stripHtml(panelContent) || /<(img|table)\b/i.test(panelContent));
  const collections = useMemo(
    () => buildAcademicCollections(facultyItems, directionItems, currentLanguageCode),
    [facultyItems, directionItems, currentLanguageCode]
  );
  const text = Object.fromEntries(
    [
      'title',
      'description',
      'universityName',
      'universitySubtitle',
      'mapTitle',
      'mapSubtitle',
      'catalogTitle',
      'catalogDescription'
    ].map((key) => [key, academicText(setting?.[key], currentLanguageCode)])
  );
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const selectionKey = `${selectedMenu?.id || ''}:${selectedMenu?.sourceType || ''}`;
  const gridRef = useRef(null);
  const loading = isAcademicSource ? facultiesLoading || directionsLoading : Boolean(resource) && resourceLoading;

  useEffect(() => {
    setHistory([]);
    setQuery('');
  }, [selectionKey, collections]);

  const rootData = {
    id: selectedMenu?.id,
    name: text.universityName || selectedMenu?.name,
    subtitle: text.universitySubtitle,
    logo: setting?.logo || '',
    backImage: setting?.image || ''
  };
  const current = history[history.length - 1] || rootData;
  const items = useMemo(
    () =>
      history.length
        ? getChildren(history[history.length - 1])
        : isAcademicSource
          ? collections[sourceType] || []
          : sourceItems,
    [history, collections, sourceType, sourceItems, isAcademicSource]
  );
  const filteredItems = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return search
      ? items.filter((item) =>
          String(item?.name || '')
            .toLocaleLowerCase()
            .includes(search)
        )
      : items;
  }, [items, query]);
  const collectionTitle = history.length
    ? ACADEMIC_SOURCE_LABELS[current.kind === 'faculty' ? 'department' : 'direction'].title
    : selectedMenu?.name || '';
  const pageKey = `${selectionKey}:${history.map((item) => item.id).join(':')}`;
  const hasScroll = useOverflow(gridRef, `${pageKey}-${query}-${filteredItems.length}`);
  const goHome = useCallback(() => {
    setHistory([]);
    setQuery('');
  }, []);
  const goBack = useCallback(() => {
    setHistory((previous) => previous.slice(0, -1));
    setQuery('');
  }, []);
  const goTo = useCallback((index) => {
    setHistory((previous) => previous.slice(0, index + 1));
    setQuery('');
  }, []);
  const openItem = useCallback((item) => {
    setHistory((previous) => [...previous, item]);
    setQuery('');
  }, []);
  const selectMenu = (id) => {
    onSelect(id);
    goHome();
  };

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
  }, [pageKey, query]);

  return (
    <section className="ae-section" aria-labelledby="ae-title">
      <div className="ae-shell">
        <header className="ae-page-header">
          <div>
            <h2 id="ae-title">{text.title || 'Akademik tuzilma'}</h2>
            {text.description && <p>{text.description}</p>}
          </div>
          <div className="ae-page-level">
            <Icon name="layers" />
            <span>
              <strong>{String(menus.length).padStart(2, '0')}</strong>
              <small>Tuzilma menyulari</small>
            </span>
          </div>
        </header>
        <div className="ae-workspace">
          <div className="ae-brand-area">
            <UniversityBrand data={rootData} />
          </div>
          <div className="ae-banner-area">
            <nav className="ae-breadcrumb" aria-label="Sahifa yo‘li">
              <button type="button" onClick={goHome} aria-current={history.length === 0 ? 'page' : undefined}>
                <Icon name="home" />
                {selectedMenu.name}
              </button>
              {history.map((node, index) => (
                <React.Fragment key={`${node.id}-${index}`}>
                  <span>/</span>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={index === history.length - 1 ? 'page' : undefined}
                  >
                    {node.name}
                  </button>
                </React.Fragment>
              ))}
            </nav>
            <AcademicBanner
              key={pageKey}
              current={current}
              rootData={rootData}
              title={collectionTitle}
              description={selectedMenu.subtitle}
              count={items.length}
            />
          </div>
          <AcademicSidebar
            menus={menus}
            selectedId={selectedMenu.id}
            text={text}
            loading={loading}
            onSelect={selectMenu}
          />
          <div className="ae-content">
            <div className="ae-toolbar">
              <div className="ae-toolbar-title">
                <span className="ae-title-line" />
                <div>
                  <h3>{collectionTitle}</h3>
                  <p>{filteredItems.length} ta natija</p>
                </div>
              </div>
              <label className="ae-search">
                <Icon name="search" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nomi bo‘yicha qidirish..."
                  aria-label="Bo‘limlarni qidirish"
                />
              </label>
            </div>
            <div className="ae-content-body">
              {hasPanelContent && !query && (
                <div className="ae-menu-content" dangerouslySetInnerHTML={createSafeMarkup(panelContent)} />
              )}
              {filteredItems.length > 0 ? (
                <div
                  ref={gridRef}
                  key={pageKey}
                  className="ae-card-grid"
                  role="region"
                  tabIndex={0}
                  aria-label={`${collectionTitle} ro‘yxati`}
                >
                  {filteredItems.map((item, index) => (
                    <AcademicCard key={`${item.kind}-${item.id}`} item={item} index={index} onOpen={openItem} />
                  ))}
                </div>
              ) : (
                <div className="ae-empty">
                  <Icon name="search" />
                  <strong>
                    {loading
                      ? 'Ma’lumotlar yuklanmoqda...'
                      : query
                        ? 'Hech narsa topilmadi'
                        : 'Hozircha ma’lumot mavjud emas'}
                  </strong>
                  <p>{query ? 'Boshqa so‘z bilan qidiring.' : 'Akademik ma’lumotlar shu yerda ko‘rinadi.'}</p>
                </div>
              )}
            </div>
            <div className="ae-content-footer">
              {hasScroll ? (
                <>
                  <Icon name="scroll" />
                  <span>Qolgan ma’lumotlar uchun pastga aylantiring</span>
                </>
              ) : (
                <span>{filteredItems.length} ta element</span>
              )}
            </div>
          </div>
        </div>
        {history.length > 0 && (
          <div className="ae-actions">
            <button type="button" onClick={goBack}>
              <Icon name="back" />
              Orqaga
            </button>
            {current.url && (
              <a href={current.url}>
                Batafsil
                <Icon name="link" />
              </a>
            )}
            <button type="button" onClick={goHome}>
              {selectedMenu.name}
              <Icon name="home" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
