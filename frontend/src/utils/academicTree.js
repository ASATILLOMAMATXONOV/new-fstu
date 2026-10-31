import { normalizeAcademicEntries } from './academic';
import { getTranslatedField } from './cms';

const DEFAULT_ROOT = {
  id: 'university',
  name: 'Universitet',
  logo: '',
  backImage: '',
  icon: 'university',
  faculties: []
};

function sortByOrder(items = []) {
  return [...items].sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0));
}

function isActive(item = {}) {
  return item.active !== false;
}

function getItemTitle(item = {}, fallback = '', language) {
  return getTranslatedField(item, 'title', item.title || fallback, language);
}

function getItemIcon(item = {}, fallback = 'book') {
  return item.icon || item.metadata?.icon || fallback;
}

function getImage(item = {}) {
  return item.logo || item.image || item.imageUrl || '';
}

function createDirectionUrl(direction = {}, facultyId, departmentId) {
  return (
    direction.link ||
    direction.url ||
    `/departments/${facultyId}/${departmentId}#attached-directions`
  );
}

export function buildAcademicTree(facultyItems = [], directionItems = [], language) {
  const { faculties } = normalizeAcademicEntries(facultyItems);
  const activeDirections = sortByOrder(directionItems.filter(isActive));
  const directionsByDepartment = new Map();

  activeDirections.forEach((direction) => {
    const key = `${direction.facultyId || ''}::${direction.departmentId || ''}`;
    const currentItems = directionsByDepartment.get(key) || [];
    currentItems.push(direction);
    directionsByDepartment.set(key, currentItems);
  });

  return {
    ...DEFAULT_ROOT,
    faculties: sortByOrder(faculties)
      .filter(isActive)
      .map((faculty) => {
        const facultyId = String(faculty.id || '');

        return {
          id: facultyId,
          kind: 'faculty',
          name: getItemTitle(faculty, 'Fakultet', language),
          logo: getImage(faculty),
          backImage: faculty.bannerImage || getImage(faculty) || DEFAULT_ROOT.backImage,
          icon: getItemIcon(faculty, 'university'),
          url: `/faculties/${facultyId}`,
          departments: sortByOrder(faculty.departments || [])
            .filter(isActive)
            .map((department) => {
              const departmentId = String(department.id || '');
              const directionKey = `${facultyId}::${departmentId}`;
              const programs = (directionsByDepartment.get(directionKey) || []).map((direction) => ({
                id: String(direction.id || `${departmentId}-direction`),
                kind: 'direction',
                name: getItemTitle(direction, "Yo'nalish", language),
                logo: getImage(direction),
                icon: getItemIcon(direction, 'graduation'),
                url: createDirectionUrl(direction, facultyId, departmentId)
              }));

              return {
                id: departmentId,
                kind: 'department',
                facultyId,
                name: getItemTitle(department, 'Kafedra', language),
                logo: getImage(department) || getImage(faculty),
                backImage: department.bannerImage || getImage(department) || faculty.bannerImage || getImage(faculty),
                icon: getItemIcon(department, 'book'),
                url: `/departments/${facultyId}/${departmentId}`,
                programs
              };
            })
        };
      })
  };
}
