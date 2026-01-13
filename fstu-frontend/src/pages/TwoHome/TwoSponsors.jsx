import React, { useEffect, useRef, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { 
  useTheme, 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Stack, 
  Divider, 
  IconButton, 
  useMediaQuery,
  alpha 
} from '@mui/material';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';

// Ikonkalar
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';

// Rasmlar (Siz import qilgan fayllar)
import asiaQs from '../../assets/images/reyting-logo/asia qs ranking.png';
import emblemUz from '../../assets/images/reyting-logo/Emblem_of_Uzbekistan.svg.png';
import impactRanking from '../../assets/images/reyting-logo/impackt renking.png';
import qsCentralAsia from '../../assets/images/reyting-logo/QS centreal asian ranking 2024.png';
import worldUni from '../../assets/images/reyting-logo/the world universty reanking.png';

import 'swiper/css';

// 0 dan sanaluvchi raqam komponenti
const Counter = ({ value }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 30 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(latest.toFixed(0));
      }
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
};

const TwoSponsors = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  // Ranglar sxemasi
  const mainBlue = isDarkMode ? theme.palette.primary.light : '#002B5B';
  const sectionBg = isDarkMode ? theme.palette.background.default : '#fff';
  const statsBg = isDarkMode ? alpha(theme.palette.primary.main, 0.15) : '#002B5B';
  const accentCyan = '#00E5FF';

  const stats = [
    { number: 27768, label: 'TALABALAR', icon: <GroupIcon sx={{ fontSize: isMobile ? 35 : 50 }} /> },
    { number: 831, label: "PROFESSORLAR", icon: <HistoryEduIcon sx={{ fontSize: isMobile ? 35 : 50 }} /> },
    { number: 67270, label: 'BITIRUVCHILAR', icon: <SchoolIcon sx={{ fontSize: isMobile ? 35 : 50 }} /> },
    { number: 257800, label: 'KITOB FONDI', icon: <AutoStoriesIcon sx={{ fontSize: isMobile ? 35 : 50 }} /> },
  ];

  const sponsors = [asiaQs, emblemUz, impactRanking, qsCentralAsia, worldUni];

  return (
    <Box sx={{ bgcolor: sectionBg, py: isMobile ? 6 : 10, transition: '0.3s' }}>
      
      {/* === HEADER === */}
      <Container maxWidth="xl">
        <Stack alignItems="center" sx={{ mb: isMobile ? 5 : 8 }}>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}>
            STATISTIKA
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600 }}>
            <Divider sx={{ flexGrow: 1, height: 2, bgcolor: alpha(mainBlue, 0.3) }} />
            <Typography sx={{ px: 2, fontWeight: 600, color: theme.palette.text.secondary, fontSize: isMobile ? 12 : 14, textAlign: 'center' }}>
              Farg'ona davlat texnika universiteti
            </Typography>
            <Divider sx={{ flexGrow: 1, height: 2, bgcolor: alpha(mainBlue, 0.3) }} />
          </Box>
        </Stack>
      </Container>

 {/* === STATISTIKA BLOKI === */}
      <Box sx={{ 
        bgcolor: statsBg, 
        py: isMobile ? 6 : 8, 
        mb: 10,
        position: 'relative',
        borderTop: isDarkMode ? `1px solid ${alpha('#fff', 0.1)}` : 'none',
        borderBottom: isDarkMode ? `1px solid ${alpha('#fff', 0.1)}` : 'none',
      }}>
        <Container maxWidth="xl">
          <Grid 
            container 
            spacing={isMobile ? 2 : 4} 
            justifyContent="space-evenly" // Elementlarni teng masofada taqsimlaydi
            alignItems="center"
          >
            {stats.map((item, index) => (
              <Grid 
                item 
                xs={6}    // Mobilda 2 tadan
                sm={4}    // Planshetda 3 tadan (ixtiyoriy)
                md={2.5}  // Kompyuterda elementlar kengligini boshqarish uchun
                key={index}
              >
                <Stack 
                  alignItems="center" 
                  spacing={1} 
                  sx={{ width: '100%' }}
                >
                  <Box sx={{ color: accentCyan }}>
                    <motion.div 
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.div>
                  </Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: '#fff', 
                    fontSize: { xs: '1.7rem', sm: '2.2rem', md: '3rem' },
                    lineHeight: 1
                  }}>
                    <Counter value={item.number} />
                  </Typography>
                  <Typography sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? alpha('#fff', 0.6) : alpha('#fff', 0.9), 
                    fontSize: { xs: 10, md: 12 },
                    letterSpacing: 1,
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}>
                    {item.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* === RANKINGS SLIDER === */}
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: theme.palette.text.primary, fontSize: 11, letterSpacing: 2 }}>
            INTERNATIONAL RANKINGS
          </Typography>
          <Divider sx={{ flexGrow: 1, bgcolor: alpha(theme.palette.text.primary, 0.1) }} />
        </Box>

        <Swiper
          modules={[Autoplay]}
          loop={true}
          speed={4000}
          autoplay={{ delay: 0, disableOnInteraction: false }}
          slidesPerView={isMobile ? 2 : 5}
          spaceBetween={40}
        >
          {[...sponsors, ...sponsors].map((logo, i) => (
            <SwiperSlide key={i}>
              <Box sx={{ 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                filter: isDarkMode ? 'grayscale(100%) brightness(1.5)' : 'grayscale(100%)',
                opacity: 0.6,
                transition: '0.4s ease',
                '&:hover': { filter: 'grayscale(0%) brightness(1)', opacity: 1, transform: 'scale(1.05)' }
              }}>
                <img 
                  src={logo} 
                  alt="Ranking Logo" 
                  style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} 
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>

      <style>{`.swiper-wrapper { transition-timing-function: linear !important; }`}</style>
    </Box>
  );
};

export default TwoSponsors;