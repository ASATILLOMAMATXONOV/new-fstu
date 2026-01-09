import React, { useState } from "react";
import { Box, Container, Typography, Stack, useTheme, alpha, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleOutline, 
  Public, 
  Bolt, 
} from "@mui/icons-material";

const mainBrandColor = "#02509eff";

// 1. HAR BIR USTUN UCHUN MA'LUMOTLAR VA LINKLAR
const chartData = [
  { label: "Bakalavriat", val: 85, stat: "92% Qabul", link: "https://fstu.uz/uz/page/bakalavriat" },
  { label: "Magistratura", val: 55, stat: "88% Yutuq", link: "https://fstu.uz/uz/page/magistratura" },
  { label: "Sirtqi", val: 75, stat: "95% Bandlik", link: "https://fstu.uz/uz/page/sirtqi-talim" },
  { label: "Qabul", val: 40, stat: "12k Ariza", link: "https://fstu.uz/uz/page/qabul" },
  { label: "Xalqaro", val: 90, stat: "24ta Grant", link: "https://fstu.uz/uz/page/xalqaro-aloqalar" },
  { label: "Stipendiya", val: 65, stat: "450+ Talaba", link: "https://fstu.uz/uz/page/stipendiyalar" },
  { label: "Ilmiy", val: 70, stat: "18ta Loyiha", link: "https://fstu.uz/uz/page/ilmiy-tadqiqot" },
];

const TwoAboutTo = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        py: { xs: 8, md: 15 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 8, lg: 12 },
          }}
        >
          {/* CHAP TOMON: MATNLAR */}
          <Box sx={{ flex: 1.1, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Stack spacing={4}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ width: 45, height: 4, bgcolor: mainBrandColor, borderRadius: 10 }} />
                  <Typography sx={{ color: mainBrandColor, fontWeight: 900, letterSpacing: 3, fontSize: "0.85rem", textTransform: "uppercase" }}>
                    FSTU GLOBAL ANALYTIKA
                  </Typography>
                </Stack>

                <Typography sx={{ fontWeight: 1000, fontSize: { xs: "2.2rem", md: "3.5rem" }, lineHeight: 1.1, color: "text.primary" }}>
                  Innovatsion Kelajak <br />
                  <Box component="span" sx={{ color: mainBrandColor }}>Raqamli Dunyoda</Box>
                </Typography>

                <Typography sx={{ color: "text.secondary", fontSize: "1.1rem", maxWidth: 580, lineHeight: 1.8 }}>
                  Universitetimizning har bir bo'limi bo'yicha real vaqt rejimidagi ko'rsatkichlar bilan tanishing.
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, pt: 2 }}>
                  {chartData.slice(0, 6).map((item, index) => (
                    <Box
                      key={index}
                      component={motion.a}
                      href={item.link}
                      target="_blank"
                      whileHover={{ x: 10 }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: { xs: "100%", sm: "calc(50% - 16px)" },
                        textDecoration: "none",
                        transition: "0.3s",
                      }}
                    >
                      <CheckCircleOutline sx={{ color: mainBrandColor, mr: 1.5, fontSize: 22 }} />
                      <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "1rem" }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </motion.div>
          </Box>

          {/* O'NG TOMON: INTERAKTIV NEON CHART */}
          <Box sx={{ flex: 0.9, width: "100%", display: "flex", justifyContent: "center" }}>
            <FuturisticFlexChart />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

/* --- ASOSIY CHART KOMPONENTI --- */
const FuturisticFlexChart = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, perspective: 1200, rotateY: 20 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{ width: "100%", }}
    >
      <Box
        sx={{
          position: "relative",
          p: { xs: 3, md: 5 },
          borderRadius: "20px",
          background: `linear-gradient(135deg, rgb(254 254 254 / 98%) 0%, ${alpha(mainBrandColor, 0.15)} 100%)`,
          backdropFilter: "blur(20px)",
          border: `2px solid ${alpha(mainBrandColor, 0.3)}`,
          boxShadow: `0 30px 60px ${alpha(mainBrandColor, 0.25)}`,
          overflow: "hidden",
        }}
      >
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 1000, color: mainBrandColor, }}>
                BO'LIMLAR STATUSI
              </Typography>
              <Typography sx={{ color: mainBrandColor, fontSize: 9, letterSpacing: 2, fontWeight: 800 }}>
                USTUNNI TANLANG
              </Typography>
            </Box>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
              <Public sx={{ color: mainBrandColor, fontSize: 35 }} />
            </motion.div>
          </Box>

          {/* 2. NEON USTUNLAR HUDUDI */}
          <Box 
            sx={{ 
              height: 220, 
              position: "relative", 
              display: "flex", 
              alignItems: "flex-end", 
              gap: 1.5, 
              px: 1, 
              zIndex: 2,
              pt: 5 // Hover badge uchun joy
            }}
          >
            {/* Hover bo'lgandagi Floating Badge */}
            <AnimatePresence>
              {hoveredIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -40, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}
                >
                  <Box sx={{ bgcolor: "#fff", px: 2, py: 0.8, borderRadius: "12px", border: `2px solid ${mainBrandColor}`, boxShadow: `0 0 20px ${mainBrandColor}` }}>
                    <Typography sx={{ color: mainBrandColor, fontWeight: 1000, fontSize: 13, whiteSpace: "nowrap" }}>
                      {chartData[hoveredIndex].stat}
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Raqamli Yer shari (Fonda sekin aylanadi) */}
            <Box sx={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", opacity: 0.1, zIndex: -1 }}>
              <Public sx={{ fontSize: 220, color: mainBrandColor }} />
            </Box>

            {/* Ustunlar (Bars) */}
            {chartData.map((item, i) => (
              <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Tooltip title={`${item.label}ga o'tish`} arrow placement="top">
                  <Box
                    component={motion.div}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => window.open(item.link, "_blank")}
                    whileHover={{ scaleX: 1.1, filter: "brightness(1.4)" }}
                    sx={{ width: "100%", position: "relative", cursor: "pointer" }}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${item.val * 1.5}px` }} // Balandlikni barqaror qilish
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{
                        width: "100%",
                        background: `linear-gradient(to top, transparent, ${mainBrandColor})`,
                        borderRadius: "8px 8px 2px 2px",
                        borderTop: `3px solid #fff`,
                        boxShadow: hoveredIndex === i 
                          ? `0 0 25px ${alpha(mainBrandColor, 0.6)}` 
                          : `0 0 10px ${alpha(mainBrandColor, 0.2)}`,
                        transition: "box-shadow 0.3s ease"
                      }}
                    />
                  </Box>
                </Tooltip>
                
                {/* Ustun ostidagi label (kichik ekranlarda ham sig'ishi uchun) */}
                <Typography sx={{ mt: 1.5, fontSize: 8, fontWeight: 900, color: hoveredIndex === i ? mainBrandColor : alpha("#000000ff", 0.4), transform: "rotate(-45deg)", whiteSpace: "nowrap", transition: "0.3s" }}>
                  {item.label.substring(0, 6)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Pastki Qism: Status Bar */}
          <Box sx={{ borderTop: `1px solid ${alpha("#fff", 0.1)}`, pt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 9, fontWeight: 900, color: mainBrandColor, letterSpacing: 3 }}>
                FSTU NETWORK: ONLINE
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {[1, 2, 3].map((s) => (
                   <motion.div key={s} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: s * 0.3, repeat: Infinity }}
                    style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: mainBrandColor }} />
                ))}
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </motion.div>
  );
};

export default TwoAboutTo;