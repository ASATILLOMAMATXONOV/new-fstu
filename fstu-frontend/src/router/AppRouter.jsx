import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "../components/layout/Navbar";
import Banner from "../components/layout/Banner";
import Faculties from "../components/layout/Faculties";
import Rektor from "../components/layout/Rektor";
import Announces from "../components/layout/Announces";
import HeroVideo from "../components/layout/HeroVideo";
import StatsSection from "../components/layout/StatsSection";
import SponsorsSlider from "../components/layout/SponsorsSlider";
import Footer from "../components/layout/Footer";


import Courses from "../pages/Home/Courses";

export default function AppRouter() {
  return (
    <BrowserRouter>

      {/* HEADER */}
      <Navbar />

      {/* MAIN LANDMARK (MUHIM!) */}
      <main id="main-content" role="main" style={{ display: "block" }}>
        <Banner />
        <Faculties />
        <Rektor />
        <Announces />
        <StatsSection />
        <HeroVideo />
        <SponsorsSlider />
      </main>

      {/* FOOTER */}
      <Footer />

      {/* ROUTES */}
      <Routes>
        {/* future routes */}
        <Route path="/courses" element={<Courses />} />
      </Routes>

    </BrowserRouter>
  );
}
