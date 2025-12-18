

import {
  Box,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import bannerImg from "../../assets/images/DJI_0025.JPG";


/* ================= PAGE ================= */
export default function pagesBanner() {
  return (
    <Box bgcolor="var(--light-gray)">

      {/* ===== BANNER / HERO ===== */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: "20vh", md: "50vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            overflow: "hidden",

            /* 🔒 BACKGROUND IMAGE — QIMIRLAMAYDI */
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(0,0,0,0.55),
                rgba(0,0,0,0.35)
              ),
              url(${bannerImg})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* ===== FLOATING DECOR ELEMENTS ===== */}

          {/* O‘NG TOMON KATTA */}
          <motion.div
            animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "-25%",
                right: "-15%",
                width: 320,
                height: 320,
                bgcolor: "var(--light-blue)",
                opacity: 0.2,
                borderRadius: "50%",
                filter: "blur(20px)",
              }}
            />
          </motion.div>

          {/* CHAP PAST */}
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: "-30%",
                left: "-20%",
                width: 260,
                height: 260,
                bgcolor: "var(--primary-blue)",
                opacity: 0.18,
                borderRadius: "50%",
                filter: "blur(22px)",
              }}
            />
          </motion.div>

          {/* KICHIK FLOAT */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "30%",
                left: "18%",
                width: 90,
                height: 90,
                bgcolor: "var(--light-gray)",
                opacity: 0.12,
                borderRadius: "50%",
              }}
            />
          </motion.div>

          {/* ===== CONTENT ===== */}
          <Box sx={{ position: "relative", zIndex: 2, px: 2 }}>
            {/* ICON */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <AccountBalanceIcon
                sx={{
                  fontSize: { xs: 44, md: 56 },
                  mb: 2,
                }}
              />
            </motion.div>

            {/* TITLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  letterSpacing: 1,
                  fontSize: { xs: "1.6rem", md: "2.2rem" },
                }}
              >
                Fargona Davlat Texnika Universiteti
              </Typography>
            </motion.div>

            {/* SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography
                sx={{
                  mt: 1.5,
                  color: "var(--light-gray)",
                  maxWidth: 600,
                  mx: "auto",
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                }}
              >
                Boshqaruv kengashining asosiy a’zolari
              </Typography>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

    </Box>
  );
}
