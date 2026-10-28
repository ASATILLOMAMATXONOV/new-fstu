
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
  getEmployeeProfilePanelContent,
  getEmployeeProfilePanelTitle,
  getEmployeePosition,
  normalizeEmployeePortfolio
} from '../utils/employees';

import {
  findDepartmentById,
  findFacultyById,
  findSectionById,
  normalizeAcademicEntries
} from '../utils/academic';

function Icon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.6 2.62a2 2 0 0 1-.45 2.11L8.09 9.6a16 16 0 0 0 6.31 6.31l1.15-1.17a2 2 0 0 1 2.11-.45c.84.28 1.72.48 2.62.6A2 2 0 0 1 22 16.92Z" />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    telegram: <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />,
    instagram: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
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
}

function normalizePanelKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o['‘’ʻ`]/g, 'o')
    .replace(/g['‘’ʻ`]/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function idMatches(value, expected) {
  const target = String(expected ?? '').trim();
  if (!target || value == null) return false;

  if (Array.isArray(value)) {
    return value.some((entry) => idMatches(entry, target));
  }

  if (typeof value === 'object') {
    return idMatches(value.id ?? value._id ?? value.value, target);
  }

  return String(value).trim() === target;
}

function isMenuForCurrentPage(menu, pageType, employee) {
  if (!menu || !pageType) return false;

  if (
    menu.active === false ||
    menu.isActive === false ||
    menu.is_active === false ||
    ['inactive', 'disabled'].includes(
      String(menu.status || '').toLowerCase()
    )
  ) {
    return false;
  }

  const kind = String(
    menu.pageType ?? menu.page_type ?? 'faculty'
  ).trim().toLowerCase();

  if (kind !== pageType) return false;

  const facultyId =
    menu.facultyId ?? menu.faculty_id ?? menu.faculty;

  const departmentId =
    menu.departmentId ?? menu.department_id ?? menu.department;

  const sectionId =
    menu.sectionId ?? menu.section_id ?? menu.section;

  if (pageType === 'faculty') {
    return idMatches(facultyId, employee.facultyId);
  }

  if (pageType === 'department') {
    return (
      idMatches(facultyId, employee.facultyId) &&
      idMatches(departmentId, employee.departmentId)
    );
  }

  if (pageType === 'section') {
    return idMatches(sectionId, employee.sectionId);
  }

  return false;
}

function isLeaderMenu(menu) {
  const value = normalizePanelKey(
    `${menu.sectionKey || ''} ${menu.title || ''}`
  );

  return [
    'dekan',
    'dean',
    'rahbar',
    'mudir',
    'boshliq',
    'leader'
  ].some((term) => value.includes(term));
}

function socialUrl(value, type) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol)
        ? url.href
        : '';
    } catch {
      return '';
    }
  }

  if (type === 'telegram' && /^@?[a-zA-Z0-9_]{5,32}$/.test(raw)) {
    return `https://t.me/${raw.replace(/^@/, '')}`;
  }

  if (type === 'instagram' && /^@?[a-zA-Z0-9._]{1,30}$/.test(raw)) {
    return `https://instagram.com/${raw.replace(/^@/, '')}/`;
  }

  return '';
}

export default function EmployeeProfilePage() {
  const { slug } = useParams();
  const { currentLanguageCode } = useLanguage();

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.employeeProfilePage,
    [currentLanguageCode]
  );

  const academicTexts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.academicEntity,
    [currentLanguageCode]
  );

  const { item, loading } = useEmployeePortfolioBySlug(slug);
  const employee = React.useMemo(
    () => item ? normalizeEmployeePortfolio(item) : null,
    [item]
  );

  const { items: academicItems = [] } = useContentList('faculties');
  const { items: pageMenuItems = [] } = useContentList('faculty-page-menus');

  const { faculties, sections } = React.useMemo(() => {
    const entries = normalizeAcademicEntries(
      Array.isArray(academicItems) ? academicItems : []
    );

    return {
      faculties: entries?.faculties || [],
      sections: entries?.sections || []
    };
  }, [academicItems]);

  const attachedLink = React.useMemo(() => {
    if (!employee) {
      return { href: '/', label: texts.homeLabel || 'Bosh sahifa' };
    }

    if (employee.attachType === 'faculty') {
      const faculty = findFacultyById(faculties, employee.facultyId);
      return {
        href: employee.facultyId
          ? `/faculties/${employee.facultyId}`
          : '/faculties',
        label: getTranslatedField(faculty, 'title', faculty?.title) ||
          texts.attachedFacultyPage || 'Fakultet'
      };
    }

    if (employee.attachType === 'department') {
      const faculty = findFacultyById(faculties, employee.facultyId);
      const department = findDepartmentById(
        faculties,
        employee.facultyId,
        employee.departmentId
      );

      return {
        href: employee.facultyId && employee.departmentId
          ? `/departments/${employee.facultyId}/${employee.departmentId}`
          : '/departments',
        label:
          getTranslatedField(department, 'title', department?.title) ||
          getTranslatedField(faculty, 'title', faculty?.title) ||
          texts.attachedDepartmentPage ||
          'Kafedra'
      };
    }

    const section = findSectionById(sections, employee.sectionId);

    return {
      href: employee.sectionId
        ? `/sections/${employee.sectionId}`
        : '/sections',
      label: getTranslatedField(section, 'title', section?.title) ||
        texts.attachedSectionPage || 'Bo‘lim'
    };
  }, [employee, faculties, sections, texts]);

  const attachedLabel = React.useMemo(() => {
    if (!employee) return '';

    return texts.attachLabels?.[employee.attachType] ||
      employee.attachType ||
      '';
  }, [employee, texts]);

  const menuLinks = React.useMemo(() => {
    if (!employee) return [];

    const usedKeys = new Set();

    return (Array.isArray(pageMenuItems) ? pageMenuItems : [])
      .filter((menu) =>
        isMenuForCurrentPage(menu, employee.attachType, employee)
      )
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((menu, index) => {
        const label = getTranslatedField(
          menu,
          'title',
          menu.title || ''
        ) || academicTexts.panelFallbackTitle || 'Menyu';

        const source = menu.sectionKey || label;
        const baseKey = normalizePanelKey(source) ||
          `panel-${menu.id || index}`;

        let key = baseKey;
        let suffix = 2;

        while (usedKeys.has(key)) {
          key = `${baseKey}-${suffix++}`;
        }

        usedKeys.add(key);

        return {
          key,
          label,
          title: label,
          sectionKey: menu.sectionKey
        };
      })
      .filter((menu) => !isLeaderMenu(menu))
      .map(({ key, label }) => ({
        key,
        label,
        to: `${attachedLink.href}#${key}`,
        end: false
      }));
  }, [employee, pageMenuItems, attachedLink.href, academicTexts]);

  if (loading) {
    return (
      <main className="epp-page epp-page--loading">
        <div className="epp-shell">
          <div className="epp-loading-card" />
        </div>
      </main>
    );
  }

  if (!employee || employee.active === false) {
    return (
      <main className="epp-page">
        <div className="epp-shell">
          <section className="epp-notfound">
            <span className="epp-overline">
              {texts.eyebrow}
            </span>
            <h1>{texts.notFoundTitle}</h1>
            <p>{texts.notFoundText}</p>
            <Link to="/" className="epp-primary-action">
              {texts.backHome}
              <Icon name="arrow" />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const initials = String(employee.fullName || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase();

  const position = getEmployeePosition(employee) || '';
  const profileTitle = getEmployeeProfilePanelTitle(employee);
  const profileContent = getEmployeeProfilePanelContent(employee);

  const telegram = socialUrl(employee.telegram, 'telegram');
  const instagram = socialUrl(employee.instagram, 'instagram');

  const phone = String(employee.phone || '').trim();
  const email = String(employee.email || employee.mail || '').trim();

  const contacts = [
    phone && /^[+0-9()\s-]{5,25}$/.test(phone)
      ? {
          key: 'phone',
          label: 'Telefon',
          value: phone,
          href: `tel:${phone.replace(/[^+\d]/g, '')}`,
          icon: 'phone'
        }
      : null,
    email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? {
          key: 'mail',
          label: 'Email',
          value: email,
          href: `mailto:${email}`,
          icon: 'mail'
        }
      : null,
    telegram
      ? {
          key: 'telegram',
          label: 'Telegram',
          value: employee.telegram,
          href: telegram,
          icon: 'telegram',
          external: true
        }
      : null,
    instagram
      ? {
          key: 'instagram',
          label: 'Instagram',
          value: employee.instagram,
          href: instagram,
          icon: 'instagram',
          external: true
        }
      : null
  ].filter(Boolean);

  return (
    <main className="epp-page">
      <div className="epp-shell">

        {/* BREADCRUMB */}
        <nav className="epp-breadcrumb" aria-label="Sahifa navigatsiyasi">
          <Link to={attachedLink.href}>{attachedLink.label}</Link>
          <Icon name="chevron" size={14} />
          <span aria-current="page">{employee.fullName}</span>
        </nav>

        {/* PROFILE HEADER */}
        <header className="epp-cover">
          <div className="epp-cover__photo">
            {employee.image ? (
              <img src={employee.image} alt={employee.fullName} />
            ) : (
              <span>{initials || 'X'}</span>
            )}
          </div>

          <div className="epp-cover__details">
            <div className="epp-kicker">
              <i className="epp-kicker__dot" />
              {texts.portfolioBadge || 'PORTFOLIO'}
            </div>

            <h1>{employee.fullName}</h1>

            {position && (
              <p className="epp-cover__position">{position}</p>
            )}

            <Link className="epp-affiliation" to={attachedLink.href}>
              <span>{attachedLabel}</span>
              <strong>{attachedLink.label}</strong>
              <Icon name="arrow" size={15} />
            </Link>
          </div>

          {/* VERTICAL CONTACT ICONS — RIGHT */}
          {contacts.length > 0 && (
            <div className="epp-cover__contacts">
              <span className="epp-cover__contacts-title">
                ALOQA
              </span>

              <div className="epp-cover__contact-list">
                {contacts.map((contact) => (
                  <a
                    key={contact.key}
                    className="epp-cover__contact-btn"
                    href={contact.href}
                    target={contact.external ? '_blank' : undefined}
                    rel={contact.external ? 'noopener noreferrer' : undefined}
                    title={`${contact.label}: ${contact.value}`}
                    aria-label={`${contact.label}: ${contact.value}`}
                  >
                    <Icon name={contact.icon} size={19} />
                    <span className="epp-cover__contact-tooltip">
                      {contact.value}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* PORTFOLIO + SIDEBAR */}
        <div className="epp-layout">
          <div className="epp-main">
            <section className="epp-section epp-section--content">
              <div className="epp-section__top">
                <span className="epp-section__index">
                  PORTFOLIO
                </span>
                <span className="epp-section__ornament" />
              </div>

              <h2>{profileTitle || texts.portfolioTitle}</h2>

              <div
                className="epp-rich-content"
                dangerouslySetInnerHTML={createSafeMarkup(
                  profileContent || '',
                  `<p>${texts.emptyContent || 'Ma’lumot mavjud emas.'}</p>`
                )}
              />
            </section>
          </div>

          <aside className="epp-aside">
            <div className="epp-aside__header">
              <span>PROFIL NAVIGATSIYASI</span>
              <span className="epp-aside__status">
                <i />
                {texts.activeBadge || 'Faol'}
              </span>
            </div>

            <div className="epp-aside__body">
              {menuLinks.length > 0 ? (
                <AcademicSidebar
                  title={academicTexts.pageMenuTitle}
                  items={menuLinks}
                  useProvidedItemsOnly
                  showLeaderCard={false}
                  showSearch={false}
                  showAnnouncements={false}
                />
              ) : (
                <div className="epp-aside__empty">
                  Menyular mavjud emas.
                </div>
              )}
            </div>

            <Link className="epp-aside__back" to={attachedLink.href}>
              <span>{attachedLink.label}</span>
              <Icon name="arrow" size={17} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
