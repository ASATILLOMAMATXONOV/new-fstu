import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  ButtonBase,
} from "@mui/material";
import { motion } from "framer-motion";
import { School, Public } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const BRAND_TEXT = "FSTU";

const images = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80",
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

  const HERO_H = "83vh"; // banner balandligi

  return (
    <>
      {/* ✅ SPACER: scroll bo‘lishi uchun banner balandligicha joy */}
      <Box sx={{ height: HERO_H }} />

      {/* ✅ FIXED HERO: hammasi yopishib turadi */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -10,
          overflow: "hidden",
        }}
      >
        {/* ✅ BACKGROUND (IMG) */}
        <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {images.map((img, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i === index ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                willChange: "opacity",
              }}
            >
              {/* ✅ OVERLAY */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  background:
                    theme.palette.mode === "light"
                      ? "linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0) 60%)"
                      : "linear-gradient(to right, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.75) 30%, rgba(10,10,10,0) 60%)",
                }}
              />
            </motion.div>
          ))}
        </Box>

        {/* ✅ CONTENT (MATN + KARTALAR) */}
        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{
              justifyContent: "flex-start",
              position: "relative",
              zIndex: 10,
            }}
          >
            {/* 📝 MATN */}
            <Grid item xs={12} md={7.5} lg={7}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Box sx={{ width: 45, height: 3, bgcolor: "#02509eff", borderRadius: 1 }} />
                  <Typography
                    sx={{
                      color: "#02509eff",
                      fontWeight: 800,
                      letterSpacing: 2,
                      fontSize: 14,
                      textTransform: "uppercase",
                    }}
                  >
                    Kelajak shu yerdan boshlanadi
                  </Typography>
                </Stack>

                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 950,
                    fontSize: { xs: "2.5rem", md: "4rem", lg: "2rem" },
                    lineHeight: 1.1,
                    mb: 3,
                    color: "text.primary",
                    maxWidth: "90%",
                  }}
                >
                  <span style={{ color: "#02509eff" }}>
                    Farg‘ona davlat texnika universiteti
                  </span>
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 16, md: 19 },
                    maxWidth: 550,
                    color: "text.secondary",
                    lineHeight: 1.6,
                    mb: 4,
                  }}
                >
                  Zamonaviy texnologiyalar va xalqaro standartlar asosida ta'lim oling.
                  Biz bilan o'z sohangizning yetuk mutaxassisiga aylaning.
                </Typography>
              </motion.div>
            </Grid>

            {/* 🎴 KARTALAR */}
            <Grid
              item
              xs={12}
              md={4.5}
              lg={5}
              sx={{
                display: { xs: "none", md: "block" },
                position: "relative",
              }}
            >
              <Box sx={{ position: "relative", height: 500, width: "100%" }}>
                {/* MARKAZIY CHIZIQ */}
                <Box
                  sx={{
                    position: "absolute",
                    left: { md: "20%", lg: "30%" },
                    top: "10%",
                    bottom: "10%",
                    width: "3px",
                    bgcolor: "rgba(2, 80, 158, 0.2)",
                    borderRadius: 2,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "100%",
                      height: "30%",
                      top: 0,
                      left: 0,
                      background:
                        "linear-gradient(to bottom, transparent, #02509eff, transparent)",
                      animation: "moveLight 3s infinite linear",
                    },
                    "@keyframes moveLight": {
                      "0%": { top: "-30%" },
                      "100%": { top: "100%" },
                    },
                  }}
                />

                {/* CARD 1 */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "35%",
                    zIndex: 5,
                  }}
                >
                  <ButtonBase
                    onClick={() => console.log("Yo'nalishlar bosildi")}
                    sx={{
                      ...cardStyle,
                      textAlign: "left",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0px 25px 50px rgba(2, 80, 158, 0.2)",
                        borderColor: "#02509eff",
                      },
                    }}
                  >
                    <Box sx={iconWrapperStyle}>
                      <School sx={{ color: "#02509eff" }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={700} fontSize={16} sx={{ display: "block" }}>
                        50+ Yo'nalishlar
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bakalavr & Magistratura
                      </Typography>
                    </Box>
                  </ButtonBase>
                </motion.div>

                {/* CARD 2 */}
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    bottom: "25%",
                    left: "15%",
                    zIndex: 5,
                  }}
                >
                  <ButtonBase
                    onClick={() => console.log("Diplom bosildi")}
                    sx={{
                      ...cardStyle,
                      textAlign: "left",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0px 25px 50px rgba(2, 80, 158, 0.2)",
                        borderColor: "#02509eff",
                      },
                    }}
                  >
                    <Box sx={iconWrapperStyle}>
                      <Public sx={{ color: "#02509eff" }} />
                    </Box>
                    <Typography fontWeight={700} fontSize={16}>
                      Xalqaro Diplom
                    </Typography>
                  </ButtonBase>
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* DECOR TEXT */}
        <Typography
          sx={{
            position: "absolute",
            bottom: -40,
            right: 40,
            fontSize: "200px",
            fontWeight: 1000,
            color: "rgba(2, 80, 158, 0.04)",
            userSelect: "none",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {BRAND_TEXT}
        </Typography>
      </Box>
    </>
  );
};

// styles
const cardStyle = {
  bgcolor: "background.paper",
  p: 1,
  boxShadow: "0px 20px 40px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
  gap: 2,
  minWidth: 240,
  border: "1px solid rgba(2, 80, 158, 0.1)",
};

const iconWrapperStyle = {
  bgcolor: "rgba(2, 80, 158, 0.1)",
  p: 1.5,
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default TwoBanner;
