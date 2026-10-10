import { HttpError } from '../utils/http-error.js';

const contentResourceAccessMap = {
  menus: 'menu-management',
  'academic-menus': 'academic-menu-management',
  banners: 'banner-management',
  advantages: 'advantages-management',
  news: 'news-management',
  announcements: 'announcements-management',
  students: 'students-management',
  partners: 'partners-management',
  statistics: 'statistics-management',
  pages: 'new-page-management',
  faculties: 'faculties-management',
  directions: 'directions-management',
  'faculty-page-menus': 'faculty-page-menu-management',
  'employees-portfolios': 'employees-portfolio-management'
};

const settingAccessMap = {
  'rector-speech': 'rector-speech-management',
  'admission-cta': 'admission-cta-management',
  'seasonal-effects': 'seasonal-effects-management'
};

function normalizeValue(value = '') {
  return String(value || '').trim();
}

export function hasMenuAccess(user, menuKey) {
  if (!user) {
    return false;
  }

  if (user.role === 'super_admin') {
    return true;
  }

  return Array.isArray(user.menuAccess) && user.menuAccess.includes(menuKey);
}

export function authorizeMenuAccess(menuKey) {
  return (req, _res, next) => {
    if (hasMenuAccess(req.user, menuKey)) {
      next();
      return;
    }

    next(new HttpError(403, 'Sizda ushbu bo‘lim uchun ruxsat yo‘q.'));
  };
}

export function authorizeContentWrite(req, _res, next) {
  const resource = normalizeValue(req.params.resource);
  const requiredMenuKey = contentResourceAccessMap[resource];

  if (!requiredMenuKey) {
    next(new HttpError(404, 'Unsupported content resource.'));
    return;
  }

  authorizeMenuAccess(requiredMenuKey)(req, _res, next);
}

export function authorizeSettingWrite(req, _res, next) {
  const settingKey = normalizeValue(req.params.key);
  const requiredMenuKey = settingAccessMap[settingKey];

  if (!requiredMenuKey) {
    next(new HttpError(403, 'Sizda ushbu sozlamani o‘zgartirish uchun ruxsat yo‘q.'));
    return;
  }

  authorizeMenuAccess(requiredMenuKey)(req, _res, next);
}
