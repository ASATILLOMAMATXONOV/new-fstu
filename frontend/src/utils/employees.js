import { getCurrentLanguageCode } from './language';
import { getTranslatedField } from './cms';

function slugify(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const assignmentLanguageKeys = ['uz', 'ru', 'en'];

function normalizeEmployeeSource(employee) {
  return employee && typeof employee === 'object' ? employee : {};
}

function createAssignmentLangs(source = {}, fallback = {}) {
  return {
    uz: { position: source?.uz?.position ?? fallback?.uz?.position ?? '' },
    ru: { position: source?.ru?.position ?? fallback?.ru?.position ?? '' },
    en: { position: source?.en?.position ?? fallback?.en?.position ?? '' }
  };
}

function hasLegacyAssignmentData(employee = {}) {
  const source = normalizeEmployeeSource(employee);

  return Boolean(
    source.attachType ||
      source.facultyId ||
      source.departmentId ||
      source.sectionId ||
      source.roleType ||
      assignmentLanguageKeys.some((lang) => String(source?.[lang]?.position || '').trim())
  );
}

export function normalizeEmployeeAssignment(assignment = {}, fallbackEmployee = {}, index = 0) {
  const sourceAssignment = normalizeEmployeeSource(assignment);
  const fallback = normalizeEmployeeSource(fallbackEmployee);

  return {
    id:
      sourceAssignment.id ||
      `${sourceAssignment.attachType || fallback.attachType || 'assignment'}-${index + 1}`,
    attachType: sourceAssignment.attachType || fallback.attachType || 'faculty',
    facultyId: sourceAssignment.facultyId || fallback.facultyId || '',
    departmentId: sourceAssignment.departmentId || fallback.departmentId || '',
    sectionId: sourceAssignment.sectionId || fallback.sectionId || '',
    roleType: sourceAssignment.roleType || fallback.roleType || 'employee',
    ...createAssignmentLangs(sourceAssignment, fallback)
  };
}

export function getEmployeeAssignments(employee = {}) {
  const sourceEmployee = normalizeEmployeeSource(employee);
  const sourceAssignments =
    Array.isArray(sourceEmployee.assignments) && sourceEmployee.assignments.length
      ? sourceEmployee.assignments
      : hasLegacyAssignmentData(sourceEmployee)
        ? [sourceEmployee]
        : [];

  return sourceAssignments.map((assignment, index) =>
    normalizeEmployeeAssignment(assignment, sourceEmployee, index)
  );
}

export function getEmployeePrimaryAssignment(employee = {}) {
  return getEmployeeAssignments(employee)[0] || null;
}

export function matchesEmployeeAssignment(assignment = {}, context = {}) {
  if (context.pageType === 'faculty') {
    return (
      assignment.attachType === 'faculty' &&
      String(assignment.facultyId || '') === String(context.facultyId || '')
    );
  }

  if (context.pageType === 'department') {
    return (
      assignment.attachType === 'department' &&
      String(assignment.facultyId || '') === String(context.facultyId || '') &&
      String(assignment.departmentId || '') === String(context.departmentId || '')
    );
  }

  if (context.pageType === 'section') {
    return (
      assignment.attachType === 'section' &&
      String(assignment.sectionId || '') === String(context.sectionId || '')
    );
  }

  return false;
}

export function findEmployeeAssignmentForContext(employee = {}, context = {}) {
  return getEmployeeAssignments(employee).find((assignment) =>
    matchesEmployeeAssignment(assignment, context)
  ) || null;
}

export function buildEmployeeSlug(fullName = '', id = '') {
  return slugify(fullName) || `employee-${id || 'profile'}`;
}

export function normalizeEmployeeSlug(value = '') {
  const source = String(value || '').trim();

  if (!source) {
    return '';
  }

  if (source.startsWith('/employees/')) {
    return source.replace(/^\/employees\//, '').replace(/\/+$/, '');
  }

  return source.replace(/^employees\//, '').replace(/\/+$/, '');
}

export function buildEmployeeProfilePath(employee = {}) {
  const sourceEmployee = normalizeEmployeeSource(employee);
  const slug =
    normalizeEmployeeSlug(sourceEmployee.slug || sourceEmployee.link) ||
    buildEmployeeSlug(sourceEmployee.fullName, sourceEmployee.id);
  return `/employees/${slug}`;
}

export function sortEmployees(list = []) {
  return [...list].sort((left, right) => {
    const orderDiff = Number(left.order || 0) - Number(right.order || 0);

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return String(left.fullName || '').localeCompare(String(right.fullName || ''), 'uz');
  });
}

export function normalizeEmployeePortfolio(item = {}) {
  const sourceItem = normalizeEmployeeSource(item);
  const panels = Array.isArray(sourceItem.panels)
    ? [...sourceItem.panels].sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
    : [];
  const rawFullName = String(sourceItem.fullName || sourceItem.title || '').trim();
  const fullName = String(getTranslatedField(sourceItem, 'title', rawFullName) || rawFullName).trim();
  const slug =
    normalizeEmployeeSlug(sourceItem.slug || sourceItem.link) ||
    buildEmployeeSlug(rawFullName, sourceItem.id);
  const assignments = getEmployeeAssignments(sourceItem);
  const currentAssignment = sourceItem.currentAssignment
    ? normalizeEmployeeAssignment(sourceItem.currentAssignment, sourceItem)
    : null;
  const activeAssignment = currentAssignment || assignments[0] || null;

  return {
    ...sourceItem,
    fullName,
    slug,
    link: buildEmployeeProfilePath({ ...sourceItem, slug }),
    assignments,
    currentAssignment,
    attachType: activeAssignment?.attachType || sourceItem.attachType || 'faculty',
    facultyId: activeAssignment?.facultyId || sourceItem.facultyId || '',
    departmentId: activeAssignment?.departmentId || sourceItem.departmentId || '',
    sectionId: activeAssignment?.sectionId || sourceItem.sectionId || '',
    roleType: activeAssignment?.roleType || sourceItem.roleType || 'employee',
    telegram: sourceItem.telegram || '',
    instagram: sourceItem.instagram || '',
    phone: sourceItem.phone || '',
    panels
  };
}

export function buildEmployeeContentQuery(context = {}) {
  if (context.pageType === 'faculty') {
    return {
      attachType: 'faculty',
      facultyId: context.facultyId || ''
    };
  }

  if (context.pageType === 'department') {
    return {
      attachType: 'department',
      facultyId: context.facultyId || '',
      departmentId: context.departmentId || ''
    };
  }

  if (context.pageType === 'section') {
    return {
      attachType: 'section',
      sectionId: context.sectionId || ''
    };
  }

  return {};
}

function getLocalizedValue(source = {}, field) {
  const languageCode = getCurrentLanguageCode();

  return (
    source?.[languageCode]?.[field] ||
    source?.uz?.[field] ||
    source?.ru?.[field] ||
    source?.en?.[field] ||
    ''
  );
}

export function getEmployeePosition(employee = {}, context = null) {
  const sourceEmployee = normalizeEmployeeSource(employee);
  const assignment =
    sourceEmployee.currentAssignment ||
    (context ? findEmployeeAssignmentForContext(sourceEmployee, context) : null) ||
    getEmployeePrimaryAssignment(sourceEmployee);

  return (
    getLocalizedValue(assignment, 'position') ||
    getLocalizedValue(sourceEmployee, 'position')
  );
}

export function getEmployeeProfilePanel(employee = {}) {
  const sourceEmployee = normalizeEmployeeSource(employee);
  return Array.isArray(sourceEmployee.panels) && sourceEmployee.panels.length
    ? sourceEmployee.panels[0]
    : null;
}

export function getEmployeeProfilePanelTitle(employee = {}) {
  return getLocalizedValue(getEmployeeProfilePanel(employee), 'title');
}

export function getEmployeeProfilePanelContent(employee = {}) {
  return getLocalizedValue(getEmployeeProfilePanel(employee), 'content');
}

export function isEmployeeAttachedToContext(employee = {}, context = {}) {
  const sourceEmployee = normalizeEmployeeSource(employee);

  if (sourceEmployee.active === false) {
    return false;
  }

  return Boolean(findEmployeeAssignmentForContext(sourceEmployee, context));
}

export function findEmployeeBySlug(list = [], slug) {
  const normalizedSlug = normalizeEmployeeSlug(slug);

  return list
    .map(normalizeEmployeePortfolio)
    .find((employee) => employee.slug === normalizedSlug || String(employee.id) === String(slug));
}
