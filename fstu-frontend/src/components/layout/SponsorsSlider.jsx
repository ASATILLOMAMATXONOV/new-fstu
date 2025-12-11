// ---------------- IMPORTS ----------------
import { Box, Container, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import img3 from "../../assets/images/logo.png"; // Tasavvur qiling, bu sizning logotipingiz

// ---------------- KEYFRAMES ----------------

// Text fade + move animation
const fadeUp = keyframes`
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Infinite smooth horizontal scroll
const infiniteScroll = keyframes`
  0% { transform: translateX(0); }
  /* Logotiplar ro'yxatini 2 barobar takrorlaganimiz uchun 50% ga siljitish kerak */
  100% { transform: translateX(-50%); }
`;

// ---------------- COMPONENT ----------------
export default function SponsorsSlider() {
  // Eslatma: Haqiqiy loyihada bu massivga har xil homiy logotiplarini joylashtiring.
  const logos = [img3, img3, img3, img3, img3, img3];
  const loopList = [...logos, ...logos]; // Uzluksiz aylanma (seamless loop) uchun 2x

  // Logotiplar aylanma tezligini sozlang
  const animationDuration = '35s'; // Sekinroq va silliqroq aylanma

  return (
    <Box 
      sx={{ 
        py: { xs: 6, md: 10 }, 
        bgcolor: "#f9f9f9", // Yengil orqa fon
        borderTop: '1px solid #eee', 
        borderBottom: '1px solid #eee'
      }}
    >
      <Container maxWidth="lg">

        {/* 🔵 CHIZIQ BILAN AJRATILGAN TITLE */}
     <Typography
  variant="h2"
  component="h2"
  sx={{
    fontSize: 28,
    textAlign: "center",
    fontWeight: 700,
    mb: { xs: 4, md: 6 },
    color: "#3f68a5",
    animation: `${fadeUp} 1s ease`,
    textTransform: 'uppercase',
    position: 'relative',

    "&:hover::after": {
      width: "100px",
    },

    "&::after": {
      content: '""',
      display: "block",
      width: "60px",
      height: "3px",
      bgcolor: "#3f68a5",
      mx: "auto",
      mt: 1,
      borderRadius: "2px",
      transition: "width 0.4s ease-out",
    }
  }}
>
  Bizning Homiylarimiz
</Typography>



        {/* 🔵 SLIDER WRAPPER - Gradient Edges Qo'shilgan */}
        <Box
          sx={{
            overflow: "hidden",
            width: "100%",
            position: "relative",
            // Gradient qatlamlar - Logotiplarning silliq yo'qolish effekti
            maskImage: `linear-gradient(to right, 
              rgba(0,0,0,0) 0%, 
              rgba(0,0,0,1) 15%, 
              rgba(0,0,0,1) 85%, 
              rgba(0,0,0,0) 100%
            )`,
            // Hover bo'lganda animatsiyani to'xtatish
            "&:hover .moving-track": {
                animationPlayState: 'paused',
            }
          }}
        >
          {/* 🔵 MOVING TRACK */}
          <Box
            className="moving-track"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 5, md: 8 },
              width: "max-content",
              animation: `${infiniteScroll} ${animationDuration} linear infinite`,
              // Boshlang'ich animatsiya holati
              animationPlayState: 'running', 
            }}
          >
            {loopList.map((src, index) => (
              <Box
                key={index}
                component="img"
                src={src}
                alt="sponsor-logo"
                sx={{
                  height: { xs: 40, sm: 55, md: 70 }, // Balandlikni biroz kamaytirdik
                  minWidth: { xs: 120, md: 180 }, // Har bir logotip uchun minimal joy ajratish
                  opacity: 0.7,
                  transition: "0.4s",
                  // Hover effekti
                  "&:hover": {
                    opacity: 1,
                    transform: "scale(1.05)",
                    filter: 'grayscale(0%)', // Rangini qaytarish
                    cursor: 'pointer',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}