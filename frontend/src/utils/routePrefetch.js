const routeLoaders = [
  [/^\/$/, () => import('../pages/HomePage')],
  [/^\/partners\/?$/, () => import('../pages/PartnersPage')],
  [/^\/news\/?$/, () => import('../pages/NewsPage')],
  [/^\/news\/page\/[^/]+\/?$/, () => import('../pages/NewsDetailPage')],
  [/^\/rektor\/?$/, () => import('../pages/RektorPage')],
  [/^\/faculties\/?$/, () => import('../pages/FacultiesPage')],
  [/^\/faculties\/[^/]+\/?$/, () => import('../pages/AcademicEntityPage')],
  [/^\/departments\/?$/, () => import('../pages/DepartmentsPage')],
  [/^\/departments\/[^/]+\/[^/]+\/?$/, () => import('../pages/AcademicEntityPage')],
  [/^\/sections\/?$/, () => import('../pages/SectionsPage')],
  [/^\/sections\/[^/]+\/?$/, () => import('../pages/AcademicEntityPage')],
  [/^\/announcements\/?$/, () => import('../pages/AnnouncementsPage')],
  [/^\/announcements\/page\/[^/]+\/?$/, () => import('../pages/AnnouncementDetailPage')],
  [/^\/students\/?$/, () => import('../pages/StudentsPage')],
  [/^\/students\/[^/]+\/?$/, () => import('../pages/StudentDetailPage')],
  [/^\/admission\/?$/, () => import('../pages/AdmissionPage')],
  [/^\/pages\/[^/]+\/?$/, () => import('../pages/DynamicPage')],
  [/^\/menu\/[^/]+\/?$/, () => import('../pages/MenuContentPage')],
  [/^\/employees\/[^/]+\/?$/, () => import('../pages/EmployeeProfilePage')],
  [/^\/journals\/?$/, () => import('../pages/JournalIssuesPage')],
  [/^\/leadership\/?$/, () => import('../pages/public/LeadershipPage')],
  [/^\/laboratories\/?$/, () => import('../pages/LaboratoriesPage')],
  [/^\/laboratories\/[^/]+\/?$/, () => import('../pages/LaboratoryDetailPage')]
];

const prefetchedPaths = new Set();

export function prefetchRoute(href) {
  if (!href || href.startsWith('#')) {
    return;
  }

  const path = href.split(/[?#]/, 1)[0] || '/';
  const match = routeLoaders.find(([pattern]) => pattern.test(path));

  if (!match || prefetchedPaths.has(path)) {
    return;
  }

  prefetchedPaths.add(path);
  match[1]().catch(() => {
    prefetchedPaths.delete(path);
  });
}
