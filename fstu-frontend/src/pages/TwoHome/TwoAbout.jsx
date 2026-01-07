import React from 'react';
import { 
  Box, Container, Typography, Grid, Stack, 
  Paper, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  School, AccountBalance, LibraryBooks, WorkOutline, 
  Settings, Apartment, PhoneInTalk, 
  AutoGraph, Dashboard, Person, ArrowForward, 
} from '@mui/icons-material';
import { useTheme } from "@mui/material/styles";

const digitalServices = [
  { name: "FSTU LIVE", icon: <AutoGraph />, url: "https://live.fstu.uz" },
  { name: "HEMIS OTM", icon: <Dashboard />, url: "https://hemis.fstu.uz" },
  { name: "HEMIS Student", icon: <Person />, url: "https://student.fstu.uz" },
  { name: "Unilibrary", icon: <LibraryBooks />, url: "https://lib.fstu.uz" },
  { name: "Bo'sh ish o'rinlari", icon: <WorkOutline />, url: "/twopages" },
];

const universityStructure = [
  { title: "Fakultetlar", desc: "O'quv-metodik bo'linmalar", icon: <School />, path: "/twofaculties" },
  { title: "Kafedralar", desc: "Ilmiy-nazariy markazlar", icon: <Apartment />, path: "/twodepartments" },
  { title: "Markazlar", desc: "Ma'muriy boshqaruv", icon: <Settings />, path: "/twocentrs" },
  { title: "Ma'muriyat", desc: "Rektorat va Kengash", icon: <AccountBalance />, path: "/administration" },
  { title: "Aloqa", desc: "+998 71 200 00 00", icon: <PhoneInTalk />, path: "/twocontact" },
];

  const TwoAbout = () => {
      const theme = useTheme();
      const navigate = useNavigate();

      const handleNavigation = (url) => {
        if (url.startsWith('http')) {
          window.open(url, '_blank');
        } else {
          navigate(url);
        }
      };


    return (
      <Box
        sx={{
          bgcolor: theme.palette.background.default, // 🔑 FAQAT RANG O‘ZGARDI
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="xl">
          <Grid
            container
            spacing={4}
            alignItems="stretch"
            justifyContent="center"
          >

            {/* CHAP TOMON: O‘LCHAMI O‘ZGARMAGAN */}
            <Grid item xs={12} md={4} lg={3.6}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary, // 🔑
                  mb: 3,
                  fontWeight: 700,
                  borderLeft: '4px solid #02509eff',
                  pl: 2,
                }}
              >
                Axborot Tizimlari
              </Typography>

              <Stack spacing={1.5}>
                {digitalServices.map((service, index) => (
                  <Paper
                    key={index}
                    component={motion.div}
                    whileHover={{ x: 8 }}
                    onClick={() => handleNavigation(service.url)}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.background.paper, // 🔑
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: '0.3s',
                      '&:hover': {
                        borderColor: '#0067ff',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ color: '#02509eff', display: 'flex' }}>
                        {service.icon}
                      </Box>
                      <Typography
                        sx={{
                          color: theme.palette.text.primary, // 🔑
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {service.name}
                      </Typography>
                    </Stack>
                    <ArrowForward
                      sx={{
                        color: theme.palette.text.secondary, // 🔑
                        fontSize: 16,
                      }}
                    />
                  </Paper>
                ))}
              </Stack>
            </Grid>

            {/* O‘NG TOMON: O‘LCHAMI O‘ZGARMAGAN */}
            <Grid item xs={12} md={8} lg={8.4} width={"65%"}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary, // 🔑
                  mb: 3,
                  fontWeight: 700,
                  borderLeft: '4px solid #02509eff',
                  pl: 2,
                }}
              >
                Universitet Bo'linmalari
              </Typography>

              <Grid container spacing={2} sx={{ display: 'flex', justifyContent:'center' }}> 
                {universityStructure.map((item, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={index}
                    sx={{ display: 'flex',}}
                  >
                    <Paper
                      component={motion.div}
                      whileHover={{ y: -5 }}
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        p: 3,
                        bgcolor: theme.palette.background.paper, // 🔑
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0,
                        cursor: 'pointer',
                        transition: '0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '160px',     // ⛔ O‘ZGARMAGAN
                        minHeight: '150px', // ⛔ O‘ZGARMAGAN
                        '&:hover': {
                          borderColor: '#0067ff',
                        },
                      }}
                    >
                      <Box sx={{ color: '#02509eff', mb: 1.5 }}>
                        {item.icon}
                      </Box>

                      <Typography
                        sx={{
                          color: theme.palette.text.primary, // 🔑
                          fontWeight: 800,
                          fontSize: '1rem',
                          mb: 0.5,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: theme.palette.text.secondary, // 🔑
                          fontSize: '0.75rem',
                          flexGrow: 1,
                          mb: 2,
                        }}
                      >
                        {item.desc}
                      </Typography>

                      <Divider sx={{ mb: 1.5 }} />

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ color: '#0067ff' }}
                      >
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
                          BATAFSIL
                        </Typography>
                        <ArrowForward sx={{ fontSize: 14 }} />
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>

          </Grid>
        </Container>
      </Box>
    );
  };

export default TwoAbout;
