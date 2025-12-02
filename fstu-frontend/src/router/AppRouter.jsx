import { BrowserRouter, Routes, Route } from "react-router-dom";

// Sahifalar
import Home from "../pages/Home/Home";
import Programs from "../pages/Programs/Programs";
import NotFound from "../pages/NotFound/NotFound";


import Navbar from "../components/layout/Navbar";
import Banner from "../components/layout/Banner";
import Faculties from "../components/layout/Faculties"
import Rektor from "../components/layout/Rektor";
import Niewss from "../components/layout/Niews";
import Announces from "../components/layout/Announces"; 

export default function AppRouter() {
  return (
    <BrowserRouter>
 
        <Navbar />
        <Banner />
        <Faculties />
        <Rektor />
        <Niewss />
        <Announces />
        
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
