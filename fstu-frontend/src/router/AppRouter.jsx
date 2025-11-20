import { BrowserRouter, Routes, Route } from "react-router-dom";

// Sahifalar
import Home from "../pages/Home/Home";
import Programs from "../pages/Programs/Programs";
import NotFound from "../pages/NotFound/NotFound";


import Navbar from "../components/layout/Navbar";

export default function AppRouter() {
  return (
    <BrowserRouter>
     

     
        <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
