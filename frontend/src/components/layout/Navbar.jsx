import React, { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import '../../assets/styles/Navbar.css';
import logo from '../../assets/optimized/logo.png';
import { useLanguage } from '../../context/LanguageContext';
import { getSiteMessages } from '../../locales/site';
import AppLink from '../common/AppLink';
import { useMenuTree } from '../../hooks/useMenuTree';
import { getMenuNodeHref, getMenuNodeTitle, sortMenuNodes } from '../../utils/menu';

const topbarSocials = [
  {
    label: 'Telegram',
    href: 'https://t.me/fstu_uz',
    icon: TelegramIcon
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/fstu_rasmiy/',
    icon: InstagramIcon
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/koreainternationaluniversityinferghana',
    icon: FacebookIcon
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@fstuuz',
    icon: YoutubeIcon
  }
];

function normalizeMenuLabel(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/o‘|o'|o`|oʻ/g, 'o')
    .replace(/g‘|g'|g`|gʻ/g, 'g')
    .replace(/’|ʻ|`/g, '')
    .trim();
}

function includesAny(value, patterns = []) {
  return patterns.some((pattern) => value.includes(pattern));
}

function getDropdownIcon(label, variant = 'link') {
  const normalized = normalizeMenuLabel(label);

  if (variant === 'link') {
    if (
      includesAny(normalized, [
        'hujjat',
        'document',
        'doc',
        'fayl',
        'документ',
        'file'
      ])
    ) {
      return ArrowDocumentIcon;
    }

    if (
      includesAny(normalized, [
        'boglan',
        'aloqa',
        'contact',
        'connect',
        'mail',
        'telefon',
        'связ',
        'контакт'
      ])
    ) {
      return ArrowMailIcon;
    }

    return ArrowMenuIcon;
  }

  if (
    includesAny(normalized, [
      'talaba',
      'student',
      'студент',
      'yoshlar'
    ])
  ) {
    return StudentsMenuIcon;
  }

  if (
    includesAny(normalized, [
      'abitur',
      'admission',
      'applicant',
      'qabul',
      'прием'
    ])
  ) {
    return AdmissionMenuIcon;
  }

  if (
    includesAny(normalized, [
      'hujjat',
      'document',
      'doc',
      'fayl',
      'документ',
      'file'
    ])
  ) {
    return DocumentMenuIcon;
  }

  if (
    includesAny(normalized, [
      'boglan',
      'aloqa',
      'contact',
      'connect',
      'mail',
      'telefon',
      'связ',
      'контакт'
    ])
  ) {
    return ContactMenuIcon;
  }

  if (
    includesAny(normalized, [
      'tuzilma',
      'structure',
      'otm',
      'fakultet',
      'kafedra',
      'bolim',
      'section',
      'department',
      'faculty',
      'структур',
      'кафед'
    ])
  ) {
    return StructureMenuIcon;
  }

  if (
    includesAny(normalized, [
      'faoliyat',
      'activity',
      'service',
      'xizmat',
      'марказ',
      'центр'
    ])
  ) {
    return ActivityMenuIcon;
  }

  if (
    includesAny(normalized, [
      'axborot',
      'news',
      'yangilik',
      'media',
      'press',
      'journal',
      'jurnal',
      'новост',
      'инфо'
    ])
  ) {
    return NewsMenuIcon;
  }

  if (
    includesAny(normalized, [
      'xalqaro',
      'international',
      'partner',
      'hamkor',
      'global',
      'междун'
    ])
  ) {
    return GlobalMenuIcon;
  }

  if (
    includesAny(normalized, [
      'xodim',
      'employee',
      'staff',
      'teacher',
      'hodim',
      'personnel',
      'сотруд',
      'препод'
    ])
  ) {
    return StaffMenuIcon;
  }

  if (
    includesAny(normalized, [
      'kelajak',
      'career',
      'road',
      'future',
      'qadam',
      'path',
      'perspective',
      'будущ'
    ])
  ) {
    return DirectionMenuIcon;
  }

  if (
    includesAny(normalized, [
      'gallery',
      'galereya',
      'foto',
      'photo',
      'video'
    ])
  ) {
    return GalleryMenuIcon;
  }

  return variant === 'title' ? FolderIcon : MenuItemIcon;
}

function getDropdownNodeIcon(hasChildren, variant = 'link') {
  if (variant === 'title' || hasChildren) {
    return getDropdownIcon('', 'title');
  }

  return getDropdownIcon('', 'link');
}

function shouldDisplayAsMegaHeader(item) {
  return Boolean(
    item?.children?.length ||
      item?.displayAsHeader ||
      item?.isHeader ||
      item?.showAsHeader ||
      item?.metadata?.displayAsHeader
  );
}

function Navbar() {
  const location = useLocation();
  const { menus: navItems, loading } = useMenuTree();
  const { currentLanguage, currentLanguageCode, languageOptions, setLanguage } = useLanguage();
  const dropdownContentRef = React.useRef(null);
  const closeDropdownTimerRef = React.useRef(null);
  const contentSwitchTimerRef = React.useRef(null);

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).navbar,
    [currentLanguageCode]
  );

  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [visibleDropdownItem, setVisibleDropdownItem] = useState(null);
  const [leavingDropdownItem, setLeavingDropdownItem] = useState(null);
  const [contentSwitching, setContentSwitching] = useState(false);
  const [contentDirection, setContentDirection] = useState('forward');
  const isAcademicDetailPage = Boolean(
    matchPath('/faculties/:id', location.pathname) ||
      matchPath('/departments/:facultyId/:departmentId', location.pathname) ||
      matchPath('/sections/:id', location.pathname)
  );

  const topbarInfo = React.useMemo(
    () => [
      {
        label: texts.topbarInfo.location,
        href: '#aloqa',
        icon: MapPinIcon
      },
      {
        label: texts.topbarInfo.phone,
        href: `tel:${String(texts.topbarInfo.phone || '')
          .split(',')[0]
          .replace(/\s+/g, '')}`,
        icon: PhoneIcon
      },
      {
        label: texts.topbarInfo.email,
        href: `mailto:${texts.topbarInfo.email}`,
        icon: MailIcon
      }
    ],
    [texts]
  );

  const topbarLinks = React.useMemo(
    () => [
      {
        label: texts.topbarLinks.lms,
        href: '#talabalar',
        icon: StudentIcon
      },
      {
        label: texts.topbarLinks.hemis,
        href: '#xodimlar',
        icon: TeamIcon
      }
    ],
    [texts]
  );

  const closeFloatingDropdown = React.useCallback((immediate = false) => {
    window.clearTimeout(closeDropdownTimerRef.current);

    if (immediate) {
      setDropdownOpen(false);
      setActiveDropdownId(null);
      setDropdownHeight(0);
      setVisibleDropdownItem(null);
      setLeavingDropdownItem(null);
      setContentSwitching(false);
      return;
    }

    closeDropdownTimerRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
      setActiveDropdownId(null);
      setDropdownHeight(0);
      setVisibleDropdownItem(null);
      setLeavingDropdownItem(null);
      setContentSwitching(false);
    }, 680);
  }, []);

  const measureDropdownHeight = React.useCallback(() => {
    window.requestAnimationFrame(() => {
      const activeContent = dropdownContentRef.current?.querySelector(
        '.stripe-dropdown-content-enter'
      );

      setDropdownHeight(Math.ceil(activeContent?.scrollHeight || 0));
    });
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenSubmenu(null);
    setLanguageOpen(false);
    closeFloatingDropdown(true);
  }, [location.pathname, location.hash, closeFloatingDropdown]);

  useEffect(() => {
    if (!visibleDropdownItem || !dropdownContentRef.current) {
      setDropdownHeight(0);
      return undefined;
    }

    const frame = window.requestAnimationFrame(measureDropdownHeight);

    return () => window.cancelAnimationFrame(frame);
  }, [visibleDropdownItem, currentLanguageCode, measureDropdownHeight]);

  useEffect(
    () => () => {
      window.clearTimeout(closeDropdownTimerRef.current);
      window.clearTimeout(contentSwitchTimerRef.current);
    },
    []
  );

  const toggleMenu = () => {
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;

      if (!nextOpen) {
        setOpenSubmenu(null);
      }

      return nextOpen;
    });
  };

  const toggleSubmenu = (id) => {
    setOpenSubmenu((currentId) => (currentId === id ? null : id));
  };

  const handleNavClick = () => {
    setOpen(false);
    setOpenSubmenu(null);
    setLanguageOpen(false);
    closeFloatingDropdown(true);
  };

  const isDesktopNavigation = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1081px)').matches;

  const showFloatingDropdown = (itemOrId) => {
    if (!isDesktopNavigation()) {
      return;
    }

    const nextItem =
      typeof itemOrId === 'object'
        ? itemOrId
        : navItems.find((item) => String(item.id) === String(itemOrId));

    if (!nextItem?.children?.length) {
      return;
    }

    window.clearTimeout(closeDropdownTimerRef.current);

    if (dropdownOpen && String(activeDropdownId) === String(nextItem.id)) {
      return;
    }

    const nextIndex = navItems.findIndex((item) => String(item.id) === String(nextItem.id));
    const currentId = visibleDropdownItem?.id ?? activeDropdownId;
    const currentIndex = navItems.findIndex((item) => String(item.id) === String(currentId));

    if (currentIndex >= 0 && nextIndex >= 0 && nextIndex !== currentIndex) {
      setContentDirection(nextIndex > currentIndex ? 'forward' : 'backward');
    }

    window.clearTimeout(contentSwitchTimerRef.current);
    setActiveDropdownId(nextItem.id);
    setDropdownOpen(true);

    setVisibleDropdownItem((currentItem) => {
      if (!currentItem || String(currentItem.id) === String(nextItem.id)) {
        setLeavingDropdownItem(null);
        setContentSwitching(false);
        return nextItem;
      }

      setLeavingDropdownItem(currentItem);
      setContentSwitching(true);

      contentSwitchTimerRef.current = window.setTimeout(() => {
        setLeavingDropdownItem(null);
        setContentSwitching(false);
      }, 220);

      return nextItem;
    });
  };

  const toggleFloatingDropdown = (id) => {
    if (!isDesktopNavigation()) {
      return false;
    }

    showFloatingDropdown(id);
    return true;
  };

  const handleNavKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeFloatingDropdown(true);
      event.currentTarget.querySelector('.nav-link:focus, .nav-caret-btn:focus')?.blur();
    }
  };

  const hideFloatingDropdown = () => {
    closeFloatingDropdown();
  };

  const handleNavItemHover = (item, hasChildren) => {
    if (hasChildren) {
      showFloatingDropdown(item);
      return;
    }

    hideFloatingDropdown();
  };

  const handleDesktopDropdownClick = (event, item, hasChildren) => {
    if (!hasChildren || !isDesktopNavigation()) {
      handleNavClick();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggleFloatingDropdown(item.id);
  };

  const handleLanguageSelect = (language) => {
    setLanguage(language);
    setLanguageOpen(false);
  };

  return (
    <>
    <header className={`fstu-header${isAcademicDetailPage ? ' fstu-header--overlay' : ''}`}>
      <div className="fstu-topbar">
        <div className="nav-shell fstu-inner topbar-row">
          <div className="topbar-left">
            {topbarInfo.map(({ label, href, icon: Icon }, index) => (
              <React.Fragment key={label}>
                <AppLink href={href} className="topbar-entry">
                  <Icon className="topbar-icon" />
                  <span>{label}</span>
                </AppLink>

                {index < topbarInfo.length - 1 && (
                  <span className="topbar-pipe" aria-hidden="true">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="topbar-right">
            {topbarLinks.map(({ label, href, icon: Icon }, index) => (
              <React.Fragment key={label}>
                <AppLink href={href} className="topbar-entry topbar-link">
                  <Icon className="topbar-icon" />
                  <span>{label}</span>
                </AppLink>

                {index < topbarLinks.length - 1 && (
                  <span className="topbar-pipe" aria-hidden="true">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}

            <span className="topbar-pipe" aria-hidden="true">
              |
            </span>

            <div className="topbar-socials">
              {topbarSocials.map(({ label, href, icon: Icon }) => (
                <AppLink key={label} href={href} className="topbar-social" aria-label={label}>
                  <Icon className="topbar-social-icon" />
                </AppLink>
              ))}
            </div>

            <span className="topbar-pipe" aria-hidden="true">
              |
            </span>

            <div className={`language-dropdown ${languageOpen ? 'active' : ''}`}>
              <button
                className="lang-btn"
                type="button"
                onClick={() => setLanguageOpen((prev) => !prev)}
                aria-expanded={languageOpen}
              >
                <GlobeIcon className="topbar-icon" />
                <span>{currentLanguage.label}</span>
                <ChevronDownIcon className="topbar-caret" />
              </button>

              {languageOpen && (
                <div className="language-menu">
                  {languageOptions.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      className={`language-item ${
                        currentLanguage.code === language.code ? 'active' : ''
                      }`}
                      onClick={() => handleLanguageSelect(language)}
                    >
                      <span className="language-code">{language.label}</span>
                      <span className="language-name">{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fstu-navbar">
        <div className="nav-shell fstu-inner navbar-row">

<AppLink
  href="/"
  className="brand"
  aria-label="FSTU bosh sahifa"
>
  <div className="brand-logo-wrap">
    <span
      className="brand-logo-glow"
      aria-hidden="true"
    />

    <img
      src={logo}
      alt="FSTU"
      className="brand-logo"
      width="120"
      height="120"
      fetchPriority="high"
      decoding="async"
    />
  </div>
</AppLink>

          <nav
            className={`nav-menu ${open ? 'active' : ''}`}
            onMouseEnter={() => window.clearTimeout(closeDropdownTimerRef.current)}
            onMouseLeave={hideFloatingDropdown}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                hideFloatingDropdown();
              }
            }}
            onKeyDown={handleNavKeyDown}
          >
            {!navItems.length && loading ? (
              <div className="nav-loading" aria-hidden="true">
                <span className="nav-loading-pill" />
                <span className="nav-loading-pill" />
                <span className="nav-loading-pill" />
              </div>
            ) : (
              navItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isSubmenuOpen = openSubmenu === item.id;
                const title = getMenuNodeTitle(item, currentLanguageCode);

                return (
                  <div
                    key={item.id}
                    className={`nav-item ${hasChildren ? 'has-dropdown' : ''} ${
                      isSubmenuOpen ? 'submenu-open' : ''
                    } ${
                      hasChildren && String(activeDropdownId) === String(item.id)
                        ? 'dropdown-active'
                        : ''
                    }`}
                    onFocus={() => {
                      if (hasChildren) {
                        showFloatingDropdown(item);
                      }
                    }}
                  >
                    <div className="nav-link-group">
                      <AppLink
                        href={getMenuNodeHref(item)}
                        className="nav-link"
                        onMouseEnter={() => handleNavItemHover(item, hasChildren)}
                        onMouseMove={() => handleNavItemHover(item, hasChildren)}
                        onClick={(event) => handleDesktopDropdownClick(event, item, hasChildren)}
                      >
                        <span>{title}</span>
                      </AppLink>

                      {hasChildren && (
                        <button
                          type="button"
                          className="nav-caret-btn"
                          aria-label={`${title} ${texts.openSectionSuffix}`}
                          aria-haspopup="true"
                          aria-controls="navbar-mega-menu"
                          aria-expanded={isSubmenuOpen || (dropdownOpen && String(activeDropdownId) === String(item.id))}
                          onMouseEnter={() => handleNavItemHover(item, hasChildren)}
                          onMouseMove={() => handleNavItemHover(item, hasChildren)}
                          onClick={(event) => {
                            if (toggleFloatingDropdown(item.id)) {
                              event.preventDefault();
                              event.stopPropagation();
                              return;
                            }

                            toggleSubmenu(item.id);
                          }}
                        >
                          <ChevronDownIcon className="nav-caret-icon" />
                        </button>
                      )}
                    </div>

                    {hasChildren && (
                      <div className="dropdown-menu mega-menu mobile-dropdown-menu">
                        <MegaDropdown
                          items={item.children}
                          languageCode={currentLanguageCode}
                          onNavigate={handleNavClick}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}

          </nav>

          <div className="navbar-actions">
            <button
              type="button"
              className="mobile-btn"
              onClick={toggleMenu}
              aria-label={texts.mobileMenu}
              aria-expanded={open}
            >
              {open ? '✕' : '☰'}
            </button>
          </div>

          {visibleDropdownItem && (
            <div
              id="navbar-mega-menu"
              className={`stripe-dropdown-shell ${dropdownOpen ? 'is-open' : 'is-closing'} ${
                contentSwitching ? 'is-switching' : ''
              } direction-${contentDirection}`}
              style={{
                '--stripe-dropdown-height': `${dropdownHeight}px`
              }}
              onMouseEnter={() => window.clearTimeout(closeDropdownTimerRef.current)}
              onMouseLeave={hideFloatingDropdown}
            >
              <div ref={dropdownContentRef} className="stripe-dropdown-content-wrap">
                {leavingDropdownItem && (
                  <div
                    key={`leaving-${leavingDropdownItem.id}`}
                    className="stripe-dropdown-content stripe-dropdown-content-exit"
                  >
                    <MegaDropdown
                      items={leavingDropdownItem.children}
                      languageCode={currentLanguageCode}
                      onNavigate={handleNavClick}
                      onContentChange={measureDropdownHeight}
                    />
                  </div>
                )}

                <div
                  key={`active-${visibleDropdownItem.id}`}
                  className="stripe-dropdown-content stripe-dropdown-content-enter"
                >
                  <MegaDropdown
                    items={visibleDropdownItem.children}
                    languageCode={currentLanguageCode}
                    onNavigate={handleNavClick}
                    onContentChange={measureDropdownHeight}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>

    <div
      className={`navbar-backdrop ${dropdownOpen ? 'is-visible' : ''}`}
      aria-hidden="true"
    />
    </>
  );
}

function MegaDropdown({ items, languageCode, onNavigate, onContentChange }) {
  const columns = sortMenuNodes(items);
  const headerColumns = columns.filter(shouldDisplayAsMegaHeader);
  const plainItems = columns.filter((column) => !shouldDisplayAsMegaHeader(column));
  const displayColumns = [...headerColumns, ...plainItems];
  const columnCount = Math.max(displayColumns.length, 1);

  return (
    <div className="mega-menu-inner" style={{ '--mega-column-count': columnCount }}>
      {displayColumns.map((column) => {
        const title = getMenuNodeTitle(column, languageCode);
        const children = sortMenuNodes(column.children || []);
        const hasChildren = children.length > 0;
        const TitleIcon = getDropdownNodeIcon(hasChildren, 'title');

        return (
          <div key={column.id} className={`mega-column${hasChildren ? '' : ' mega-column-single'}`}>
            {hasChildren ? (
              <>
                <AppLink href={getMenuNodeHref(column)} className="mega-title" onClick={onNavigate}>
                  <span className="mega-title-icon-wrap">
                    <TitleIcon className="mega-title-icon" />
                  </span>
                  <span className="mega-title-text">{title}</span>
                  <span className="mega-title-count">{children.length}</span>
                </AppLink>

                <div className="mega-links">
                  {children.map((child) => (
                    <MegaDropdownLink
                      key={child.id}
                      item={child}
                      languageCode={languageCode}
                      onNavigate={onNavigate}
                      onContentChange={onContentChange}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mega-links">
                <AppLink href={getMenuNodeHref(column)} className="mega-link mega-link-single" onClick={onNavigate}>
                  <span className="mega-link-icon-wrap">
                    <ArrowMenuIcon className="mega-link-icon" />
                  </span>
                  <span className="mega-link-text">{title}</span>
                </AppLink>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MegaDropdownLink({ item, languageCode, onNavigate, onContentChange, depth = 0 }) {
  const [expanded, setExpanded] = React.useState(false);
  const title = getMenuNodeTitle(item, languageCode);
  const children = sortMenuNodes(item.children || []);
  const hasChildren = children.length > 0;
  const LinkIcon = getDropdownNodeIcon(hasChildren);
  const linkContent = (
    <>
      <span className="mega-link-icon-wrap">
        <LinkIcon className="mega-link-icon" />
      </span>
      <span className="mega-link-copy">
        <span className="mega-link-text">{title}</span>
        <span className="mega-link-meta">
          {hasChildren ? `${children.length} menu` : 'Menu'}
        </span>
      </span>
    </>
  );

  return (
    <div
      className={`mega-link-group${hasChildren ? ' has-nested' : ''}${expanded ? ' is-open' : ''}`}
      style={{ '--mega-depth': depth }}
    >
      {hasChildren ? (
        <button
          type="button"
          className="mega-link mega-link-parent"
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((current) => !current);
            onContentChange?.();
          }}
        >
          {linkContent}
        </button>
      ) : (
        <AppLink href={getMenuNodeHref(item)} className="mega-link" onClick={onNavigate}>
          {linkContent}
        </AppLink>
      )}

      {hasChildren && expanded && (
        <div className="mega-sub-links">
          {children.map((child) => (
            <MegaDropdownLink
              key={child.id}
              item={child}
              languageCode={languageCode}
              onNavigate={onNavigate}
              onContentChange={onContentChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FolderIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7.5h16v11H4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 10.5h16M9 7.5V5h6v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MenuItemIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 6.5h10v11H7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 10h4m-4 3.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 12h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="m12 7 5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDocumentIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 7h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 8.5h5M15 6.5l3 2-3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowMailIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4.5 7.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 12h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m16 9 3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StudentsMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m3 9 9-4.5L21 9l-9 4.5L3 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 11.5v3.2c0 1.4 2.2 2.8 5 2.8s5-1.4 5-2.8v-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 10.8v4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AdmissionMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 4.5v3M7.5 4.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DocumentMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 3.5h7l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3.5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11h6M9 14.5h6M9 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ContactMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 6.5h14v9H8l-3 3v-12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 10h6M9 13.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StructureMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="15" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="9.5" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7.5h6M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ActivityMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m6.5 14.5 3-3 3 2 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 8.5H14v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NewsMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 6h14v12H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 9h4M8 12.5h8M8 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="13.5" y="8.5" width="3.5" height="2.5" fill="currentColor" />
    </svg>
  );
}

function DirectionMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m10 10 5-2-2 5-4 2 1-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function GlobalMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function StaffMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19c.7-2.3 2.7-3.8 5.1-3.8h1c2.4 0 4.4 1.5 5.1 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 19c.5-1.5 1.8-2.5 3.4-2.5h.5c1.1 0 2.2.5 2.9 1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GalleryMenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m7 15 3-3 2.5 2.2 2-1.7L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
    </svg>
  );
}

function MapPinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s6-5.13 6-11a6 6 0 1 0-12 0c0 5.87 6 11 6 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 16.42v2.75a1.83 1.83 0 0 1-2 1.83A18.2 18.2 0 0 1 3 5a1.83 1.83 0 0 1 1.82-2H7.6a1.83 1.83 0 0 1 1.78 1.45l.58 2.62a1.83 1.83 0 0 1-.52 1.72l-1.2 1.2a14.65 14.65 0 0 0 5.77 5.77l1.2-1.2a1.83 1.83 0 0 1 1.72-.52l2.62.58A1.83 1.83 0 0 1 21 16.42Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m22 8-8.97 5.7a2 2 0 0 1-2.06 0L2 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StudentIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m2 9 10-5 10 5-10 5L2 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path
        d="M6 11.5V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TeamIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TelegramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21.5 4.5 3.3 11.5c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.5c.2.7.4 1 1 1 .5 0 .8-.2 1.2-.6l2.6-2.5 5.3 3.9c1 .5 1.7.3 2-1l3.2-15.1c.3-1.2-.5-1.7-1.4-1.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m8 14.5 10.7-6.8-8.3 8.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 8h2V4h-2.8C10.4 4 9 5.7 9 8.3V11H6v4h3v6h4v-6h3l.6-4H13V8.8c0-.6.3-.8 1-.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M22 12s0-3.4-.4-5a2.8 2.8 0 0 0-2-2C17.8 4.5 12 4.5 12 4.5s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8.6 2 12 2 12s0 3.4.4 5a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.6.4-5 .4-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" />
    </svg>
  );
}

export default Navbar;
