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
const JournalIssuesPage = React.lazy(() => import('./pages/JournalIssuesPage'));

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
          //  Student Announcement Stats Section
          <StudentAnnouncementStats /> 
        </Suspense>


        <Suspense fallback={<SectionFallback minHeight={280} />}>
        //  Home Partners Section
          <HomePartnersSection />
        </Suspense>

        <Suspense fallback={<SectionFallback minHeight={420} />}>
        //  Statistics Section
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

            //  ----  Partners Page Route  ------------ 
          <Route
            path="/partners"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <PartnersPage />
              </Suspense>
            }
          />

          //  ----  News Page Route  ------------
          <Route
            path="/news"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <NewsPage />
              </Suspense>
            }
          />

            //  ----  News Detail Page Route  ------------
          <Route
            path="/news/page/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <NewsDetailPage />
              </Suspense>
            }
          />

            //  ----  Rektor Page Route  ------------
          <Route
            path="/rektor"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <RektorPage />
              </Suspense>
            }
          />

          //  ----  Faculties Page Route  ------------
          <Route
            path="/faculties"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <FacultiesPage />
              </Suspense>
            }
          />

            //  ----  Faculty Detail Page Route  ------------
          <Route
            path="/faculties/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AcademicEntityPage pageType="faculty" />
              </Suspense>
            }
          />

          //  ----  Departments Page Route  ------------  

          <Route
            path="/departments"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <DepartmentsPage />
              </Suspense>
            }
          />

              //  ----  Department Detail Page Route  ------------
          <Route
            path="/departments/:facultyId/:departmentId"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AcademicEntityPage pageType="department" />
              </Suspense>
            }
          />

            //  ----  Sections Page Route  ------------
          <Route
            path="/sections"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <SectionsPage />
              </Suspense>
            }
          />

            //  ----  Section Detail Page Route  ------------
          <Route
            path="/sections/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AcademicEntityPage pageType="section" />
              </Suspense>
            }
          />

            //  ----  Announcements Page Route  ------------  
          <Route
            path="/announcements"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <AnnouncementsPage />
              </Suspense>
            }
          />

            //  ----  Announcement Detail Page Route  ------------
          <Route
            path="/announcements/page/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <AnnouncementDetailPage />
              </Suspense>
            }
          />

            //  ----  Students Page Route  ------------
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

          //  ----  Admission Page Route  ------------
          <Route
            path="/admission"
            element={
              <Suspense fallback={<SectionFallback minHeight={720} />}>
                <AdmissionPage />
              </Suspense>
            }
          />


            //  ----  Dynamic Page Route  ------------
          <Route
            path="/pages/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <DynamicPage />
              </Suspense>
            }
          />
          
            //  ----  Menu Content Page Route  ------------
          <Route
            path="/menu/:id"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <MenuContentPage />
              </Suspense>
            }
          />

            //  ----  Employee Profile Page Route  ------------
          <Route
            path="/employees/:slug"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
                <EmployeeProfilePage />
              </Suspense>
            }
          />


            //  ----  Journal Issues Page Route  ------------
          <Route
            path="/journals"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}> 
               <JournalIssuesPage />
              </Suspense>
            }
          />






            //  ----  Catch-all Route for Undefined Paths  ------------
            <Route path="*" element={<Navigate to="/" replace />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
