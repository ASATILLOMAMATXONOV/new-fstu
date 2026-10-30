import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';

import './App.css';
import ScrollManager from './components/layout/ScrollManager';

import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import InnerPageBanner from './components/layout/InnerPageBanner';
import SeasonalEffectsOverlay from './components/layout/SeasonalEffectsOverlay';
import ThemeColorSwitcher from './components/layout/ThemeColorSwitcher';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const RobotAssistant = React.lazy(() => import('./components/assistant/RobotAssistant'));

const LeadershipPage = React.lazy(() => import('./pages/public/LeadershipPage'));
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
const LaboratoriesPage = React.lazy(() => import('./pages/LaboratoriesPage'));

function SiteLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <ScrollManager />
      <Navbar />
      {pathname !== '/' && <InnerPageBanner key={pathname} />}
      <Outlet />
      <Footer />
    </>
  );
}

function SectionFallback({ minHeight = 320 }) {
  return <div className="section-fallback" style={{ minHeight }} aria-hidden="true" />;
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

            <Route path="/" element={<Suspense fallback={<SectionFallback minHeight={960} />}><HomePage /></Suspense>} />
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
          <Route
            path="/journals"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
               <JournalIssuesPage />
              </Suspense>
            }
          />

          <Route
            path="/leadership"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
               <LeadershipPage />
              </Suspense>
            }
          />
          <Route
            path="/laboratories"
            element={
              <Suspense fallback={<SectionFallback minHeight={960} />}>
               <LaboratoriesPage />
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
