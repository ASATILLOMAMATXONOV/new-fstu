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
import SearchIcon from '@mui/icons-material/Search';

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
    .toLocaleLowerCase()
    .replace(/o[‘ʻ'’`]/g, 'o')
    .replace(/g[‘ʻ'’`]/g, 'g')
    .replace(/[‘ʻ'’`]/g, '');
}

function isAcademicMenu(node) {
  if (node?.metadata?.menuScope === 'academic' || node?.menuScope === 'academic') return true;
  return [node?.uz?.title, node?.ru?.title, node?.en?.title, node?.title].some((title) => {
    const value = normalizeMenuName(title);
    return value.includes('akademik') || value.includes('academic');
  });
}

function buildBranchItems(nodes = [], level = 0) {
  return sortMenuNodes(nodes).flatMap((node) => {
    if (node.active === false || node.id === undefined || node.id === null) return [];
    return [
      {
        key: String(node.id),
        label: `${level ? '— '.repeat(level) : ''}${getMenuNodeTitle(node) || 'Menu'}`,
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

const emptyText = 'Ma’lumotlar hali joylanmagan';

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
  const { menus = [], loading: menusLoading } = useMenuTree('academic-menus', {
    enabled: showMenuSection
  });
  const { items: employeeItems = [] } = useContentList('employees-portfolios', {
    summaryOnly: false,
    enabled: shouldResolveLeaderFromList
  });
  const { items: announcementItems = [] } = useContentList('announcements', {
    limit: 3,
    orderBy: 'recent',
    enabled: showAnnouncements
  });

  const latestAnnouncements = React.useMemo(
    () => [...announcementItems]
      .filter(item => item?.active !== false)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3),
    [announcementItems]
  );

  const hasProvidedItems = Array.isArray(items);
  const fallbackMenuItems = React.useMemo(() => [
    { label: texts.items.faculties, to: '/faculties', end: true },
    { label: texts.items.departments, to: '/departments', end: true },
    { label: texts.items.sections, to: '/sections', end: true },
    { label: texts.items.partners, to: '/partners', end: true },
    { label: texts.items.news, to: '/news', end: false }
  ], [texts]);

  const academicRoot = React.useMemo(
    () => menus.find(isAcademicMenu) || menus[0] || null,
    [menus]
  );

  const derivedItems = React.useMemo(() => {
    if (useProvidedItemsOnly && hasProvidedItems) return items;
    if (items?.length) return items;
    if (academicRoot) {
      const rootHasOwnPage = Boolean(String(academicRoot.url || '').trim()) || hasMenuNodeContent(academicRoot);
      if (menus.length === 1 && academicRoot.children?.length && isAcademicMenu(academicRoot) && !rootHasOwnPage) {
        return buildBranchItems(academicRoot.children);
      }
      return buildBranchItems(menus);
    }
    return menusLoading ? [] : fallbackMenuItems;
  }, [academicRoot, fallbackMenuItems, hasProvidedItems, items, menus, menusLoading, useProvidedItemsOnly]);

  const sidebarTitle = title || texts.title;
  const filteredItems = React.useMemo(() => {
    const q = normalizeMenuName(searchValue);
    return q ? derivedItems.filter(item => normalizeMenuName(item.label).includes(q)) : derivedItems;
  }, [derivedItems, searchValue]);

  const leadEmployee = React.useMemo(() => {
    if (leader) return leader;
    const context = { pageType, facultyId, departmentId, sectionId };
    const employees = sortEmployees(
      employeeItems
        .map(normalizeEmployeePortfolio)
        .map(employee => {
          const currentAssignment = findEmployeeAssignmentForContext(employee, context);
          if (!currentAssignment || !isEmployeeAttachedToContext(employee, context)) return null;
          return normalizeEmployeePortfolio({ ...employee, currentAssignment });
        })
        .filter(Boolean)
    );
    const roleType = pageType === 'faculty' ? 'dean'
      : pageType === 'department' ? 'department_head'
        : pageType === 'section' ? 'section_head' : '';
    return employees.find(employee => employee.roleType === roleType) || employees[0] || null;
  }, [leader, employeeItems, pageType, facultyId, departmentId, sectionId]);

  const shouldShowLeaderCard = showLeaderCard && supportsLeaderContext;
  const leaderCardTitle = leaderTitle || (
    pageType === 'faculty' ? 'Fakultet dekani'
      : pageType === 'department' ? 'Kafedra mudiri'
        : pageType === 'section' ? 'Bo‘lim boshlig‘i' : ''
  );
  const leaderName = leadEmployee?.fullName || leaderCardTitle;
  const leaderPosition = getEmployeePosition(leadEmployee) || emptyText;
  const leaderImage = leadEmployee?.image || '';
  const leaderPhone = leadEmployee?.phone || '';
  const leaderTelegram = leadEmployee?.telegram || '';
  const leaderInstagram = leadEmployee?.instagram || '';
  const leaderEmail = leadEmployee?.email || leadEmployee?.mail || '';
  const leaderReception = leadEmployee?.receptionTime || leadEmployee?.workTime || leadEmployee?.workingHours || '';

  return (
    <aside className="academic-sidebar" aria-label={sidebarTitle}>
      {shouldShowLeaderCard && (
        <section className="academic-dean-card">
          <h3 className="academic-dean-title">{leaderCardTitle}</h3>
          <div className="academic-dean-photo-wrap">
            {leaderImage ? (
              <img className="academic-dean-photo" src={leaderImage} alt={leaderName} loading="lazy" />
            ) : (
              <div className="academic-dean-photo academic-dean-photo-empty" aria-hidden="true">
                {leaderName?.charAt(0) || 'H'}
              </div>
            )}
          </div>
          <div className="academic-dean-body">
            <h4 title={leaderName}>{leaderName}</h4>
            <p title={leaderPosition}>{leaderPosition}</p>
            <div className="academic-dean-social">
              {leaderTelegram && <a href={leaderTelegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><TelegramIcon /></a>}
              {leaderPhone && <a href={`tel:${leaderPhone}`} aria-label="Telefon"><PhoneOutlinedIcon /></a>}
              {leaderInstagram && <a href={leaderInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
              {leaderEmail && <a href={`mailto:${leaderEmail}`} aria-label="Email"><EmailOutlinedIcon /></a>}
            </div>
          </div>
          <div className="academic-dean-info">
            <h4>Ma’lumotlar</h4>
            <div className="academic-dean-info-row"><span><WorkIcon /></span><p title={leaderPosition}>{leaderPosition}</p></div>
            <div className="academic-dean-info-row"><span><EmailOutlinedIcon /></span><p title={leaderEmail || emptyText}>{leaderEmail || emptyText}</p></div>
            <div className="academic-dean-info-row"><span><PhoneOutlinedIcon /></span><p title={leaderPhone || emptyText}>{leaderPhone || emptyText}</p></div>
            <div className="academic-dean-info-row"><span><AccessTimeIcon /></span><p title={leaderReception || emptyText}>{leaderReception || emptyText}</p></div>
            {leadEmployee && (
              <NavLink to={buildEmployeeProfilePath(leadEmployee)} className="academic-dean-btn">
                <LinkIcon />Rahbar haqida <ArrowForwardIosIcon className="academic-action-arrow" />
              </NavLink>
            )}
          </div>
        </section>
      )}

      {showMenuSection && (
        <section className="academic-pages-box">
          <h3>{sidebarTitle}<span className="academic-pages-count">{filteredItems.length}</span></h3>
          <nav className="academic-sidebar-nav" aria-label={sidebarTitle}>
            {filteredItems.map(item => {
              const itemKey = item.key || item.to || item.label;
              const isSelected = item.isActive ?? (Boolean(item.key) && item.key === activeKey);
              const content = (
                <>
                  <span className="academic-sidebar-icon"><ArrowForwardIosIcon fontSize="small" /></span>
                  <strong title={item.label}>{item.label}</strong>
                  <span className="academic-sidebar-end"><ArrowForwardIosIcon fontSize="small" /></span>
                </>
              );
              if (typeof item.onClick === 'function' && !item.to) {
                return <button key={itemKey} type="button" onClick={item.onClick} className={`academic-sidebar-link${isSelected ? ' is-active' : ''}`}>{content}</button>;
              }
              return (
                <NavLink
                  key={itemKey}
                  to={item.to || '#'}
                  end={item.end ?? true}
                  className={({ isActive }) => `academic-sidebar-link${isActive || isSelected ? ' is-active' : ''}`}
                >
                  {content}
                </NavLink>
              );
            })}
            {!filteredItems.length && <div className="academic-sidebar-empty">{texts.searchEmpty}</div>}
          </nav>
        </section>
      )}

      {showSearch && (
        <div className="academic-search-box">
          <label className="academic-search-field">
            <SearchIcon />
            <input
              type="search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Sahifa nomi bo‘yicha qidirish..."
              aria-label="Sahifa nomi bo‘yicha qidirish"
            />
          </label>
          <button type="button" onClick={() => setSearchValue(value => value.trim())}>Qidirish</button>
        </div>
      )}

      {showAnnouncements && (
        <section className="academic-sidebar-announcements">
          <div className="academic-sidebar-announcements-head">
            <h4>E’lonlar</h4>
            <NavLink to="/announcements" className="academic-sidebar-announcements-all">Barchasi <ArrowForwardIosIcon /></NavLink>
          </div>
          <div className="academic-sidebar-announcements-list">
            {latestAnnouncements.length ? latestAnnouncements.map(item => {
              const name = getTranslatedField(item, 'title', item.title) || 'E’lon';
              const image = item.image || item.cover || item.photo || '';
              return (
                <NavLink key={item.id} to={`/announcements/page/${item.id}`} className="academic-sidebar-announcement-card">
                  <span className="academic-sidebar-announcement-image">
                    {image ? <img src={image} alt="" loading="lazy" /> : <span className="academic-sidebar-announcement-placeholder">E</span>}
                  </span>
                  <strong title={name}>{name}</strong>
                  <ArrowForwardIosIcon className="academic-announcement-arrow" />
                </NavLink>
              );
            }) : <div className="academic-sidebar-announcement-empty">E’lonlar hali joylanmagan</div>}
          </div>
        </section>
      )}
    </aside>
  );
}

export default AcademicSidebar;
