import React from 'react';
import { Box, Container, Typography, Button, Stack, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowForward, PlayCircleOutline, School, Public } from '@mui/icons-material';

const TwoBanner = () => {
  return (
    <Box 
      sx={{ 
        bgcolor: '#0a0a0a', 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 10, md: 0 }
      }}
    >
      {/* Orqa fondagi noodatiy chiziqlar (Abstract Background) */}
      <Box sx={{ 
        position: 'absolute', top: '-10%', right: '-5%', 
        width: '500px', height: '500px', 
        background: 'radial-gradient(circle, rgba(255,122,0,0.1) 0%, rgba(10,10,10,0) 70%)',
        zIndex: 0 
      }} />

      <Container maxWidth="xl" sx={{ zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          
          {/* CHAP TOMON: MATNLAR */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ width: 40, height: 2, bgcolor: '#ff7a00' }} />
                <Typography sx={{ color: '#ff7a00', fontWeight: 'bold', letterSpacing: 2, fontSize: '14px' }}>
                  KELAJAK SHU YERDAN BOSHLANADI
                </Typography>
              </Stack>

              <Typography variant="h1" sx={{ 
                color: 'white', 
                fontWeight: 900, 
                fontSize: { xs: '3rem', md: '5rem' },
                lineHeight: 1.1,
                mb: 3
              }}>
                BILIM BILAN <br /> 
                <span style={{ color: '#ff7a00' }}>DUNYONI</span> O'ZGARTIR
              </Typography>

              <Typography sx={{ color: '#aaa', fontSize: '18px', mb: 4, maxWidth: '500px' }}>
                Zamonaviy texnologiyalar va xalqaro standartlar asosida ta'lim oling. 
                Biz bilan o'z sohangizning yetuk mutaxassisiga aylaning.
              </Typography>

            
            </motion.div>
          </Grid>

     {/* O'NG TOMON: ANIMATSIYALI KARTALAR */}
<Grid 
  item 
  xs={12} 
  md={5} 
  sx={{ 
    // Planshet o'lchamidan (900px) pastda butunlay yo'qoladi
    display: { xs: 'none', md: 'flex' }, 
    position: 'relative', 
    height: '400px', 
    justifyContent: 'center', 
    alignItems: 'center',
    margin: '0 auto' 
  }}
>
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1 }}
    style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    {/* Markaziy kvadrat rasm */}
    <Box sx={{ 
      width: '80%', 
      height: '80%', 
      border: '2px solid #333', 
      position: 'relative', 
      backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: 2,
      '&::after': {
        content: '""', 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        width: '100%', 
        height: '100%', 
        border: '2px solid #ff7a00', 
        zIndex: -1
      }
    }} />

    {/* Suzuvchi Kartochka 1 */}
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 4 }}
      style={{ position: 'absolute', top: '15%', left: '0%', zIndex: 3 }}
    >
      <Box sx={{ bgcolor: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 10 }}>
        <School sx={{ color: '#ff7a00' }} />
        <Box>
          <Typography sx={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>50+ Yo'nalishlar</Typography>
          <Typography sx={{ color: '#666', fontSize: '12px' }}>Bakalavr va Magistratura</Typography>
        </Box>
      </Box>
    </motion.div>

    {/* Suzuvchi Kartochka 2 */}
    <motion.div
      animate={{ y: [0, 20, 0] }}
      transition={{ repeat: Infinity, duration: 5 }}
      style={{ position: 'absolute', bottom: '10%', right: '5%', zIndex: 3 }}
    >
      <Box sx={{ bgcolor: '#ff7a00', p: 2, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Public />
        <Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>Xalqaro Diplom</Typography>
        </Box>
      </Box>
    </motion.div>
  </motion.div>
</Grid>

        </Grid>
      </Container>

      {/* Pastki o'ng tomondagi dekorativ matn */}
      <Typography sx={{ 
        position: 'absolute', bottom: 20, right: -0, 
        fontSize: '150px', fontWeight: 900, color: 'rgba(255,255,255,0.03)',
        zIndex: 0, userSelect: 'none'
      }}>
        EDUCATION
      </Typography>
    </Box>
  );
};

export default TwoBanner;