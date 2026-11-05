import { buildAcademicTree } from './academicTree';
import { normalizeAcademicEntries } from './academic';
import { getHtmlExcerpt, getTranslatedField } from './cms';
import { buildEmployeeProfilePath } from './employees';
import { getMenuNodeHref, getMenuNodeTitle } from './menu';

export const ACADEMIC_SOURCE_LABELS = {
  faculty: { title: 'Fakultetlar', singular: 'Fakultet' },
  department: { title: 'Kafedralar', singular: 'Kafedra' },
  section: { title: 'Bo‘limlar', singular: 'Bo‘lim' },
  direction: { title: 'Ta’lim yo‘nalishlari', singular: 'Yo‘nalish' },
  news: { title: 'Yangiliklar', singular: 'Yangilik' },
  announcements: { title: 'E’lonlar', singular: 'E’lon' },
  students: { title: 'Talabalar', singular: 'Talaba' },
  partners: { title: 'Hamkorlar', singular: 'Hamkor' },
  pages: { title: 'Sahifalar', singular: 'Sahifa' },
  employees: { title: 'Xodimlar', singular: 'Xodim' },
  statistics: { title: 'Statistika', singular: 'Statistika' },
  banners: { title: 'Bannerlar', singular: 'Banner' },
  advantages: { title: 'Afzalliklar', singular: 'Afzallik' },
  menu: { title: 'Sayt menyulari', singular: 'Menyu' },
  custom: { title: 'Boxlar', singular: 'Box' }
};

export const STRUCTURE_RESOURCE_MAP = {
  news: 'news',
  announcements: 'announcements',
  students: 'students',
  partners: 'partners',
  pages: 'pages',
  employees: 'employees-portfolios',
  statistics: 'statistics',
  banners: 'banners',
  advantages: 'advantages'
};

const menuSourcesByPath = {
  '/faculties': 'faculty',
  '/departments': 'department',
  '/sections': 'section',
  '/news': 'news',
  '/announcements': 'announcements',
  '/students': 'students',
  '/partners': 'partners'
};

