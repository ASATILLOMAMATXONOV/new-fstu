import React, { useState } from "react";
import {
  useTheme, useMediaQuery, Box, Typography, Avatar, Chip,
  Paper, Grid, Divider, Accordion, AccordionSummary, AccordionDetails, IconButton, alpha, Stack 
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info, Users, BookOpen, FileText, Handshake, ChevronDown,
  Phone, Mail, Award, GraduationCap, Briefcase, ExternalLink, Globe
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

// --- XODIM KARTASI (EXPANDABLE) ---
const StaffAccordion = ({ person, accentColor, expanded, onChange, isHead = false }) => (
  <Paper 
    elevation={0}
    sx={{ 
      mb: 2, borderRadius: "24px", overflow: "hidden",
      border: "1px solid",
      borderColor: expanded ? accentColor : "rgba(0,0,0,0.06)",
      transition: "all 0.3s ease",
      bgcolor: "white",
      boxShadow: expanded ? "0 10px 30px rgba(0,0,0,0.05)" : "none"
    }}
  >
    <Box 
      onClick={() => onChange(person.id)}
      sx={{ 
        p: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
        bgcolor: expanded ? `${accentColor}05` : "transparent",
        "&:hover": { bgcolor: expanded ? `${accentColor}08` : "#fcfcfc" }
      }}
    >
      <Avatar 
        src={person.img} 
        sx={{ width: { xs: 60, md: 80 }, height: { xs: 60, md: 80 }, border: `2px solid ${accentColor}20` }}
      >
        {person.name[0]}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Typography variant="overline" sx={{ color: accentColor, fontWeight: 800, letterSpacing: 1 }}>
          {isHead ? "KAFEDRA MUDIRI" : person.role.toUpperCase()}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1rem", md: "1.25rem" } }}>{person.name}</Typography>
        {!expanded && (
          <Typography variant="body2" sx={{ opacity: 0.6 }}>{person.degree}</Typography>
        )}
      </Box>

      <Box sx={{ 
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)", 
        transition: "0.4s", color: accentColor 
      }}>
        <ChevronDown />
      </Box>
    </Box>

    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Box sx={{ p: { xs: 2, md: 4 }, pt: 0 }}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={4}>
              {/* Aloqa bo'limi */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: accentColor, letterSpacing: 1 }}>ALOQA</Typography>
                <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}><Phone size={18} color={accentColor}/> <Typography variant="body2" sx={{ fontWeight: 600 }}>{person.phone}</Typography></Box>
                <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}><Mail size={18} color={accentColor}/> <Typography variant="body2" sx={{ fontWeight: 600 }}>{person.email}</Typography></Box>
                <Box sx={{ display: "flex", gap: 1.5 }}><Globe size={18} color={accentColor}/> <Typography variant="body2" sx={{ fontWeight: 600 }}>Google Scholar Profile</Typography></Box>
              </Grid>

              {/* Batafsil ma'lumot */}
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, fontSize: "0.85rem", color: accentColor, mb: 1 }}>
                    <GraduationCap size={18}/> ILMIY DARAJA VA YO'NALISH
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{person.degree}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>{person.specialty}</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, fontSize: "0.85rem", color: accentColor, mb: 1 }}>
                    <BookOpen size={18}/> O'TADIGAN FANLARI
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {person.subjects?.map((s, i) => <Chip key={i} label={s} size="small" variant="filled" sx={{ bgcolor: `${accentColor}15`, fontWeight: 600 }} />)}
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800, fontSize: "0.85rem", color: accentColor, mb: 1 }}>
                    <Award size={18}/> ILMIY ISHLARI VA NATIJALAR
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.8 }}>{person.works}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  </Paper>
);

