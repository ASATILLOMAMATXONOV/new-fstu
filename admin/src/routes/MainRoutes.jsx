import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import { getFirstAccessiblePath } from 'constants/admin-access';
import Loadable from 'components/Loadable';
import useAuth from 'hooks/useAuth';
import DashboardLayout from 'layout/Dashboard';

// pages
const MenuManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/menu-management'))
);

const AcademicMenuManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/academic-menu-management'))
);

const BannerManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/banner-management'))
);

const AdvantagesManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/advantages-management'))
);

const RankingsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/rankings-management'))
);

const AcademicStructureManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/academic-structure-management'))
);

const NewsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/news-management'))
);

const AnnouncementsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/announcements-management'))
);

const StudentsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/students-management'))
);

const PartnersManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/partners-management'))
);

const StatisticsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/statistics-management'))
);

const NewPageManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/new-page-management'))
);

const EmployeesPortfolioManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/employees-portfolio-management'))
);

const FacultiesManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/faculties-management'))
);

const DirectionsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/directions-management'))
);

const FacultyPageMenuManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/faculty-page-menu-management'))
);

const RectorSpeechManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/rector-speech-management'))
);

const AdmissionCtaManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/admission-cta-management'))
);

const SeasonalEffectsManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/seasonal-effects-management'))
);

const AdminUsersManagementPage = Loadable(
  lazy(() => import('pages/extra-pages/admin-users-management'))
);

function DefaultDashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getFirstAccessiblePath(user) || '/login'} replace />;
}

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DefaultDashboardRedirect />
    },
    {
      path: 'menu-management',
      element: <MenuManagementPage />
    },
    {
      path: 'advantages-management',
      element: <AdvantagesManagementPage />
    },
    {
      path: 'rankings-management',
      element: <RankingsManagementPage />
    },
    {
      path: 'academic-structure-management',
      element: <AcademicStructureManagementPage />
    },
    {
      path: 'banner-management',
      element: <BannerManagementPage />
    },
    {
      path: 'academic-menu-management',
      element: <AcademicMenuManagementPage />
    },
    {
      path: 'news-management',
      element: <NewsManagementPage />
    },
    {
      path: 'announcements-management',
      element: <AnnouncementsManagementPage />
    },
    {
      path: 'students-management',
      element: <StudentsManagementPage />
    },
    {
      path: 'partners-management',
      element: <PartnersManagementPage />
    },
    {
      path: 'statistics-management',
      element: <StatisticsManagementPage />
    },
    {
      path: 'new-page-management',
      element: <NewPageManagementPage />
    },
    {
      path: 'employees-portfolio-management',
      element: <EmployeesPortfolioManagementPage />
    },
    {
      path: 'faculties-management',
      element: <FacultiesManagementPage />
    },
    {
      path: 'directions-management',
      element: <DirectionsManagementPage />
    },
    {
      path: 'faculty-page-menu-management',
      element: <FacultyPageMenuManagementPage />
    },

    {
      path: 'rector-speech-management',
      element: <RectorSpeechManagementPage />
    },
    {
      path: 'admission-cta-management',
      element: <AdmissionCtaManagementPage />
    },
    {
      path: 'seasonal-effects-management',
      element: <SeasonalEffectsManagementPage />
    },

    {
      path: 'admin-users-management',
      element: <AdminUsersManagementPage />
    }

  ]
};

export default MainRoutes;
