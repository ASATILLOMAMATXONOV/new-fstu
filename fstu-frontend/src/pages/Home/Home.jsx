import Banner from "../../components/layout/Banner";
import Faculties from "../../components/layout/Faculties";
import Rektor from "../../components/layout/Rektor";
import Announces from "../../components/layout/Announces";
import HeroVideo from "../../components/layout/HeroVideo";
import StatsSection from "../../components/layout/StatsSection";
import SponsorsSlider from "../../components/layout/SponsorsSlider";

export default function Home() {
  return (
    <main id="main-content" role="main">
      <Banner />
      <Faculties />
      <Rektor />
      <Announces />
      <StatsSection />
      <HeroVideo />
      <SponsorsSlider />
    </main>
  );
}
