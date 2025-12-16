import { BrowserRouter, Routes, Route } from "react-router-dom";

// layout
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollToTop from "../components/layout/ScrollToTop";


// pages
import Home from "../pages/Home/Home";
import Courses from "../pages/Home/Courses";
import Faculties from "../pages/Faculties/Faculties";

export default function AppRouter() {
  return (
    <BrowserRouter>
    <ScrollToTop />
    
      {/* HEADER */}
      <Navbar />

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/faculties" element={<Faculties />} />
      </Routes>

      {/* FOOTER */}
      <Footer />
    </BrowserRouter>
  );
}
