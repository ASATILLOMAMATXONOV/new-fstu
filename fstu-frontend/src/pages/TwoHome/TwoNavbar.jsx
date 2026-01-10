import React, { useState, useContext } from "react";
import {
  AppBar, Toolbar, Box, Container, Stack, Typography, alpha,
  useScrollTrigger, Button, IconButton, InputBase
} from "@mui/material";
import {
  KeyboardArrowDown, Search, Language, 
  Brightness4, Brightness7, HelpOutline, School,
  Info, Person, Description, Engineering, AccountBalance, 
  Groups, Biotech, Settings, BarChart, Public, VolunteerActivism
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../components/theme/ColorModeContext";

import LogoImg from "../../assets/images/logo.png";

const fstuBlue = "#02509eff";

const megaMenuData = {
  "UNIVERSITET": [
    {
      columnName: "ASOSIY",
      items: [
        { name: "UNIVERSITET HAQIDA", icon: <Info />, url: "/about" },
        { name: "REKTOR TABRIGI", icon: <Person />, url: "/rector" },
        { name: "NIZOM VA QOIDALAR", icon: <Description />, url: "/docs" },
      ]
    },
    {
      columnName: "TUZILMA",
      items: [
        { name: "FAKULTETLAR", icon: <Engineering />, url: "/faculties" },
        { name: "KAFEDRALAR", icon: <AccountBalance />, url: "/departments" },
        { name: "BO'LIMLAR", icon: <Groups />, url: "/sections" },
      ]
    },
    {
      columnName: "NAZORAT",
      items: [
        { name: "MARKAZLAR", icon: <Biotech />, url: "/centers" },
        { name: "KORRUPTSIYAGA QARSHI", icon: <Settings />, url: "/anti-corruption" },
        { name: "SIFAT NAZORATI", icon: <BarChart />, url: "/quality" },
      ]
    }
  ],
  "FAOLIYAT": [
    {
      columnName: "ILMIY-TA'LIM",
      items: [
        { name: "ILMIY FAOLIYAT", icon: <Biotech />, url: "/science" },
        { name: "O'QUV FAOLIYATI", icon: <School />, url: "/edu" },
      ]
    },
    {
      columnName: "HAMKORLIK",
      items: [
        { name: "XALQARO HAMKORLIK", icon: <Public />, url: "/international" },
        { name: "LOYIHALAR", icon: <Settings />, url: "/projects" },
      ]
    },
    {
      columnName: "IJTIMOIY",
      items: [
        { name: "MA'NAVIY-MA'RIFIY", icon: <VolunteerActivism />, url: "/spiritual" },
        { name: "MOLIYAVIY FAOLIYAT", icon: <BarChart />, url: "/finance" },
      ]
    }
  ]
};

const navItems = [
  { name: "UNIVERSITET" },
  { name: "FAOLIYAT" },
  { name: "TALABALAR", url: "/students" },
  { name: "ABITURIYENT", url: "/admission" },
  { name: "YANGILIKLAR", url: "/news" }
];

const TwoNavbar = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { toggleColorMode } = useContext(ColorModeContext);
  const [activeMenu, setActiveMenu] = useState(null);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          // Rejimga qarab Navbar rangi o'zgaradi
          bgcolor: isDarkMode ? "#1e1e1e" : "white", 
          color: isDarkMode ? "white" : "black", 
          boxShadow: trigger ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
          backgroundImage: "none" // MUI dark mode gradientni olib tashlash uchun
        }}
      >
        {/* TOP PANEL (HEMIS va til tanlash) */}
        <Box sx={{ bgcolor: fstuBlue, color: "white", py: 0.5 }}>
          <Container maxWidth="xl">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={3}>
                <TopLink icon={<School fontSize="inherit"/>} text="HEMIS" />
                <TopLink icon={<HelpOutline fontSize="inherit"/>} text="XIZMATLAR" />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                  <Language sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: '11px', fontWeight: 800 }}>O'ZBEKCHA</Typography>
                  <KeyboardArrowDown sx={{ fontSize: 14 }} />
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", py: 1, px: "0 !important" }}>
            <Box component="a" href="/" sx={{ display: "flex", alignItems: "center", textDecoration: 'none' }}>
              <img src={LogoImg} alt="Logo" style={{ height: 55, filter: isDarkMode ? "brightness(1.5)" : "none" }} />
            </Box>

            {/* Qidiruv paneli rejimlarga moslangan */}
            <Box sx={{ 
              display: { xs: "none", md: "flex" }, 
              alignItems: "center", 
              bgcolor: isDarkMode ? "#333" : "#f1f3f4", 
              px: 2, py: 0.8, borderRadius: "50px", width: "300px", 
              border: `1px solid ${isDarkMode ? "#444" : "#e0e0e0"}`
            }}>
              <Search sx={{ color: isDarkMode ? "#aaa" : "#888", mr: 1, fontSize: 20 }} />
              <InputBase 
                placeholder="QIDIRUV..." 
                sx={{ 
                    fontSize: '0.85rem', 
                    flex: 1, 
                    textTransform: 'uppercase',
                    color: isDarkMode ? "white" : "black"
                }} 
              />
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={toggleColorMode} sx={{ color: fstuBlue }}>
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <Button variant="contained" sx={{ bgcolor: fstuBlue, fontWeight: 700, borderRadius: '50px', px: 3 }}>
                KABINET
              </Button>
            </Stack>
          </Toolbar>

          {/* Menyu qatori */}
          <Box sx={{ display: "flex", borderTop: `1px solid ${isDarkMode ? "#333" : "#f0f0f0"}` }}>
            {navItems.map((item) => (
              <Box 
                key={item.name} 
                onMouseEnter={() => setActiveMenu(item.name)} 
                onMouseLeave={() => setActiveMenu(null)}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{
                    py: 2.5, px: 3,
                    color: activeMenu === item.name ? fstuBlue : (isDarkMode ? "#ccc" : "#444"),
                    fontWeight: 800, fontSize: "0.8rem",
                    textTransform: "uppercase",
                    "&::after": {
                      content: '""', position: 'absolute', bottom: 0, left: 0,
                      width: activeMenu === item.name ? '100%' : '0%',
                      height: 3, bgcolor: fstuBlue, transition: '0.3s'
                    }
                  }}
                  endIcon={megaMenuData[item.name] && <KeyboardArrowDown sx={{ transform: activeMenu === item.name ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
                >
                  {item.name}
                </Button>

                <AnimatePresence>
                  {activeMenu === item.name && megaMenuData[item.name] && (
                    <motion.div
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "fixed", left: 0, right: 0,
                        backgroundColor: isDarkMode ? "#1e1e1e" : "white", 
                        boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
                        zIndex: 1000, 
                        borderTop: `1px solid ${isDarkMode ? "#444" : "#eee"}`, 
                        overflow: "hidden"
                      }}
                    >
                      <Container maxWidth="xl" sx={{ py: 5, display: 'flex', alignItems: 'flex-start' }}>
                         {/* Mega Menu Chap tomoni */}
                         <Box sx={{ 
                           width: '280px', 
                           bgcolor: isDarkMode ? "#252525" : "#fbfcfd", 
                           p: 4, 
                           borderLeft: `6px solid ${fstuBlue}`, height: 'auto' 
                         }}>
                            <Typography variant="h5" fontWeight={900} color={fstuBlue} sx={{ mb: 1.5, textTransform: 'uppercase' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color={isDarkMode ? "#aaa" : "text.secondary"} sx={{ mb: 2, lineHeight: 1.6, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              BO'LIMLAR VA XIZMATLAR BILAN TANISHING
                            </Typography>
                         </Box>

                         {/* Mega Menu Linklar */}
                         <Box sx={{ 
                            flex: 1, display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            columnGap: 4, pl: 8 
                         }}>
                            {megaMenuData[item.name].map((column, idx) => (
                                <Box key={idx}>
                                    <Typography sx={{ 
                                        fontWeight: 800, color: fstuBlue, 
                                        fontSize: '0.75rem', mb: 2, pb: 1,
                                        borderBottom: `1px solid ${isDarkMode ? "#444" : "#eee"}`, 
                                        letterSpacing: 1,
                                        textTransform: 'uppercase'
                                    }}>
                                        {column.columnName}
                                    </Typography>

                                    <Stack spacing={0.5}>
                                        {column.items.map((link) => (
                                            <Box 
                                                key={link.name} component="a" href={link.url}
                                                sx={{ 
                                                    textDecoration: 'none', color: isDarkMode ? "#ddd" : "#333", display: 'flex',
                                                    alignItems: 'center', gap: 1.5, py: 1, px: 1.5, 
                                                    borderRadius: '8px', transition: '0.2s',
                                                    '&:hover': { 
                                                        bgcolor: alpha(fstuBlue, 0.1), color: fstuBlue,
                                                        '& .icon-box': { bgcolor: fstuBlue, color: 'white' }
                                                    }
                                                }}
                                            >
                                                <Box className="icon-box" sx={{ 
                                                    display: 'flex', p: 0.8, borderRadius: '8px', 
                                                    bgcolor: isDarkMode ? "#333" : "#f0f4f8", 
                                                    color: isDarkMode ? "#bbb" : "#555", transition: '0.3s'
                                                }}>
                                                    {React.cloneElement(link.icon, { sx: { fontSize: 18 } })}
                                                </Box>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                                  {link.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                         </Box>
                      </Container>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            ))}
          </Box>
        </Container>
      </AppBar>
    </>
  );
};

const TopLink = ({ icon, text }) => (
  <Button size="small" startIcon={icon} sx={{ color: "white", fontSize: "0.68rem", fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, '&:hover': { opacity: 1 } }}>
    {text}
  </Button>
);

export default TwoNavbar;