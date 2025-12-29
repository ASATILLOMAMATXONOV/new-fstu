import React, { useState } from "react";
import {
  useTheme, Box, Container, Typography, TextField,
  Button, Paper, MenuItem, Avatar, IconButton, Stack, alpha, 
  List, ListItemButton, ListItemIcon, ListItemText, Divider, Grid, Card
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, MapPin, Send, MessageSquare,
  Globe, BookOpen, CheckCircle2, Headphones, 
  ChevronRight, FileText, UserPlus, GraduationCap, 
  Info, Download, Clock, Calendar, CheckCircle, User,          // Qo'shildi
  Mail,
} from "lucide-react";

import ColorModeProvider from "../../components/theme/ColorModeContext";
import TwoNavbar from "../../pages/TwoHome/TwoNavbar";
import TwoAboutBanner from "../../pages/TwoHome/TwoAboutBanner";
import TwoFooter from "../../pages/TwoHome/TwoFooter";

const MAIN_COLOR = "#02509e";

const TwoContactContent = () => {
  const theme = useTheme();
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState("call");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const menuItems = [
    { id: "call", label: "Call Markaz", icon: <Headphones size={20} /> },
    { id: "transfer", label: "O'qishni ko'chirish", icon: <GraduationCap size={20} /> },
    { id: "science", label: "Ilmiy maqolalar", icon: <FileText size={20} /> },
    { id: "admission", label: "Qabul (Kirish)", icon: <UserPlus size={20} /> },
    { id: "form", label: "Murojaat qoldirish", icon: <MessageSquare size={20} /> },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <TwoNavbar />
      <TwoAboutBanner />

      
      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 18 }, pb: 10 }}>
        <Box sx={{ 
          display: "flex", 
          gap: { md: 4, lg: 6 }, 
          alignItems: "flex-start", 
          flexDirection: { xs: "column", md: "row" } 
        }}>
          
          {/* ================= ASIDE (MUSTAQIL NAVIGATSIYA) ================= */}
          <Box component="aside" sx={{ width: { xs: "100%", md: 300 }, position: { md: "sticky" }, top: 110, flexShrink: 0 }}>
            <Paper elevation={0} sx={{ 
              p: 2,  border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}>
              <Typography variant="overline" sx={{ px: 2, pt: 1, display: "block", fontWeight: 900, color: MAIN_COLOR, letterSpacing: 2 }}>
                Menus
              </Typography>
              <List sx={{ mt: 1 }}>
                {menuItems.map((item) => (
                  <ListItemButton
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    selected={activeTab === item.id}
                    sx={{
                     mb: 0.5, py: 1.5,
                      "&.Mui-selected": {
                        bgcolor: alpha(MAIN_COLOR, 0.1), color: MAIN_COLOR,
                        "& .MuiListItemIcon-root": { color: MAIN_COLOR },
                        "&:hover": { bgcolor: alpha(MAIN_COLOR, 0.15) }
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }} />
                    {activeTab === item.id && <ChevronRight size={16} />}
                  </ListItemButton>
                ))}
              </List>
            </Paper>

            <Card elevation={0} sx={{ mt: 3, p: 2.5,  bgcolor: alpha(MAIN_COLOR, 0.03), border: `1px solid ${alpha(MAIN_COLOR, 0.1)}` }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Clock size={18} color={MAIN_COLOR} />
                  <Typography variant="caption" fontWeight={700}>09:00 — 18:00 (Dush-Shan)</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Calendar size={18} color={MAIN_COLOR} />
                  <Typography variant="caption" fontWeight={700}>Dam olish kuni: Yakshanba</Typography>
                </Stack>
              </Stack>
            </Card>
          </Box>

          {/* ================= SECTION (DINAMIK KONTENT) ================= */}
          <Box component="section" sx={{ flexGrow: 1, minWidth: 0, width: "100%" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                
                {activeTab === "call" && (
                  <Box>
                    <HeaderTitle title="Call Markaz" subtitle="Mutaxassislarimiz sizga yordam berishga tayyor." />
                    <Grid container spacing={3}>
                      <Grid item xs={12}><StaffCard name="Jasurbek Asqarov" pos="Texnik koordinatori" room="102" tel="+998 73 244 00 11" /></Grid>
                      <Grid item xs={12}><StaffCard name="Malika Sodiqova" pos="Xalqaro aloqalar mas'uli" room="205" tel="+998 73 244 00 22" /></Grid>
                    </Grid>
                  </Box>
                )}

                {activeTab === "transfer" && (
                  <Box>
                    <HeaderTitle title="O'qishni ko'chirish" subtitle="Hujjatlar va transfer shartlari." />
                    <Paper sx={{ p: 4, border: `1px solid ${theme.palette.divider}` }}>
                       <Typography variant="h6" fontWeight={800} mb={3}>Kerakli hujjatlar:</Typography>
                       <Stack spacing={2}>
                          {["Talaba arizasi", "Reyting daftarchasi", "Passport nusxasi"].map((item, idx) => (
                            <Stack key={idx} direction="row" spacing={2} alignItems="center">
                              <CheckCircle size={20} color={MAIN_COLOR} />
                              <Typography fontWeight={600} variant="body2">{item}</Typography>
                            </Stack>
                          ))}
                       </Stack>
                       <Button startIcon={<Download size={18} />} variant="contained" sx={{ mt: 4,  "&:hover": { bgcolor: alpha(MAIN_COLOR, 0.9) } }}>
                         Yo'riqnomani yuklash
                       </Button>
                    </Paper>
                  </Box>
                )}

                {activeTab === "science" && (
                  <Box>
                    <HeaderTitle title="Ilmiy maqolalar" subtitle="Nashrlar bo'yicha ma'lumotlar." />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}><InfoCard title="Scopus & WOS" text="Xalqaro metodika." /></Grid>
                      <Grid item xs={12} sm={6}><InfoCard title="OAK jurnallari" text="Milliy nashrlar." /></Grid>
                    </Grid>
                  </Box>
                )}

                {activeTab === "admission" && (
                  <Box>
                    <HeaderTitle title="Qabul jarayoni" subtitle="Talaba bo'lish imkoniyati." />
                    <Paper sx={{ p: 4,   border: `2px solid ${MAIN_COLOR}` }}>
                       <Typography variant="h5" fontWeight={900} color={MAIN_COLOR}>Qabul-2024 ochiq!</Typography>
                       <Button variant="contained" sx={{ mt: 3,  }}>Topshirishga o'tish</Button>
                    </Paper>
                  </Box>
                )}

                {activeTab === "form" && (
                <Box>
                    <HeaderTitle 
                    title="Murojaat yo'llash" 
                    subtitle="Savollaringizni qoldiring, biz tezda javob beramiz." 
                    />
                    
                    <Paper 
                    elevation={0}
                    sx={{ 
                        p: { xs: 3, md: 5 }, 
                        border: `1px solid ${alpha(MAIN_COLOR, 0.1)}`,
                        bgcolor: "#ffffff",
                        borderRadius: "2px" 
                    }}
                    >
                <form onSubmit={handleSubmit}>

                {/* ================= INPUTLAR QISMI (FLEX) ================= */}
                <Box
                    sx={{
                    display: "flex",
                    gap: 4,
                    mb: 4,
                    flexWrap: { xs: "wrap", md: "nowrap" }, // mobile’da pastga tushadi
                    }}
                >
                    {/* ===== CHAP TARAF (50%) ===== */}
                    <Box sx={{ flex: 1 }}>
                    <Stack spacing={3}>
                        {[
                        {
                            label: "F.I.SH",
                            placeholder: "Ismingizni kiriting",
                            icon: <User size={18} />,
                        },
                        {
                            label: "EMAIL MANZIL",
                            placeholder: "example@mail.com",
                            icon: <Mail size={18} />,
                            type: "email",
                        },
                        {
                            label: "TELEFON",
                            placeholder: "+998 -- --- -- --",
                            icon: <Phone size={18} />,
                        },
                        {
                            label: "TELEGRAM",
                            placeholder: "@username",
                            icon: <Send size={18} />,
                        },
                        ].map((field, i) => (
                        <Box key={i}>
                            <Typography
                            variant="caption"
                            sx={{
                                color: MAIN_COLOR,
                                fontWeight: 900,
                                mb: 0.5,
                                display: "block",
                                letterSpacing: "1px",
                            }}
                            >
                            {field.label}
                            </Typography>

                            <TextField
                            fullWidth
                            variant="standard"
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            InputProps={{
                                startAdornment: (
                                <Box sx={{ mr: 1, color: MAIN_COLOR }}>
                                    {field.icon}
                                </Box>
                                ),
                            }}
                            sx={{
                                "& .MuiInput-underline:after": {
                                borderBottomColor: MAIN_COLOR,
                                },
                            }}
                            />
                        </Box>
                        ))}
                    </Stack>
                    </Box>

                    {/* ===== O‘NG TARAF (50%) ===== */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography
                        variant="caption"
                        sx={{
                        color: MAIN_COLOR,
                        fontWeight: 900,
                        mb: 0.5,
                        display: "block",
                        letterSpacing: "1px",
                        }}
                    >
                        XABARINGIZ
                    </Typography>

                    <TextField
                        fullWidth
                        multiline
                        rows={11}
                        variant="outlined"
                        placeholder="Savolingizni bu yerga batafsil yozishingiz mumkin..."
                        sx={{
                        flexGrow: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "4px",
                            bgcolor: alpha(MAIN_COLOR, 0.02),
                            "& fieldset": {
                            borderColor: alpha(MAIN_COLOR, 0.25),
                            },
                            "&:hover fieldset": {
                            borderColor: MAIN_COLOR,
                            },
                            "&.Mui-focused fieldset": {
                            borderColor: MAIN_COLOR,
                            },
                        },
                        }}
                    />
                    </Box>
                </Box>

                {/* ================= YUBORISH TUGMASI (ALOHIDA) ================= */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        py: 2,
                        px: { xs: 6, md: 14 },
                        fontWeight: 900,
                        bgcolor: MAIN_COLOR,
                        borderRadius: "4px",
                        letterSpacing: "1px",
                        "&:hover": {
                        bgcolor: "#013d7a",
                        boxShadow: `0 10px 30px ${alpha(MAIN_COLOR, 0.4)}`,
                        },
                    }}
                    >
                    MUROJAATNI YUBORISH
                    </Button>
                </Box>

                </form>



                    </Paper>
                </Box>
                )}

              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      </Container>
      <TwoFooter />
    </Box>
  );
};

/* ================= YORDAMCHI KOMPONENTLAR ================= */

const HeaderTitle = ({ title, subtitle }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" fontWeight={800} sx={{ color: "#02509eff", letterSpacing: "-1px", fontSize: "1.5rem" }}>{title}</Typography>
    <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>
    <Divider sx={{ mt: 3, width: 60, height: 4,  bgcolor: MAIN_COLOR }} />
  </Box>
);

const StaffCard = ({ name, pos, room, tel }) => (
  <Paper elevation={0} sx={{ p: 3,  border: "1px solid", borderColor: "divider", transition: "0.3s", "&:hover": { borderColor: MAIN_COLOR } }}>
    <Stack direction="row" spacing={3} alignItems="center">
      <Avatar sx={{ width: 60, height: 60, bgcolor: MAIN_COLOR, fontWeight: 800 }}>{name[0]}</Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight={800}>{name}</Typography>
        <Typography variant="caption" sx={{ color: MAIN_COLOR, fontWeight: 700, textTransform: "uppercase" }}>{pos}</Typography>
        <Stack direction="row" spacing={4} mt={1}>
           <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: 0.7 }}><MapPin size={14}/> {room}-xona</Typography>
           <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}><Phone size={14}/> {tel}</Typography>
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

const InfoCard = ({ title, text }) => (
  <Paper sx={{ p: 3, height: "100%",  borderLeft: `4px solid ${MAIN_COLOR}`, bgcolor: alpha(MAIN_COLOR, 0.02) }}>
    <Typography variant="h6" fontWeight={600} color={MAIN_COLOR}>{title}</Typography>
    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>{text}</Typography>
  </Paper>
);

const TwoContact = () => (
  <ColorModeProvider>
    <TwoContactContent />
  </ColorModeProvider>
);

export default TwoContact;