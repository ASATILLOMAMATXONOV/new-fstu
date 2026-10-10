function slugifyValue(value = '') {
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

export function createDepartmentId(facultyId, department, index) {
  if (department?.id) {
    return department.id;
  }

  const orderPart = department?.order || index + 1;
  const titlePart =
    slugifyValue(department?.uz?.title || department?.title || department?.en?.title) ||
    `department-${index + 1}`;

  return `${facultyId || 'faculty'}-${titlePart}-${orderPart}`;
}

export function normalizeFacultyItem(faculty = {}) {
  return {
    ...faculty,
    departments: (faculty.departments || []).map((department, index) => ({
      ...department,
      id: createDepartmentId(faculty.id, department, index),
      facultyId: department.facultyId || faculty.id
    }))
  };
}

export function normalizeAcademicEntries(items = []) {
  const activeItems = items.filter((item) => item.active !== false);

  return {
    faculties: activeItems
      .filter((item) => item.entityType !== 'section')
      .map(normalizeFacultyItem),
    sections: activeItems.filter((item) => item.entityType === 'section')
  };
}

export function findFacultyById(faculties = [], facultyId) {
  return faculties.find((faculty) => String(faculty.id) === String(facultyId));
}

export function findSectionById(sections = [], sectionId) {
  return sections.find((section) => String(section.id) === String(sectionId));
}

export function findDepartmentById(faculties = [], facultyId, departmentId) {
  const faculty = findFacultyById(faculties, facultyId);

  return faculty?.departments?.find(
    (department) => String(department.id) === String(departmentId)
  );
}
