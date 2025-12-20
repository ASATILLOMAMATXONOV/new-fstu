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

import Footer from "../../components/layout/Footer";


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

      {/* FOOTER */}
       <Footer />
      
    </main>
  );
}
