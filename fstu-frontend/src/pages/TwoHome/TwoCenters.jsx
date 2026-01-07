import React, { useState } from "react";
import {
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  Button,
  IconButton,
  Container,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";

import {
  Database,
  Archive,
  MessageSquare,
  FileText,
  FlaskConical,
  Users,
  Megaphone,
  ShieldCheck,
  BookOpen,
  Wallet,
  PenTool,
  Monitor,
  Globe,
  UserCheck,
  Scale,
  Layers,
  Calculator,
  GraduationCap,
  CheckCircle,
  TrendingUp,
  Star,
  School,
  Rocket,
  Zap,
  Phone,
  Mail,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Cpu,
  MapPin,
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";



// GIF fayllarni import qilish
import labsaratoyiya1 from "../../assets/videos/labsaratoyiya 1.gif";
import labsaratoyiya2 from "../../assets/videos/labsaratoyiya.gif";



const TwoCentersContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const accentColor = theme.palette.primary.main;

  const [openCenterId, setOpenCenterId] = useState(1);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

const handleNext = () => {
  setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
};

const handlePrev = () => {
  setCurrentSlide((prev) => (prev === slides.length - 0 ? slides.length - 1 : prev - 1));
};


  const centers = [
    {
      id: 1,
      title: "Markazlar",
      icon: <Cpu size={20} />,
      divisions: [
        {
          id: 101,
          name: "Axborot-resurs markazi",
          icon: <Rocket size={18} />,
          desc: "Ushbu bo'limda neyron tarmoqlari, mashinali o'rganish va katta ma'lumotlar bilan ishlash bo'yicha ilmiy-amaliy loyihalar amalga oshiriladi.",
          head: {
            name: "Dr. Rustam Karimov",
            role: "Markaz Rahbari, PhD",
            email: "r.karimov@fpi.uz",
            phone: "+998 90 321 65 43",
            office: "IT-Park, 2-qavat",
            img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
          }
        },
        {
          id: 102,
          name: "Raqamli ta'lim texnologiyalar markazi",
          icon: <Rocket size={18} />,
          desc: "Ushbu bo'limda neyron tarmoqlari, mashinali o'rganish va katta ma'lumotlar bilan ishlash bo'yicha ilmiy-amaliy loyihalar amalga oshiriladi.",
          head: {
            name: "Dr. Rustam Karimov",
            role: "Markaz Rahbari, PhD",
            email: "r.karimov@fpi.uz",
            phone: "+998 90 321 65 43",
            office: "IT-Park, 2-qavat",
            img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
          }
        },
        {
          id: 103,
          name: "Startap markazi",
          icon: <Rocket size={18} />,
          desc: "Ushbu bo'limda neyron tarmoqlari, mashinali o'rganish va katta ma'lumotlar bilan ishlash bo'yicha ilmiy-amaliy loyihalar amalga oshiriladi.",
          head: {
            name: "Dr. Rustam Karimov",
            role: "Markaz Rahbari, PhD",
            email: "r.karimov@fpi.uz",
            phone: "+998 90 321 65 43",
            office: "IT-Park, 2-qavat",
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
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 202,
          name: "Arxiv",
          icon: <Archive size={18} />,
          desc: "Muassasa hujjatlarini saqlash, tartibga solish va arxivlash bilan shug‘ullanuvchi bo‘lim.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 203,
          name: "Jismoniy va yuridik shaxslarning murojaatlari bilan ishlash, nazorat va monitoring bo'limi",
          icon: <MessageSquare size={18} />,
          desc: "Fuqarolar va tashkilotlar murojaatlarini ko‘rib chiqish, ijrosini nazorat qilish va monitoring olib borish.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 204,
          name: "Devonxona",
          icon: <FileText size={18} />,
          desc: "Kiruvchi va chiquvchi hujjatlar bilan ishlash, rasmiy yozishmalarni yuritish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 205,
          name: "Ilmiy-tadqiqotlar, innovatsiyalar va ilmiy-pedagogik kadrlarni tayyorlash bo‘limi",
          icon: <FlaskConical size={18} />,
          desc: "Ilmiy tadqiqotlar va innovatsion loyihalarni rivojlantirish hamda ilmiy kadrlarni tayyorlash bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 206,
          name: "Yoshlar bilan ishlash, ma’naviyat va ma’rifat bo’limi",
          icon: <Users size={18} />,
          desc: "Talabalar va yoshlar bilan ishlash, ma’naviy-ma’rifiy tadbirlarni tashkil etish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 207,
          name: "Marketing va talabalar amaliyoti bo'limi",
          icon: <Megaphone size={18} />,
          desc: "Marketing strategiyalari va talabalar amaliyotini tashkil etish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 208,
          name: "Mehnatni muhofaza qilish bo’limi",
          icon: <ShieldCheck size={18} />,
          desc: "Xodimlar xavfsizligi va mehnatni muhofaza qilish talablarini nazorat qiluvchi bo‘lim.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 209,
          name: "O’quv-uslubiy boshqarma",
          icon: <BookOpen size={18} />,
          desc: "O‘quv jarayonini metodik jihatdan ta’minlash va boshqarish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 210,
          name: "Moliya-rejalashtirish bo'limi",
          icon: <Wallet size={18} />,
          desc: "Moliyaviy rejalashtirish, budjet va xarajatlarni boshqarish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 211,
          name: "Tahririyat-noshirlik bo’limi",
          icon: <PenTool size={18} />,
          desc: "Ilmiy va o‘quv adabiyotlarini tahrirlash va nashr etish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 212,
          name: "O'qitishning texnik vositalari bo'limi",
          icon: <Monitor size={18} />,
          desc: "Ta’lim jarayonida foydalaniladigan texnik vositalarni boshqarish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 213,
          name: "Xalqaro hamkorlik bo´limi",
          icon: <Globe size={18} />,
          desc: "Xalqaro aloqalar va hamkorlik loyihalarini rivojlantirish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 214,
          name: "Xodimlar bo’limi",
          icon: <UserCheck size={18} />,
          desc: "Kadrlar bilan ishlash, ishga qabul qilish va rivojlantirish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 215,
          name: "Yuridik xizmat bo'limi",
          icon: <Scale size={18} />,
          desc: "Huquqiy masalalar va hujjatlar bilan ishlovchi bo‘lim.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 216,
          name: "2 – bo’lim",
          icon: <Layers size={18} />,
          desc: "Muassasaning maxsus faoliyat yo‘nalishlarini amalga oshiruvchi bo‘lim.", 
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 217,
          name: "Buxgalteriya",
          icon: <Calculator size={18} />,
          desc: "Moliyaviy hisobotlar va buxgalteriya hisobini yuritish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 218,
          name: "Magistratura bo‘limi",
          icon: <GraduationCap size={18} />,
          desc: "Magistratura ta’lim yo‘nalishlarini boshqarish va muvofiqlashtirish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 219,
          name: "Ta’lim sifatini nazorat qilish bo’limi",
          icon: <CheckCircle size={18} />,
          desc: "Ta’lim sifatini baholash va nazorat qilish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 220,
          name: "Ilmiy-innovatsion ishlanmalarni tijoratlashtirish bo’limi",
          icon: <TrendingUp size={18} />,
          desc: "Ilmiy ishlanmalarni amaliyotga joriy qilish va tijoratlashtirish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 221,
          name: "Iqtidorli talabalarning ilmiy tadqiqot faoliyatini tashkil etish bo'limi",
          icon: <Star size={18} />,
          desc: "Iqtidorli talabalar bilan ilmiy tadqiqotlar olib borishni tashkil etish bo‘limi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 222,
          name: "Sirtqi bo`lim",
          icon: <School size={18} />,
          desc: "Sirtqi ta’lim yo‘nalishlarini muvofiqlashtiruvchi bo‘lim.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },

        {
          id: 223,
          name: "Kelajakga qadam",
          icon: <Rocket size={18} />,
          desc: "Yoshlar tashabbuslari va kelajak loyihalarini rivojlantirish markazi.",
          head: {
                  name: "Dr. Rustam Karimov",
                  role: "Markaz Rahbari, PhD",
                  email: "r.karimov@fpi.uz",
                  phone: "+998 90 321 65 43",
                  office: "IT-Park, 2-qavat",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
                }
        },
      ]

    }
  ];

const slides = [
  {
    id: 1,
    title: "ILMIY LABORATORIYA",
    desc: "Innovatsion tadqiqotlar, zamonaviy texnologiyalar va yuqori aniqlik markazi.",
    gif: labsaratoyiya2 // Asosiy GIF
  },
  {
    id: 2,
    title: "KELAJAK TEXNOLOGIYALARI",
    desc: "Sun'iy intellekt va robototexnika olamiga xush kelibsiz.",
    gif: labsaratoyiya1 // Ikkinchi GIF
  }
];
  const toggleCenter = (id) => setOpenCenterId(openCenterId === id ? null : id);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", transition: "0.3s" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      <Box sx={{ 
        maxWidth: "1600px", margin: "0 auto", 
        display: "flex", flexDirection: isMobile ? "column" : "row",
        pt: { xs: 4, md: 8 }, px: { xs: 2, sm: 4 }, pb: 10, gap: { xs: 4, md: 6 }
      }}>
        
        {/* CHAP TOMON: NAVIGATSIYA */}
        <Box sx={{ 
          flex: selectedDivision && !isMobile ? "0 0 350px" : "1 1 350px",
          display: selectedDivision && isMobile ? "none" : "block"
        }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 4, color: "#02509eff", letterSpacing: "-1px", fontSize:'25px', fontFamily:' Arial, Helvetica, sans-serif;' }}>
            Markazlar va Bo'limlar
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {centers.map((center) => (
              <Box key={center.id} sx={{ 
                overflow: "hidden", 
                border: "1px solid",
                borderColor: openCenterId === center.id ? accentColor : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                bgcolor: openCenterId === center.id ? (isDark ? "rgba(255,255,255,0.03)" : "#fcfcfc") : "transparent",
                transition: "0.3s ease"
              }}>
                <Box onClick={() => toggleCenter(center.id)} sx={{ p: 2.5, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ color: openCenterId === center.id ? accentColor : "text.secondary" }}>{center.icon}</Box>
                    <Typography sx={{ fontWeight: 700, color: "text.primary" }}>{center.title}</Typography>
                  </Box>
                  {openCenterId === center.id ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                </Box>
                <AnimatePresence>
                  {openCenterId === center.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                        {center.divisions.map((div) => (
                          <Box key={div.id} onClick={() => setSelectedDivision(div)} sx={{
                            p: 2,  cursor: "pointer",
                            bgcolor: selectedDivision?.id === div.id ? accentColor : "transparent",
                            color: selectedDivision?.id === div.id ? "#fff" : "text.primary",
                            transition: "0.2s",
                            "&:hover": { bgcolor: selectedDivision?.id === div.id ? accentColor : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }
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
                  key="lab-intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: isMobile ? "500px" : "650px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "5px",
                    background: "#000",
                    border: `1px solid ${accentColor}20`,
                  }}
                >
                  {/* ANIMATSIYALI FON (GIF) */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 1 }}
                      style={{ position: "absolute", inset: 0, zIndex: 1 }}
                    >
                      <Box
                        component="img"
                        src={slides[currentSlide].gif}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.3) contrast(1.1)",
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* MARKAZIY KONTENT */}
                  <Box sx={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "800px", px: 4 }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Typography
                          variant="h2"
                          sx={{
                            fontWeight: 600,
                            color: "#fff",
                            fontSize:'25px', fontFamily:' Arial, Helvetica, sans-serif;',
                            textShadow: "0 0 30px rgba(0,0,0,0.8)",
                            mb: 2,
                          }}
                        >
                          {slides[currentSlide].title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "1rem",
                            maxWidth: "550px",
                            mx: "auto",
                            mb: 5,
                          }}
                        >
                          {slides[currentSlide].desc}
                        </Typography>
                      </motion.div>
                    </AnimatePresence>

                    {/* KIRISH TUGMASI */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        onClick={() => setSelectedDivision(centers[0].divisions[0])}
                        sx={{
                          bgcolor: accentColor,
                          color: "#fff",
                          px: 3,
                          py: 1,
                         fontFamily:' Arial, Helvetica, sans-serif;',
                          fontWeight: 600,
                          boxShadow: `0 10px 30px ${accentColor}40`,
                          "&:hover": { bgcolor: accentColor, filter: "brightness(1.2)" },
                        }}
                      >
                        Laboratoriyaga Kirish
                      </Button>
                    </motion.div>
                  </Box>

                  {/* SCANNER LINE */}
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      left: 0,
                      width: "100%",
                      height: "2px",
                      background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                      zIndex: 5,
                      opacity: 0.3,
                    }}
                  />

                  {/* --- PASTI O'NGDA JOYLASHSAN NAVIGATSIYA (< >) --- */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 30,
                      right: 30,
                      display: "flex",
                      gap: 2,
                      zIndex: 20,
                    }}
                  >
                    {/* CHAPGA TUGMASI */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        onClick={handlePrev}
                        sx={{
                          color: "#fff",
                          border: `1px solid rgba(255,255,255,0.2)`,
                          bgcolor: "rgba(255,255,255,0.05)",
                          backdropFilter: "blur(10px)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.15)", borderColor: accentColor },
                        }}
                      >
                        <ChevronLeft size={28} />
                      </IconButton>
                    </motion.div>

                    {/* O'NGGA TUGMASI */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        onClick={handleNext}
                        sx={{
                          color: "#fff",
                          border: `1px solid rgba(255,255,255,0.2)`,
                          bgcolor: "rgba(255,255,255,0.05)",
                          backdropFilter: "blur(10px)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.15)", borderColor: accentColor },
                        }}
                      >
                        <ChevronRight size={28} />
                      </IconButton>
                    </motion.div>
                  </Box>

                  {/* SLAYD RAQAMI (Kichik detal) */}
                  <Typography
                    sx={{
                      position: "absolute",
                      bottom: 40,
                      left: 40,
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 800,
                      zIndex: 10,
                      letterSpacing: 4,
                    }}
                  >
                    0{currentSlide + 1} / 0{slides.length}
                  </Typography>
                </motion.div>

            ) : (
              /* TANLANGAN BO'LIM MA'LUMOTI */
              <motion.div
                key={selectedDivision.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                style={{
                  position: "sticky",
                  top: 100,
                  zIndex: 10,
                }}
              >

                <Button 
                  startIcon={<ArrowLeft size={18} />} 
                  onClick={() => setSelectedDivision(null)} 
                  sx={{ mb: 2, fontWeight: 800,  color: "#02509eff"}}
                >
                  Orqaga qaytish
                </Button>
                
                <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: 4, md: 6 } }}>
                  {/* Rahbar Card */}
                  <Box sx={{ 
                    flex: { xs: "1 1 100%", lg: "0 0 380px" }, 
                    bgcolor: isDark ? "#111" : "#fff", 
                    overflow: "hidden", 
                    border: "1px solid", borderColor: "divider",
                    boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(0,0,0,0.05)"
                  }}>
                    <Box sx={{ height: "400px", position: "relative" }}>
                      <img src={selectedDivision.head.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Head" />
                      <Box sx={{ 
                        position: "absolute", bottom: 0, left: 0, right: 0, 
                        p: 3, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", color: "#fff"
                      }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedDivision.head.name}</Typography>
                        <Typography sx={{ opacity: 0.9, fontSize: "0.9rem" }}>{selectedDivision.head.role}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ p: 4 }}>
                      <ContactRow icon={<Phone size={18}/>} label="Aloqa" val={selectedDivision.head.phone} color={accentColor} />
                      <ContactRow icon={<Mail size={18}/>} label="Email" val={selectedDivision.head.email} color={accentColor} />
                      <ContactRow icon={<MapPin size={18}/>} label="Xona" val={selectedDivision.head.office} color={accentColor} />
                    </Box>
                  </Box>

                  {/* Kontent */}
                  <Box sx={{ flex: 1, pt: 2 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, color: "#02509eff", fontSize: { xs: "1rem", md: "2rem" }, letterSpacing: "-1px" }}>
                      {selectedDivision.name}
                    </Typography>
                    <Typography sx={{ fontSize: "1.1rem", color: "text.secondary", mb: 5, lineHeight: 1.8 }}>
                      {selectedDivision.desc}
                    </Typography>
                  <Button
  variant="contained"
  size="large"
  sx={{
    bgcolor: accentColor,
    px: 5,
    py: 1,
    borderRadius: "14px",
    fontWeight: 600,
    fontSize: "1rem",
    textTransform: "none", // Matnni asl holicha qoldirish
    boxShadow: `0 10px 25px ${accentColor}40`,
    position: "relative",
    overflow: "hidden",
    transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      bgcolor: accentColor,
      transform: "translateY(-5px)",
      boxShadow: `0 15px 35px ${accentColor}60`,
      "& .btn-icon": {
        transform: "translateX(8px) scale(1.2)",
      },
      "&::before": {
        left: "100%",
      }
    },
    // Yaltirash effekti (Shine effect)
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)",
      transition: "0.6s",
      zIndex: 1,
    }
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, position: "relative", zIndex: 2 }}>
    Batafsil
    
    <motion.div
      className="btn-icon"
      animate={{ 
        x: [0, 5, 0], // Doimiy sekin harakat
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      style={{ display: "flex", alignItems: "center" }}
    >
      <ChevronRight size={22} strokeWidth={3} />
    </motion.div>
  </Box>
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

const ContactRow = ({ icon, label, val, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
    <Box sx={{ color: color, bgcolor: `${color}15`, p: 1.2, borderRadius: "12px", display: "flex" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, display: "block", textTransform: "uppercase" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "text.primary" }}>{val}</Typography>
    </Box>
  </Box>
);

const TwoCenters = () => (
  <ColorModeProvider>
    <TwoCentersContent />
  </ColorModeProvider>
);

export default TwoCenters;