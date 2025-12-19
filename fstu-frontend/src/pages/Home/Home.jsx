import { Link } from "react-router-dom";
import "../../assets/styles/FloatingToolbar.css";

import Navbar from "../../components/layout/Navbar";
import Banner from "../../components/layout/Banner";
import All from "../../components/layout/All";
import Rektor from "../../components/layout/Rektor";
import Announces from "../../components/layout/Announces";
import HeroVideo from "../../components/layout/HeroVideo";
import StatsSection from "../../components/layout/StatsSection";
import SponsorsSlider from "../../components/layout/SponsorsSlider";

import FloatingToolbar from "../../components/layout/FloatingToolbar";


export default function Home() {
  return (
    <main id="main-content" role="main">
      <Navbar />
      <Banner />
      <All />
      <Rektor />
      <Announces />
      <StatsSection />
      <HeroVideo />
      <SponsorsSlider />
      <FloatingToolbar />

      {/* FLOATING SWITCHER */}
      <div className="floating-switcher">
        <span className="main-icon">⚙️</span>

        <div className="switcher-menu">
          <Link to="/twopages">Ko‘rinish 1</Link>
          <Link to="/twopages?view=2">Ko‘rinish 2</Link>
          <Link to="/twopages?view=3">Ko‘rinish 3</Link>
        </div>
      </div>
    </main>
  );
}
