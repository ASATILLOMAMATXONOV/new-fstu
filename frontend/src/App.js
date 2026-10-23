import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';

import './App.css';

import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import HeroBanner from './components/layout/HeroBanner';
import HomeInfoSection from './components/layout/HomeInfoSection';
import UniversityRankings from './components/layout/UniversityRankings';
import NewsPageHome from './components/layout/NewsPageHome';
import StudentsSection from './components/layout/StudentsSection';
import LaboratoryPage from './components/layout/LaboratoryPage';
import HomeFacultyConstellation from './components/layout/HomeFacultyConstellation';
import Footer from './components/layout/Footer';
import InnerPageBanner from './components/layout/InnerPageBanner';
import SeasonalEffectsOverlay from './components/layout/SeasonalEffectsOverlay';
import ThemeColorSwitcher from './components/layout/ThemeColorSwitcher';
const RobotAssistant = React.lazy(() => import('./components/assistant/RobotAssistant'));

const RektorMurojaati = React.lazy(() => import('./components/layout/RektorMurojaati'));
const StudentAnnouncementStats = React.lazy(() => import('./components/layout/StudentAnnouncementStats'));

const HomePartnersSection = React.lazy(() => import('./components/layout/HomePartnersSection'));
const StatisticsSection = React.lazy(() => import('./components/layout/StatisticsSection'));

const PartnersPage = React.lazy(() => import('./pages/PartnersPage'));
const NewsPage = React.lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = React.lazy(() => import('./pages/NewsDetailPage'));
const RektorPage = React.lazy(() => import('./pages/RektorPage'));
const FacultiesPage = React.lazy(() => import('./pages/FacultiesPage'));
const DepartmentsPage = React.lazy(() => import('./pages/DepartmentsPage'));
const SectionsPage = React.lazy(() => import('./pages/SectionsPage'));
const AnnouncementsPage = React.lazy(() => import('./pages/AnnouncementsPage'));
const AnnouncementDetailPage = React.lazy(() => import('./pages/AnnouncementDetailPage'));
const StudentsPage = React.lazy(() => import('./pages/StudentsPage'));
const StudentDetailPage = React.lazy(() => import('./pages/StudentDetailPage'));
const DynamicPage = React.lazy(() => import('./pages/DynamicPage'));
const MenuContentPage = React.lazy(() => import('./pages/MenuContentPage'));
const EmployeeProfilePage = React.lazy(() => import('./pages/EmployeeProfilePage'));
const AcademicEntityPage = React.lazy(() => import('./pages/AcademicEntityPage'));
const AdmissionPage = React.lazy(() => import('./pages/AdmissionPage'));

function ScrollManager() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (location.pathname === '/' && location.hash === '#news') {
      navigate('/news', { replace: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.hash, navigate]);

  return null;
}

function SiteLayout() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <InnerPageBanner />
      <Outlet />
      <Footer />
    </>
  );
}

function SectionFallback({ minHeight = 320 }) {
  return <div className="section-fallback" style={{ minHeight }} aria-hidden="true" />;
}

function HomePage() {
  return (
    <main className="home-page">
      <HeroBanner />

      <div className="app-content-shell">
        <HomeInfoSection />
        <UniversityRankings />
        <HomeFacultyConstellation />
        <RektorMurojaati />
        <NewsPageHome />
        <StudentsSection />
        <LaboratoryPage />
      </div>


      <div className="app-content-shell">
        <Suspense fallback={<SectionFallback minHeight={340} />}>
          <StudentAnnouncementStats />
        </Suspense>


        <Suspense fallback={<SectionFallback minHeight={280} />}>
          <HomePartnersSection />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <StatisticsSection />
        </Suspense>
      </div>
    </main>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <SeasonalEffectsOverlay />
        <ThemeColorSwitcher />
        <Suspense fallback={null}><RobotAssistant /></Suspense>
        <Routes>
          <Route element={<SiteLayout />}>

            <Route path="/" element={<HomePage />} />

          <Route
            path="/partners"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <PartnersPage />
              </Suspense>
            }
          />

          <Route
            path="/news"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <NewsPage />
              </Suspense>
            }
          />

          <Route
            path="/news/page/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <NewsDetailPage />
              </Suspense>
            }
          />

          <Route
            path="/rektor"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <RektorPage />
              </Suspense>
            }
          />

          <Route
            path="/faculties"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <FacultiesPage />
              </Suspense>
            }
          />

          <Route
            path="/faculties/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AcademicEntityPage pageType="faculty" />
              </Suspense>
            }
          />

          

          <Route
            path="/departments"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <DepartmentsPage />
              </Suspense>
            }
          />

          <Route
            path="/departments/:facultyId/:departmentId"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AcademicEntityPage pageType="department" />
              </Suspense>
            }
          />

          <Route
            path="/sections"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <SectionsPage />
              </Suspense>
            }
          />

          <Route
            path="/sections/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AcademicEntityPage pageType="section" />
              </Suspense>
            }
          />

          <Route
            path="/announcements"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AnnouncementsPage />
              </Suspense>
            }
          />

          <Route
            path="/announcements/page/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <AnnouncementDetailPage />
              </Suspense>
            }
          />

          <Route
            path="/students"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <StudentsPage />
              </Suspense>
            }
          />

          <Route
            path="/students/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <StudentDetailPage />
              </Suspense>
            }
          />

          <Route
            path="/admission"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <AdmissionPage />
              </Suspense>
            }
          />

          <Route
            path="/pages/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <DynamicPage />
              </Suspense>
            }
          />

          <Route
            path="/menu/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <MenuContentPage />
              </Suspense>
            }
          />

          <Route
            path="/employees/:slug"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <EmployeeProfilePage />
              </Suspense>
            }
          />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
