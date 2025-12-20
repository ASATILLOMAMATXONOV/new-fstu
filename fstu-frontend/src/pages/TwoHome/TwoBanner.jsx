import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { School, Public } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const text = "FSTU";

const TwoBanner = () => {
  const theme = useTheme();

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
      {/* ABSTRACT BACKGROUND */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(255,122,0,0.12) 0%, rgba(0,0,0,0) 70%)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* LEFT CONTENT */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Box sx={{ width: 40, height: 2, bgcolor: "#ff7a00" }} />
                <Typography
                  sx={{
                    color: "#ff7a00",
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
                  fontSize: { xs: "3rem", md: "5rem" },
                  lineHeight: 1.1,
                  mb: 3,
                }}
              >
                BILIM BILAN <br />
                <span style={{ color: "#ff7a00" }}>DUNYONI</span> O'ZGARTIR
              </Typography>

              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 18,
                  maxWidth: 500,
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
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* CENTER IMAGE */}
              <Box
                sx={{
                  width: "80%",
                  height: "80%",
                  border: "2px solid",
                  borderColor: "divider",
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                  zIndex: 2,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 20,
                    left: 20,
                    width: "100%",
                    height: "100%",
                    border: "2px solid #ff7a00",
                    zIndex: -1,
                  },
                }}
              />

              {/* FLOAT CARD 1 */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                style={{ position: "absolute", top: "15%", left: "0%" }}
              >
                <Box
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    p: 2,
                    marginLeft:2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    boxShadow: 10,
                  }}
                >
                  <School sx={{ color: "#ff7a00" }} />
                  <Box>
                    <Typography fontWeight={700} fontSize={14}>
                      50+ Yo'nalishlar
                    </Typography>
                    <Typography
                      fontSize={12}
                      color={theme.palette.text.secondary}
                    >
                      Bakalavr va Magistratura
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* FLOAT CARD 2 */}
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                style={{ position: "absolute", bottom: "10%", right: "5%" }}
              >
                <Box
                  sx={{
                    bgcolor: "#ff7a00",
                    p: 2,
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Public />
                  <Typography fontWeight={700} fontSize={14}>
                    Xalqaro Diplom
                  </Typography>
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
          right: 0,
          fontSize: "150px",
          fontWeight: 900,
          color:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.03)",
          userSelect: "none",
          display: "flex",
          zIndex: 0,
        }}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.3, duration: 0.4 }}
          >
            {char}
          </motion.span>
        ))}
      </Typography>
    </Box>
  );
};

export default TwoBanner;
