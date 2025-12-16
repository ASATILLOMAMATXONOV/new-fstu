import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
  Divider
} from "@mui/material";
import { Link } from "react-router-dom";
import { hover, motion } from "framer-motion";

/* ===== ICONS ===== */
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SchoolIcon from "@mui/icons-material/School";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";


/* ===== ASSETS (Logolar uchun yo'llarni loyihangizga qarab tekshiring) ===== */
import atLogo from "../../assets/images/fakultet-logo/AT va T.png";
import eeLogo from "../../assets/images/fakultet-logo/ee.png";
import depLogo from "../../assets/images/fakultet-logo/A va Q.png";

/* ================= DATA ================= */
const faculties = [
  {
    id: 1,
    title: "Axborot texnologiyalari fakulteti",
    logo: atLogo,
    departments: [
      {
        name: "Dasturiy injiniring kafedrasi",
        logo: depLogo,
        mediaType: "video",
        mediaSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        name: "Axborot xavfsizligi kafedrasi",
        logo: depLogo,
        mediaType: "image",
        mediaSrc: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800",
      },
    ],
  },
  {
    id: 2,
    title: "Energetika muhandisligi fakulteti",
    logo: eeLogo,
    departments: [
      {
        name: "Elektr energetikasi kafedrasi",
        logo: depLogo,
        mediaType: "image",
        mediaSrc: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800",
      },
    ],
  },
];

const quickLinks = [
  { label: "Fakultetlar", to: "/faculties" },
  { label: "Kafedralar", to: "/departments" },
  { label: "Markaz va bo‘limlar", to: "/centers" },
  { label: "Me’yoriy hujjatlar", to: "/documents" },
];

/* ================= COMPONENTS ================= */

// Animatsiya komponenti
const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
);

// Sarlavha komponenti
const FacultyHeader = ({ title }) => (
  <Box sx={{ mb: 6, textAlign: "center" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Box sx={{ flex: 1, height: "2px", background: "linear-gradient(90deg, transparent, #0062ff)" }} />
      <Stack direction="row" spacing={1} alignItems="center">
        <SchoolIcon color="primary" />
        <Typography fontWeight={800} variant="h5" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, height: "2px", background: "linear-gradient(90deg, #0062ff, transparent)" }} />
    </Box>
  </Box>
);

// Yon menyu (Aside)
const AsideMenu = () => (
  <Paper
    sx={{
      p: 3,
      bgcolor: "var(--card-bg)",
      border: "1px solid var(--border-light)",
      position: { md: "sticky" },
      top: 120,
      transition: "0.3s",
      "&:hover": {
        borderColor: "var(--primary-blue)",
        boxShadow: "0 12px 28px rgba(63,104,165,.25)",
      },
    }}
  >
    {/* Qidiruv */}
    <Typography fontWeight={800} mb={1.5}>
      Qidiruv
    </Typography>

    <Box sx={{ display: "flex", mb: 3 }}>
      <TextField fullWidth size="small" placeholder="Qidiruv" />
      <Button
        sx={{
          ml: 1,
          minWidth: 44,
          bgcolor: "var(--primary-blue)",
          color: "#fff",
          "&:hover": { bgcolor: "#2f4f8f" },
        }}
      >
        <SearchIcon />
      </Button>
    </Box>

    {/* Tezkor havolalar */}
    <Typography fontWeight={800} mb={1.5}>
      Tezkor havolalar
    </Typography>

    <Stack spacing={0.5} mb={3}>
      {quickLinks.map((item) => (
        <Button
          key={item.to}
          component={Link}
          to={item.to}
          disableRipple
          sx={{
            justifyContent: "space-between",
            textTransform: "none",
            borderRadius: 2,
            px: 1.5,
            py: 1.2,
            color: "var(--text-dark)",
            position: "relative",
            overflow: "hidden",

            /* pastki chiziq */
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "0%",
              height: "2px",
              backgroundColor: "var(--primary-blue)",
              transition: "width 0.3s ease",
            },

            "&:hover": {
              color: "var(--primary-blue)",
              backgroundColor: "rgba(63,104,165,0.05)",
            },

            "&:hover::after": {
              width: "100%",
            },

            /* icon animatsiya */
            "& svg": {
              opacity: 0,
              transform: "translateX(-6px)",
              transition: "0.3s",
            },

            "&:hover svg": {
              opacity: 1,
              transform: "translateX(0)",
            },
          }}
        >
          {item.label}
          <ChevronRightIcon />
        </Button>
      ))}
    </Stack>

    {/* Interaktiv xizmatlar */}
    <Typography fontWeight={800} mb={1.5}>
      Interaktiv xizmatlar
    </Typography>

    <Button
      fullWidth
      component={Link}
      to="/housing-application"
      endIcon={<ChevronRightIcon />}
      sx={{
        justifyContent: "space-between",
        textTransform: "none",
        borderRadius: 2,
        px: 2,
        py: 1.4,
        fontWeight: 600,
        bgcolor: "rgba(63,104,165,0.08)",
        color: "var(--primary-blue)",
        "&:hover": {
          bgcolor: "rgba(63,104,165,0.15)",
        },
      }}
    >
      Talabalar turar joyi uchun ariza berish
    </Button>
  </Paper>
);

