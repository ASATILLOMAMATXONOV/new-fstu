import React, { useState } from "react";
import { Box, Container, Typography, Stack, useTheme, alpha, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleOutline, 
  Public, 
} from "@mui/icons-material";

import imgbg from "../../assets/images/L_height.webp";
const mainBrandColor = "#ffffffff";

const chartData = [
  { label: "Bakalavriat", val: 85, stat: "92% Qabul", link: "#" },
  { label: "Magistratura", val: 55, stat: "88% Yutuq", link: "#" },
  { label: "Sirtqi", val: 75, stat: "95% Bandlik", link: "#" },
  { label: "Qabul", val: 40, stat: "12k Ariza", link: "#" },
  { label: "Xalqaro", val: 90, stat: "24ta Grant", link: "#" },
  { label: "Stipendiya", val: 65, stat: "450+ Talaba", link: "#" },
  { label: "Ilmiy", val: 70, stat: "18ta Loyiha", link: "#" },
];

const TwoAboutTo = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        py: { xs: 8, md: 15 },
        // FON RASMI VA OVERLAY
       backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.51)), url(${imgbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed", // Parallax effekti
        color: "#fff",
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
                  <Typography sx={{ color: mainBrandColor, fontWeight: 800, letterSpacing: 1, fontSize: "1rem", textTransform: "uppercase" }}>
                    FSTU GLOBAL ANALYTIKA
                  </Typography>
                </Stack>

                <Typography sx={{ fontWeight: 800, fontSize: { xs: "2.5rem", md: "3.5rem" }, lineHeight: 1.1 }}>
                  Kelajak <Box component="span" sx={{ color: mainBrandColor }}>Statistikasi</Box>
                </Typography>

                <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", maxWidth: 580, lineHeight: 1.8 }}>
                  Universitetimizning har bir bo'limi bo'yicha real vaqt rejimidagi ko'rsatkichlar bilan tanishing.
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {chartData.slice(0, 6).map((item, index) => (
                    <Box
                      key={index}
                      component={motion.a}
                      href={item.link}
                      whileHover={{ scale: 1.05, x: 10 }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: { xs: "100%", sm: "calc(50% - 16px)" },
                        textDecoration: "none",
                        p: 2,
                        borderRadius: "12px",
                        bgcolor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "0.3s",
                      }}
                    >
                      <CheckCircleOutline sx={{ color: mainBrandColor, mr: 1, fontSize: 22 }} />
                      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </motion.div>
          </Box>

          {/* O'NG TOMON: INTERAKTIV GLASS CHART */}
          <Box sx={{ flex: 0.9, width: "100%", display: "flex", justifyContent: "center" }}>
            <FuturisticFlexChart />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

/* --- ASOSIY CHART KOMPONENTI (GLASSMORPHISM) --- */
const FuturisticFlexChart = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, perspective: 1200, rotateY: 20 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
      style={{ width: "100%" }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: "32px",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        <Stack spacing={4}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 1000, color: "#fff" }}>
                LIVE STATUS
              </Typography>
              <Typography sx={{ color: mainBrandColor, fontSize: 10, letterSpacing: 2, fontWeight: 800 }}>
                BO'LIMLAR STATUSI
              </Typography>
            </Box>
            <Public sx={{ color: mainBrandColor, fontSize: 40 }} />
          </Box>

          <Box sx={{ height: 220, display: "flex", alignItems: "flex-end", gap: 2, px: 1 }}>
            {chartData.map((item, i) => (
              <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Tooltip title={item.stat} arrow placement="top" open={hoveredIndex === i}>
                  <Box
                    component={motion.div}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    sx={{ width: "100%", position: "relative", cursor: "pointer" }}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${item.val * 2}px` }}
                      transition={{ duration: 1.5, type: "spring" }}
                      style={{
                        width: "100%",
                        background: hoveredIndex === i 
                          ? "linear-gradient(to top, #02509e, #00d2ff)" 
                          : "rgba(255,255,255,0.2)",
                        borderRadius: "8px 8px 4px 4px",
                        boxShadow: hoveredIndex === i ? "0 0 25px #00d2ff" : "none",
                        transition: "0.3s"
                      }}
                    />
                  </Box>
                </Tooltip>
                
                <Typography sx={{ 
                  mt: 2, 
                  fontSize: 10, 
                  fontWeight: 800, 
                  color: hoveredIndex === i ? "#00d2ff" : "rgba(255,255,255,0.5)", 
                  transform: "rotate(-45deg)",
                  whiteSpace: "nowrap"
                }}>
                  {item.label.substring(0, 5)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", pt: 2, textAlign: "center" }}>
            <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3 }}>
              FSTU NETWORK ONLINE
            </Typography>
          </Box>
        </Stack>
      </Box>
    </motion.div>
  );
};

export default TwoAboutTo;