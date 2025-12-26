import React, { useState } from 'react';
import { Box, Container, Typography, Stack, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Biotech, 
  Engineering, 
  Computer, 
  SettingsSuggest,
  ArrowForward
} from '@mui/icons-material';
import { useTheme, alpha } from "@mui/material/styles";

// Rasmlar/GIFlar yo'li
import L1Img from "../../assets/videos/l1.gif";
import L2Img from "../../assets/videos/l2.gif";
import L3Img from "../../assets/videos/L3.gif";

const labData = [
  { 
    id: 1,
    title: "Robototexnika Markazi", 
    icon: <Engineering />, 
    media: L1Img,
    desc: "Sanoat robotlari va avtomatlashtirilgan o'quv stendlari to'plami."
  },
  { 
    id: 2,
    title: "IT-Akademiya", 
    icon: <Computer />, 
    media: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    desc: "Yuqori quvvatli grafik stansiyalar va bulutli texnologiyalar laboratoriyasi."
  },
  { 
    id: 3,
    title: "Mexatronika Stendlari", 
    icon: <SettingsSuggest />, 
    media: L2Img,
    desc: "Pnevmatika va gidravlika tizimlarini o'rganish uchun maxsus jihozlar."
  },
  { 
    id: 4,
    title: "Biotexnologiya", 
    icon: <Biotech />, 
    media: L3Img,
    desc: "Zamonaviy mikroskoplar va DNK tahlili uchun innovatsion uskunalar."
  },
];

const TwoLabaratoris = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(labData[0]);

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, py: { xs: 8, md: 12 } }}>
      <Container maxWidth="xl">
        {/* SARLAVHA */}
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            mb: 5, 
            fontSize: '24px', 
            fontFamily: 'Arial, sans-serif',
            borderLeft: '4px solid #02509eff', 
            pl: 2,
            lineHeight: 1.2,
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
          }}
        >
          O'quv Laboratoriyalari
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
          
          {/* CHAP TOMON: RO'YXAT */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack spacing={1.5}>
              {labData.map((item) => (
                <Box
                  key={item.id}
                  component={motion.div}
                  onClick={() => setActiveTab(item)}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: activeTab.id === item.id ? theme.palette.background.paper : 'transparent',
                    border: '2px solid',
                    // Faqat aktiv bo'lganda yoki hoverda border chiqadi
                    borderColor: activeTab.id === item.id ? '#0067ff' : 'divider',
                    borderRadius: 1,
                    transition: '0.3s all ease',
                    boxShadow: activeTab.id === item.id ? '0 10px 20px rgba(0,0,0,0.05)' : 'none',
                    '&:hover': {
                      borderColor: '#02509eff',
                      bgcolor: theme.palette.background.paper,
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      color: '#02509eff', 
                      display: 'flex',
                      bgcolor: activeTab.id === item.id ? alpha('#0067ff', 0.1) : 'transparent',
                      p: 1,
                      borderRadius: 1
                    }}>
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{
                        color: activeTab.id === item.id ? theme.palette.text.primary : theme.palette.text.secondary,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Stack>
                  <ArrowForward
                    sx={{
                      color: activeTab.id === item.id ? '#0067ff' : theme.palette.divider,
                      fontSize: 18,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* O'NG TOMON: MEDIA PLAYER */}
          <Box sx={{ flex: 1.5, width: '100%', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <Box
                key={activeTab.id}
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 400, md: 550 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#000',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.15)'
                }}
              >
                <img
                  src={activeTab.media}
                  alt={activeTab.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.7
                  }}
                />

                {/* MA'LUMOTLAR QISMI (OVERLAY) */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: { xs: 3, md: 5 },
                  background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)',
                }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, mb: 1, fontSize: '24px',  fontFamily: 'Arial, sans-serif', }}>
                    {activeTab.title}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: '90%' }}>
                    {activeTab.desc}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: '#02509eff',
                      color: 'white',
                      px: 4,
                      py: 1.2,
                      borderRadius: 2,
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#0067ff' }
                    }}
                  >
                    Batafsil
                  </Button>
                </Box>
              </Box>
            </AnimatePresence>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default TwoLabaratoris;