/* ================= MAIN PAGE ================= */
export default function FacultiesPage() {
  return (
    <Box sx={{ bgcolor: "#f4f7fa", py: 10 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={6}>
          
          {/* ASOSIY KONTENT */}
          <Box flex={1}>
            {faculties.map((fac, facIndex) => (
              <Box key={fac.id} sx={{ mb: 12 }}>
                
                <FadeUp>
                  <FacultyHeader title={fac.title} />
                  <Box
                    component="img"
                    src={fac.logo}
                    alt={fac.title}
                    sx={{ height: 100, mx: "auto", display: "block", mb: 6, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))" }}
                  />
                </FadeUp>

                <Typography
                  fontWeight={800}
                  textAlign="center"
                  mb={4}
                  color="text.secondary"
                  sx={{ fontSize: "0.85rem", textTransform: "uppercase", opacity: 0.7 }}
                >
                  Fakultet kafedralari
                </Typography>

             {/* KAFEDRA KARTALARI RO'YXATI */}
<Stack spacing={4}>
  {fac.departments.map((dep, i) => (
    <FadeUp delay={i * 0.15} key={i}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: { xs: "auto", md: 240 },
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.05)",
          transition: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-10px)",
            borderColor: "var(--primary-blue)",
        boxShadow: "0 12px 28px rgba(63,104,165,.25)",
            "& .media-box": { transform: "scale(1.05)" },
            "& .action-btn": { bgcolor: "#fff", color: "primary.main" }
          }
           
        }}
      >
        {/* CHAP QISIM: MEDIA (Video/Rasm) */}
        <Box
          className="media-box"
          sx={{
            width: { xs: "100%", md: "35%" },
            position: "relative",
            minHeight: { xs: 220, md: "100%" },
            overflow: "hidden",
            transition: "0.6s ease",
            zIndex: 2,
          }}
        >
          {dep.mediaType === "video" ? (
            <Box sx={{ height: "100%", position: "relative" }}>
              <video
                src={dep.mediaSrc}
                muted loop autoPlay playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box sx={{ width: 45, height: 45, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  ▶
                </Box>
              </Box>
            </Box>
          ) : (
            <Box component="img" src={dep.mediaSrc} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          
          {/* Talabalar soni badji (Media ustida) */}
          <Box sx={{
            position: "absolute", top: 20, left: 20,
            bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)",
            px: 2, py: 0.5, borderRadius: "10px", display: "flex", alignItems: "center", gap: 1
          }}>
            <PeopleAltIcon sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="caption" fontWeight={800} color="text.primary">
              {dep.studentCount || "450"}+ talaba
            </Typography>
          </Box>
        </Box>

        {/* O'NG QISIM: MA'LUMOTLAR */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative"
           

          }}
        >
          {/* Kafedra nomi va Icon */}
          <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
            <Box sx={{ 
              p: 1.5, bgcolor: "primary.main", borderRadius: "14px", 
              boxShadow: "0 8px 20px rgba(0, 98, 255, 0.3)", display: "flex" 
            }}>
              <Box component="img" src={dep.logo} sx={{ width: 70, filter: "brightness(0) invert(1)" }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ lineHeight: 1.2 }}>
                {dep.name}
              </Typography>
              <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ textTransform: "uppercase" }}>
                Kafedra turi: Mutaxassislik
              </Typography>
            </Box>
          </Stack>

    
          <Divider sx={{ mb: 3, opacity: 0.6,  }} />

          {/* Harakat tugmasi va qo'shimcha info */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
             <Stack direction="row" spacing={3} >
                <Box>
                   <Typography variant="caption" color="text.secondary" display="block">Yo'nalishlar</Typography>
                   <Typography variant="subtitle2" fontWeight={700}>4 ta</Typography>
                </Box>
                <Box>
                   <Typography variant="caption" color="text.secondary" display="block">Laboratoriyalar</Typography>
                   <Typography variant="subtitle2" fontWeight={700}>6 ta</Typography>
                </Box>
             </Stack>

             <Button
                className="action-btn"
                component={Link}
                to={`/department/${i}`}
                variant="contained"
                endIcon={<ChevronRightIcon />}
                sx={{
                  borderRadius: "12px", px: 4, py: 1.2, textTransform: "none", fontWeight: 700,
                  transition: "0.3s"
                }}
              >
                Kirish
              </Button>
          </Stack>
        </Box>
      </Box>
    </FadeUp>
  ))}
</Stack>
              </Box>
            ))}
          </Box>

          {/* O'NG TOMON: ASIDE MENU */}
          <Box sx={{ width: { md: 320 } }}>
            <AsideMenu />
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}