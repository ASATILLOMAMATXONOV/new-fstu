import React, { useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Rasmlar to'plami
const slideData = [
  {
    bg: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000",
    front: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000",
  },
  {
    bg: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000",
    front: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000",
  },
  {
    bg: "https://images.unsplash.com/photo-1524178232457-3bb2449948b3?q=80&w=2000",
    front: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000",
  }
];

const TwoAboutBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const accentColor = theme.palette.primary.main;

  const [index, setIndex] = useState(0);

  // Avtomatik almashish (Carousel effekti)
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideData.length);
    }, 5000); // Har 5 soniyada
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: isMobile ? "auto" : "550px",
        position: "relative",
        padding: isMobile ? "60px 20px" : "100px 0",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* 1. ANIMATSIYALI ORQA FON RASMI */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.4, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5 }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${slideData[index].bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: isDark ? "blur(12px) brightness(0.2)" : "blur(12px) brightness(0.9)",
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          position: "relative",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: isMobile ? "60px" : "100px",
          zIndex: 1,
        }}
      >
        {/* CHAP TOMON: GEOMETRIK QATLAM */}
        <div style={{ flex: 1, position: "relative", height: isMobile ? "250px" : "350px", width: "100%" }}>
          {/* Orqa dekorativ kvadrat */}
          <motion.div
            animate={{ rotate: [-6, -8, -6] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: isMobile ? "180px" : "280px",
              height: isMobile ? "180px" : "280px",
              backgroundColor: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              top: "5%",
              left: "5%",
              zIndex: 1,
            }}
          />

          {/* Old kvadrat (ICHIDAGI RASM ALMASHADI) */}
          <motion.div
            style={{
              position: "absolute",
              width: isMobile ? "180px" : "280px",
              height: isMobile ? "180px" : "280px",
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              border: `1px solid ${theme.palette.divider}`,
              top: "15%",
              left: "20%",
              zIndex: 2,
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
              rotate: 8
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`front-${index}`}
                src={slideData[index].front}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "rotate(-8deg) scale(1.2)"
                }}
              />
            </AnimatePresence>
          </motion.div>
        </div>

        {/* O'NG TOMON: MATNLAR */}
        <div style={{ flex: 1.2 }}>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{ color: accentColor, fontWeight: 800, fontSize: "12px", letterSpacing: "3px", marginBottom: "15px" }}
          >
            BIZ HAQIMIZDA
          </motion.div>

          <motion.h2
            style={{ fontSize: "24px", fontWeight: 900, color: theme.palette.text.primary, lineHeight: 1.2 }}
          >
            Bilim va tajribani <br />
            <span style={{ color: accentColor }}>uyg'unlashtiramiz</span>
          </motion.h2>

          <motion.p
            style={{ fontSize: "16px", color: theme.palette.text.secondary, marginTop: "20px", lineHeight: 1.8 }}
          >
            Akademiyamizda har bir talaba individual yondashuv va zamonaviy 
            metodikalar asosida ta'lim oladi. Rasmlarimizda aks etganidek, 
            bizda muhit doimo jonli va natijaga yo'naltirilgan.
          </motion.p>

          <div style={{ marginTop: "35px", display: "flex", gap: "20px", alignItems: "center" }}>
             {/* Slayder nuqtalari (Indikator) */}
             {slideData.map((_, i) => (
               <div 
                key={i} 
                onClick={() => setIndex(i)}
                style={{ 
                  width: index === i ? "30px" : "8px", 
                  height: "8px", 
                  backgroundColor: index === i ? accentColor : `${accentColor}44`, 
                  borderRadius: "10px", 
                  cursor: "pointer", 
                  transition: "0.4s" 
                }} 
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoAboutBanner;