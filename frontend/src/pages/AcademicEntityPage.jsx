import React from 'react';
import { FiClock, FiExternalLink, FiInstagram, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import '../assets/styles/AcademicEntityPage.css';
import AppLink from '../components/common/AppLink';
import AttachedFilesList from '../components/common/AttachedFilesList';
import LinkedInfoTable from '../components/common/LinkedInfoTable';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { useContentItem } from '../hooks/useContentItem';
import { getSiteMessages } from '../locales/site';
import { createSafeMarkup, formatCmsDate, getHtmlExcerpt, getTranslatedField, stripHtml } from '../utils/cms';
import {
  buildEmployeeProfilePath,
  findEmployeeAssignmentForContext,
  getEmployeeAssignments,
  getEmployeePosition,
  isEmployeeAttachedToContext,
  normalizeEmployeePortfolio,
  sortEmployees
} from '../utils/employees';
import {
  findDepartmentById,
  normalizeFacultyItem
} from '../utils/academic';

function normalizePanelKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '')
    .replace(/’/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function truncateMenuLabel(value = '', maxLength = 15) {
  const source = String(value || '').trim();

  if (source.length <= maxLength) {
    return source;
  }

  return `${source.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function createUniquePanels(panels = []) {
  const usedKeys = new Set();

  return panels.map((panel, index) => {
    const baseKey = panel.key || `panel-${index + 1}`;
    let nextKey = baseKey;
    let duplicateIndex = 2;

    while (usedKeys.has(nextKey)) {
      nextKey = `${baseKey}-${duplicateIndex}`;
      duplicateIndex += 1;
    }

    usedKeys.add(nextKey);

    return {
      ...panel,
      key: nextKey
    };
  });
}

function resolvePanelVariant(pageType, sectionKey) {
  const key = normalizePanelKey(sectionKey);

  if (
    key.includes('employee') ||
    key.includes('hodim') ||
    key.includes('xodim') ||
    key.includes('portfolio')
  ) {
    return 'employees';
  }

  if (pageType === 'faculty' && (key.includes('department') || key.includes('kafedra'))) {
    return 'departments';
  }

  if (pageType === 'faculty' && (key.includes('section') || key.includes('bolim'))) {
    return 'sections';
  }

  if (
    pageType === 'department' &&
    (key.includes('direction') || key.includes('yonalish') || key.includes('yo-nalish'))
  ) {
    return 'directions';
  }

  if (pageType === 'department' && (key.includes('faculty') || key.includes('fakultet'))) {
    return 'faculty';
  }

  return 'content';
}

function resolveLeaderRole(pageType) {
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

function isAboutPanel(panel = {}) {
  const normalized = normalizePanelKey(`${panel.sectionKey || ''} ${panel.title || ''}`);

  return (
    normalized.includes('about') ||
    normalized.includes('haqida') ||
    normalized.includes('info') ||
    normalized.includes('malumot')
  );
}

function isLeaderPanel(panel = {}) {
  const normalized = normalizePanelKey(`${panel.sectionKey || ''} ${panel.title || ''}`);

  return (
    normalized.includes('dekan') ||
    normalized.includes('dean') ||
    normalized.includes('rahbar') ||
    normalized.includes('mudir') ||
    normalized.includes('boshliq') ||
    normalized.includes('leader')
  );
}

function isOverviewPanel(panel = {}) {
  return panel?.variant === 'overview';
}

function normalizeEntityId(value) {
  if (value && typeof value === 'object') {
    return normalizeEntityId(
      value.id ?? value._id ?? value.value ?? value.facultyId ?? value.faculty_id ?? ''
    );
  }
  return String(value ?? '').trim();
}

function matchesEntity(value, expected) {
  const target = normalizeEntityId(expected);
  if (!target || value == null) return false;

  if (Array.isArray(value)) {
    return value.some((entry) => matchesEntity(entry, target));
  }

  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').some((entry) => matchesEntity(entry.trim(), target));
  }

  return normalizeEntityId(value) === target;
}

function isAcademicMenuActive(menu) {
  if (menu.active === false || menu.isActive === false || menu.is_active === false) {
    return false;
  }
  const status = String(menu.status || '').toLowerCase();
  return status !== 'inactive' && status !== 'disabled';
}

function isMenuForCurrentPage(menu, pageType, context) {
  if (!menu || !isAcademicMenuActive(menu)) return false;

  const kind = String(menu.pageType ?? menu.page_type ?? 'faculty').trim().toLowerCase();
  if (kind && kind !== pageType) return false;

  const facultyIds = [
    menu.facultyId, menu.faculty_id, menu.faculty,
    menu.facultyIds, menu.faculty_ids, menu.faculties,
    menu.context?.facultyId, menu.context?.faculty_id,
    menu.attachments?.facultyIds, menu.associations?.faculties,
    menu.entityId, menu.entity_id,
    menu.targets?.faculties
  ];
  const departmentIds = [
    menu.departmentId, menu.department_id, menu.department,
    menu.context?.departmentId, menu.context?.department_id
  ];
  const sectionIds = [
    menu.sectionId, menu.section_id, menu.section,
    menu.context?.sectionId, menu.context?.section_id
  ];

  if (pageType === 'faculty') {
    return facultyIds.some((value) => matchesEntity(value, context.facultyId));
  }
  if (pageType === 'department') {
    return facultyIds.some((value) => matchesEntity(value, context.facultyId)) &&
      departmentIds.some((value) => matchesEntity(value, context.departmentId));
  }
  return sectionIds.some((value) => matchesEntity(value, context.sectionId));
}

function createConfiguredPanels(pageType, menuEntries = [], texts) {
  return createUniquePanels(
    menuEntries.map((menu) => {
      const sectionSource = menu.sectionKey || getTranslatedField(menu, 'title', menu.title);

      return {
        key: normalizePanelKey(sectionSource) || `panel-${menu.id}`,
        title: getTranslatedField(menu, 'title', menu.title) || texts.panelFallbackTitle,
        variant: resolvePanelVariant(pageType, sectionSource),
        menuId: menu.id,
        sectionKey: menu.sectionKey,
        files: menu.files || [],
        uz: {
          title: menu?.uz?.title || menu?.translations?.uz?.title || menu?.title || '',
          content: menu?.uz?.content || menu?.translations?.uz?.content || ''
        },
        ru: {
          title: menu?.ru?.title || menu?.translations?.ru?.title || '',
          content: menu?.ru?.content || menu?.translations?.ru?.content || ''
        },
        en: {
          title: menu?.en?.title || menu?.translations?.en?.title || '',
          content: menu?.en?.content || menu?.translations?.en?.content || ''
        }
      };
    })
  );
}

function renderRichText(html, emptyText) {
  if (!stripHtml(html)) {
    return <div className="academic-entity-empty-state">{emptyText}</div>;
  }

  return <div className="academic-entity-rich" dangerouslySetInnerHTML={createSafeMarkup(html)} />;
}

function sortByOrder(list = []) {
  return [...list].sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
}

function renderPanelWithFiles(content, panel) {
  if (!panel?.files?.length) {
    return content;
  }

  return (
    <div className="academic-entity-panel-stack">
      {content}
      <AttachedFilesList items={panel.files} />
    </div>
  );
}

function UpdateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 2.75A2.25 2.25 0 0 1 9.25 5v.25h5.5V5a.75.75 0 0 1 1.5 0v.25H17A3.25 3.25 0 0 1 20.25 8.5v8A3.25 3.25 0 0 1 17 19.75H7A3.25 3.25 0 0 1 3.75 16.5v-8A3.25 3.25 0 0 1 7 5.25h.75V5A2.25 2.25 0 0 1 10 2.75a.75.75 0 0 1 0 1.5A.75.75 0 0 0 9.25 5v.25h5.5V5A2.25 2.25 0 0 1 17 2.75a.75.75 0 0 1 0 1.5A.75.75 0 0 0 16.25 5v.25H17A1.75 1.75 0 0 1 18.75 7v1.25H5.25V7A1.75 1.75 0 0 1 7 5.25h.75V5A.75.75 0 0 0 7 4.25a.75.75 0 0 1 0-1.5Zm-1.75 7v6.75c0 .97.78 1.75 1.75 1.75h10c.97 0 1.75-.78 1.75-1.75V9.75H5.25Zm4 2.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75Zm5.5 0a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DirectionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 19.5 7.5v9L12 21 4.5 16.5v-9L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2a2.2 2.2 0 1 1-2.2 2.2A2.2 2.2 0 0 1 12 8.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.6v3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isExternalHref(value = '') {
  return /^(https?:|mailto:|tel:)/i.test(String(value || '').trim());
}

function AcademicEntityPage({ pageType = 'faculty' }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.academicEntity,
    [currentLanguageCode]
  );
  const backToMap = {
    faculty: '/faculties',
    department: '/departments',
    section: '/sections'
  };
  const meta = {
    ...(texts.meta[pageType] || texts.meta.faculty),
    backTo: backToMap[pageType] || '/faculties'
  };
  const isFacultyShowcase = pageType === 'faculty' || pageType === 'department';
  const contextFacultyId = pageType === 'faculty' ? params.id : params.facultyId;
  const contextDepartmentId = params.departmentId;
  const contextSectionId = params.id;
  const academicEntityId =
    pageType === 'faculty'
      ? params.id
      : pageType === 'department'
        ? params.facultyId
        : params.id;
  const { item: academicSourceItem, loading: academicLoading } = useContentItem(
    'faculties',
    academicEntityId
  );
  const { items: menuItems, loading: menuLoading } = useContentList('faculty-page-menus', {
    summaryOnly: false
  });
  const { items: employeeItems, loading: employeesLoading } = useContentList(
    'employees-portfolios',
    { summaryOnly: false }
  );
  const { items: directionItems, loading: directionsLoading } = useContentList('directions', {
    summaryOnly: false,
    facultyId: contextFacultyId,
    departmentId: contextDepartmentId,
    enabled: pageType === 'department'
  });

  const faculty = React.useMemo(() => {
    if (pageType !== 'faculty' && pageType !== 'department') {
      return null;
    }

    return academicSourceItem ? normalizeFacultyItem(academicSourceItem) : null;
  }, [academicSourceItem, pageType]);

  const department = React.useMemo(() => {
    if (pageType !== 'department' || !faculty) {
      return null;
    }

    return findDepartmentById([faculty], faculty.id, params.departmentId);
  }, [faculty, pageType, params.departmentId]);

  const section = pageType === 'section' ? academicSourceItem : null;

  const entity = pageType === 'faculty' ? faculty : pageType === 'department' ? department : section;

  const attachedMenus = React.useMemo(() => {
    return (Array.isArray(menuItems) ? menuItems : [])
      .filter((menu) =>
        isMenuForCurrentPage(menu, pageType, {
          facultyId: contextFacultyId,
          departmentId: contextDepartmentId,
          sectionId: contextSectionId
        })
      )
      .sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
  }, [contextDepartmentId, contextFacultyId, contextSectionId, menuItems, pageType]);

  const configuredPanels = React.useMemo(
    () => createConfiguredPanels(pageType, attachedMenus, texts),
    [attachedMenus, pageType, texts]
  );

  // Development diagnostics: show whether the CMS source is empty or ID filtering failed.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || menuLoading) return;
    if (pageType !== 'faculty') return;

    console.groupCollapsed('[AcademicEntityPage] Fakultet menyulari');
    console.log('Fakultet ID:', contextFacultyId);
    console.log('CMS menyular soni:', Array.isArray(menuItems) ? menuItems.length : 0);
    console.log('CMS menyular:', menuItems);
    console.log('Biriktirilgan menyular:', attachedMenus);
    console.log('Ko‘rsatiladigan panellar:', configuredPanels);
    console.groupEnd();
  }, [pageType, contextFacultyId, menuItems, attachedMenus, configuredPanels, menuLoading]);
  const attachedDirections = React.useMemo(
    () => sortByOrder(directionItems || []),
    [directionItems]
  );
  const [activeDirectionItemId, setActiveDirectionItemId] = React.useState('');
  const needsSectionsList =
    pageType === 'faculty' && configuredPanels.some((panel) => panel.variant === 'sections');
  const { items: sections } = useContentList('faculties', {
    entityType: 'section',
    enabled: needsSectionsList
  });

  const activePanelKeyFromHash = normalizePanelKey(location.hash.replace('#', ''));
  const [activePanelKey, setActivePanelKey] = React.useState(activePanelKeyFromHash);
  const fallbackOverviewPanel = React.useMemo(
    () => ({
      key: 'page-overview',
      title: texts.defaultTabTitle,
      variant: 'overview'
    }),
    [texts]
  );
  const hasDirectionsPanel = configuredPanels.some((panel) => panel.variant === 'directions');
  const autoDirectionsPanel = React.useMemo(() => {
    if (pageType !== 'department' || !attachedDirections.length || hasDirectionsPanel) {
      return null;
    }

    return {
      key: 'attached-directions',
      title: texts.directionsPanelTitle,
      variant: 'directions'
    };
  }, [attachedDirections.length, hasDirectionsPanel, pageType, texts.directionsPanelTitle]);
  const departmentDirectionsPanel = React.useMemo(
    () => configuredPanels.find((panel) => panel.variant === 'directions') || autoDirectionsPanel,
    [autoDirectionsPanel, configuredPanels]
  );
  const showTopMenuTabs =
    pageType === 'faculty' || pageType === 'department' || pageType === 'section';

  const panelItems = React.useMemo(() => {
    const visiblePanels = configuredPanels.filter((panel) => !isLeaderPanel(panel));

    return [fallbackOverviewPanel, ...(autoDirectionsPanel ? [autoDirectionsPanel] : []), ...visiblePanels];
  }, [autoDirectionsPanel, configuredPanels, fallbackOverviewPanel]);

  const selectedPanel = React.useMemo(() => {
    if (!panelItems.length) {
      return null;
    }

    if (!activePanelKey) {
      return panelItems[0];
    }

    return panelItems.find((panel) => panel.key === activePanelKey) || panelItems[0];
  }, [activePanelKey, panelItems]);

  React.useEffect(() => {
    setActivePanelKey(activePanelKeyFromHash);
  }, [activePanelKeyFromHash, location.pathname]);

  React.useEffect(() => {
    const panelKeys = panelItems.map((panel) => panel.key);

    if (!panelKeys.length) {
      if (activePanelKey) {
        setActivePanelKey('');
      }

      return;
    }

    if (panelKeys.includes(activePanelKey)) {
      return;
    }

    if (activePanelKey) {
      setActivePanelKey(panelKeys[0]);
    }
  }, [activePanelKey, panelItems]);

  React.useEffect(() => {
    if (!attachedDirections.length) {
      if (activeDirectionItemId) {
        setActiveDirectionItemId('');
      }

      return;
    }

    const hasActiveDirection = attachedDirections.some(
      (item) => String(item.id) === String(activeDirectionItemId)
    );

    if (!hasActiveDirection) {
      setActiveDirectionItemId(String(attachedDirections[0].id));
    }
  }, [activeDirectionItemId, attachedDirections]);

  const hasLegacyPanelHash =
    Boolean(location.hash) &&
    Boolean(activePanelKeyFromHash) &&
    (activePanelKeyFromHash === 'overview' ||
      activePanelKeyFromHash === fallbackOverviewPanel.key ||
      configuredPanels.some((panel) => panel.key === activePanelKeyFromHash));

  React.useEffect(() => {
    if (!hasLegacyPanelHash) {
      return;
    }

    navigate(
      {
        pathname: location.pathname,
        search: location.search
      },
      { replace: true }
    );
  }, [hasLegacyPanelHash, location.pathname, location.search, navigate]);

  const handlePanelSelect = (panelKey) => {
    setActivePanelKey(panelKey);
  };

  const openDirectionTarget = React.useCallback(
    (item) => {
      const href = String(item?.link || '').trim();

      if (!href) {
        return;
      }

      if (isExternalHref(href)) {
        window.location.href = href;
        return;
      }

      navigate(href);
    },
    [navigate]
  );

  const panelNavigationItems = panelItems.map((panel) => ({
    key: panel.key,
    label: panel.title,
    onClick: () => handlePanelSelect(panel.key)
  }));

  const attachedEmployees = React.useMemo(() => {
    return sortEmployees(
      employeeItems
        .map(normalizeEmployeePortfolio)
        .map((employee) => {
          const currentAssignment = findEmployeeAssignmentForContext(employee, {
            pageType,
            facultyId: contextFacultyId,
            departmentId: contextDepartmentId,
            sectionId: contextSectionId
          });

          if (!currentAssignment || !isEmployeeAttachedToContext(employee, {
            pageType,
            facultyId: contextFacultyId,
            departmentId: contextDepartmentId,
            sectionId: contextSectionId
          })) {
            return null;
          }

          return normalizeEmployeePortfolio({
            ...employee,
            currentAssignment
          });
        })
        .filter(Boolean)
    );
  }, [
    contextDepartmentId,
    contextFacultyId,
    contextSectionId,
    employeeItems,
    pageType
  ]);

  const leadEmployee = React.useMemo(
    () => findLeadEmployee(attachedEmployees, pageType),
    [attachedEmployees, pageType]
  );
  const departmentHeads = React.useMemo(
    () =>
      sortEmployees(
        employeeItems.flatMap((item) => {
          const employee = normalizeEmployeePortfolio(item);

          return getEmployeeAssignments(employee)
            .filter(
              (assignment) =>
                assignment.attachType === 'department' &&
                assignment.roleType === 'department_head' &&
                String(assignment.facultyId || '') === String(contextFacultyId || '')
            )
            .map((assignment) =>
              normalizeEmployeePortfolio({
                ...employee,
                currentAssignment: assignment
              })
            );
        })
      ),
    [contextFacultyId, employeeItems]
  );
  const departmentHeadsById = React.useMemo(() => {
    return departmentHeads.reduce((accumulator, employee) => {
      const departmentId = String(employee.departmentId || '');

      if (!departmentId || accumulator[departmentId]) {
        return accumulator;
      }

      accumulator[departmentId] = employee;
      return accumulator;
    }, {});
  }, [departmentHeads]);

  const departmentList = React.useMemo(() => sortByOrder(faculty?.departments || []), [faculty]);
  const activeDirectionItem = React.useMemo(() => {
    if (!attachedDirections.length) {
      return null;
    }

    return (
      attachedDirections.find((item) => String(item.id) === String(activeDirectionItemId)) ||
      attachedDirections[0]
    );
  }, [activeDirectionItemId, attachedDirections]);
  const attachedMenuCount = configuredPanels.length;
  const summaryItems =
    pageType === 'faculty'
      ? [
          { label: texts.summary.pageType, value: meta.label },
          { label: texts.summary.departments, value: String(departmentList.length) },
          { label: texts.summary.attachedMenu, value: String(attachedMenuCount) }
        ]
      : pageType === 'department'
        ? [
            { label: texts.summary.pageType, value: meta.label },
            {
              label: texts.summary.faculty,
              value: getTranslatedField(faculty, 'title', faculty?.title) || '-'
            },
            { label: texts.summary.attachedMenu, value: String(attachedMenuCount) }
          ]
        : [];

  const leaderCardTitle =
    texts.leaderCardTitles?.[pageType] ||
    texts.leaderCardTitles?.faculty ||
    meta.label;
  const updatedLabel = formatCmsDate(entity?.updatedAt || entity?.createdAt);
  const hasDepartmentsPanel = panelItems.some((panel) => panel.variant === 'departments');

  const leaderActions = React.useMemo(() => {
    if (!leadEmployee) {
      return [];
    }

    return [
      leadEmployee.phone
        ? {
            key: 'phone',
            href: `tel:${leadEmployee.phone}`,
            label: texts.leaderInfoPhoneLabel,
            icon: <FiPhone />
          }
        : null,
      leadEmployee.telegram
        ? {
            key: 'telegram',
            href: leadEmployee.telegram,
            label: texts.leaderInfoTelegramLabel,
            icon: <FiSend />,
            external: true
          }
        : null,
      leadEmployee.instagram
        ? {
            key: 'instagram',
            href: leadEmployee.instagram,
            label: texts.leaderInfoInstagramLabel,
            icon: <FiInstagram />,
            external: true
          }
        : null
    ].filter(Boolean);
  }, [leadEmployee, texts]);

const renderDepartmentGrid = () => {
  if (!departmentList.length) {
    return <div className="academic-entity-empty-state">{texts.emptyDepartments}</div>;
  }

  return (
    <div className="academic-department-list">
      {departmentList.map((item) => {
        const departmentTitle = getTranslatedField(item, 'title', item.title);
        const head = departmentHeadsById[String(item.id)] || null;
        const headName = head?.fullName || 'Ma’lumotlar hali joylanmagan';
        const receptionTime =
          head?.receptionTime || head?.workTime || head?.workingHours || 'Dushanba – Juma 9:00 -17:00';
        const phone = head?.phone || '';
        const email = head?.email || head?.mail || '';

        return (
          <AppLink
            key={item.id}
            href={`/departments/${faculty.id}/${item.id}`}
            className="academic-department-item"
          >
            <div className="academic-department-item-logo">
              {item.image || faculty.image ? (
                <img src={item.image || faculty.image} alt={departmentTitle} />
              ) : (
                <span>{departmentTitle?.charAt(0) || 'K'}</span>
              )}
            </div>

            <div className="academic-department-item-body">
              <h3>{departmentTitle}</h3>
              <p>{headName}</p>

              <div className="academic-department-item-line" />

              <ul>
                <li>
                  <span>▣</span>
                  <strong>Qabul vaqti:</strong> {receptionTime}
                </li>

                {phone ? (
                  <li>
                    <span>☎</span>
                    <strong>Telefon:</strong> {phone}
                  </li>
                ) : null}

                <li>
                  <span>✉</span>
                  <strong>Email:</strong> {email || 'Ma’lumotlar hali joylanmagan'}
                </li>
              </ul>
            </div>
          </AppLink>
        );
      })}
    </div>
  );
};

  const renderDirectionsGrid = () => {
    if (!attachedDirections.length) {
      return <div className="academic-entity-empty-state">{texts.emptyDirections}</div>;
    }

    const activeItem = activeDirectionItem || attachedDirections[0];
    const activeTitle = getTranslatedField(activeItem, 'title', activeItem?.title);
    const activeContent = getTranslatedField(activeItem, 'content') || '';
    const activeHref = String(activeItem?.link || '').trim();
    const showDirectionSelector = attachedDirections.length > 1;

    return (
      <div className="academic-direction-browser">
        {showDirectionSelector ? (
          <div className="academic-direction-list" role="tablist" aria-label={texts.directionsPanelTitle}>
            {attachedDirections.map((item) => {
              const title = getTranslatedField(item, 'title', item.title);
              const isActive = String(item.id) === String(activeItem?.id);
              const content = getTranslatedField(item, 'content') || '';
              const hasContent = Boolean(stripHtml(content));
              const hasLink = Boolean(String(item.link || '').trim());

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`academic-direction-item${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (hasContent) {
                      setActiveDirectionItemId(String(item.id));
                      return;
                    }

                    if (hasLink) {
                      openDirectionTarget(item);
                      return;
                    }

                    setActiveDirectionItemId(String(item.id));
                  }}
                >
                  <span className="academic-direction-item-icon">
                    <DirectionIcon />
                  </span>
                  <span className="academic-direction-item-label">{title}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <section className="academic-direction-detail academic-entity-content-surface academic-entity-content-surface--prose">
          <div className="academic-entity-overview-head academic-entity-overview-head--compact">
            <h3>{activeTitle || texts.directionsPanelTitle}</h3>
          </div>

          {renderRichText(activeContent, texts.directionEmptyContent)}

          {activeHref ? (
            <AppLink href={activeHref} className="academic-direction-detail-link">
              <FiExternalLink />
              {texts.directionLinkLabel}
            </AppLink>
          ) : null}
        </section>
      </div>
    );
  };

  const renderFacultyOverview = () => {
    const showDepartmentsFallback = !hasDepartmentsPanel && departmentList.length > 0;

    return (
      <div className="academic-entity-overview-stack academic-entity-overview-stack--faculty">
        <section className="academic-entity-content-surface academic-entity-content-surface--prose">
          <div className="academic-entity-overview-head academic-entity-overview-head--compact">
            <h3>{texts.facultyAboutTitle}</h3>
          </div>

          {renderRichText(
            getTranslatedField(entity, 'content') || '',
            texts.emptyFacultyContent
          )}
        </section>

        {showDepartmentsFallback ? (
          <section className="academic-entity-content-surface">
            <div className="academic-entity-overview-head academic-entity-overview-head--compact">
              <h3>{texts.attachedDepartmentsTitle}</h3>
            </div>

            {renderDepartmentGrid()}
          </section>
        ) : null}
      </div>
    );
  };

  const renderDirectionsSection = (panel = departmentDirectionsPanel) => {
    if (!panel) {
      return null;
    }

    const panelContent = getTranslatedField(panel, 'content') || '';
    const hasPanelContent = Boolean(stripHtml(panelContent));

    return renderPanelWithFiles(
      <section className="academic-entity-content-surface">
        {hasPanelContent ? (
          <div className="academic-direction-intro">
            {renderRichText(panelContent, '')}
          </div>
        ) : null}

        {renderDirectionsGrid()}
      </section>,
      panel
    );
  };

  const renderDepartmentOverview = () => (
    <div className="academic-entity-overview-stack academic-entity-overview-stack--faculty">
      <section className="academic-entity-content-surface academic-entity-content-surface--prose">
        {renderRichText(
          getTranslatedField(entity, 'content') || '',
          texts.emptyPageContent
        )}
      </section>
    </div>
  );

  const renderPanelContent = (panel = selectedPanel) => {
    if (!panel || panel.variant === 'overview') {
      if (pageType === 'faculty') {
        return renderFacultyOverview();
      }

      if (pageType === 'department') {
        return renderDepartmentOverview();
      }

      return (
        <div className="academic-entity-overview-section">
          {renderRichText(
            getTranslatedField(entity, 'content') || '',
            texts.emptyPageContent
          )}
        </div>
      );
    }

    if (panel.variant === 'departments') {
      return renderPanelWithFiles(
        <section className="academic-entity-content-surface">
          <div className="academic-entity-overview-head academic-entity-overview-head--compact">
            <h3>{panel.title}</h3>
          </div>

          {renderDepartmentGrid()}
        </section>,
        panel
      );
    }

    if (panel.variant === 'faculty') {
      if (!faculty) {
        return <div className="academic-entity-empty-state">{texts.missingFacultyInfo}</div>;
      }

      return renderPanelWithFiles(
        <section className="academic-entity-content-surface">
          <div className="academic-entity-feature">
            <div className="academic-entity-feature-media">
              <img
                src={faculty.image || entity?.image}
                alt={getTranslatedField(faculty, 'title', faculty.title)}
              />
            </div>

            <div className="academic-entity-feature-body">
              <span>{texts.relatedFacultyLabel}</span>
              <h3>{getTranslatedField(faculty, 'title', faculty.title)}</h3>
              <p>
                {getHtmlExcerpt(getTranslatedField(faculty, 'content') || '', 200) ||
                  texts.relatedFacultyFallback}
              </p>

              <AppLink href={`/faculties/${faculty.id}`} className="academic-entity-feature-link">
                {texts.openFacultyPage}
              </AppLink>
            </div>
          </div>
        </section>,
        panel
      );
    }

    if (panel.variant === 'directions') {
      return renderDirectionsSection(panel);
    }

    if (panel.variant === 'sections') {
      if (!sections.length) {
        return <div className="academic-entity-empty-state">{texts.emptySections}</div>;
      }

      return renderPanelWithFiles(
        <section className="academic-entity-content-surface">
          <div className="academic-entity-card-grid compact">
            {sections.map((item) => (
              <AppLink
                key={item.id}
                href={`/sections/${item.id}`}
                className="academic-entity-card compact"
              >
                <div className="academic-entity-card-body">
                  <span>{texts.sectionBadge}</span>
                  <h3>{getTranslatedField(item, 'title', item.title)}</h3>
                  <p>
                    {getHtmlExcerpt(getTranslatedField(item, 'content') || '', 120) ||
                      texts.sectionFallback}
                  </p>
                </div>
              </AppLink>
            ))}
          </div>
        </section>,
        panel
      );
    }

    if (panel.variant === 'employees') {
      if (employeesLoading) {
        return null;
      }

      if (!attachedEmployees.length) {
        return <div className="academic-entity-empty-state">{texts.emptyEmployees}</div>;
      }

      return renderPanelWithFiles(
        <section className="academic-entity-content-surface">
          <div className="academic-employee-grid">
            {attachedEmployees.map((employee, index) => (
              <AppLink
                key={employee.id}
                href={buildEmployeeProfilePath(employee)}
                className="academic-employee-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="academic-employee-card-media">
                  {employee.image ? (
                    <img src={employee.image} alt={employee.fullName} />
                  ) : (
                    <div className="academic-employee-card-placeholder">
                      {employee.fullName?.charAt(0) || 'H'}
                    </div>
                  )}
                </div>

                <div className="academic-employee-card-body">
                  <h3>{employee.fullName}</h3>
                  <p>{getEmployeePosition(employee) || texts.employeeFallbackPosition}</p>
                </div>
              </AppLink>
            ))}
          </div>
        </section>,
        panel
      );
    }

    const panelContent = getTranslatedField(panel, 'content') || '';
    const hasPanelContent = Boolean(stripHtml(panelContent));

    if (pageType === 'faculty' && isAboutPanel(panel) && !hasPanelContent) {
      return renderFacultyOverview();
    }

    return renderPanelWithFiles(
      <section className="academic-entity-content-surface academic-entity-content-surface--prose">
        {renderRichText(panelContent, texts.emptyMenuContent)}
      </section>,
      panel
    );
  };

