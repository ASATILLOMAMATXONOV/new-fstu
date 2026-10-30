import React from 'react';
import HeroBanner from '../components/layout/HeroBanner';
import DeferredSection from '../components/common/DeferredSection';

const HomeInfoSection = React.lazy(() => import('../components/layout/HomeInfoSection'));
const UniversityRankings = React.lazy(() => import('../components/layout/UniversityRankings'));
const HomeFacultyConstellation = React.lazy(() => import('../components/layout/HomeFacultyConstellation'));
const RektorMurojaati = React.lazy(() => import('../components/layout/RektorMurojaati'));
const NewsPageHome = React.lazy(() => import('../components/layout/NewsPageHome'));
const StudentsSection = React.lazy(() => import('../components/layout/StudentsSection'));
const LaboratoryPage = React.lazy(() => import('../components/layout/LaboratoryPage'));
const StudentAnnouncementStats = React.lazy(() => import('../components/layout/StudentAnnouncementStats'));
const HomePartnersSection = React.lazy(() => import('../components/layout/HomePartnersSection'));
const StatisticsSection = React.lazy(() => import('../components/layout/StatisticsSection'));

export default function HomePage() {
  return (
    <main className="home-page">
      <HeroBanner />
      <div className="app-content-shell">
        <DeferredSection><HomeInfoSection /></DeferredSection>
        <DeferredSection><UniversityRankings /></DeferredSection>
        <DeferredSection minHeight={720}><HomeFacultyConstellation /></DeferredSection>
        <DeferredSection><RektorMurojaati /></DeferredSection>
        <DeferredSection minHeight={600}><NewsPageHome /></DeferredSection>
        <DeferredSection minHeight={480}><StudentsSection /></DeferredSection>
        <DeferredSection><LaboratoryPage /></DeferredSection>
      </div>
      <div className="app-content-shell">
        <DeferredSection minHeight={340}><StudentAnnouncementStats /></DeferredSection>
        <DeferredSection minHeight={280}><HomePartnersSection /></DeferredSection>
        <DeferredSection minHeight={420}><StatisticsSection /></DeferredSection>
      </div>
    </main>
  );
}
