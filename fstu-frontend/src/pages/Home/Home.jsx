import Banner from "../../components/layout/Banner";
import All from "../../components/layout/All";
import Rektor from "../../components/layout/Rektor";
import Announces from "../../components/layout/Announces";
import HeroVideo from "../../components/layout/HeroVideo";
import StatsSection from "../../components/layout/StatsSection";
import SponsorsSlider from "../../components/layout/SponsorsSlider";

export default function Home() {
  return (
    <main id="main-content" role="main">
      <Banner />
      <All />
      <Rektor />
      <Announces />
      <StatsSection />
      <HeroVideo />
      <SponsorsSlider />
    </main>
  );
}
