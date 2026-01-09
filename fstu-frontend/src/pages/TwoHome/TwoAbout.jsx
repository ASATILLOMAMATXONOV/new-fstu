import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  School,
  AccountBalance,
  LibraryBooks,
  WorkOutline,
  Settings,
  Apartment,
  PhoneInTalk,
  AutoGraph,
  Dashboard,
  Person,
  ArrowForward,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const digitalServices = [
  { name: "FSTU LIVE", icon: <AutoGraph />, url: "https://live.fstu.uz" },
  { name: "HEMIS OTM", icon: <Dashboard />, url: "https://hemis.fstu.uz" },
  { name: "HEMIS Student", icon: <Person />, url: "https://student.fstu.uz" },
  { name: "Unilibrary", icon: <LibraryBooks />, url: "https://lib.fstu.uz" },
  { name: "Bo'sh ish o'rinlari", icon: <WorkOutline />, url: "/twopages" },
];

const universityStructure = [
  { title: "Fakultetlar", desc: "O'quv-metodik bo'linmalar", icon: <School />, path: "/twofaculties" },
  { title: "Kafedralar", desc: "Ilmiy-nazariy markazlar", icon: <Apartment />, path: "/twodepartments" },
  { title: "Markazlar", desc: "Ma'muriy boshqaruv", icon: <Settings />, path: "/twocentrs" },
  { title: "Ma'muriyat", desc: "Rektorat va Kengash", icon: <AccountBalance />, path: "/administration" },
  { title: "Aloqa", desc: "+998 71 200 00 00", icon: <PhoneInTalk />, path: "/twocontact" },
];

const MotionPaper = motion(Paper);

const TwoAbout = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleNavigation = (url) => {
    if (url.startsWith("http")) window.open(url, "_blank");
    else navigate(url);
  };

  // Header animatsiyasi variantlari
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } 
    }
  };

  return (
    <Box sx={{ py: 8, bgcolor: theme.palette.background.default, overflow: "hidden" }}>
      <Container maxWidth="xl">
        
        {/* ✅ YUQORI HEADER QISMI */}
        <Box sx={{ mb: { xs: 6, md: 10 }, textAlign: "center" }}>
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Stack alignItems="center" spacing={2}>
              <motion.div variants={headerVariants}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <Box sx={{ width: 40, height: 3, bgcolor: "#02509e", borderRadius: 10 }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      fontSize: 13,
                      color: "#02509e",
                    }}
                  >
                    Raqamli Ekotizim
                  </Typography>
                  <Box sx={{ width: 40, height: 3, bgcolor: "#02509e", borderRadius: 10 }} />
                </Stack>
              </motion.div>

              <motion.div variants={headerVariants}>
                <Typography
                  sx={{
                    fontSize: { xs: "1rem", md: "2rem" },
                    fontWeight: 1000,
                    color: "text.primary",
                    lineHeight: 1.1,
                  }}
                >
                  Farg‘ona davlat texnika universiteti axborot tizimlari va bo‘linmalari haqida
                  ma'lumotlar
                </Typography>
              </motion.div>

              <motion.div variants={headerVariants}>
                <Typography
                  sx={{
                    color: "text.secondary",
                    maxWidth: 700,
                    fontSize: { xs: "0.9rem", md: "1.1rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Institut hayotidagi barcha raqamli xizmatlar, o'quv bo'linmalari va 
                  ma'muriy markazlar haqida ma'lumotlarni bitta platformada jamladik.
                </Typography>
              </motion.div>
            </Stack>
          </motion.div>
        </Box>

        <Grid container spacing={5}>
          {/* ✅ CHAP TOMON: AXBOROT TIZIMLARI (Chapdan surilib kiradi) */}
          <Grid item xs={12} lg={3}>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 1000, borderLeft: "5px solid #02509e", pl: 2 }}>
                Axborot tizimlari
              </Typography>
              <Stack spacing={2}>
                {digitalServices.map((service) => (
                  <MotionPaper
                    key={service.name}
                    whileHover={{ x: 10, borderColor: "#02509e" }}
                    onClick={() => handleNavigation(service.url)}
                    sx={{
                      p: 2.2,
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                      transition: "0.3s"
                    }}
                  >
                    <Box sx={{ 
                      mr: 2, 
                      width: 40, height: 40, 
                      borderRadius: 2, 
                      display: "grid", placeItems: "center",
                      bgcolor: alpha("#02509e", 0.08), 
                      color: "#02509e" 
                    }}>
                      {service.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{service.name}</Typography>
                    <ArrowForward sx={{ ml: "auto", fontSize: 16, opacity: 0.3 }} />
                  </MotionPaper>
                ))}
              </Stack>
            </motion.div>
          </Grid>

          {/* ✅ O'NG TOMON: BO'LINMALAR (O'ngdan surilib kiradi) */}
          <Grid item xs={12} lg={9}>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 1000, borderLeft: "5px solid #02509e", pl: 2 }}>
                Universitet bo‘linmalari
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    xl: "repeat(5, 1fr)", 
                  },
                }}
              >
                {universityStructure.map((item) => (
                  <MotionPaper
                    key={item.title}
                    whileHover={{ y: -10, borderColor: "#02509e", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      bgcolor: "background.paper",
                      transition: "0.3s",
                    }}
                  >
                    <Box sx={{ 
                      width: 50, height: 50, borderRadius: 3, mb: 2.5,
                      display: "grid", placeItems: "center", 
                      bgcolor: alpha("#02509e", 0.1), color: "#02509e" 
                    }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 1000, fontSize: 17, mb: 1, color: "text.primary" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, flexGrow: 1, fontSize: 13.5, lineHeight: 1.5 }}>
                      {item.desc}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "#02509e" }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>BATAFSIL</Typography>
                      <ArrowForward sx={{ fontSize: 16 }} />
                    </Stack>
                  </MotionPaper>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

// Helper funksiya shaffoflik uchun
const alpha = (color, opacity) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

export default TwoAbout;