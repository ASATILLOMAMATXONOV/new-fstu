import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { School, Public } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const text = "FSTU";

const images = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1920&q=80",
];

const TwoBanner = () => {
  const theme = useTheme();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        pt: { xs: 10, md: 0 },
      }}
    >
      {/* GRADIENTLI ANIMATSIYALI FON */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            right: 0, // O'ng tomonga bog'ladik
            width: "70%", // Faqat o'ng tarafni ko'proq egallaydi
            height: "100%",
            backgroundImage: `url(${images[index]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
            // CHAPDAN O'NGGA GRADIENT NIQOB (MASK)
            WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
      </AnimatePresence>

      <Container maxWidth="xl" sx={{ zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          {/* LEFT CONTENT */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Box sx={{ width: 40, height: 2, bgcolor: "#02509eff" }} />
                <Typography
                  sx={{
                    color: "#02509eff",
                    fontWeight: 700,
                    letterSpacing: 2,
                    fontSize: 14,
                  }}
                >
                  KELAJAK SHU YERDAN BOSHLANADI
                </Typography>
              </Stack>

              <Typography
                variant="h1"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 900,
                  fontSize: { xs: "2.8rem", md: "3.8rem" },
                  lineHeight: 1.1,
                  mb: 3,
                }}
              >
                BILIM BILAN <br />
                <span style={{ color: "#02509eff" }}>DUNYONI</span> O'ZGARTIR
              </Typography>

              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 18,
                  maxWidth: 500,
                  textShadow: theme.palette.mode === 'light' ? "0 0 20px white" : "none" 
                }}
              >
                Zamonaviy texnologiyalar va xalqaro standartlar asosida ta'lim
                oling. Biz bilan o'z sohangizning yetuk mutaxassisiga aylaning.
              </Typography>
            </motion.div>
          </Grid>

          {/* RIGHT CONTENT */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              height: 400,
              position: 'relative'
            }}
          >
             {/* Rasm ustidagi floating cardlar kodingizni saqlab qoldim */}
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{ position: 'relative', width: '100%', height: '100%' }}
            >
              {/* FLOAT CARD 1 */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                style={{ position: "absolute", top: "20%", left: "10%", zIndex: 10 }}
              >
                <Box sx={{ bgcolor: "background.paper", p: 2, boxShadow: 10, borderRadius: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <School sx={{ color: "#02509eff" }} />
                  <Box>
                    <Typography fontWeight={700} fontSize={14}>50+ Yo'nalishlar</Typography>
                    <Typography fontSize={12} color="text.secondary">Bakalavr va Magistratura</Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* FLOAT CARD 2 */}
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                style={{ position: "absolute", bottom: "20%", right: "10%", zIndex: 10 }}
              >
                <Box sx={{ bgcolor: "background.paper", p: 2, boxShadow: 10, borderRadius: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Public sx={{ color: "#02509eff" }} />
                  <Typography fontWeight={700} fontSize={14}>Xalqaro Diplom</Typography>
                </Box>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* DECORATIVE TEXT */}
      <Typography
        sx={{
          position: "absolute",
          bottom: 20,
          right: 30,
          fontSize: "150px",
          fontWeight: 900,
          color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
          userSelect: "none",
          zIndex: 1,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default TwoBanner;