export function structureSource(menu) {
  if (menu?.sourceType !== 'menu') return menu?.sourceType || '';
  const path = String(menu.node?.url || '')
    .split(/[?#]/)[0]
    .replace(/\/+$/, '');
  return menuSourcesByPath[path] || 'menu';
}

function safeHref(value) {
  const href = String(value || '').trim();
  if (/^\/(?!\/)/.test(href) && !/[\\\s]/.test(href)) return href;
  try {
    return /^https?:$/.test(new URL(href).protocol) ? href : '';
  } catch {
    return '';
  }
}

export function buildResourceCollection(sourceType, items = [], language = 'uz') {
  const hrefOf = (item) => {
    switch (sourceType) {
      case 'news':
        return `/news/page/${item.id}`;
      case 'announcements':
        return `/announcements/page/${item.id}`;
      case 'students':
        return `/students/${item.id}`;
      case 'pages':
        return `/pages/${item.id}`;
      case 'employees':
        return buildEmployeeProfilePath(item);
      default:
        return item.link || item.url || item.buttonUrl || '';
    }
  };
  return items
    .filter((item) => item && item.active !== false)
    .map((item) => ({
      id: String(item.id),
      kind: sourceType,
      order: Number(item.order || 0),
      name:
        getTranslatedField(item, 'title', item.title || '', language) ||
        getTranslatedField(item, 'fullName', item.fullName || item.name || '', language),
      logo: item.image || item.logo || item.imageUrl || '',
      icon: 'book',
      subtitle:
        sourceType === 'statistics'
          ? String(item.value ?? item.count ?? '')
          : getHtmlExcerpt(getTranslatedField(item, 'description', '', language), 100),
      url: safeHref(hrefOf(item))
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.order - b.order);
}

export function buildLinkedMenuCollection(menu, siteMenus = [], language = 'uz') {
  const node = menu?.node;
  if (!node) return [];
  const children = siteMenus.filter(
    (item) => item && item.active !== false && String(item.parentId || '') === String(node.id)
  );
  return (children.length ? children : [node])
    .map((item) => ({
      id: String(item.id),
      kind: 'menu',
      name: getMenuNodeTitle(item, language) || item.title || '',
      logo: item.image || '',
      icon: 'book',
      order: Number(item.order || 0),
      url: safeHref(getMenuNodeHref(item))
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.order - b.order);
}

export function academicText(value, language = 'uz') {
  return typeof value === 'string' ? value.trim() : String(value?.[language] || value?.uz || '').trim();
}

export function buildCustomMenuCollection(menu, language = 'uz') {
  return (Array.isArray(menu?.cards) ? menu.cards : [])
    .filter((card) => card && card.active !== false)
    .map((card, index) => ({
      id: String(card.id || index),
      kind: 'custom',
      name: academicText(card.title, language) || `Box ${index + 1}`,
      logo: card.image || '',
      icon: 'book',
      url: safeHref(card.url)
    }))
    .filter((card) => card.name || card.logo || card.url);
}

export function getStructureMenus(setting, language, siteMenus = []) {
  if (setting?.active === false) return [];
  const normalizedMenus = (Array.isArray(setting?.menus) ? setting.menus : [])
    .filter((menu) => menu && menu.active !== false && ACADEMIC_SOURCE_LABELS[menu.sourceType])
    .map((menu) => {
      const menuWithoutSubtitle = Object.fromEntries(Object.entries(menu).filter(([key]) => key !== 'subtitle'));
      const node =
        menu.sourceType === 'menu'
          ? siteMenus.find((item) => String(item.id) === String(menu.menuId) && item.active !== false)
          : null;
      return {
        ...menuWithoutSubtitle,
        node,
        id: String(menu.id),
        name:
          menu.sourceType === 'menu'
            ? node && (getMenuNodeTitle(node, language) || node.title || '')
            : academicText(menu.title, language) || ACADEMIC_SOURCE_LABELS[menu.sourceType].title
      };
    })
    .filter((menu) => menu.name);

  return normalizedMenus.reduce((result, menu) => {
    const key = menu.sourceType === 'custom' ? `custom:${menu.id}` : `${menu.sourceType}:${menu.menuId || menu.id}`;
    const existingIndex = result.findIndex((entry) => entry._mergeKey === key);
    if (existingIndex === -1) return [...result, { ...menu, _mergeKey: key }];
    const existing = result[existingIndex];
    const cardIds = new Set((existing.cards || []).map((card) => String(card.id)));
    result[existingIndex] = {
      ...existing,
      cards: [...(existing.cards || []), ...(menu.cards || []).filter((card) => !cardIds.has(String(card.id)))],
      order: Math.min(Number(existing.order || 0), Number(menu.order || 0))
    };
    return result;
  }, [])
    .map(({ _mergeKey, ...menu }) => menu)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

export function buildAcademicCollections(facultyItems = [], directionItems = [], language = 'uz') {
  const tree = buildAcademicTree(facultyItems, directionItems, language);
  const { sections } = normalizeAcademicEntries(facultyItems);
  const departments = tree.faculties.flatMap((faculty) => faculty.departments);
  const programsById = new Map(
    departments.flatMap((department) => department.programs).map((program) => [program.id, program])
  );
  const titleOf = (item) => getTranslatedField(item, 'title', item.title || '', language);
  const imageOf = (item) => item.logo || item.image || item.imageUrl || '';
  const directions = directionItems
    .filter((item) => item && item.active !== false)
    .map((item) => {
      const existing = programsById.get(String(item.id));
      return existing
        ? { ...existing, order: item.order }
        : {
            id: String(item.id),
            kind: 'direction',
            name: titleOf(item),
            logo: imageOf(item),
            icon: 'graduation',
            order: item.order,
            url:
              item.link ||
              item.url ||
              (item.facultyId && item.departmentId
                ? `/departments/${item.facultyId}/${item.departmentId}#attached-directions`
                : '')
          };
    });
  return {
    faculty: tree.faculties,
    department: departments,
    section: sections
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item) => ({
        id: String(item.id),
        kind: 'section',
        name: titleOf(item),
        logo: imageOf(item),
        backImage: item.bannerImage || imageOf(item),
        icon: item.icon || 'university',
        url: `/sections/${item.id}`
      })),
    direction: directions.sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
  };
}