const TwoDepartmentsContent = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const accentColor = theme.palette.primary.main;
  const [activeSection, setActiveSection] = useState("about");
  const [expandedStaffId, setExpandedStaffId] = useState(null);

  const handleStaffToggle = (id) => setExpandedStaffId(expandedStaffId === id ? null : id);

  const data = {
    dept: {
      name: "Dasturiy Injiniring Kafedrasi",
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200",
      description: "Kafedra 2010-yilda tashkil etilgan bo'lib, zamonaviy dasturiy ta'minot arxitekturasi, sun'iy intellekt va bulutli texnologiyalar yo'nalishida yuqori malakali mutaxassislar tayyorlaydi. Hozirda kafedrada 20 dan ortiq professor-o'qituvchilar faoliyat yuritmoqda.",
    },
  head: {
  id: "h1",
  name: "Dr. Anvar Akramov",
  role: "Kafedra Mudiri",
  degree: "PhD, Dotsent",
  specialty: "Sun'iy intellekt va Big Data arxitekturasi",
  phone: "+998 90 123 45 67",
  email: "a.akramov@fpi.uz",
  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400", // ✅
  subjects: ["Dasturiy arxitektura", "AI asoslari"],
  works: "50 dan ortiq maqolalar..."
},

staff: [
  {
    id: "s1",
    name: "S. Karimov",
    role: "Professor",
    degree: "Fan doktori (DSc)",
    specialty: "Algoritmlar",
    phone: "+998 91 111 22 33",
    email: "karimov@fpi.uz",
    img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400", // ✅
    subjects: ["Algoritmlar"],
    works: "100+ maqolalar."
  },
  {
    id: "s2",
    name: "M. Olimov",
    role: "Dotsent",
    degree: "PhD",
    specialty: "Web injiniring",
    phone: "+998 93 444 55 66",
    email: "olimov@fpi.uz",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400", // ✅
    subjects: ["React JS"],
    works: "Amaliy qo'llanmalar."
  }
],

    subjects: [
      { course: "1-KURS", list: [{ name: "Dasturlash asoslari", cr: 6, t: "Prof. S. Karimov" }, { name: "Matematik tahlil", cr: 4, t: "Dots. M. Aliyev" }] },
      { course: "2-KURS", list: [{ name: "Ma'lumotlar bazasi", cr: 5, t: "Dr. A. Akramov" }, { name: "Web texnologiyalar", cr: 6, t: "Dots. M. Olimov" }] }
    ],
    articles: [
      { title: "AI-based optimization in Cloud Systems", journal: "IEEE Explore", year: "2024", author: "A. Akramov" },
      { title: "Modern Web Security Protocols", journal: "Scopus: IT Review", year: "2023", author: "M. Olimov" }
    ],
    partners: [
      { name: "IT-Park Uzbekistan", type: "Hamkorlik shartnomasi", icon: <Briefcase /> },
      { name: "EPAM Systems", type: "Amaliyot markazi", icon: <Handshake /> }
    ]
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      <Box sx={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", pt: 8, px: { xs: 2, md: 4 }, pb: 10, gap: 5 }}>
        
        {/* NAVIGATSIYA MENYUSI */}
        <Box sx={{ flex: "0 0 300px" }}>
          <Paper elevation={0} sx={{  overflow: "hidden", position: 'sticky', top: 100, border: "1px solid rgba(0,0,0,0.05)" }}>
            {[
              { id: "about", title: "Kafedra haqida", icon: <Info size={20}/> },
              { id: "staff", title: "Xodimlar", icon: <Users size={20}/> },
              { id: "subjects", title: "Fanlar", icon: <BookOpen size={20}/> },
              { id: "articles", title: "Maqolalar", icon: <FileText size={20}/> },
              { id: "contracts", title: "Hamkorlik", icon: <Handshake size={20}/> }
            ].map((item) => (
              <Box 
                key={item.id} 
                onClick={() => setActiveSection(item.id)} 
                sx={{ 
                  p: 2.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 2, 
                  borderLeft: "6px solid", borderColor: activeSection === item.id ? accentColor : "transparent", 
                  bgcolor: activeSection === item.id ? `${accentColor}08` : "transparent",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.02)" }
                }}
              >
                <Box sx={{ color: activeSection === item.id ? accentColor : "text.secondary" }}>{item.icon}</Box>
                <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* ASOSIY KONTENT */}
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              
              {/* 1. HAQIDA */}
              {activeSection === "about" && (
                <Box>
                  <Box sx={{ width: "100%", height: "400px", borderRadius: "5px", overflow: "hidden", mb: 4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                    <img src={data.dept.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="dept" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>{data.dept.name}</Typography>
                  <Typography sx={{ fontSize: "1.1rem", opacity: 0.7, mb: 5, lineHeight: 1.8 }}>{data.dept.description}</Typography>
                  <Divider sx={{ mb: 4 }} />
                  
                </Box>
              )}

          {/* 2. XODIMLAR BO'LIMI - YANGI DIZAYN */}
          {activeSection === "staff" && (
            <Box 
              component={motion.div} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              sx={{ py: 2 }}
            >
              {/* Zamonaviy Sarlavha */}
              <Box sx={{ mb: 6, position: 'relative' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: isDarkMode ? "#fff" : "#000", letterSpacing: -1 }}>
                  Kafedra <Box component="span" sx={{ color: accentColor }}>Jamoasi</Box>
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 500, mt: 1, fontWeight: 500 }}>
                  Soha yetakchilari va tajribali mutaxassislar bilan tanishing.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {[data.head, ...data.staff].map((p, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box
                        onClick={() => window.open(`https://scholar.google.com/citations?user=${p.name}`, "_blank")}
                        sx={{ 
                          position: "relative",
                          cursor: "pointer",
                          height: 400,
                          overflow: "hidden",
                          bgcolor: "#1a1a1a",
                          "&:hover .info-box": { transform: "translateY(0)", opacity: 1 },
                          "&:hover .staff-img": { transform: "scale(1.1)", filter: "blur(2px) brightness(0.5)" },
                          "&:hover .bottom-name": { opacity: 0 }
                        }}
                      >
                        {/* ASOSIY RASM - To'liq rangli */}
                        <img 
                          className="staff-img"
                          src={p.img} 
                          alt={p.name} 
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover", 
                            transition: "0.7s cubic-bezier(0.4, 0, 0.2, 1)"
                          }} 
                        />

                        {/* DOIMIY ISM (PASTDA) - Chiroyli gradient bilan */}
                        <Box className="bottom-name" sx={{ 
                          position: 'absolute', bottom: 0, left: 0, right: 0, p: 3,
                          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                          transition: "0.3s ease"
                        }}>
                          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 900, lineHeight: 1.1 }}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: accentColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {p.role}
                          </Typography>
                        </Box>

                        {/* HOVER INFO - Noodatiy va Rangli */}
                        <Box 
                          className="info-box"
                          sx={{ 
                            position: 'absolute', inset: 0, p: 4,
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            bgcolor: alpha(isDarkMode ? "#000" : accentColor, 0.85),
                            backdropFilter: "blur(8px)",
                            color: "#fff",
                            opacity: 0,
                            transform: "translateY(100%)",
                            transition: "0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                            zIndex: 2
                          }}
                        >
                          <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 900 }}>Ilmiy daraja</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.2 }}>{p.degree}</Typography>
                          
                          <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 3 }} />

                          <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1, color: "#fff" }}>
                              {p.works.split(' ')[0]}<Box component="span" sx={{ fontSize: "1rem", ml: 1, opacity: 0.7 }}>maqola</Box>
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, mt: 1, display: 'block' }}>
                              {p.specialty}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                            <Box sx={{ p: 1, border: "1px solid rgba(255,255,255,0.3)", borderRadius: 0 }}>
                              <Mail size={16} />
                            </Box>
                            <Box sx={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 900 }}>PROFIL</Typography>
                              <ExternalLink size={12} />
                            </Box>
                          </Stack>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

              {/* 3. FANLAR */}
              {activeSection === "subjects" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>O'quv dasturi</Typography>
                  {data.subjects.map((course, i) => (
                    <Accordion key={i} elevation={0} sx={{ mb: 2, borderRadius: "20px !important", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <AccordionSummary expandIcon={<ChevronDown />}><Typography sx={{ fontWeight: 800 }}>{course.course}</Typography></AccordionSummary>
                      <AccordionDetails>
                        {course.list.map((sub, j) => (
                          <Paper key={j} sx={{ p: 2.5, mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.03)" }}>
                            <Box><Typography sx={{ fontWeight: 700 }}>{sub.name}</Typography><Typography variant="caption" sx={{ opacity: 0.6 }}>O'qituvchi: {sub.t}</Typography></Box>
                            <Chip label={`${sub.cr} Kredit`} color="primary" sx={{ fontWeight: 700 }} />
                          </Paper>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {/* 4. MAQOLALAR */}
              {activeSection === "articles" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Ilmiy nashrlar</Typography>
                  {data.articles.map((art, i) => (
                    <Paper key={i} sx={{ p: 3, mb: 2, borderRadius: "24px", borderLeft: `8px solid ${accentColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.1rem" }}>{art.title}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.6 }}>{art.author} | {art.journal} ({art.year})</Typography>
                      </Box>
                      <IconButton color="primary"><ExternalLink size={20}/></IconButton>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* 5. HAMKORLIK */}
              {activeSection === "contracts" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Strategik hamkorlar</Typography>
                  <Grid container spacing={3}>
                    {data.partners.map((con, i) => (
                      <Grid item xs={12} md={6} key={i}>
                        <Paper sx={{ p: 4, borderRadius: "28px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)", transition: "0.3s", "&:hover": { borderColor: accentColor } }}>
                          <Box sx={{ color: accentColor, mb: 2, display: "flex", justifyContent: "center" }}>{con.icon}</Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{con.name}</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>{con.type}</Typography>
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