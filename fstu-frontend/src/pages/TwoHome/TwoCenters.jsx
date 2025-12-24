import React, { useState } from "react";
import { useTheme, useMediaQuery, Box, Typography, Button, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Building2, Phone, Mail, ArrowLeft,
  ExternalLink, Users, Award, 
  ChevronRight, ChevronLeft, ChevronDown, MapPin, 
  Cpu, Globe, ShieldCheck, Database, Rocket
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

const TwoCentersContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const accentColor = theme.palette.primary.main;

  const [openCenterId, setOpenCenterId] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState(null);

  const centers = [
    {
      id: 1,
      title: "Markazlar",
      icon: <Cpu size={20} />,
      divisions: [
        {
          id: 101,
          name: "Sun'iy Intellekt Bo'limi",
          icon: <Rocket size={18} />,
          desc: "Ushbu bo'limda neyron tarmoqlari, mashinali o'rganish va katta ma'lumotlar bilan ishlash bo'yicha ilmiy-amaliy loyihalar amalga oshiriladi.",
          head: {
            name: "Dr. Rustam Karimov",
            role: "Markaz Rahbari, PhD",
            email: "r.karimov@fpi.uz",
            phone: "+998 90 321 65 43",
            office: "IT-Park, 2-qavat",
            bio: "Machine Learning sohasida 10 yillik tajriba.",
            img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
          }
        }
      ]
    },
    {
      id: 2,
      title: "Bo'limlar",
      icon: <Globe size={20} />,
      divisions: [
        {
          id: 201,
          name: "Startap Inkubator",
          icon: <Database size={18} />,
          desc: "Yosh tadqiqotchilarning g'oyalarini biznes loyihaga aylantirish markazi.",
          head: {
            name: "Malika Orifova",
            role: "Inkubatsiya Koordinatori",
            email: "m.orifova@fpi.uz",
            phone: "+998 97 555 00 11",
            office: "B-blok, 12-xona",
            bio: "Biznes strategiya bo'yicha ekspert.",
            img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800"
          }
        }
      ]
    }
  ];

  const toggleCenter = (id) => setOpenCenterId(openCenterId === id ? null : id);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      <Box sx={{ 
        maxWidth: "1600px", margin: "0 auto", 
        display: "flex", flexDirection: isMobile ? "column" : "row",
        pt: isMobile ? 2 : 8, px: isSmallMobile ? 2 : 4, pb: 10, gap: 5
      }}>
        
        {/* CHAP TOMON: NAVIGATSIYA */}
        <Box sx={{ 
          flex: selectedDivision && !isMobile ? "0 0 350px" : "1 1 350px",
          display: selectedDivision && isMobile ? "none" : "block"
        }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textTransform: "uppercase" }}>
            Markaz va bo'limlar
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {centers.map((center) => (
              <Box key={center.id} sx={{ 
                overflow: "hidden", 
                border: `1px solid ${openCenterId === center.id ? accentColor : theme.palette.divider}`,
                bgcolor: openCenterId === center.id ? (isDark ? "#111" : "#fcfcfc") : "transparent",
                borderRadius: "12px"
              }}>
                <Box onClick={() => toggleCenter(center.id)} sx={{ p: 2.5, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ color: openCenterId === center.id ? accentColor : "inherit" }}>{center.icon}</Box>
                    <Typography sx={{ fontWeight: 800 }}>{center.title}</Typography>
                  </Box>
                  {openCenterId === center.id ? <ChevronDown /> : <ChevronRight />}
                </Box>
                <AnimatePresence>
                  {openCenterId === center.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                        {center.divisions.map((div) => (
                          <Box key={div.id} onClick={() => setSelectedDivision(div)} sx={{
                            p: 2, borderRadius: "8px", cursor: "pointer",
                            bgcolor: selectedDivision?.id === div.id ? accentColor : "transparent",
                            color: selectedDivision?.id === div.id ? "#fff" : "inherit"
                          }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>{div.name}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            ))}
          </Box>
        </Box>

        {/* O'NG TOMON: ASOSIY CONTENT */}
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {!selectedDivision ? (
              <motion.div
                key="yt-intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "relative",
                  width: "100%",
                  height: isMobile ? "450px" : "650px",
                  borderRadius: "32px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                {/* YouTube Video Iframe */}
                <iframe
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "100%",
                    height: "100%",
                    minWidth: "177.77vh", // 16:9 nisbatni saqlash
                    minHeight: "56.25vw",
                    transform: "translate(-50%, -50%) scale(1.1)",
                    pointerEvents: "none",
                    border: "none",
                    filter: "brightness(0.5)",
                  }}
                  src="https://www.youtube.com/embed/9XInD-NnpxU?autoplay=1&mute=1&loop=1&playlist=9XInD-NnpxU&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
                  allow="autoplay; encrypted-media"
                  title="Background Video"
                />

                {/* Video ustidagi matn */}
                <Box sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  textAlign: "center",
                  p: 4,
                  background: "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
                }}>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", p: 2, borderRadius: "50%", mb: 3, display: "inline-flex", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <Globe size={40} color={accentColor} />
                  </Box>
                  <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: isSmallMobile ? "32px" : "48px" }}>
                    Innovatsion Markazlar
                  </Typography>
                  <Typography sx={{ maxWidth: "550px", fontSize: "18px", opacity: 0.8, mb: 4 }}>
                    Kelajak texnologiyalari va ilmiy tadqiqotlar olamiga xush kelibsiz.
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <motion.div animate={{ x: [-5, 5] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                      <ChevronLeft color={accentColor} strokeWidth={3} />
                    </motion.div>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>BO'LIMNI TANLANG</Typography>
                  </Box>
                </Box>
              </motion.div>
            ) : (
              /* TANLANGAN BO'LIM MA'LUMOTI */
              <motion.div key={selectedDivision.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <Button startIcon={<ArrowLeft />} onClick={() => setSelectedDivision(null)} sx={{ mb: 4, fontWeight: 800 }}>
                  Orqaga qaytish
                </Button>
                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 5 }}>
                  <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 380px" }, bgcolor: isDark ? "#111" : "#fff", borderRadius: "24px", overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                    <img src={selectedDivision.head.img} style={{ width: "100%", height: "450px", objectFit: "cover" }} alt="Head" />
                    <Box sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedDivision.head.name}</Typography>
                      <Typography color={accentColor} sx={{ fontWeight: 700, mb: 3 }}>{selectedDivision.head.role}</Typography>
                      <ContactRow icon={<Phone size={18}/>} label="Aloqa" val={selectedDivision.head.phone} color={accentColor} />
                      <ContactRow icon={<Mail size={18}/>} label="Email" val={selectedDivision.head.email} color={accentColor} />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>{selectedDivision.name}</Typography>
                    <Typography sx={{ fontSize: "18px", opacity: 0.7, mb: 5, lineHeight: 1.8 }}>
                      {selectedDivision.desc}
                    </Typography>
                    <Button variant="contained" sx={{ bgcolor: accentColor, px: 5, py: 2, borderRadius: "16px", fontWeight: 800 }}>
                      Loyihalar bilan tanishish
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
      <TwoFooter />
    </Box>
  );
};

// Yordamchi komponent
const ContactRow = ({ icon, label, val, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
    <Box sx={{ color: color, bgcolor: `${color}15`, p: 1, borderRadius: "10px", display: "flex" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: "14px" }}>{val}</Typography>
    </Box>
  </Box>
);

const TwoCenters = () => (
  <ColorModeProvider>
    <TwoCentersContent />
  </ColorModeProvider>
);

export default TwoCenters;