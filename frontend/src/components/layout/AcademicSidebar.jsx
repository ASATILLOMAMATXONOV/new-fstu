import React from 'react';
import { NavLink } from 'react-router-dom';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WorkIcon from '@mui/icons-material/Work';

import '../../assets/styles/AcademicSidebar.css';
import { useContentList } from '../../hooks/useContentList';
import { useLanguage } from '../../context/LanguageContext';
import { useMenuTree } from '../../hooks/useMenuTree';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField, stripHtml } from '../../utils/cms';
import { getMenuNodeHref, getMenuNodeTitle, sortMenuNodes } from '../../utils/menu';
import {
  buildEmployeeProfilePath,
  findEmployeeAssignmentForContext,
  getEmployeePosition,
  isEmployeeAttachedToContext,
  normalizeEmployeePortfolio,
  sortEmployees
} from '../../utils/employees';

function normalizeMenuName(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '');
}

function isAcademicMenu(node) {
  if (node?.metadata?.menuScope === 'academic' || node?.menuScope === 'academic') return true;

  return [node?.uz?.title, node?.ru?.title, node?.en?.title, node?.title].some((title) => {
    const normalizedTitle = normalizeMenuName(title);
    return normalizedTitle.includes('akademik') || normalizedTitle.includes('academic');
  });
}

function buildBranchItems(nodes = [], level = 0) {
  return sortMenuNodes(nodes).flatMap((node) => {
    if (node.active === false || node.id === undefined || node.id === null) return [];

    const prefix = level > 0 ? `${'- '.repeat(level)}` : '';

    return [
      {
        key: String(node.id),
        label: `${prefix}${getMenuNodeTitle(node) || 'Menu'}`,
        to: getMenuNodeHref(node),
        end: true
      },
      ...buildBranchItems(node.children || [], level + 1)
    ];
  });
}

function hasMenuNodeContent(node) {
  return Boolean(stripHtml(getTranslatedField(node, 'content', '') || node?.title || ''));
}

function AcademicSidebar({
  title,
  items,
  activeKey = '',
  useProvidedItemsOnly = false,
  showSearch = false,
  showLeaderCard = true,
  showMenuSection = true,
  showAnnouncements = true,
  pageType = '',
  facultyId,
  departmentId,
  sectionId,
  leader,
  leaderTitle
}) {
  const { currentLanguageCode } = useLanguage();

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).academicSidebar,
    [currentLanguageCode]
  );

  const [searchValue, setSearchValue] = React.useState('');
  const supportsLeaderContext = ['faculty', 'department', 'section'].includes(pageType);
  const shouldResolveLeaderFromList = showLeaderCard && !leader && supportsLeaderContext;
  const shouldLoadMenuTree = showMenuSection;
  const { menus, loading: menusLoading } = useMenuTree('academic-menus', {
    enabled: shouldLoadMenuTree
  });
  const { items: employeeItems } = useContentList('employees-portfolios', {
    summaryOnly: false,
    enabled: shouldResolveLeaderFromList
  });
  const { items: announcementItems } = useContentList('announcements', {
    limit: 3,
    orderBy: 'recent',
    enabled: showAnnouncements
  });

  const latestAnnouncements = React.useMemo(() => {
    return [...announcementItems]
      .filter((item) => item.active !== false)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
  }, [announcementItems]);

  const hasProvidedItems = Array.isArray(items);

  const fallbackMenuItems = React.useMemo(
    () => [
      { label: texts.items.faculties, to: '/faculties', end: true },
      { label: texts.items.departments, to: '/departments', end: true },
      { label: texts.items.sections, to: '/sections', end: true },
      { label: texts.items.partners, to: '/partners', end: true },
      { label: texts.items.news, to: '/news', end: false }
    ],
    [texts]
  );

  const academicRoot = React.useMemo(() => {
    if (!menus.length) return null;
    return menus.find((node) => isAcademicMenu(node)) || menus[0] || null;
  }, [menus]);

  const derivedItems = React.useMemo(() => {
    if (useProvidedItemsOnly && hasProvidedItems) return items;
    if (items?.length) return items;

    if (academicRoot) {
      const rootHasOwnPage = Boolean(String(academicRoot.url || '').trim()) || hasMenuNodeContent(academicRoot);
      const multipleRoots = menus.length > 1;

      if (!multipleRoots && academicRoot.children?.length && isAcademicMenu(academicRoot) && !rootHasOwnPage) {
        return buildBranchItems(academicRoot.children);
      }

      return buildBranchItems(menus);
    }

    if (menusLoading) return [];
    return fallbackMenuItems;
  }, [academicRoot, fallbackMenuItems, hasProvidedItems, items, menus, menusLoading, useProvidedItemsOnly]);

  const sidebarTitle = title || texts.title;

  const filteredItems = React.useMemo(() => {
    const normalizedSearch = normalizeMenuName(searchValue);
    if (!normalizedSearch) return derivedItems;
    return derivedItems.filter((item) => normalizeMenuName(item.label).includes(normalizedSearch));
  }, [derivedItems, searchValue]);

  const leadEmployee = React.useMemo(() => {
    if (leader) return leader;

    const normalizedEmployees = sortEmployees(
      employeeItems
        .map(normalizeEmployeePortfolio)
        .map((employee) => {
          const currentAssignment = findEmployeeAssignmentForContext(employee, {
            pageType,
            facultyId,
            departmentId,
            sectionId
          });

          if (!currentAssignment || !isEmployeeAttachedToContext(employee, {
            pageType,
            facultyId,
            departmentId,
            sectionId
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

    const roleType =
      pageType === 'faculty'
        ? 'dean'
        : pageType === 'department'
          ? 'department_head'
          : pageType === 'section'
          ? 'section_head'
            : '';

    return normalizedEmployees.find((employee) => employee.roleType === roleType) || normalizedEmployees[0] || null;
  }, [leader, employeeItems, pageType, facultyId, departmentId, sectionId]);

  const shouldShowLeaderCard = showLeaderCard && supportsLeaderContext;

  const leaderCardTitle =
    leaderTitle ||
    (pageType === 'faculty'
      ? 'Fakultet dekani'
      : pageType === 'department'
        ? 'Kafedra mudiri'
        : pageType === 'section'
          ? 'Bo‘lim boshlig‘i'
          : '');

  const leaderName = leadEmployee?.fullName || leaderCardTitle;
  const leaderPosition = getEmployeePosition(leadEmployee) || 'Ma’lumotlar hali joylanmagan';
  const leaderImage = leadEmployee?.image || '';
  const leaderPhone = leadEmployee?.phone || '';
  const leaderTelegram = leadEmployee?.telegram || '';
  const leaderInstagram = leadEmployee?.instagram || '';
  const leaderEmail = leadEmployee?.email || leadEmployee?.mail || '';
  const leaderReception = leadEmployee?.receptionTime || leadEmployee?.workTime || leadEmployee?.workingHours || '';

  return (
    <aside className="academic-sidebar" aria-label={sidebarTitle}>
      {shouldShowLeaderCard ? (
        <div className="academic-dean-card">
          <h3 className="academic-dean-title">{leaderCardTitle}</h3>

          <div className="academic-dean-photo-wrap">
            {leaderImage ? (
              <img className="academic-dean-photo" src={leaderImage} alt={leaderName} />
            ) : (
              <div className="academic-dean-photo academic-dean-photo-empty">
                {leaderName?.charAt(0) || 'H'}
              </div>
            )}
          </div>

          <div className="academic-dean-body">
            <h4>{leaderName}</h4>
            <p>{leaderPosition}</p>

            <div className="academic-dean-social">
              {leaderTelegram ? (
                <a href={leaderTelegram} target="_blank" rel="noreferrer" aria-label="Telegram">
                  <TelegramIcon />
                </a>
              ) : null}

              {leaderPhone ? (
                <a href={`tel:${leaderPhone}`} aria-label="Telefon">
                  <PhoneOutlinedIcon />
                </a>
              ) : null}

              {leaderInstagram ? (
                <a href={leaderInstagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              ) : null}

              {leaderEmail ? (
                <a href={`mailto:${leaderEmail}`} aria-label="Email">
                  <EmailOutlinedIcon />
                </a>
              ) : null}
            </div>
          </div>

          <div className="academic-dean-info">
            <h4>Ma’lumotlar</h4>

            <div className="academic-dean-info-row">
              <span><WorkIcon /></span>
              <p>{leaderPosition}</p>
            </div>

            <div className="academic-dean-info-row">
              <span><EmailOutlinedIcon /></span>
              <p>{leaderEmail || 'Ma’lumotlar hali joylanmagan'}</p>
            </div>

            <div className="academic-dean-info-row">
              <span><PhoneOutlinedIcon /></span>
              <p>{leaderPhone || 'Ma’lumotlar hali joylanmagan'}</p>
            </div>

            <div className="academic-dean-info-row">
              <span><AccessTimeIcon /></span>
              <p>{leaderReception || 'Ma’lumotlar hali joylanmagan'}</p>
            </div>

            {leadEmployee ? (
              <NavLink to={buildEmployeeProfilePath(leadEmployee)} className="academic-dean-btn">
                <LinkIcon />
                Rahbar haqida
              </NavLink>
            ) : null}
          </div>
        </div>
      ) : null}

      {showMenuSection ? (
        <div className="academic-pages-box">
          <h3>{sidebarTitle}</h3>

          <nav className="academic-sidebar-nav">
            {filteredItems.map((item) => {
              const itemKey = item.key || item.to || item.label;
              const isSelected = item.isActive ?? (item.key && item.key === activeKey);

              if (typeof item.onClick === 'function' && !item.to) {
                return (
                  <button
                    key={itemKey}
                    type="button"
                    onClick={item.onClick}
                    className={`academic-sidebar-link${isSelected ? ' is-active' : ''}`}
                  >
                    <span className="academic-sidebar-icon">
                      <ArrowForwardIosIcon fontSize="small" />
                    </span>
                    <strong>{item.label}</strong>
                  </button>
                );
              }

              return (
                <NavLink
                  key={itemKey}
                  to={item.to}
                  end={item.end ?? true}
                  className={({ isActive }) =>
                    `academic-sidebar-link${isActive || isSelected ? ' is-active' : ''}`
                  }
                >
                  <span className="academic-sidebar-icon">
                    <ArrowForwardIosIcon fontSize="small" />
                  </span>
                  <strong>{item.label}</strong>
                </NavLink>
              );
            })}

            {!filteredItems.length ? (
              <div className="academic-sidebar-empty">{texts.searchEmpty}</div>
            ) : null}
          </nav>
        </div>
      ) : null}

      {showSearch ? (
        <div className="academic-search-box">
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Yangilik nomi, yoki sahifa nomi ..."
          />
          <button type="button">Qidirish</button>
        </div>
      ) : null}

      {showAnnouncements ? (
        <div className="academic-sidebar-announcements">
          <div className="academic-sidebar-announcements-head">
            <h4>Elonlar</h4>

            <NavLink to="/announcements" className="academic-sidebar-announcements-all">
              Barchasi
            </NavLink>
          </div>

          <div className="academic-sidebar-announcements-list">
            {latestAnnouncements.length ? (
              latestAnnouncements.map((item) => {
                const announcementTitle = getTranslatedField(item, 'title', item.title) || 'Elon';
                const announcementImage = item.image || item.cover || item.photo || '';

                return (
                  <NavLink
                    key={item.id}
                    to={`/announcements/page/${item.id}`}
                    className="academic-sidebar-announcement-card"
                  >
                    <div className="academic-sidebar-announcement-image">
                      {announcementImage ? (
                        <img src={announcementImage} alt={announcementTitle} />
                      ) : (
                        <div className="academic-sidebar-announcement-placeholder">E</div>
                      )}
                    </div>

                    <strong>{announcementTitle}</strong>
                  </NavLink>
                );
              })
            ) : (
              <div className="academic-sidebar-announcement-empty">
                Elonlar hali joylanmagan
              </div>
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export default AcademicSidebar;
