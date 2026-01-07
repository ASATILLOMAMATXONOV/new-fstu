import React, { useState } from "react";
import { useTheme, useMediaQuery, Box, Typography, Button, IconButton, Avatar } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Zap, ShieldCheck,Building2, Phone, Mail, ArrowLeft,
  ExternalLink, Info, GraduationCap, Users, Award, 
  ChevronRight, ChevronLeft, ChevronDown, MapPin, Briefcase, Microscope
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

// --- ANIMATSIYA VARIANTLARI ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Elementlar ketma-ket chiqishi uchun
      delayChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } 
  }
};

const TwoDepartmentsContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const accentColor = theme.palette.primary.main;

  const [openFacId, setOpenFacId] = useState(1);
  const [selectedDept, setSelectedDept] = useState(null);

  const faculties = [
    {
      id: 1,
      title: "Axborot Texnologiyalari",
      icon: <Code2 size={20} />,
      departments: [
        {
          id: 101,
          name: "Dasturiy Injiniring",
          icon: <Code2 size={18} />,
          desc: "Kafedra zamonaviy dasturiy ta'minot yaratish texnologiyalari va bulutli hisoblashlar bo'yicha mutaxassislar tayyorlaydi. O'quv jarayonida xalqaro standartlarga asoslangan metodikalar qo'llaniladi.",
          head: {
            name: "Dr. Anvar Akramov",
            role: "Kafedra Mudiri, Dotsent",
            email: "a.akramov@fpi.uz",
            phone: "+998 90 123 45 67",
            office: "A-blok, 302-xona",
            bio: "15 yillik tajribaga ega dasturiy arxitektor. 40 dan ortiq xalqaro ilmiy maqolalar muallifi.",
            img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800"
          }
        },
        {
          id: 102,
          name: "Kiberxavfsizlik",
          icon: <ShieldCheck size={18} />,
          desc: "Axborot xavfsizligi, kriptografiya va tarmoq himoyasi yo'nalishida tadqiqotlar olib boriladi.",
          head: {
            name: "Prof. Sanjar Karimov",
            role: "Texnika fanlari doktori",
            email: "s.karimov@fpi.uz",
            phone: "+998 93 444 55 66",
            office: "B-blok, 105-xona",
            bio: "Kiber-mudofaa bo'yicha xalqaro ekspert. Ko'plab davlat loyihalari maslahatchisi.",
            img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800"
          }
        }
      ]
    },
    {
        id: 2,
        title: "Energetika fakulteti",
        icon: <Zap size={20} />,
        departments: [
          {
            id: 201,
            name: "Muqobil energiya manbalari",
            icon: <Zap size={18} />,
            desc: "Quyosh, shamol va vodorod energetikasi bo'yicha innovatsion loyihalar markazi.",
            head: {
              name: "PhD. Jamshid Boltayev",
              role: "Kafedra Mudiri",
              email: "j.boltayev@fpi.uz",
              phone: "+998 97 777 88 99",
              office: "Energo-korpus, 12-xona",
              bio: "Yashil energetika bo'yicha mutaxassis, Germaniyaning TU Berlin universiteti bitiruvchisi.",
              img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
            }
          }
        ]
      }
  ];

  const toggleFac = (id) => setOpenFacId(openFacId === id ? null : id);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      <Box sx={{ 
        maxWidth: "1600px", margin: "0 auto", 
        display: "flex", flexDirection: isMobile ? "column" : "row",
        pt: isMobile ? 2 : 8, px: isSmallMobile ? 2 : 4, pb: 10, gap: 5
      }}>
        
        {/* --- CHAP TOMON: ACCORDION NAVIGATION --- */}
        <Box sx={{ 
          flex: selectedDept && !isMobile ? "0 0 350px" : "1 1 350px",
          display: selectedDept && isMobile ? "none" : "block"
        }}>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: "24px", mb: 1, textTransform: "uppercase" }}>
            Fakultetlar
          </Typography>
          <Typography sx={{ opacity: 0.5, mb: 4, fontSize: "14px" }}>Kafedrani tanlang.</Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {faculties.map((fac) => {
              const isOpen = openFacId === fac.id;
              return (
                <Box key={fac.id} sx={{ 
                  overflow: "hidden", 
                  border: `1px solid ${isOpen ? accentColor : theme.palette.divider}`,
                  bgcolor: isOpen ? (isDark ? "#111" : "#fcfcfc") : "transparent",
                  transition: "0.3s"
                }}>
                  <Box 
                    onClick={() => toggleFac(fac.id)}
                    sx={{ 
                      p: 2.5, cursor: "pointer", display: "flex", alignItems: "center", 
                      justifyContent: "space-between",
                      "&:hover": { bgcolor: "action.hover" }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ color: isOpen ? accentColor : "inherit" }}>{fac.icon}</Box>
                      <Typography sx={{ fontWeight: 800 }}>{fac.title}</Typography>
                    </Box>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </Box>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                          {fac.departments.map((dept) => (
                            <Box
                              key={dept.id}
                              onClick={() => setSelectedDept(dept)}
                              sx={{
                                p: 2, borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
                                bgcolor: selectedDept?.id === dept.id ? accentColor : "transparent",
                                color: selectedDept?.id === dept.id ? "#fff" : "inherit",
                                "&:hover": { bgcolor: selectedDept?.id === dept.id ? accentColor : "action.selected" }
                              }}
                            >
                              {dept.icon}
                              <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>{dept.name}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* --- O'NG TOMON: DYNAMIC CONTENT WITH STAGGER ANIMATION --- */}
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {!selectedDept ? (
             <motion.div
      key="placeholder"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
      style={{ 
        height: "100%", 
        minHeight: "500px",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px"
      }}
    >
      {/* ANIMATSIYALI ICON KONTEYNERI */}
      <Box sx={{ position: "relative", mb: 4 }}>
        {/* Pulsatsiya qiluvchi fon halqalari */}
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.3, 0.1, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.8,
              ease: "easeOut" 
            }}
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: "50%",
              backgroundColor: accentColor,
              zIndex: 0
            }}
          />
        ))}

        {/* Suzib turuvchi asosiy icon */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100px",
            height: "100px",
            borderRadius: "30px",
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 20px 40px ${accentColor}33`,
            border: `1px solid ${accentColor}44`
          }}
        >
          <Building2 size={50} strokeWidth={1.5} color={accentColor} />
        </motion.div>
      </Box>

      {/* MATN ANIMATSIYASI */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: "center" }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800, 
            color: isDark ? "#fff" : "#333",
            mb: 1.5,
            letterSpacing: "-0.5px"
          }}
        >
          Kafedra tanlanmagan
        </Typography>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center", opacity: 0.5 }}>
          <Box 
            component={motion.div}
            animate={{ x: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronLeft size={18} color={accentColor} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>
            Ma'lumot ko'rish uchun chap menyudan tanlang
          </Typography>
        </Box>
      </motion.div>

      {/* FON UCHUN YENGIL BLUR */}
      <Box sx={{ 
        position: "absolute", 
        width: "300px", 
        height: "300px", 
        bgcolor: accentColor, 
        filter: "blur(150px)", 
        opacity: 0.05, 
        zIndex: -1 
      }} />
    </motion.div>
            ) : (
              <motion.div
                key={selectedDept.id}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -50 }}
              >
                <motion.div variants={fadeInUp}>
                  <Button startIcon={<ArrowLeft />} onClick={() => setSelectedDept(null)} sx={{ mb: 4, fontWeight: 800 }}>
                    Orqaga qaytish
                  </Button>
                </motion.div>

                <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 6 }}>
                  
                  {/* MUDIR CARD (3D HOVER) */}
                  <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 380px" } }}>
                    <motion.div variants={fadeInUp}>
                        <motion.div
                            whileHover={{ y: -10, rotateY: isMobile ? 0 : 8 }}
                            style={{
                                perspective: "1000px",  overflow: "hidden",
                                backgroundColor: isDark ? "#111" : "#fff",
                                boxShadow: "0 30px 60px rgba(0,0,0,0.1)",
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Box sx={{ width: "100%", aspectRatio: {xs: "1/1", md: "3/4"}, overflow: "hidden" }}>
                                <img src={selectedDept.head.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </Box>
                            <Box sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>{selectedDept.head.name}</Typography>
                                <Typography sx={{ color: accentColor, fontWeight: 700, fontSize: "13px", mb: 3, textTransform: "uppercase" }}>
                                    {selectedDept.head.role}
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <ContactRow icon={<Phone size={18}/>} label="Telefon" val={selectedDept.head.phone} color={accentColor} />
                                    <ContactRow icon={<Mail size={18}/>} label="Email" val={selectedDept.head.email} color={accentColor} />
                                    <ContactRow icon={<MapPin size={18}/>} label="Xona" val={selectedDept.head.office} color={accentColor} />
                                </Box>
                            </Box>
                        </motion.div>
                    </motion.div>
                  </Box>

                  {/* KAFEDRA INFO */}
                  <Box sx={{ flex: 1 }}>
                    <motion.div variants={fadeInUp}>
                        <Typography variant="overline" sx={{ letterSpacing: 3, fontWeight: 900, color: accentColor }}>Kafedra Haqida</Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: isSmallMobile ? "16px" : "25px" }}>{selectedDept.name}</Typography>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <Typography sx={{ fontSize: "18px", lineHeight: 1.8, opacity: 0.7, mb: 5 }}>
                            {selectedDept.desc} {selectedDept.head.bio}
                        </Typography>
                    </motion.div>

                    {/* STATS */}
                    <Box sx={{ display: "grid", gridTemplateColumns: isSmallMobile ? "1fr" : "repeat(3, 1fr)", gap: 2, mb: 6 }}>
                        {[
                            { icon: <Users />, val: "450+", lab: "Talabalar" },
                            { icon: <GraduationCap />, val: "18", lab: "O'qituvchilar" },
                            { icon: <Microscope />, val: "8", lab: "Laboratoriyalar" }
                        ].map((s, i) => (
                            <motion.div key={i} variants={fadeInUp}>
                                <Box sx={{ p: 3, borderRadius: "22px", border: "1px solid #02509eff" ,  textAlign: "center" }}>
                                    <Box sx={{ color: accentColor, mb: 1, display: "flex", justifyContent: "center" }}>{s.icon}</Box>
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{s.val}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.5 }}>{s.lab}</Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>

                    <motion.div variants={fadeInUp}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="contained"  sx={{ bgcolor: accentColor, px: 2, borderRadius: "12px", fontWeight: 600 }}>
                                Batafsil Ma'lumot
                            </Button>
                            <IconButton sx={{ border: "1px solid", borderColor: "divider", borderRadius: "16px", p: 2 }}>
                                <ExternalLink />
                            </IconButton>
                        </Box>
                    </motion.div>
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

// Helper
const ContactRow = ({ icon, label, val, color }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color: color, bgcolor: `${color}15`, p: 1, borderRadius: "10px", display: "flex" }}>{icon}</Box>
        <Box>
            <Typography variant="caption" sx={{ display: "block", opacity: 0.5, fontWeight: 700 }}>{label}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "14px" }}>{val}</Typography>
        </Box>
    </Box>
);

const TwoDepartments = () => (
  <ColorModeProvider>
    <TwoDepartmentsContent />
  </ColorModeProvider>
);

export default TwoDepartments;