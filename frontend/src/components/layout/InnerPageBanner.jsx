
import React, { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import '../../assets/styles/InnerPageBanner.css';
import mainBanner from '../../assets/optimized/card-1.jpg';

import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { useContentItem } from '../../hooks/useContentItem';
import { useSetting } from '../../hooks/useSetting';
import { useEmployeePortfolioBySlug } from '../../hooks/useEmployeePortfolioBySlug';

import { getSiteMessages } from '../../locales/site';

import {
  findDepartmentById,
  normalizeFacultyItem
} from '../../utils/academic';

import {
  getHtmlExcerpt,
  getLocalizedValue,
  getTranslatedField,
  stripHtml
} from '../../utils/cms';

import {
  findEmployeeAssignmentForContext,
  getEmployeePosition,
  isEmployeeAttachedToContext,
  normalizeEmployeePortfolio,
  sortEmployees
} from '../../utils/employees';

import { getMenuNodeTitle } from '../../utils/menu';

/* ==========================================
   HELPERS
========================================== */

const withBannerImage = (content = {}) => ({
  ...content,
  image: mainBanner
});

function getBannerBaseContent(pathname, texts) {
  if (pathname === '/') return null;

  if (matchPath('/news/page/:id', pathname)) {
    return withBannerImage(texts.newsDetail);
  }

  if (matchPath('/announcements/page/:id', pathname)) {
    return withBannerImage(texts.announcementDetail);
  }

  if (matchPath('/pages/:id', pathname)) {
    return withBannerImage(texts.dynamicPage);
  }

  if (matchPath('/menu/:id', pathname)) {
    return withBannerImage(texts.menuPage);
  }

  if (matchPath('/employees/:slug', pathname)) {
    return withBannerImage(texts.employeeProfile);
  }

  if (pathname.startsWith('/news')) {
    return withBannerImage(texts.newsList);
  }

  if (pathname.startsWith('/announcements')) {
    return withBannerImage(texts.announcementsList);
  }

  if (pathname.startsWith('/partners')) {
    return withBannerImage(texts.partners);
  }

  if (pathname.startsWith('/admission')) {
    return withBannerImage(texts.admission);
  }

  if (matchPath('/faculties/:id', pathname)) {
    return withBannerImage(texts.facultyDetail);
  }

  if (matchPath(
    '/departments/:facultyId/:departmentId',
    pathname
  )) {
    return withBannerImage(texts.departmentDetail);
  }

  if (matchPath('/sections/:id', pathname)) {
    return withBannerImage(texts.sectionDetail);
  }

  if (pathname.startsWith('/sections')) {
    return withBannerImage(texts.sectionsList);
  }

  if (pathname.startsWith('/faculties')) {
    return withBannerImage(texts.facultiesList);
  }

  if (pathname.startsWith('/departments')) {
    return withBannerImage(texts.departmentsList);
  }

  if (pathname.startsWith('/students')) {
    return withBannerImage(texts.students);
  }

  if (pathname.startsWith('/rektor')) {
    return withBannerImage(texts.rector);
  }

  return withBannerImage(texts.default);
}

/* ==========================================
   TEXT NORMALIZATION
========================================== */

function normalizeText(value) {
  return stripHtml(String(value || ''))
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

function shouldShowDescription(title, description) {
  const heading = normalizeText(title);
  const details = normalizeText(description)
    .replace(/(?:\.{3}|…)+$/, '')
    .trim();

  if (!details) return false;
  if (!heading) return true;

  // Tavsif sarlavhani qayta takrorlasa yashiriladi.
  if (
    details.length >= 35 &&
    (heading.includes(details) || details.includes(heading))
  ) {
    return false;
  }

  const length = Math.min(
    heading.length,
    details.length,
    100
  );

  if (
    length >= 35 &&
    heading.slice(0, length) === details.slice(0, length)
  ) {
    return false;
  }

  return true;
}

function getTitleSizeClass(title) {
  const length = String(title || '').trim().length;

  if (length > 240) return 'inner-banner-xlong';
  if (length > 120) return 'inner-banner-long';

  return 'inner-banner-normal';
}

function buildBannerDescription(item, fallback = '') {
  const content = getTranslatedField(
    item,
    'content',
    ''
  );

  return getHtmlExcerpt(content || '', 170) || fallback;
}

/* ==========================================
   ACADEMIC HELPERS
========================================== */

function getLeaderRole(pageType) {
  if (pageType === 'faculty') return 'dean';
  if (pageType === 'department') return 'department_head';
  if (pageType === 'section') return 'section_head';

  return 'employee';
}

function findLeadEmployee(employees, pageType) {
  const roleType = getLeaderRole(pageType);

  return (
    employees.find(
      (employee) => employee.roleType === roleType
    ) ||
    employees[0] ||
    null
  );
}

/* ==========================================
   BREADCRUMBS
========================================== */

function BannerBreadcrumbs({ items }) {
  if (!items?.length) return null;

  return (
    <nav
      className="inner-page-banner-breadcrumbs"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && (
            <span
              className="inner-page-banner-breadcrumb-separator"
              aria-hidden="true"
            >
              /
            </span>
          )}

          {item.href ? (
            <AppLink
              href={item.href}
              className="inner-page-banner-breadcrumb-link"
            >
              {item.label}
            </AppLink>
          ) : (
            <span className="inner-page-banner-breadcrumb-current">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ==========================================
   MAIN COMPONENT
========================================== */

function InnerPageBanner() {
  const location = useLocation();
  const { currentLanguageCode } = useLanguage();

  const pageTexts = useMemo(
    () => getSiteMessages(currentLanguageCode).pages,
    [currentLanguageCode]
  );

  const texts = pageTexts.innerBanner;
  const academicTexts = pageTexts.academicEntity;

  /* ROUTES */

  const pathname = location.pathname;

  const menuMatch = matchPath('/menu/:id', pathname);
  const pageMatch = matchPath('/pages/:id', pathname);

  const facultyMatch = matchPath(
    '/faculties/:id',
    pathname
  );

  const departmentMatch = matchPath(
    '/departments/:facultyId/:departmentId',
    pathname
  );

  const sectionMatch = matchPath(
    '/sections/:id',
    pathname
  );

  const newsMatch = matchPath(
    '/news/page/:id',
    pathname
  );

  const announcementMatch = matchPath(
    '/announcements/page/:id',
    pathname
  );

  const employeeMatch = matchPath(
    '/employees/:slug',
    pathname
  );

  /* CMS DATA */

  const { item: menuItem } = useContentItem(
    'menus',
    menuMatch?.params?.id
  );

  const { item: pageItem } = useContentItem(
    'pages',
    pageMatch?.params?.id
  );

  const { item: newsItem } = useContentItem(
    'news',
    newsMatch?.params?.id
  );

  const { item: announcementItem } = useContentItem(
    'announcements',
    announcementMatch?.params?.id
  );

  const { item: admissionItem } = useSetting(
    'admission-cta'
  );

  const { item: employeeItem } = useEmployeePortfolioBySlug(
    employeeMatch?.params?.slug
  );

  const academicId =
    facultyMatch?.params?.id ||
    departmentMatch?.params?.facultyId ||
    sectionMatch?.params?.id;

  const { item: academicItem } = useContentItem(
    'faculties',
    academicId
  );

  /* ACADEMIC CONTEXT */

  const academicRouteType = facultyMatch
    ? 'faculty'
    : departmentMatch
      ? 'department'
      : sectionMatch
        ? 'section'
        : null;

  const academicContext = useMemo(() => {
    if (!academicRouteType) return null;

    return {
      pageType: academicRouteType,
      facultyId:
        facultyMatch?.params?.id ||
        departmentMatch?.params?.facultyId ||
        '',
      departmentId:
        departmentMatch?.params?.departmentId || '',
      sectionId:
        sectionMatch?.params?.id || ''
    };
  }, [
    academicRouteType,
    facultyMatch?.params?.id,
    departmentMatch?.params?.facultyId,
    departmentMatch?.params?.departmentId,
    sectionMatch?.params?.id
  ]);

  const { items: employeeItems = [] } = useContentList(
    'employees-portfolios',
    {
      summaryOnly: false,
      enabled: Boolean(academicRouteType)
    }
  );

  /* ACADEMIC ENTITY */

  const academicEntity = useMemo(() => {
    if (facultyMatch || sectionMatch) {
      return academicItem || null;
    }

    if (departmentMatch) {
      const faculty = academicItem
        ? normalizeFacultyItem(academicItem)
        : null;

      if (!faculty) return null;

      return findDepartmentById(
        [faculty],
        faculty.id,
        departmentMatch.params.departmentId
      );
    }

    return null;
  }, [
    academicItem,
    facultyMatch?.params?.id,
    sectionMatch?.params?.id,
    departmentMatch?.params?.departmentId
  ]);

  /* LEADER */

  const academicEmployees = useMemo(() => {
    if (!academicContext) return [];

    const employees = (employeeItems || [])
      .map(normalizeEmployeePortfolio)
      .map((employee) => {
        const currentAssignment =
          findEmployeeAssignmentForContext(
            employee,
            academicContext
          );

        if (
          !currentAssignment ||
          !isEmployeeAttachedToContext(
            employee,
            academicContext
          )
        ) {
          return null;
        }

        return normalizeEmployeePortfolio({
          ...employee,
          currentAssignment
        });
      })
      .filter(Boolean);

    return sortEmployees(employees);
  }, [employeeItems, academicContext]);

  const academicLeadEmployee = useMemo(
    () => findLeadEmployee(
      academicEmployees,
      academicRouteType
    ),
    [academicEmployees, academicRouteType]
  );

  /* ========================================
     RESOLVE BANNER CONTENT
  ======================================== */

  const content = useMemo(() => {
    const base = getBannerBaseContent(
      pathname,
      texts
    );

    if (!base) return null;

    /* MENUS */

    if (menuMatch) {
      return {
        ...base,
        title:
          getMenuNodeTitle(menuItem) ||
          base.title,
        description: buildBannerDescription(
          menuItem,
          base.description
        )
      };
    }

    /* EMPLOYEE */

    if (employeeMatch) {
      const employee = employeeItem
        ? normalizeEmployeePortfolio(employeeItem)
        : null;

      return {
        ...base,
        title: employee?.fullName || base.title,
        description:
          getEmployeePosition(employee) ||
          base.description
      };
    }

    /* DYNAMIC PAGE */

    if (pageMatch) {
      return {
        ...base,
        title:
          getTranslatedField(
            pageItem,
            'title',
            pageItem?.title
          ) || base.title,
        description: buildBannerDescription(
          pageItem,
          base.description
        )
      };
    }

    /* NEWS */

    if (newsMatch) {
      return {
        ...base,
        title:
          getTranslatedField(
            newsItem,
            'title',
            newsItem?.title
          ) || base.title,
        description: buildBannerDescription(
          newsItem,
          base.description
        )
      };
    }

    /* ANNOUNCEMENTS */

    if (announcementMatch) {
      return {
        ...base,
        title:
          getTranslatedField(
            announcementItem,
            'title',
            announcementItem?.title
          ) || base.title,
        description: buildBannerDescription(
          announcementItem,
          base.description
        )
      };
    }

    /* ADMISSION */

    if (pathname.startsWith('/admission')) {
      return {
        ...base,
        title: getLocalizedValue(
          admissionItem?.title,
          base.title
        ),
        description:
          getHtmlExcerpt(
            getLocalizedValue(
              admissionItem?.content
            ) || '',
            170
          ) || base.description
      };
    }

    /* ACADEMIC PAGES */

    if (academicRouteType) {
      const faculty = academicItem
        ? normalizeFacultyItem(academicItem)
        : null;

      const entityTitle =
        getTranslatedField(
          academicEntity,
          'title',
          academicEntity?.title
        ) || base.title;

      const leaderLabel =
        academicTexts.leaderInlineLabels?.[
          academicRouteType
        ] ||
        academicTexts.leaderInlineLabels?.faculty ||
        '';

      const backLabel =
        texts.academicBreadcrumbs?.[
          academicRouteType
        ] ||
        academicTexts.meta?.[
          academicRouteType
        ]?.backLabel ||
        '';

      const backHref =
        academicRouteType === 'faculty'
          ? '/faculties'
          : academicRouteType === 'department'
            ? '/departments'
            : '/sections';

      return {
        ...base,
        title: entityTitle,
        image:
          academicEntity?.bannerImage ||
          faculty?.bannerImage ||
          base.image,
        description: '',
        layout: 'academic',
        showEyebrow: false,
        subtitle:
          academicLeadEmployee && leaderLabel
            ? `${leaderLabel}: ${academicLeadEmployee.fullName}`
            : '',
        breadcrumbs: [
          {
            label: backLabel,
            href: backHref
          },
          {
            label: entityTitle
          }
        ]
      };
    }

    return base;
  }, [
    pathname,
    texts,
    menuMatch?.params?.id,
    menuItem,
    employeeMatch?.params?.slug,
    employeeItem,
    pageMatch?.params?.id,
    pageItem,
    newsMatch?.params?.id,
    newsItem,
    announcementMatch?.params?.id,
    announcementItem,
    admissionItem,
    academicRouteType,
    academicEntity,
    academicItem,
    academicTexts,
    academicLeadEmployee
  ]);

  if (!content) return null;

  /* ========================================
     TEXT DISPLAY RULES
  ======================================== */

  const bannerTitle = String(
    content.title || ''
  ).trim();

  const bannerDescription = String(
    content.description || ''
  ).trim();

  const titleSizeClass = getTitleSizeClass(
    bannerTitle
  );

  const showDescription = shouldShowDescription(
    bannerTitle,
    bannerDescription
  );

  const isAcademic =
    content.layout === 'academic';

  /* ========================================
     RENDER
  ======================================== */

  return (
    <section
      className={[
        'inner-page-banner',
        isAcademic
          ? 'inner-page-banner--academic'
          : ''
      ].filter(Boolean).join(' ')}
      aria-label={bannerTitle}
    >
      <div className="inner-page-banner-shell">
        <div className="inner-page-banner-card">

          {/* BACKGROUND */}

          <img
            src={content.image || mainBanner}
            alt=""
            className="inner-page-banner-image"
            fetchPriority="high"
          />

          <div
            className="inner-page-banner-overlay"
            aria-hidden="true"
          />

          {/* CONTENT */}

          <div className="inner-page-banner-content">
            <div className="inner-page-banner-content-shell">

              <div
                className={[
                  'inner-page-banner-copy',
                  isAcademic
                    ? 'inner-page-banner-copy--academic'
                    : '',
                  titleSizeClass
                ].filter(Boolean).join(' ')}
              >

                {/* EYEBROW */}

                {content.showEyebrow !== false &&
                  content.eyebrow && (
                    <span className="inner-page-banner-eyebrow">
                      {content.eyebrow}
                    </span>
                  )}

                {/* TITLE */}

                <h1 className="inner-page-banner-title">
                  {bannerTitle}
                </h1>

                {/* SUBTITLE */}

                {content.subtitle && (
                  <p className="inner-page-banner-subtitle">
                    {content.subtitle}
                  </p>
                )}

                {/* DESCRIPTION */}

                {showDescription && (
                  <p className="inner-page-banner-description">
                    {bannerDescription}
                  </p>
                )}

                {/* BREADCRUMBS */}

                <BannerBreadcrumbs
                  items={content.breadcrumbs}
                />

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default InnerPageBanner;
