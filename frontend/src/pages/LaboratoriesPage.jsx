
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AcademicSidebar from '../components/layout/AcademicSidebar';
import '../assets/styles/LaboratoriesPage.css';

import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getTranslatedField, getHtmlExcerpt } from '../utils/cms';

const PER_PAGE = 6;

const LABELS = {
  uz: {
    category: 'Laboratoriya',
    view: 'Batafsil ma’lumot',
    location: 'Joylashuvi',
    manager: 'Mas’ul xodim',
    empty: 'Laboratoriyalar mavjud emas',
    loading: 'Laboratoriyalar yuklanmoqda...',
    prev: 'Oldingi',
    next: 'Keyingi',
    noDescription: 'Laboratoriya haqida batafsil ma’lumot.'
  },
  ru: {
    category: 'Лаборатория',
    view: 'Подробнее',
    location: 'Расположение',
    manager: 'Ответственный',
    empty: 'Лаборатории не найдены',
    loading: 'Загрузка лабораторий...',
    prev: 'Назад',
    next: 'Далее',
    noDescription: 'Подробная информация о лаборатории.'
  },
  en: {
    category: 'Laboratory',
    view: 'View details',
    location: 'Location',
    manager: 'Coordinator',
    empty: 'No laboratories available',
    loading: 'Loading laboratories...',
    prev: 'Previous',
    next: 'Next',
    noDescription: 'Detailed information about the laboratory.'
  }
};

const ICONS = {
  arrow: <path d="M5 12h14m-7-7 7 7-7 7" />,
  map: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  lab: (
    <>
      <path d="M9 3h6m-5 0v7l-6 9a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-6-9V3" />
      <path d="M7 16h10" />
    </>
  )
};

function Icon({ name, size = 18 }) {
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
      {ICONS[name]}
    </svg>
  );
}

function getLaboratoryData(item, ui) {
  const read = (field) =>
    getTranslatedField(item, field, item?.[field]) || '';

  return {
    id: item.id,
    title: read('title') || read('name'),
    direction: read('direction') || read('category') || ui.category,
    description:
      getHtmlExcerpt(read('content'), 130) ||
      read('description') ||
      ui.noDescription,
    image: item.image || item.photo || '',
    location: read('location') || read('address'),
    manager: read('manager') || read('responsible')
  };
}

function LaboratoryCard({ item, index, ui, onOpen }) {
  const lab = getLaboratoryData(item, ui);

  return (
    <button
      type="button"
      className="laboratory-card"
      style={{ '--lab-delay': `${Math.min(index, 8) * 0.075}s` }}
      onClick={() => onOpen(lab.id)}
      aria-label={`${ui.view}: ${lab.title}`}
    >
      <div className="laboratory-card-image">
        {lab.image ? (
          <img src={lab.image} alt={lab.title} loading="lazy" />
        ) : (
          <div className="laboratory-card-placeholder">
            <Icon name="lab" size={55} />
          </div>
        )}

        <div className="laboratory-image-overlay" />

        <span className="laboratory-image-badge">
          {lab.direction}
        </span>
      </div>

      <div className="laboratory-card-content">
        <h2>{lab.title}</h2>

        <p className="laboratory-description">
          {lab.description}
        </p>

        {(lab.location || lab.manager) && (
          <div className="laboratory-card-meta">
            {lab.location && (
              <div className="laboratory-meta-item">
                <Icon name="map" size={16} />
                <span>{lab.location}</span>
              </div>
            )}

            {lab.manager && (
              <div className="laboratory-meta-item">
                <Icon name="user" size={16} />
                <span>{lab.manager}</span>
              </div>
            )}
          </div>
        )}

        <div className="laboratory-card-footer">
          <span>{ui.view}</span>
          <span className="laboratory-card-arrow">
            <Icon name="arrow" size={18} />
          </span>
        </div>
      </div>
    </button>
  );
}

function LaboratoriesPage() {
  const navigate = useNavigate();
  const { currentLanguageCode } = useLanguage();
  const ui = LABELS[currentLanguageCode] || LABELS.uz;

  const { items = [], loading } = useContentList('laboratories', {
    orderBy: 'recent'
  });

  const [page, setPage] = useState(1);

  const laboratories = useMemo(() => {
    return [...items]
      .filter((item) => item && item.active !== false)
      .sort((a, b) => {
        const aOrder = Number(a.sortOrder ?? a.order ?? 999999);
        const bOrder = Number(b.sortOrder ?? b.order ?? 999999);
        return aOrder - bOrder;
      });
  }, [items]);

  const totalPages = Math.max(
    1,
    Math.ceil(laboratories.length / PER_PAGE)
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const visibleLaboratories = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return laboratories.slice(start, start + PER_PAGE);
  }, [laboratories, page]);

  const changePage = (next) => {
    if (next < 1 || next > totalPages) return;

    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="laboratories-page">
      <div className="laboratories-layout">
        <section className="laboratories-main">
          {loading ? (
            <div className="laboratories-grid" aria-busy="true">
              {Array.from({ length: PER_PAGE }).map((_, index) => (
                <div className="laboratory-skeleton" key={index}>
                  <div className="laboratory-skeleton-image" />
                  <div className="laboratory-skeleton-body">
                    <div className="laboratory-skeleton-line" />
                    <div className="laboratory-skeleton-line short" />
                    <div className="laboratory-skeleton-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : laboratories.length === 0 ? (
            <div className="laboratories-empty">
              <Icon name="lab" size={40} />
              <p>{ui.empty}</p>
            </div>
          ) : (
            <>
              <div className="laboratories-grid" key={page}>
                {visibleLaboratories.map((lab, index) => (
                  <LaboratoryCard
                    key={lab.id ?? index}
                    item={lab}
                    index={index}
                    ui={ui}
                    onOpen={(labId) => navigate(`/laboratories/${labId}`)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="laboratories-pagination"
                  aria-label="Laboratory pages"
                >
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => changePage(page - 1)}
                  >
                    {ui.prev}
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((number) => (
                    <button
                      key={number}
                      type="button"
                      className={page === number ? 'active' : ''}
                      aria-current={page === number ? 'page' : undefined}
                      onClick={() => changePage(number)}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => changePage(page + 1)}
                  >
                    {ui.next}
                  </button>
                </nav>
              )}
            </>
          )}
        </section>

        <aside className="laboratories-sidebar">
          <AcademicSidebar />
        </aside>
      </div>
    </main>
  );
}

export default LaboratoriesPage;
