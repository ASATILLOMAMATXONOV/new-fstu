import React from 'react';
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
import { findDepartmentById, normalizeFacultyItem } from '../../utils/academic';
import { getHtmlExcerpt, getLocalizedValue, getTranslatedField } from '../../utils/cms';
import {
  findEmployeeAssignmentForContext,
  getEmployeePosition,
  isEmployeeAttachedToContext,
  normalizeEmployeePortfolio,
  sortEmployees
} from '../../utils/employees';
import { getMenuNodeTitle } from '../../utils/menu';

function withBannerImage(content = {}) {
  return {
    ...content,
    image: mainBanner
  };
}

function getBannerBaseContent(pathname, texts) {
  if (pathname === '/') {
    return null;
  }

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

  if (matchPath('/departments/:facultyId/:departmentId', pathname)) {
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

function buildBannerDescription(item, fallbackText) {
  const excerpt = getHtmlExcerpt(getTranslatedField(item, 'content') || '', 170);
  return excerpt || fallbackText;
}

function resolveLeaderRole(pageType = 'faculty') {
  if (pageType === 'faculty') {
    return 'dean';
  }

  if (pageType === 'department') {
    return 'department_head';
  }

  if (pageType === 'section') {
    return 'section_head';
  }

  return 'employee';
}

function findLeadEmployee(list = [], pageType = 'faculty') {
  const preferredRole = resolveLeaderRole(pageType);
  return list.find((employee) => employee.roleType === preferredRole) || list[0] || null;
}

function InnerPageBanner() {
  const location = useLocation();
  const { currentLanguageCode } = useLanguage();
  const pageTexts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages,
    [currentLanguageCode]
  );
  const texts = pageTexts.innerBanner;
  const academicTexts = pageTexts.academicEntity;
  const menuMatch = matchPath('/menu/:id', location.pathname);
  const pageMatch = matchPath('/pages/:id', location.pathname);
  const facultyMatch = matchPath('/faculties/:id', location.pathname);
  const departmentMatch = matchPath('/departments/:facultyId/:departmentId', location.pathname);
  const sectionMatch = matchPath('/sections/:id', location.pathname);
  const newsMatch = matchPath('/news/page/:id', location.pathname);
  const announcementMatch = matchPath('/announcements/page/:id', location.pathname);
  const employeeMatch = matchPath('/employees/:slug', location.pathname);

  const { item: menuItem } = useContentItem('menus', menuMatch?.params?.id);
  const { item: pageItem } = useContentItem('pages', pageMatch?.params?.id);
  const { item: newsItem } = useContentItem('news', newsMatch?.params?.id);
  const { item: announcementItem } = useContentItem(
    'announcements',
    announcementMatch?.params?.id
  );
  const { item: admissionItem } = useSetting('admission-cta');
  const { item: employeeItem } = useEmployeePortfolioBySlug(employeeMatch?.params?.slug);
  const { item: academicItem } = useContentItem(
    'faculties',
    facultyMatch?.params?.id || departmentMatch?.params?.facultyId || sectionMatch?.params?.id
  );

  const academicRouteType = facultyMatch
    ? 'faculty'
    : departmentMatch
      ? 'department'
      : sectionMatch
        ? 'section'
        : null;

  const academicContext = React.useMemo(() => {
    if (!academicRouteType) {
      return null;
    }

    return {
      pageType: academicRouteType,
      facultyId: facultyMatch?.params?.id || departmentMatch?.params?.facultyId || '',
      departmentId: departmentMatch?.params?.departmentId || '',
      sectionId: sectionMatch?.params?.id || ''
    };
  }, [academicRouteType, departmentMatch, facultyMatch, sectionMatch]);
  const { items: employeeItems } = useContentList('employees-portfolios', {
    summaryOnly: false,
    enabled: Boolean(academicRouteType)
  });

  const academicEntity = React.useMemo(() => {
    if (facultyMatch) {
      return academicItem || null;
    }

    if (sectionMatch) {
      return academicItem || null;
    }

    if (departmentMatch) {
      const normalizedFaculty = academicItem ? normalizeFacultyItem(academicItem) : null;

      return normalizedFaculty
        ? findDepartmentById(
            [normalizedFaculty],
            normalizedFaculty.id,
            departmentMatch.params.departmentId
          )
        : null;
    }

    return null;
  }, [academicItem, departmentMatch, facultyMatch, sectionMatch]);

  const academicEmployees = React.useMemo(() => {
    if (!academicContext) {
      return [];
    }

    return sortEmployees(
      employeeItems
        .map(normalizeEmployeePortfolio)
        .map((employee) => {
          const currentAssignment = findEmployeeAssignmentForContext(employee, academicContext);

          if (!currentAssignment || !isEmployeeAttachedToContext(employee, academicContext)) {
            return null;
          }

          return normalizeEmployeePortfolio({
            ...employee,
            currentAssignment
          });
        })
        .filter(Boolean)
    );
  }, [academicContext, employeeItems]);

  const academicLeadEmployee = React.useMemo(
    () => findLeadEmployee(academicEmployees, academicRouteType || 'faculty'),
    [academicEmployees, academicRouteType]
  );

  const content = React.useMemo(() => {
    const baseContent = getBannerBaseContent(location.pathname, texts);

    if (!baseContent) {
      return null;
    }

    if (menuMatch) {
      return {
        ...baseContent,
        title: getMenuNodeTitle(menuItem) || baseContent.title,
        description: buildBannerDescription(menuItem, baseContent.description)
      };
    }

    if (employeeMatch) {
      const employee = employeeItem ? normalizeEmployeePortfolio(employeeItem) : null;

      return {
        ...baseContent,
        title: employee?.fullName || baseContent.title,
        description: getEmployeePosition(employee) || baseContent.description
      };
    }

    if (pageMatch) {
      return {
        ...baseContent,
        title: getTranslatedField(pageItem, 'title', pageItem?.title) || baseContent.title,
        description: buildBannerDescription(pageItem, baseContent.description)
      };
    }

    if (newsMatch) {
      return {
        ...baseContent,
        title: getTranslatedField(newsItem, 'title', newsItem?.title) || baseContent.title,
        description: buildBannerDescription(newsItem, baseContent.description)
      };
    }

    if (announcementMatch) {
      return {
        ...baseContent,
        title:
          getTranslatedField(announcementItem, 'title', announcementItem?.title) || baseContent.title,
        description: buildBannerDescription(announcementItem, baseContent.description)
      };
    }

    if (location.pathname.startsWith('/admission')) {
      return {
        ...baseContent,
        title: getLocalizedValue(admissionItem?.title, baseContent.title),
        description:
          getHtmlExcerpt(getLocalizedValue(admissionItem?.content) || '', 170) ||
          baseContent.description
      };
    }

    if (facultyMatch || sectionMatch) {
      const entityTitle =
        getTranslatedField(academicEntity, 'title', academicEntity?.title) || baseContent.title;
      const leaderLabel =
        academicTexts.leaderInlineLabels?.[academicRouteType] ||
        academicTexts.leaderInlineLabels?.faculty ||
        '';

      return {
        ...baseContent,
        image: academicEntity?.bannerImage || baseContent.image,
        title: entityTitle,
        description: '',
        layout: 'academic',
        showEyebrow: false,
        subtitle:
          academicLeadEmployee && leaderLabel
            ? `${leaderLabel}: ${academicLeadEmployee.fullName}`
            : '',
        breadcrumbs: [
          {
            label:
              texts.academicBreadcrumbs?.[academicRouteType] ||
              academicTexts.meta?.[academicRouteType]?.backLabel ||
              '',
            href:
              academicRouteType === 'faculty'
                ? '/faculties'
                : academicRouteType === 'department'
                  ? '/departments'
                  : '/sections'
          },
          {
            label: entityTitle
          }
        ]
      };
    }

    if (departmentMatch) {
      const normalizedFaculty = academicItem ? normalizeFacultyItem(academicItem) : null;
      const department = normalizedFaculty
        ? findDepartmentById(
            [normalizedFaculty],
            normalizedFaculty.id,
            departmentMatch.params.departmentId
          )
        : null;
      const entityTitle = getTranslatedField(department, 'title', department?.title) || baseContent.title;
      const leaderLabel =
        academicTexts.leaderInlineLabels?.department ||
        academicTexts.leaderInlineLabels?.faculty ||
        '';

      return {
        ...baseContent,
        image: department?.bannerImage || normalizedFaculty?.bannerImage || baseContent.image,
        title: entityTitle,
        description: '',
        layout: 'academic',
        showEyebrow: false,
        subtitle:
          academicLeadEmployee && leaderLabel
            ? `${leaderLabel}: ${academicLeadEmployee.fullName}`
            : '',
        breadcrumbs: [
          {
            label:
              texts.academicBreadcrumbs?.department ||
              academicTexts.meta?.department?.backLabel ||
              '',
            href: '/departments'
          },
          {
            label: entityTitle
          }
        ]
      };
    }

    return baseContent;
  }, [
    academicItem,
    admissionItem,
    academicEntity,
    academicLeadEmployee,
    academicRouteType,
    academicTexts,
    announcementMatch,
    announcementItem,
    departmentMatch,
    employeeItem,
    employeeMatch,
    facultyMatch,
    location.pathname,
    menuItem,
    menuMatch,
    newsItem,
    newsMatch,
    pageItem,
    pageMatch,
    sectionMatch,
    texts
  ]);

  if (!content) {
    return null;
  }

  return (
    <section
      className={`inner-page-banner${
        content.layout === 'academic' ? ' inner-page-banner--academic' : ''
      }`}
    >
      <div className="inner-page-banner-shell">
        <div className="inner-page-banner-card">
          <img
            src={content.image}
            alt={content.title}
            className="inner-page-banner-image"
            fetchPriority="high"
          />

          <div className="inner-page-banner-overlay" aria-hidden="true" />

          <div className="inner-page-banner-content">
            <div className="inner-page-banner-content-shell">
              <div
                className={`inner-page-banner-copy${
                  content.layout === 'academic' ? ' inner-page-banner-copy--academic' : ''
                }`}
              >
                {content.showEyebrow !== false ? <span>{content.eyebrow}</span> : null}
                <h1>{content.title}</h1>

                {content.subtitle ? (
                  <p className="inner-page-banner-subtitle">{content.subtitle}</p>
                ) : null}

                {content.description ? (
                  <p className="inner-page-banner-description">{content.description}</p>
                ) : null}

                {content.breadcrumbs?.length ? (
                  <div className="inner-page-banner-breadcrumbs" aria-label="Breadcrumb">
                    {content.breadcrumbs.map((item, index) => (
                      <React.Fragment key={`${item.label}-${index}`}>
                        {index > 0 ? (
                          <span className="inner-page-banner-breadcrumb-separator" aria-hidden="true">
                            /
                          </span>
                        ) : null}

                        {item.href ? (
                          <AppLink href={item.href} className="inner-page-banner-breadcrumb-link">
                            {item.label}
                          </AppLink>
                        ) : (
                          <span className="inner-page-banner-breadcrumb-current">{item.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InnerPageBanner;
