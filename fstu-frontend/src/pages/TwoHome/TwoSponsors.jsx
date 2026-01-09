import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Container, Grid, Stack, Divider } from '@mui/material';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';

// Ikonkalar
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

// Rasmlar
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
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(latest.toFixed(0));
      }
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
};

const TwoSponsors = () => {
  const theme = useTheme();
  const mainBlue = '#002B5B';
  const accentCyan = '#00E5FF';

  const stats = [
    { number: 27768, label: 'TALABALAR', icon: <GroupIcon sx={{ fontSize: 50 }} /> },
    { number: 831, label: "PROFESSOR O'QITUVCHILAR", icon: <HistoryEduIcon sx={{ fontSize: 50 }} /> },
    { number: 67270, label: 'BITIRUVCHILAR', icon: <SchoolIcon sx={{ fontSize: 50 }} /> },
    { number: 257800, label: 'KITOB FONDI', icon: <AutoStoriesIcon sx={{ fontSize: 50 }} /> },
  ];

  const sponsors = [asiaQs, emblemUz, impactRanking, qsCentralAsia, worldUni];

  return (
    <Box sx={{ bgcolor: '#fff', py: 12 }}>
      <Container maxWidth="xl">
        
        {/* === HEADER: Markazda === */}
        <Stack alignItems="center" sx={{ mb: 10 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: mainBlue, mb: 1, textAlign: 'center' }}>
            STATISTIKA
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 700 }}>
            <Divider sx={{ flexGrow: 1, height: 2, bgcolor: mainBlue }} />
            <Typography sx={{ px: 3, fontWeight: 600, color: mainBlue, textAlign: 'center' }}>
              Farg'ona davlat texnika universiteti
            </Typography>
            <Divider sx={{ flexGrow: 1, height: 2, bgcolor: mainBlue }} />
          </Box>
        </Stack>

        {/* === STATISTIKA: Markazda va Sanaluvchi raqamlar === */}
        <Box 
          sx={{ 
            bgcolor: mainBlue, 
            borderRadius: '30px', 
            p: { xs: 4, md: 8 }, 
            mb: 12,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,43,91,0.2)'
          }}
        >
          {/* Fon effekti (nuqtachalar) */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <Grid container spacing={6} justifyContent="center" alignItems="center">
            {stats.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Stack alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ color: accentCyan, mb: 1 }}>
                    <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: 'spring' }}>
                      {item.icon}
                    </motion.div>
                  </Box>
                  
                  <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                    <Counter value={item.number} />
                  </Typography>

                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: '80%' }} 
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '3px', backgroundColor: accentCyan }} 
                  />

                  <Typography variant="button" sx={{ fontWeight: 800, color: accentCyan, textAlign: 'center', mt: 2, letterSpacing: 1.5 }}>
                    {item.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* === SLIDER: Tartibli va Silliq === */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: 3, whiteSpace: 'nowrap' }}>
            INTERNATIONAL RANKINGS
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>

        <Swiper
          modules={[Autoplay]}
          loop={true}
          speed={6000}
          autoplay={{ delay: 0, disableOnInteraction: false }}
          slidesPerView={2}
          breakpoints={{ 
            640: { slidesPerView: 3 }, 
            1024: { slidesPerView: 5 } 
          }}
        >
          {[...sponsors, ...sponsors].map((logo, i) => (
            <SwiperSlide key={i}>
              <Box sx={{ 
                height: 120, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                filter: 'grayscale(100%)',
                opacity: 0.5,
                transition: '0.4s ease',
                '&:hover': { filter: 'grayscale(0%)', opacity: 1, transform: 'scale(1.1)' }
              }}>
                <img src={logo} alt="Ranking" style={{ maxWidth: '80%', maxHeight: '60px', objectFit: 'contain' }} />
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