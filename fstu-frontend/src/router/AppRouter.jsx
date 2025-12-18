import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

// layout
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollToTop from "../components/layout/ScrollToTop";

// pages
import Home from "../pages/Home/Home";
import Courses from "../pages/Home/Courses";
import Faculties from "../pages/Faculties/Faculties";
import PagesBanner from "../components/layout/pagesBanner";
import SideMenu from "../components/layout/SideMenu";
import DepartmentsPage from "../pages/Faculties/Departments";
import Centers from "../pages/Home/Centers";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ScrollToTop />

        {/* HEADER */}
        <Navbar />

        {/* CONTENT (MUHIM QISM) */}
        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/pages" element={<PagesBanner />} />
            <Route path="/sede" element={<SideMenu />} />
            <Route path="/centers" element={<Centers />} />


          </Routes>
        </Box>

        {/* FOOTER */}
        <Footer />
      </Box>
    </BrowserRouter>
  );
}
