import React, { useState } from "react";
import {
  useTheme,
  useMediaQuery,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Users,
  BookOpen,
  FileText,
  Handshake,
  ChevronRight,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Building2,
  Globe,
  Microscope,
  Award,
  Clock,
  Calendar,
  Layers,
  Calculator,
  Monitor
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

// --- YORDAMCHI KOMPONENTLAR ---
const InfoRow = ({ icon, label, val }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Box sx={{ color: "#fff", bgcolor: "primary.main", p: 0.8, borderRadius: "8px", display: "flex" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ display: "block", opacity: 0.5, fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>{val}</Typography>
    </Box>
  </Box>
);

const TwoDepartmentsContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const accentColor = theme.palette.primary.main;

  const [activeSection, setActiveSection] = useState("about");

  // --- MA'LUMOTLAR BAZASI ---
  const currentDept = {
    name: "Dasturiy Injiniring Kafedrasi",
    img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200",
    description: "Kafedra 2010-yilda tashkil etilgan bo'lib, zamonaviy dasturiy ta'minot arxitekturasi va sun'iy intellekt yo'nalishida yuqori malakali mutaxassislar tayyorlaydi.",
    head: {
      name: "Dr. Anvar Akramov",
      role: "Kafedra Mudiri, Dotsent",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400",
      phone: "+998 90 123 45 67",
      email: "a.akramov@fpi.uz",
      office: "A-blok, 302-xona"
    },
    staff: [
      { name: "S. Karimov", role: "Professor", bio: "Algoritmlar bo'yicha mutaxassis" },
      { name: "M. Olimov", role: "Dotsent", bio: "Web texnologiyalar eksperti" },
      { name: "A. Azimov", role: "Assistent", bio: "Mobil dasturlash o'qituvchisi" }
    ],
    articles: [
      { title: "AI in Modern Software Engineering", year: "2025", journal: "IEEE Explore" },
      { title: "Cloud computing security protocols", year: "2024", journal: "Springer" }
    ],
    contracts: [
      { company: "EPAM Systems", type: "Kadrlar tayyorlash", date: "2024-2027" },
      { company: "IT Park", type: "Stajirovka dasturi", date: "2025-2030" }
    ],
    subjectsData: [
      {
        course: 1,
        title: "1-kurs Fanlari",
        icon: <Calculator size={20} />,
        list: [
          { name: "Matematik analiz", credit: 6, semester: 1, teacher: "Prof. H. Alimov", hours: 144, type: "Majburiy" },
          { name: "Dasturlash asoslari", credit: 7, semester: 1, teacher: "Dots. S. Karimov", hours: 160, type: "Mutaxassislik" }
        ]
      },
      {
        course: 2,
        title: "2-kurs Fanlari",
        icon: <Layers size={20} />,
        list: [
          { name: "Ma'lumotlar tuzilmasi", credit: 6, semester: 3, teacher: "Dots. M. Olimov", hours: 144, type: "Mutaxassislik" }
        ]
      },
      {
        course: 3,
        title: "3-kurs Fanlari",
        icon: <Monitor size={20} />,
        list: [
          { name: "System Design", credit: 5, semester: 6, teacher: "Dr. A. Akramov", hours: 120, type: "Mutaxassislik" }
        ]
      }
    ]
  };

  const menuItems = [
    { id: "about", title: "Kafedra haqida", icon: <Info size={20} /> },
    { id: "staff", title: "Xodimlar", icon: <Users size={20} /> },
    { id: "subjects", title: "Fanlari", icon: <BookOpen size={20} /> },
    { id: "articles", title: "Maqolalari", icon: <FileText size={20} /> },
    { id: "contracts", title: "Shartnomalari", icon: <Handshake size={20} /> },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      <Box sx={{ 
        maxWidth: "1400px", margin: "0 auto", 
        display: "flex", flexDirection: isMobile ? "column" : "row",
        pt: 8, px: { xs: 2, md: 4 }, pb: 10, gap: 5
      }}>
        
        {/* --- CHAP MENYU --- */}
        <Box sx={{ flex: "0 0 320px" }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>MENYU</Typography>
          <Paper variant="outlined" sx={{ borderRadius: "20px", overflow: "hidden" }}>
            {menuItems.map((item) => (
              <Box
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                sx={{
                  p: 2.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
                  borderLeft: "4px solid",
                  borderColor: activeSection === item.id ? accentColor : "transparent",
                  bgcolor: activeSection === item.id ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)") : "transparent",
                  "&:hover": { bgcolor: "action.hover" }
                }}
              >
                <Box sx={{ color: activeSection === item.id ? accentColor : "text.secondary" }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: activeSection === item.id ? 800 : 600 }}>{item.title}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* --- O'NG TOMON --- */}
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 1. KAFEDRA HAQIDA */}
              {activeSection === "about" && (
                <Box>
                  <Box sx={{ width: "100%", height: "300px", borderRadius: "24px", overflow: "hidden", mb: 4 }}>
                    <img src={currentDept.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="dept" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>{currentDept.name}</Typography>
                  <Typography sx={{ fontSize: "18px", opacity: 0.7, mb: 4 }}>{currentDept.description}</Typography>
                  
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: "24px" }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={4} md={3}>
                        <Avatar src={currentDept.head.img} sx={{ width: 120, height: 120, border: `4px solid ${accentColor}` }} />
                      </Grid>
                      <Grid item xs={12} sm={8} md={9}>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{currentDept.head.name}</Typography>
                        <Typography sx={{ color: accentColor, fontWeight: 700, mb: 3 }}>{currentDept.head.role}</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}><InfoRow icon={<Phone size={16}/>} label="Telefon" val={currentDept.head.phone} /></Grid>
                          <Grid item xs={12} sm={6}><InfoRow icon={<Mail size={16}/>} label="Email" val={currentDept.head.email} /></Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {/* 2. XODIMLAR */}
              {activeSection === "staff" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Kafedra xodimlari</Typography>
                  <Grid container spacing={3}>
                    {currentDept.staff.map((person, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: "20px", textAlign: "center" }}>
                          <Avatar sx={{ width: 70, height: 70, mx: "auto", mb: 2, bgcolor: accentColor }}>{person.name[0]}</Avatar>
                          <Typography sx={{ fontWeight: 800 }}>{person.name}</Typography>
                          <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700 }}>{person.role}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* 3. FANLAR (KURS KESIMIDA) */}
              {activeSection === "subjects" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>O'quv rejasidagi fanlar</Typography>
                  {currentDept.subjectsData.map((courseGroup, idx) => (
                    <Accordion key={idx} sx={{ mb: 2, borderRadius: "16px !important", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
                      <AccordionSummary expandIcon={<ChevronDown color={accentColor} />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box sx={{ color: accentColor, bgcolor: `${accentColor}15`, p: 1, borderRadius: "10px" }}>{courseGroup.icon}</Box>
                          <Typography sx={{ fontWeight: 800 }}>{courseGroup.title}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {courseGroup.list.map((sub, i) => (
                          <Box key={i} sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={4}>
                                <Typography sx={{ fontWeight: 800 }}>{sub.name}</Typography>
                                <Chip label={sub.type} size="small" sx={{ mt: 1, fontSize: "10px" }} />
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
                                  <Award size={14} color={accentColor} /> Kredit: {sub.credit}
                                </Typography>
                                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 1, opacity: 0.6 }}>
                                  <Clock size={14} /> {sub.hours} soat
                                </Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>Semestr: {sub.semester}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.6 }}>{sub.teacher}</Typography>
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <Button fullWidth variant="outlined" size="small" sx={{ borderRadius: "8px" }}>Sillabus</Button>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {/* 4. MAQOLALAR */}
              {activeSection === "articles" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Ilmiy maqolalar</Typography>
                  {currentDept.articles.map((art, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 3, mb: 2, borderRadius: "16px" }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{art.title}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.6 }}>{art.journal} • {art.year}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* 5. SHARTNOMALAR */}
              {activeSection === "contracts" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Hamkorlik shartnomalari</Typography>
                  <Grid container spacing={3}>
                    {currentDept.contracts.map((con, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Paper sx={{ p: 3, borderRadius: "20px", borderLeft: `6px solid ${accentColor}` }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{con.company}</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>{con.type}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, mt: 1, display: "block" }}>{con.date}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
      <TwoFooter />
    </Box>
  );
};

const TwoDepartments = () => (
  <ColorModeProvider>
    <TwoDepartmentsContent />
  </ColorModeProvider>
);

export default TwoDepartments;