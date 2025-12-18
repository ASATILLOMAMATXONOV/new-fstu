import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { Link } from "react-router-dom";
/* ===== ICONS ===== */
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "../../assets/styles/style.css";


/* ================= DATA ================= */
const quickLinks = [
  { label: "Fakultetlar", to: "/faculties" },
  { label: "Kafedralar", to: "/departments" },
  { label: "Markaz va bo‘limlar", to: "/centers" },
  { label: "Me’yoriy hujjatlar", to: "/documents" },
];

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
        boxShadow: "0 12px 28px var(--box-grid)",
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
          "&:hover": { bgcolor: "var(--box-grid)" },
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
    <>
    <Box sx={{ bgcolor: "#f4f7fa", py: 10 }}>
     
          {/* O'NG TOMON: ASIDE MENU */}
          <Box sx={{ width: { md: 320 } }}>
            <AsideMenu />
          </Box>

    </Box>
    </>
  );
}