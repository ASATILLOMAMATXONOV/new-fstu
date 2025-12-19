import React from "react";
import { Box, Typography, Button, Container, Card, Stack } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "../../assets/styles/style.css";

// Swiper stillari
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Ikonkalar
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

const EVENT_DATA = [
  {
    title: "Web Design and Modern User Interfaces in 2025: Future Trends and AI IntegrationWeb Design and Modern User Interfaces in 2025: Future Trends and AI Integration", 
    date: "December 20, 2025",
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
  },
  {
    title: "The Future of Online Education", 
    date: "January 15, 2026",
    img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"
  },
  {
    title: "Global Tech Summit 2025: Innovation and Digital Literacy Beyond Limits", 
    date: "February 10, 2026",
    img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800"
  },
  {
    title: "New Start of Creative Art", 
    date: "March 05, 2026",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"
  }
];

export default function EventsSlider() {
  return (
    <Box sx={{ bgcolor: "#f4f7fa", py: 10, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        
        {/* HEADER */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          
          <Typography variant="h3" sx={{ fontWeight: 800,fontSize: '2rem', color: "var(--primary-blue)", mt: 1 }}>
            So'ngi yangliklar
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', px: { xs: 0, md: 2 } }}>
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true} // Cheksiz aylanish
            grabCursor={true} // Kursor bilan ushlab surish imkoniyati
            speed={1000} // Aylanish tezligi (ms)
            autoplay={{
              delay: 3000,
              disableOnInteraction: false, // Foydalanuvchi tekkanda ham to'xtamaydi
            }}
            navigation={{
              prevEl: ".event-prev",
              nextEl: ".event-next",
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              768: { slidesPerView: 2, alignItems: 'flex-start' },
              1024: { slidesPerView: 3, alignItems: 'flex-start' },
            }}
          >
            {EVENT_DATA.map((event, index) => (
              <SwiperSlide key={index} style={{ height: 'auto' }}>
                <Card sx={{ 
                  // borderRadius: "24px", 
                  boxShadow: "0 15px 40px rgba(0,0,0,0.06)",
                  bgcolor: "#fff",
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)' }
                }}>
                  {/* RASM */}
                  <Box sx={{ width: '100%', height: 230, overflow: 'hidden' }}>
                    <Box component="img" src={event.img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>

                  <Box sx={{ p: 4 }}>
                    {/* SANA */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "var(--primary-blue)", mb: 2 }}>
                      <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.date}</Typography>
                    </Stack>

                    {/* TITLE - DINAMIK BALANDLIK */}
                    <Typography variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                     
                      fontSize: '1rem',
                      color: "#001233", 
                      mb: 4, 
                      lineHeight: 1.4,
                      minHeight: "50px" // Estetik ko'rinish uchun minimal joy
                    }}>
                      {event.title}
                    </Typography>

                    <Button 
                      variant="contained" 
                      fullWidth
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        bgcolor: "var(--primary-blue)", 
                        borderRadius: "12px",
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: "0 6px 15px rgba(26, 102, 255, 0.2)",
                        "&:hover": { bgcolor: "#0044cc" }
                      }}
                    >
                      VIEW DETAILS
                    </Button>
                  </Box>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* NAVIGATSIYA TUGMALARI (< >) */}
          <Button className="event-prev" sx={{ ...navStyle, left: { xs: -10, md: -60,color: "var(--primary-blue)", } }}>
            <ArrowBackIcon fontSize="medium" />
          </Button>
          <Button className="event-next" sx={{ ...navStyle, right: { xs: -10, md: -60, color: "var(--primary-blue)", } }}>
            <ArrowForwardIcon fontSize="medium" />
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

const navStyle = {
  position: 'absolute',
  top: '55%',
  transform: 'translateY(-50%)',
  zIndex: 10,
  minWidth: 55,
  height: 55,
  borderRadius: "50%",
  bgcolor: "#fff",
  color: "#1a66ff",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  border: "1px solid #f0f0f0",
  "&:hover": { 
    bgcolor: "#1a66ff", 
    color: "#fff",
    transform: 'translateY(-50%) scale(1.1)' 
  },
  transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)"
};