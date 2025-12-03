import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

// ===== COLORS (SKROMNIY) =====
const PRIMARY = "#3f68a5";
const MUTED = "#555";
const BORDER = "#e6e6e6";
const BG = "#ffffff";

// ===== DATA =====
const STATS = [
  { label: "Talabalar", value: 27768, icon: <SchoolIcon /> },
  { label: "Professorlar", value: 831, icon: <GroupIcon /> },
  { label: "Bitiruvchilar", value: 67270, icon: <EmojiEventsIcon /> },
  { label: "Kitob fondi", value: 257800, icon: <LibraryBooksIcon /> },
];

// ===== STAT CARD =====
function StatCard({ value, label, icon, start }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1200;
    const step = 20;
    const increment = Math.ceil(value / (duration / step));

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, step);

    return () => clearInterval(timer);
  }, [value, start]);

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 2,
        textAlign: "center",
        transition: "0.3s",
        "&:hover": {
          borderColor: PRIMARY,
          boxShadow: "0 6px 20px rgba(63,104,165,0.15)",
        },
      }}
    >
      {/* ICON */}
      <Box sx={{ color: PRIMARY, mb: 1 }}>{icon}</Box>

      {/* COUNT */}
      <Typography
        fontSize={{ xs: 32, md: 42 }}
        fontWeight={800}
        color={PRIMARY}
      >
        {count.toLocaleString("uz-UZ")}
      </Typography>

      {/* LABEL */}
      <Typography fontSize={16} color={MUTED}>
        {label}
      </Typography>
    </Box>
  );
}

// ===== MAIN =====
export default function UniversityNumbers() {
  const ref = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={ref} sx={{ py: { xs: 6, md: 10 },  }}>
      {/* CONTAINER */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        {/* HEADER */}
        <Box textAlign="center" mb={6}>
          <Typography
            fontSize={14}
            letterSpacing={3}
            color={PRIMARY}
            fontWeight={700}
            mb={1}
          >
            UNIVERSITET STATISTIKASI
          </Typography>

          <Typography
            fontSize={{ xs: 26, md: 36 }}
            fontWeight={800}
            color={PRIMARY}
            mb={2}
          >
            Universitet raqamlarda
          </Typography>

          <Typography color={MUTED} maxWidth={600} mx="auto">
            Ta’lim, ilm-fan va bilimlar bazasining bugungi holati
          </Typography>
        </Box>

        {/* GRID */}
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr 1fr",
            md: "repeat(4, 1fr)",
          }}
          gap={3}
        >
          {STATS.map((item, i) => (
            <StatCard key={i} {...item} start={start} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
