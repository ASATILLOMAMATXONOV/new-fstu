import React, { useState } from "react";
import {
  useTheme, useMediaQuery, Box, Typography, Avatar, Chip,
  Paper, Grid, Divider, Accordion, AccordionSummary, AccordionDetails, IconButton
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
        id: "h1", name: "Dr. Anvar Akramov", role: "Kafedra Mudiri", degree: "PhD, Dotsent",
        specialty: "Sun'iy intellekt va Big Data arxitekturasi", phone: "+998 90 123 45 67", email: "a.akramov@fpi.uz",
        subjects: ["Dasturiy arxitektura", "AI asoslari"], works: "50 dan ortiq maqolalar, 3 ta patent va 2 ta darslik muallifi."
    },
    staff: [
      { 
        id: "s1", name: "S. Karimov", role: "Professor", degree: "Fan doktori (DSc)", 
        specialty: "Algoritmlar va optimallashtirish", phone: "+998 91 111 22 33", email: "karimov@fpi.uz",
        subjects: ["Ma'lumotlar tuzilmasi", "Murakkab algoritmlar"], works: "100 dan ortiq xalqaro maqolalar, 10 ta patent."
      },
      { 
        id: "s2", name: "M. Olimov", role: "Dotsent", degree: "PhD", 
        specialty: "Web va Mobil injiniring", phone: "+998 93 444 55 66", email: "olimov@fpi.uz",
        subjects: ["React JS", "Node JS", "Cloud Computing"], works: "Full-stack texnologiyalar bo'yicha amaliy qo'llanmalar muallifi."
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
          <Paper elevation={0} sx={{ borderRadius: "24px", overflow: "hidden", position: 'sticky', top: 100, border: "1px solid rgba(0,0,0,0.05)" }}>
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
                  <Box sx={{ width: "100%", height: "400px", borderRadius: "32px", overflow: "hidden", mb: 4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                    <img src={data.dept.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="dept" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>{data.dept.name}</Typography>
                  <Typography sx={{ fontSize: "1.1rem", opacity: 0.7, mb: 5, lineHeight: 1.8 }}>{data.dept.description}</Typography>
                  <Divider sx={{ mb: 4 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>Kafedra Rahbariyati</Typography>
                  <StaffAccordion person={data.head} accentColor={accentColor} expanded={expandedStaffId === data.head.id} onChange={handleStaffToggle} isHead={true} />
                </Box>
              )}

              {/* 2. XODIMLAR */}
              {activeSection === "staff" && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Kafedra jamoasi</Typography>
                  <StaffAccordion person={data.head} accentColor={accentColor} expanded={expandedStaffId === data.head.id} onChange={handleStaffToggle} isHead={true} />
                  {data.staff.map(p => (
                    <StaffAccordion key={p.id} person={p} accentColor={accentColor} expanded={expandedStaffId === p.id} onChange={handleStaffToggle} />
                  ))}
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