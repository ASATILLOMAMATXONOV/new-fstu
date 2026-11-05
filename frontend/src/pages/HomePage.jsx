import React from 'react';
import HeroBanner from '../components/layout/HeroBanner';
import DeferredSection from '../components/common/DeferredSection';
import { RevealSequence, RevealSlot } from '../components/common/RevealSequence';

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
      <RevealSequence>
        <RevealSlot index={0} alwaysVisible>
          <HeroBanner />
        </RevealSlot>
        <div className="app-content-shell">
          <DeferredSection revealIndex={1}><HomeInfoSection /></DeferredSection>
          <DeferredSection revealIndex={2} minHeight={0}><UniversityRankings /></DeferredSection>
          <DeferredSection revealIndex={3} minHeight={0}><HomeFacultyConstellation /></DeferredSection>
          <DeferredSection revealIndex={4}><RektorMurojaati /></DeferredSection>
          <DeferredSection revealIndex={5} minHeight={600}><NewsPageHome /></DeferredSection>
          <DeferredSection revealIndex={6} minHeight={480}><StudentsSection /></DeferredSection>
          <DeferredSection revealIndex={7} minHeight={0}><LaboratoryPage /></DeferredSection>
        </div>
        <div className="app-content-shell">
          <DeferredSection revealIndex={8} minHeight={340}><StudentAnnouncementStats /></DeferredSection>
          <DeferredSection revealIndex={9} minHeight={280}><HomePartnersSection /></DeferredSection>
          <DeferredSection revealIndex={10} minHeight={420}><StatisticsSection /></DeferredSection>
        </div>
      </RevealSequence>
    </main>
  );
}
