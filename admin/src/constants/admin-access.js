export const menuAccessGroups = [
  {
    id: 'main',
    title: 'Asosiy boshqaruv',
    items: [
      { key: 'menu-management', title: 'Menyular', url: '/menu-management' },
      { key: 'banner-management', title: 'Banner boshqaruvi', url: '/banner-management' },
      { key: 'academic-menu-management', title: 'Akademik menyu', url: '/academic-menu-management' },
      { key: 'advantages-management', title: 'Afzalliklar boshqaruvi', url: '/advantages-management' },
      { key: 'statistics-management', title: 'Statistika boshqaruvi', url: '/statistics-management' }
    ]
  },
  {
    id: 'content',
    title: 'Kontent boshqaruvi',
    items: [
      { key: 'news-management', title: 'Yangiliklar', url: '/news-management' },
      { key: 'announcements-management', title: 'E’lonlar', url: '/announcements-management' },
      { key: 'new-page-management', title: 'Yangi sahifa', url: '/new-page-management' },
      { key: 'partners-management', title: 'Hamkorlar', url: '/partners-management' }
    ]
  },
  {
    id: 'university',
    title: 'Universitet sahifalari',
    items: [
      { key: 'faculties-management', title: 'Fakultet / kafedra / bo‘lim', url: '/faculties-management' },
      { key: 'directions-management', title: "Yo'nalishlar", url: '/directions-management' },
      { key: 'faculty-page-menu-management', title: 'O‘ng menu sozlash', url: '/faculty-page-menu-management' },
      { key: 'employees-portfolio-management', title: 'Hodimlar portfolio', url: '/employees-portfolio-management' },
      { key: 'students-management', title: 'Talabalar', url: '/students-management' }
    ]
  },
  {
    id: 'special',
    title: 'Maxsus sahifalar',
    items: [
      { key: 'admission-cta-management', title: 'Qabul 2024', url: '/admission-cta-management' },
      { key: 'seasonal-effects-management', title: 'Fasl effektlari', url: '/seasonal-effects-management' },
      { key: 'rector-speech-management', title: 'Rektor murojaati', url: '/rector-speech-management' },
      { key: 'admin-users-management', title: 'Adminlar boshqaruvi', url: '/admin-users-management', superAdminOnly: true }
    ]
  }
];

export const allMenuItems = menuAccessGroups.flatMap((group) => group.items);
export const allMenuKeys = allMenuItems.map((item) => item.key);

function normalizePathname(pathname = '/') {
  const source = String(pathname || '').trim();
  if (!source) return '/';
  return source.length > 1 ? source.replace(/\/+$/, '') : source;
}

export function getMenuTitle(key) {
  return allMenuItems.find((item) => item.key === key)?.title || key;
}

export function canAccessMenuItem(user, item) {
  if (!user) {
    return false;
  }

  if (user.role === 'super_admin') {
    return true;
  }

  if (item.superAdminOnly) {
    return false;
  }

  return Array.isArray(user.menuAccess) && user.menuAccess.includes(item.key);
}

export function canAccessAdminPath(user, pathname) {
  if (!user) {
    return false;
  }

  if (user.role === 'super_admin') {
    return true;
  }

  const normalizedPath = normalizePathname(pathname);
  const matchedItem = allMenuItems.find((item) => normalizePathname(item.url) === normalizedPath);

  if (!matchedItem) {
    return false;
  }

  return canAccessMenuItem(user, matchedItem);
}

export function getFirstAccessiblePath(user) {
  const firstItem = allMenuItems.find((item) => canAccessMenuItem(user, item));
  return firstItem?.url || null;
}

function filterChildren(children = [], user) {
  return children
    .map((child) => {
      if (child.type === 'item') {
        const source = allMenuItems.find((item) => item.url === child.url || item.key === child.id);
        return source && canAccessMenuItem(user, source) ? child : null;
      }

      if (child.type === 'collapse') {
        const nextChildren = filterChildren(child.children || [], user);
        return nextChildren.length ? { ...child, children: nextChildren } : null;
      }

      return child;
    })
    .filter(Boolean);
}

export function filterNavigationByAccess(menuConfig, user) {
  if (!menuConfig?.items?.length) {
    return { items: [] };
  }

  if (user?.role === 'super_admin') {
    return menuConfig;
  }

  return {
    ...menuConfig,
    items: menuConfig.items
      .map((group) => {
        if (group.type !== 'group') {
          return group;
        }

        const nextChildren = filterChildren(group.children || [], user);
        return nextChildren.length ? { ...group, children: nextChildren } : null;
      })
      .filter(Boolean)
  };
}
