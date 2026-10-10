import React from 'react';
import { Link, useParams } from 'react-router-dom';

import '../assets/styles/EmployeeProfilePage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, getTranslatedField } from '../utils/cms';
import { useEmployeePortfolioBySlug } from '../hooks/useEmployeePortfolioBySlug';
import { useContentList } from '../hooks/useContentList';
import {
  buildEmployeeProfilePath,
  getEmployeeProfilePanelContent,
  getEmployeeProfilePanelTitle,
  normalizeEmployeePortfolio
} from '../utils/employees';
import {
  findDepartmentById,
  findFacultyById,
  findSectionById,
  normalizeAcademicEntries
} from '../utils/academic';

function normalizePanelKey(value = '') {
  return String(value || '').trim().toLowerCase()
    .replace(/o'/g, 'o').replace(/g'/g, 'g')
    .replace(/ʻ/g, '').replace(/'/g, '').replace(/`/g, '').replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function createUniquePanels(panels = []) {
  const usedKeys = new Set();
  return panels.map((panel, index) => {
    const baseKey = panel.key || `panel-${index + 1}`;
    let nextKey = baseKey;
    let dup = 2;
    while (usedKeys.has(nextKey)) { nextKey = `${baseKey}-${dup}`; dup++; }
    usedKeys.add(nextKey);
    return { ...panel, key: nextKey };
  });
}

function isLeaderPanel(panel = {}) {
  const n = normalizePanelKey(`${panel.sectionKey || ''} ${panel.title || ''}`);
  return n.includes('dekan') || n.includes('dean') || n.includes('rahbar') ||
    n.includes('mudir') || n.includes('boshliq') || n.includes('leader');
}

function isMenuForCurrentPage(menu, pageType, context) {
  if (menu.active === false || (menu.pageType || 'faculty') !== pageType) return false;
  if (pageType === 'faculty') return String(menu.facultyId || '') === String(context.facultyId || '');
  if (pageType === 'department') {
    return String(menu.facultyId || '') === String(context.facultyId || '') &&
      String(menu.departmentId || '') === String(context.departmentId || '');
  }
  return String(menu.sectionId || '') === String(context.sectionId || '');
}

function createConfiguredPanels(menuEntries = [], fallbackTitle = '') {
  return createUniquePanels(menuEntries.map((menu) => {
    const sectionSource = menu.sectionKey || getTranslatedField(menu, 'title', menu.title);
    return {
      key: normalizePanelKey(sectionSource) || `panel-${menu.id}`,
      title: getTranslatedField(menu, 'title', menu.title) || fallbackTitle,
      sectionKey: menu.sectionKey
    };
  }));
}

function EmployeeProfilePage() {
  const { slug } = useParams();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.employeeProfilePage,
    [currentLanguageCode]
  );
  const academicEntityTexts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.academicEntity,
    [currentLanguageCode]
  );
  const { item, loading } = useEmployeePortfolioBySlug(slug);
  const employee = item ? normalizeEmployeePortfolio(item) : null;
  const { items: academicItems } = useContentList('faculties');
  const { items: pageMenuItems } = useContentList('faculty-page-menus');
  const { faculties, sections } = React.useMemo(
    () => normalizeAcademicEntries(academicItems), [academicItems]
  );

  const attachedLink = React.useMemo(() => {
    if (!employee) return { href: '/', label: texts.homeLabel };
    if (employee.attachType === 'faculty') {
      const faculty = findFacultyById(faculties, employee.facultyId);
      return {
        href: employee.facultyId ? `/faculties/${employee.facultyId}` : '/faculties',
        label: getTranslatedField(faculty, 'title', faculty?.title) || texts.attachedFacultyPage
      };
    }
    if (employee.attachType === 'department') {
      const faculty = findFacultyById(faculties, employee.facultyId);
      const department = findDepartmentById(faculties, employee.facultyId, employee.departmentId);
      return {
        href: employee.facultyId && employee.departmentId
          ? `/departments/${employee.facultyId}/${employee.departmentId}` : '/departments',
        label: getTranslatedField(department, 'title', department?.title) ||
          getTranslatedField(faculty, 'title', faculty?.title) || texts.attachedDepartmentPage
      };
    }
    const section = findSectionById(sections, employee.sectionId);
    return {
      href: employee.sectionId ? `/sections/${employee.sectionId}` : '/sections',
      label: getTranslatedField(section, 'title', section?.title) || texts.attachedSectionPage
    };
  }, [employee, faculties, sections, texts]);

  const attachedLabel = React.useMemo(() => {
    if (!employee) return '';
    if (employee.attachType === 'faculty') return texts.attachLabels.faculty;
    if (employee.attachType === 'department') return texts.attachLabels.department;
    return texts.attachLabels.section;
  }, [employee, texts]);

  const relatedEmployees = React.useMemo(() => {
    if (!employee) return [];
    return [employee].filter(Boolean).map((entry) => ({
      label: entry.fullName,
      to: buildEmployeeProfilePath(entry),
      end: true
    }));
  }, [employee]);

  const employeePageType = React.useMemo(() => {
    if (!employee) return '';
    if (employee.attachType === 'faculty') return 'faculty';
    if (employee.attachType === 'department') return 'department';
    if (employee.attachType === 'section') return 'section';
    return '';
  }, [employee]);

  const attachedPageMenus = React.useMemo(() => {
    if (!employee || !employeePageType) return [];
    return [...pageMenuItems]
      .filter((menu) => isMenuForCurrentPage(menu, employeePageType, {
        facultyId: employee.facultyId,
        departmentId: employee.departmentId,
        sectionId: employee.sectionId
      }))
      .sort((l, r) => Number(l.order || 0) - Number(r.order || 0));
  }, [employee, employeePageType, pageMenuItems]);

  const attachedMenuLinks = React.useMemo(() => {
    return createConfiguredPanels(attachedPageMenus, academicEntityTexts.panelFallbackTitle)
      .filter((panel) => !isLeaderPanel(panel))
      .map((panel) => ({
        key: panel.key,
        label: panel.title,
        to: `${attachedLink.href}#${panel.key}`,
        end: false
      }));
  }, [academicEntityTexts.panelFallbackTitle, attachedLink.href, attachedPageMenus]);

  if (loading) return <main className="epp-page epp-page--loading" />;

  if (!employee || employee.active === false) {
    return (
      <main className="epp-page">
        <div className="epp-shell">
          <div className="epp-notfound">
            <span className="epp-notfound__eyebrow">{texts.eyebrow}</span>
            <h1 className="epp-notfound__title">{texts.notFoundTitle}</h1>
            <p className="epp-notfound__text">{texts.notFoundText}</p>
            <Link to="/" className="epp-btn">{texts.backHome}</Link>
          </div>
        </div>
      </main>
    );
  }

  const initials = (employee.fullName || '')
    .split(' ').slice(0, 2).map((w) => w[0] || '').join('');

  return (
    <main className="epp-page">
      <div className="epp-shell">

        {/* ── LEFT PANEL ─────────────────────────────── */}
        <aside className="epp-panel">
          <div className="epp-panel__inner">
            <span className="epp-panel__watermark" aria-hidden="true">{initials}</span>

            {/* Photo */}
            <div className="epp-panel__photo">
              {employee.image
                ? <img src={employee.image} alt={employee.fullName} />
                : <div className="epp-panel__photo-placeholder">{initials}</div>}
            </div>

            {/* Menu — scrollable, panelda */}
            {attachedMenuLinks.length > 0 && (
              <div className="epp-panel__menu">
                <AcademicSidebar
                  title={academicEntityTexts.pageMenuTitle}
                  items={attachedMenuLinks}
                  useProvidedItemsOnly
                  showLeaderCard={false}
                  showSearch={false}
                  showAnnouncements={false}
                />
              </div>
            )}

            <div className="epp-panel__vname" aria-hidden="true">{employee.fullName}</div>

            {/* Portfolio */}
            <div className="epp-panel__portfolio">
              <span className="epp-label">{texts.portfolioBadge}</span>
              <h3 className="epp-panel__portfolio-title">{texts.portfolioTitle}</h3>
              {!!relatedEmployees.length && (
                <nav className="epp-panel__related">
                  {relatedEmployees.map((rel) => (
                    <Link key={rel.to} to={rel.to} className="epp-panel__related-link">
                      {rel.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </aside>

        {/* ── RIGHT CONTENT ──────────────────────────── */}
        <div className="epp-content">

          {/* Top bar */}
          <div className="epp-topbar">
            <Link to={attachedLink.href} className="epp-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              {attachedLink.label}
            </Link>
            <span className="epp-badge">{attachedLabel}</span>
          </div>

          {/* ── HERO: foto o'ngda, matn chapda ──────── */}
          {/* ── HERO: ingichka strip, foto yo'q ────── */}
          {/* ── HERO: ultra uskiy ─────────────────── */}
          <section className="epp-hero">
            {/* O'ng: chiplar + faollik */}
            <div className="epp-hero__actions">
              {employee.phone && (
                <a href={`tel:${employee.phone}`} className="epp-chip">
                  <PhoneIcon />{employee.phone}
                </a>
              )}
              {employee.telegram && (
                <a href={employee.telegram} target="_blank" rel="noreferrer" className="epp-chip">
                  <TelegramIcon />{texts.telegram}
                </a>
              )}
              {employee.instagram && (
                <a href={employee.instagram} target="_blank" rel="noreferrer" className="epp-chip">
                  <InstagramIcon />{texts.instagram}
                </a>
              )}
              <span className="epp-active-dot">
                <span className="epp-active-dot__pulse" />
                {texts.activeBadge || 'Faol'}
              </span>
            </div>
          </section>

          {/* Divider */}
          <div className="epp-rule">
            <span className="epp-rule__label">{texts.profileSectionLabel}</span>
          </div>

          {/* Body content */}
          {(getEmployeeProfilePanelTitle(employee) || getEmployeeProfilePanelContent(employee)) && (
            <section className="epp-body">
              {!!getEmployeeProfilePanelTitle(employee) && (
                <h2 className="epp-body__title">{getEmployeeProfilePanelTitle(employee)}</h2>
              )}
              <div
                className="epp-body__content"
                dangerouslySetInnerHTML={createSafeMarkup(
                  getEmployeeProfilePanelContent(employee),
                  `<p>${texts.emptyContent}</p>`
                )}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.62a2 2 0 0 1-.45 2.11L8.09 9.6a16 16 0 0 0 6.31 6.31l1.15-1.17a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.62.6A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default EmployeeProfilePage;