const renderLeaderCard = () => (
  <div className="academic-entity-leader-card academic-entity-leader-card--clean">
    <div className="academic-entity-leader-clean-title">
      <h2>{leaderCardTitle}</h2>
    </div>

    {leadEmployee ? (
      <div className="academic-entity-leader-clean-body">
        <div className="academic-entity-leader-clean-photo">
          {leadEmployee.image ? (
            <img src={leadEmployee.image} alt={leadEmployee.fullName} />
          ) : (
            <div className="academic-entity-leader-placeholder">
              {leadEmployee.fullName?.charAt(0) || 'H'}
            </div>
          )}
        </div>

        <div className="academic-entity-leader-clean-info">
          <h3>{leadEmployee.fullName}</h3>
          {getEmployeePosition(leadEmployee) ? <p>{getEmployeePosition(leadEmployee)}</p> : null}

          {(
            [
              leadEmployee.phone,
              leadEmployee.email || leadEmployee.mail,
              leadEmployee.receptionTime || leadEmployee.workTime || leadEmployee.workingHours
            ].filter(Boolean).length > 0
          ) ? (
            <div className="academic-entity-leader-clean-details">
              {leadEmployee.phone ? (
                <div className="academic-entity-leader-clean-detail">
                  <span className="academic-entity-leader-clean-detail-icon">
                    <FiPhone />
                  </span>

                  <div>
                    <small>{texts.leaderInfoPhoneLabel}</small>
                    <strong>{leadEmployee.phone}</strong>
                  </div>
                </div>
              ) : null}

              {leadEmployee.email || leadEmployee.mail ? (
                <div className="academic-entity-leader-clean-detail">
                  <span className="academic-entity-leader-clean-detail-icon">
                    <FiMail />
                  </span>

                  <div>
                    <small>{texts.leaderInfoEmailLabel}</small>
                    <strong>{leadEmployee.email || leadEmployee.mail}</strong>
                  </div>
                </div>
              ) : null}

              {leadEmployee.receptionTime || leadEmployee.workTime || leadEmployee.workingHours ? (
                <div className="academic-entity-leader-clean-detail">
                  <span className="academic-entity-leader-clean-detail-icon">
                    <FiClock />
                  </span>

                  <div>
                    <small>{texts.leaderInfoReceptionLabel}</small>
                    <strong>
                      {leadEmployee.receptionTime ||
                        leadEmployee.workTime ||
                        leadEmployee.workingHours}
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {leaderActions.length ? (
            <div className="academic-entity-leader-clean-actions">
              {leaderActions.map((action) => (
                <AppLink
                  key={action.key}
                  href={action.href}
                  className="academic-entity-leader-clean-action"
                  aria-label={action.label}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noreferrer' : undefined}
                >
                  {action.icon}
                </AppLink>
              ))}
            </div>
          ) : null}

          <AppLink
            href={buildEmployeeProfilePath(leadEmployee)}
            className="academic-entity-leader-clean-profile"
          >
            <FiExternalLink />
            {texts.leaderProfileAction || 'Batafsil'}
          </AppLink>
        </div>
      </div>
    ) : (
      <div className="academic-entity-empty-state">
        {texts.leaderEmptyText || texts.emptyEmployees}
      </div>
    )}
  </div>
);



  const sidebarUsesProvidedItems = panelNavigationItems.length > 0;
  const shouldShowTopLinkTable = React.useMemo(() => {
    if (!entity?.linkTable?.length) {
      return false;
    }

    if (!selectedPanel || isOverviewPanel(selectedPanel)) {
      return true;
    }

    if (pageType === 'faculty' && isAboutPanel(selectedPanel)) {
      return true;
    }

    return selectedPanel.variant === 'content';
  }, [entity?.linkTable, pageType, selectedPanel]);

const renderSidebarNavigation = () => (
  <AcademicSidebar
    title={texts.pageMenuTitle}
    items={sidebarUsesProvidedItems ? panelNavigationItems : undefined}
    activeKey={selectedPanel?.key}
    useProvidedItemsOnly={sidebarUsesProvidedItems}
    showSearch={sidebarUsesProvidedItems}
    pageType={pageType}
    facultyId={contextFacultyId}
    departmentId={contextDepartmentId}
    sectionId={contextSectionId}
    leader={leadEmployee}
    leaderTitle={leaderCardTitle}
  />
);

const renderSidebarExtras = () => (
  <AcademicSidebar
    title={texts.pageMenuTitle}
    items={sidebarUsesProvidedItems ? panelNavigationItems : undefined}
    activeKey={selectedPanel?.key}
    useProvidedItemsOnly={sidebarUsesProvidedItems}
    showSearch
    showLeaderCard={false}
    showMenuSection={false}
    pageType={pageType}
    facultyId={contextFacultyId}
    departmentId={contextDepartmentId}
    sectionId={contextSectionId}
    leader={leadEmployee}
    leaderTitle={leaderCardTitle}
  />
);

const renderSidebarStack = () => (
  <div className="academic-entity-sidebar-stack">
    {renderSidebarNavigation()}
  </div>
);

  const renderTopMenuTabs = (className = '') => {
    if (!showTopMenuTabs || !panelItems.length) {
      return null;
    }

    return (
      <div
        className={`academic-entity-tabs academic-entity-tabs--uniform${className ? ` ${className}` : ''}`}
        role="tablist"
        aria-label={texts.pageMenuTitle}
      >
        {panelItems.map((panel) => {
          const fullLabel = panel.title || texts.panelFallbackTitle;
          const shortLabel = truncateMenuLabel(fullLabel, 15);
          const hasTooltip = fullLabel.length > 15;

          return (
            <button
              key={panel.key}
              type="button"
              className={`academic-entity-tab${selectedPanel?.key === panel.key ? ' is-active' : ''}`}
              aria-pressed={selectedPanel?.key === panel.key}
              title={hasTooltip ? fullLabel : undefined}
              data-full-label={fullLabel}
              data-has-tooltip={hasTooltip ? 'true' : 'false'}
              onClick={() => handlePanelSelect(panel.key)}
            >
              <span className="academic-entity-tab-label">{shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (academicLoading || menuLoading || employeesLoading || directionsLoading) {
    return <main className="academic-entity-page" />;
  }

  if (!entity) {
    return (
      <main className="academic-entity-page">
        <div className="academic-entity-layout">
          <section className="academic-entity-not-found">
            <span>{meta.eyebrow}</span>
            <h1>{meta.emptyTitle}</h1>
            <p>{texts.notFoundText}</p>
            <Link to={meta.backTo} className="academic-entity-back-link">
              {meta.backLabel}
            </Link>
          </section>

          <aside className="academic-entity-sidebar">
            {renderSidebarNavigation()}
          </aside>
        </div>
      </main>
    );
  }

  const overviewTitle = getTranslatedField(entity, 'title', entity.title) || meta.label;
  const isOverviewSelected = !selectedPanel || isOverviewPanel(selectedPanel);
  const panelTitle = isOverviewSelected ? overviewTitle : selectedPanel?.title || overviewTitle;
  const panelSubtitle = isOverviewSelected ? meta.label : texts.pageMenuTitle;
  const panelDescription = isOverviewSelected
    ? pageType === 'faculty'
      ? texts.facultyOverviewDescription
      : texts.pageOverviewDescription(meta.label)
    : texts.activeMenuDescription;
  const showPanelHead = !showTopMenuTabs && !isFacultyShowcase && (!!selectedPanel || pageType !== 'faculty');

  // Fakultet: faqat tanlangan menyuning kontenti ko‘rsatiladi.
  // CMS orqali biriktirilgan menyular o‘ngdagi AcademicSidebar'da qoladi.
  if (pageType === 'faculty') {
    const facultyContent = getTranslatedField(entity, 'content') || '';
    const availableMenus = configuredPanels.filter((panel) => !isLeaderPanel(panel));
    const activeMenu = availableMenus.find((panel) => panel.key === activePanelKey);
    const showingAbout = !activeMenu;
    const displayedTitle = showingAbout ? texts.facultyAboutTitle : activeMenu.title;
    const displayedContent = showingAbout
      ? facultyContent
      : getTranslatedField(activeMenu, 'content') || '';
    const displayedFiles = showingAbout ? [] : (
      Array.isArray(activeMenu.files) ? activeMenu.files : []
    );

    const sidebarItems = [
      {
        key: 'faculty-about',
        label: texts.facultyAboutTitle,
        isActive: showingAbout,
        onClick: () => setActivePanelKey('page-overview')
      },
      ...availableMenus.map((panel) => ({
        key: panel.key,
        label: panel.title,
        isActive: activeMenu?.key === panel.key,
        onClick: () => setActivePanelKey(panel.key)
      }))
    ];

    return (
      <main className="academic-entity-page academic-entity-page--faculty academic-entity-page--information-only">
        <div className="academic-entity-information-shell">
          <article className="academic-entity-information-card" key={showingAbout ? 'faculty-about' : activeMenu.key}>
            <header className="academic-entity-information-header">
              <nav className="faculty-breadcrumb" aria-label="Sahifa navigatsiyasi">
                <Link className="faculty-breadcrumb-link" to={meta.backTo}>
                  {meta.backLabel || 'Fakultetlar'}
                </Link>
                <span className="faculty-breadcrumb-separator" aria-hidden="true">›</span>
                {showingAbout ? (
                  <span className="faculty-breadcrumb-current" aria-current="page">
                    {texts.facultyAboutTitle}
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      className="faculty-breadcrumb-link"
                      onClick={() => setActivePanelKey('page-overview')}
                    >
                      {texts.facultyAboutTitle}
                    </button>
                    <span className="faculty-breadcrumb-separator" aria-hidden="true">›</span>
                    <span className="faculty-breadcrumb-current" aria-current="page">
                      {displayedTitle}
                    </span>
                  </>
                )}
              </nav>
              <div className="faculty-heading-row">
                <span className="academic-entity-information-accent" aria-hidden="true" />
                <h2>{displayedTitle}</h2>
              </div>
            </header>

            {stripHtml(displayedContent) ? (
              <div
                className="academic-entity-information-content academic-entity-rich"
                dangerouslySetInnerHTML={createSafeMarkup(displayedContent)}
              />
            ) : null}

            {displayedFiles.length > 0 ? (
              <AttachedFilesList items={displayedFiles} />
            ) : null}

            {!stripHtml(displayedContent) && displayedFiles.length === 0 ? (
              <div className="academic-entity-empty-state">{texts.emptyFacultyContent}</div>
            ) : null}

            {showingAbout && entity?.linkTable?.length > 0 ? (
              <div className="academic-entity-information-links">
                <LinkedInfoTable items={entity.linkTable} />
              </div>
            ) : null}
          </article>

          <aside className="academic-entity-information-sidebar">
            <AcademicSidebar
              title={texts.pageMenuTitle}
              items={sidebarItems}
              activeKey={showingAbout ? 'faculty-about' : activeMenu.key}
              useProvidedItemsOnly
              showSearch={false}
              showLeaderCard
              showMenuSection
              showAnnouncements
              pageType="faculty"
              facultyId={contextFacultyId}
              leader={leadEmployee}
              leaderTitle={leaderCardTitle}
            />
          </aside>
        </div>
      </main>
    );
  }

  if (isFacultyShowcase) {
    return (
      <main className="academic-entity-page academic-entity-page--faculty">
        {updatedLabel ? (
          <div className="academic-entity-showcase-update-bar">
            <div className="academic-entity-showcase-update-shell">
              <div className="academic-entity-showcase-update">
                <UpdateIcon />
                <span>
                  {texts.lastUpdatedLabel}: {updatedLabel}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="academic-entity-faculty-shell">
          <article className="academic-entity-panel academic-entity-panel--faculty">
            {renderTopMenuTabs()}

            {shouldShowTopLinkTable ? (
              <div className="academic-entity-panel-links">
                <LinkedInfoTable items={entity?.linkTable} />
              </div>
            ) : null}

            <div className="academic-entity-panel-body academic-entity-panel-body--faculty">
              {renderPanelContent(selectedPanel)}
            </div>
          </article>

          <aside className="academic-entity-leader-column">
            {renderLeaderCard()}
            <div className="academic-entity-leader-sidebar">
              {renderSidebarExtras()}
            </div>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className={`academic-entity-page academic-entity-page--${pageType}`}>
      <div className={`academic-entity-layout${showTopMenuTabs ? ' academic-entity-layout--with-leader' : ''}`}>
        <article className="academic-entity-main">
          <section className={`academic-entity-hero academic-entity-hero--${pageType}`}>
            <div className="academic-entity-hero-copy">
              <div className="academic-entity-hero-topline">
                <Link to={meta.backTo} className="academic-entity-back-link">
                  ← {meta.backLabel}
                </Link>
                {pageType !== 'section' ? (
                  <span className="academic-entity-eyebrow">{meta.label}</span>
                ) : null}
              </div>

              <h1>{overviewTitle}</h1>

              {summaryItems.length ? (
                <div className={`academic-entity-summary academic-entity-summary--${pageType}`}>
                  {summaryItems.map((item) => (
                    <div className="academic-entity-summary-card" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              {pageType === 'section' ? renderTopMenuTabs('academic-entity-tabs--hero') : null}
            </div>

            <div className="academic-entity-hero-media">
              {entity.image ? (
                <div className="academic-entity-hero-media-frame">
                  <img src={entity.image} alt={overviewTitle} />
                </div>
              ) : (
                <div className="academic-entity-hero-placeholder">{meta.label}</div>
              )}
            </div>
          </section>

          <section className="academic-entity-panel">
            {pageType !== 'section' ? renderTopMenuTabs() : null}

            {showPanelHead && (
              <div className="academic-entity-panel-head">
                <span>{panelSubtitle}</span>
                <h2>{panelTitle}</h2>
                <p>{panelDescription}</p>
              </div>
            )}

            {shouldShowTopLinkTable ? (
              <div className="academic-entity-panel-links">
                <LinkedInfoTable items={entity?.linkTable} />
              </div>
            ) : null}

            <div
              className="academic-entity-panel-body"
              style={{
                marginTop:
                  showPanelHead || (showTopMenuTabs && pageType !== 'section') ? undefined : 0
              }}
            >
              {renderPanelContent(selectedPanel)}
            </div>
          </section>
        </article>

        <aside className="academic-entity-sidebar">
          {showTopMenuTabs ? (
            <div className="academic-entity-sidebar-stack">
              {renderLeaderCard()}
              {renderSidebarExtras()}
            </div>
          ) : (
            renderSidebarStack()
          )}
        </aside>
      </div>
    </main>
  );
}

export default AcademicEntityPage;
