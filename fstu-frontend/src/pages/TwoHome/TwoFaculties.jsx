import React, { useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Code2,
  Zap,
  Settings,
  ArrowRight,
  Layers,
  Users,
  GraduationCap,
  BookOpen,
  LayoutGrid,
  Building2,
  FlaskConical,
  Shirt,
  BarChart3
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

const TwoFacultiesContent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const accentColor = theme.palette.primary.main;

  const faculties = [
    {
      id: 1,
      title: "Axborot texnologiyalari va telekommunikatsiya fakulteti",
      icon: <Code2 />,
      desc: "Zamonaviy dasturlash tillari, kiberxavfsizlik va telekommunikatsiya tarmoqlarini o'rganish markazi.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000",
      stats: { students: "1,200+", courses: "12", professors: "45", departments: "5" }
    },
    {
      id: 2,
      title: "Arxitektura va qurilish fakulteti",
      icon: <Building2 />,
      desc: "Shaharsozlik, loyihalash va zamonaviy arxitektura yechimlari bo'yicha mutaxassislar tayyorlash.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000",
      stats: { students: "850+", courses: "8", professors: "30", departments: "3" }
    },
    {
      id: 3,
      title: "Energetika muhandisligi fakulteti",
      icon: <Zap />,
      desc: "Elektr energiyasi ishlab chiqarish, muqobil energiya manbalari va energiya samaradorligi.",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000",
      stats: { students: "980+", courses: "10", professors: "38", departments: "4" }
    },
    {
      id: 4,
      title: "Mexanika - mashinasozlik fakulteti",
      icon: <Settings />,
      desc: "Mashinasozlik texnologiyalari, avtomatlashtirilgan tizimlar va metallga ishlov berish jarayonlari.",
      image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=1000",
      stats: { students: "1,100+", courses: "15", professors: "52", departments: "6" }
    },
    {
      id: 5,
      title: "Kimyo texnologiya fakulteti",
      icon: <FlaskConical />,
      desc: "Kimyoviy jarayonlar, neft-gaz qayta ishlash va laboratoriya tadqiqotlari yo'nalishi.",
      image: "https://images.unsplash.com/photo-1532187875605-1ef147c6d14b?q=80&w=1000",
      stats: { students: "750+", courses: "9", professors: "28", departments: "4" }
    },
    {
      id: 6,
      title: "Yengil sanoat va to'qimachilik fakulteti",
      icon: <Shirt />,
      desc: "To'qimachilik sanoati, dizayn va yengil sanoat mahsulotlarini ishlab chiqarish texnologiyalari.",
      image: "https://images.unsplash.com/photo-1558603668-6570496b66f8?q=80&w=1000",
      stats: { students: "600+", courses: "7", professors: "22", departments: "3" }
    },
    {
      id: 7,
      title: "Ishlab chiqarishda boshqaruv fakulteti",
      icon: <BarChart3 />,
      desc: "Sanoat iqtisodiyoti, menejment va ishlab chiqarish jarayonlarini boshqarish strategiyalari.",
      image: "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=1000",
      stats: { students: "900+", courses: "11", professors: "35", departments: "4" }
    },
  ];

  const [activeTab, setActiveTab] = useState(faculties[0]);

  return (
    <>
      <TwoNavbar />
      <TwoAboutBanner />

      <main style={{
        minHeight: "85vh",
        backgroundColor: theme.palette.background.default,
        padding: isMobile ? "0" : "60px 0",
        display: "flex",
        justifyContent: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            maxWidth: "1400px", 
            width: "100%",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 40px 100px -20px rgba(0,0,0,0.1)"
          }}
        >
          {/* --- LEFT SIDE (IMAGE & INFO) --- */}
          <section style={{ 
            flex: "1 1 60%", 
            position: "relative", 
            minHeight: isMobile ? "500px" : "750px",
            overflow: "hidden"
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`bg-${activeTab.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${activeTab.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </AnimatePresence>

            <div style={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? "linear-gradient(to right, #0d0d0d 60%, transparent 100%)"
                : "linear-gradient(to right, #ffffff 60%, transparent 100%)",
              zIndex: 1
            }} />

            <div style={{
              position: "relative",
              zIndex: 2,
              padding: isMobile ? "40px 20px" : "60px 80px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              
              {/* KATTA ANIMATSIYALI LOGO */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`main-logo-${activeTab.id}`}
                  initial={{ y: -30, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  style={{
                    width: "85px",
                    height: "85px",
                    backgroundColor: accentColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "25px",
                    boxShadow: `0 15px 35px ${accentColor}44`,
                  }}
                >
                  {React.cloneElement(activeTab.icon, { size: 40 })}
                </motion.div>
              </AnimatePresence>

              <motion.h2
                key={`title-${activeTab.id}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={{ fontSize: isMobile ? "16px" : "25px", fontWeight: 900, margin: "0 0 20px", textTransform: "uppercase", lineHeight: 1.1 }}
              >
                {activeTab.title}
              </motion.h2>

              <motion.p
                key={`desc-${activeTab.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: theme.palette.text.secondary, fontSize: "18px", maxWidth: "550px", lineHeight: 1.6, marginBottom: "40px" }}
              >
                {activeTab.desc}
              </motion.p>

              {/* STATISTIKA */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginBottom: "40px" }}>
                {[
                  { icon: <LayoutGrid size={20} />, label: "Kafedralar", value: activeTab.stats.departments },
                  { icon: <Users size={20} />, label: "Talabalar", value: activeTab.stats.students },
                  { icon: <BookOpen size={20} />, label: "Yo'nalishlar", value: activeTab.stats.courses },
                  { icon: <GraduationCap size={20} />, label: "Professorlar", value: activeTab.stats.professors },
                ].map((stat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ color: accentColor }}>{stat.icon}</div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 800 }}>{stat.value}</div>
                      <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.6, textTransform: "uppercase" }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ x: 10 }}
                onClick={() => navigate(`/faculties/${activeTab.id}`)}
                style={{
                  backgroundColor: '#02509eff',
                  color: "#fff",
                  padding: "16px 40px",
                  border: "none",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "fit-content",
                  textTransform: "uppercase"
                }}
              >
                Batafsil <ArrowRight size={20} />
              </motion.button>
            </div>
          </section>

          {/* --- RIGHT SIDE (SCROLLABLE MENU) --- */}
          <aside style={{ 
            flex: "1 1 40%", 
            background: isDark ? "#141414" : "#f9f9f9",
            borderLeft: isMobile ? "none" : `1px solid ${theme.palette.divider}`,
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "auto" : "750px",
            overflowY: "auto"
          }}>
            <div style={{ padding: "30px 40px", position: "sticky", top: 0, background: isDark ? "#141414" : "#f9f9f9", zIndex: 10, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: "20px", letterSpacing: "1px" }}>FAKULTETLAR</h3>
            </div>

            <nav style={{ padding: "10px" }}>
              {faculties.map((fac) => {
                const active = activeTab.id === fac.id;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setActiveTab(fac)}
                    style={{
                      width: "100%",
                      padding: "20px 25px",
                      marginBottom: "5px",
                      border: "none",
                      background: active ? theme.palette.background.paper : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      cursor: "pointer",
                      textAlign: "left",
                      position: "relative",
                      transition: "0.3s"
                    }}
                  >
                    {active && <motion.div layoutId="bar" style={{ position: "absolute", left: 0, width: "4px", height: "60%", backgroundColor: accentColor }} />}
                    <div style={{ 
                      color: active ? accentColor : theme.palette.text.secondary,
                      transition: "0.3s"
                    }}>
                      {React.cloneElement(fac.icon, { size: 22 })}
                    </div>
                    <span style={{ 
                      fontWeight: active ? 800 : 500, 
                      fontSize: "14px", 
                      color: active ? theme.palette.text.primary : theme.palette.text.secondary,
                      lineHeight: 1.3
                    }}>
                      {fac.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </motion.div>
      </main>
      <TwoFooter />
    </>
  );
};

const TwoFaculties = () => {
  return (
    <ColorModeProvider>
      <TwoFacultiesContent />
    </ColorModeProvider>
  );
};

export default TwoFaculties;