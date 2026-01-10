import React, { useState, useContext } from "react";
import {
  AppBar, Toolbar, Box, Container, Stack, Typography, alpha,
  useScrollTrigger, Button, IconButton, InputBase, Drawer, 
  List, ListItem, ListItemText, Divider, Collapse, useMediaQuery, ListItemIcon
} from "@mui/material";
import {
  KeyboardArrowDown, Search, Brightness4, Brightness7, School,
  Info, Person, Description, Engineering, AccountBalance, 
  Groups, Biotech, Settings, Public, VolunteerActivism, 
  Facebook, Instagram, YouTube, Telegram, LocationOn, 
  Phone, History, WorkspacePremium, MenuBook, Campaign, HelpOutline,
  Email, Assignment, Menu as MenuIcon, Close, ExpandLess, ExpandMore
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../components/theme/ColorModeContext";
import LogoImg from "../../assets/images/logo.png";

// --- YORDAMCHI KOMPONENTLAR ---
const Flag = ({ src }) => (
  <img 
    src={src} 
    alt="flag" 
    style={{ width: 22, height: 14, borderRadius: '2px', objectFit: 'cover', display: 'block' }} 
  />
);

const fstuBlue = "#00355eff";

// --- MEGA MENU MA'LUMOTLARI ---
const megaMenuData = {
  "UNIVERSITET": [
    { columnName: "UMUMIY", items: [
      { name: "Rektor murojaati", icon: <Campaign />, url: "/twopages" },
      { name: "Universitet haqida", icon: <AccountBalance />, url: "/twopages" },
      { name: "Ustav", icon: <MenuBook />, url: "/twopages" },
    ]},
    { columnName: "TUZILMA", items: [
      { name: "Ma'muriyat", icon: <Groups />, url: "/administration" },
      { name: "Fakultetlar", icon: <AccountBalance />, url: "/twofaculties" },
      { name: "Kafedralar", icon: <AccountBalance />, url: "/twoDepartments" },
      { name: "Markazlar va bo‘limlar", icon: <Groups />, url: "/twocentrs" },
      { name: "Nazorat kengashi", icon: <Engineering />, url: "/twocentrs" },
    ]},
    // { columnName: "FAOLIYAT", items: [
    //   { name: "O'quv ishlari", icon: <School />, url: "/twopages" },
    //   { name: "Ilmiy faoliyat", icon: <Biotech />, url: "/twopages" },
    //   { name: "Xalqaro aloqalar", icon: <Public />, url: "/twopages" },
    //   { name: "Ma'naviyat", icon: <VolunteerActivism />, url: "/twopages" },
    // ]},
    { columnName: "NAZORAT", items: [
      { name: "Sifat nazorati", icon: <WorkspacePremium />, url: "/twopages" },
      { name: "Korrupsiyaga qarshi", icon: <Settings />, url: "/twopages" },
      { name: "E'tirozlar", icon: <HelpOutline />, url: "/twopages" },
      { name: "Matbuot xizmati", icon: <Campaign />, url: "/twopages" },
    ]},
    { columnName: "ALOQA", items: [
      { name: "Bog'lanish", icon: <Phone />, url: "/twocontact" },
      // { name: "Manzil", icon: <LocationOn />, url: "/location" },
      // { name: "Virtual qabulxona", icon: <Person />, url: "/virtual" },
      // { name: "Bo'sh ish o'rinlari", icon: <Groups />, url: "/jobs" },
    ]}
  ],
  "FAOLIYAT": [
    { columnName: "MA’NAVIY FAOLIYAT", items: [
      { name: "Ma'naviyat", icon: <VolunteerActivism />, url: "/twopages" },
      { name: "Sport", icon: <History />, url: "/twopages" },
      { name: "Madaniyat", icon: <Campaign />, url: "/twopages" }
    ]},
    { columnName: "O'QUV FAOLIYAT", items: [
      { name: "Bakalavriat", icon: <School />, url: "/twopages" },
      { name: "Magistratura", icon: <School />, url: "/twopages" },
      { name: "NORMATIV XUJJATLAR", icon: <MenuBook />, url: "/twopages" }
    ]},
    { columnName: "ILMIY INNOVATSION FAOLIYAT", items: [
      { name: "Doktorantura", icon: <Biotech />, url: "/twopages" },
      { name: "Jurnallar", icon: <MenuBook />, url: "/journals" }
    ]},
    { columnName: "MOLIYAVIY KO'RSATKICHLAR", items: [
      { name: "Texnopark", icon: <Engineering />, url: "/twopages" },
      { name: "Startaplar", icon: <Biotech />, url: "/startups" }
    ]},
    { columnName: "XALQARO FAOLIYAT", items: [
      { name: "Xalqaro hamkorlik", icon: <Public />, url: "/twopages" },
      { name: "Xalqaro grantlar", icon: <Biotech />, url: "/twopages" }
    ]}
  ]
};

const navItems = [
  { name: "UNIVERSITET" }, 
  { name: "FAOLIYAT" }, 
  { name: "TALABALAR", url: "/students" }, 
  { name: "ABITURIYENT", url: "/adm" }, 
  { name: "YANGILIKLAR", url: "/news" }
];

const TwoNavbar = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { toggleColorMode } = useContext(ColorModeContext);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [lang, setLang] = useState('UZ');

  const handleMobileExpand = (name) => {
    setMobileExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      <AppBar position="sticky" sx={{ 
        bgcolor: isDarkMode ? "#121212" : "white", 
        color: isDarkMode ? "white" : fstuBlue, 
        boxShadow: trigger ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
        backgroundImage: "none",
        transition: '0.3s'
      }}>
        
        {/* --- TOP BAR (Desktop) --- */}
        {!isMobile && (
          <Box sx={{ bgcolor: fstuBlue, color: "white", py: 0.8, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Container maxWidth="xl">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                
                {/* Ijtimoiy tarmoqlar va Tel */}
                <Stack direction="row" spacing={2.5} alignItems="center">
                  <Facebook fontSize="small" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }} />
                  <Instagram fontSize="small" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }} />
                  <Telegram fontSize="small" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }} />
                  <YouTube fontSize="small" sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }} />
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 16, mx: 1 }} />
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.7, fontWeight: 500 }}>
                    <Phone sx={{ fontSize: 14 }} /> +998 (73) 241-12-06
                  </Typography>
                </Stack>

                {/* Xizmatlar va Tillar */}
                <Stack direction="row" spacing={3} alignItems="center">
                  <Stack direction="row" spacing={2.5}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer', fontWeight: 600 }}>
                      <Public sx={{ fontSize: 14 }} /> SDGS
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer', fontWeight: 600 }}>
                      <Assignment sx={{ fontSize: 14 }} /> Hujjat almashinuvi
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, cursor: 'pointer', fontWeight: 700 }}>
                      <Person sx={{ fontSize: 14 }} /> HEMIS
                    </Typography>
                  </Stack>

                  <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', height: 16 }} />

                  {/* Tillar bo'limi */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {['UZ', 'RU', 'EN'].map((l) => (
                      <Box 
                        key={l}
                        onClick={() => setLang(l)} 
                        sx={{ 
                          cursor: 'pointer', 
                          opacity: lang === l ? 1 : 0.4, 
                          transform: lang === l ? 'scale(1.1)' : 'scale(1)',
                          transition: '0.2s'
                        }}
                      >
                        <Flag src={l === 'UZ' ? "https://flagcdn.com/uz.svg" : l === 'RU' ? "https://flagcdn.com/ru.svg" : "https://flagcdn.com/gb.svg"} />
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Container>
          </Box>
        )}

        {/* --- MAIN NAVBAR --- */}
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: isMobile ? 1 : 1.5, justifyContent: 'space-between' }}>
            <Box component="a" href="/" sx={{ display: "flex", alignItems: "center" }}>
              <img src={LogoImg} alt="Logo" style={{ height: isMobile ? 40 : (trigger ? 45 : 55), transition: '0.3s' }} />
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", bgcolor: alpha(fstuBlue, 0.05), px: 2, py: 0.6, borderRadius: "4px" }}>
                <Search sx={{ color: "#777", mr: 1, fontSize: 18 }} />
                <InputBase placeholder="Qidiruv..." sx={{ fontSize: '0.85rem', width: '150px' }} />
              </Box>
              
              <IconButton onClick={toggleColorMode} size="small" sx={{ border: `1px solid ${alpha(fstuBlue, 0.1)}` }}>
                {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
              </IconButton>
              
              {!isMobile && (
                <Button variant="outlined" sx={{ borderColor: fstuBlue, color: fstuBlue, fontWeight: 700, px: 3 }}>
                  LOGIN
                </Button>
              )}

              {isMobile && (
                <IconButton onClick={() => setMobileOpen(true)} color="inherit">
                  <MenuIcon />
                </IconButton>
              )}
            </Stack>
          </Toolbar>

          {/* --- DESKTOP NAVIGATION + MEGA MENU --- */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1, borderTop: `1px solid ${alpha(fstuBlue, 0.08)}` }}>
              {navItems.map((item) => (
                <Box 
                  key={item.name} 
                  onMouseEnter={() => setActiveMenu(item.name)} 
                  onMouseLeave={() => setActiveMenu(null)}
                  sx={{ position: 'relative' }}
                >
                  <Button sx={{ py: 2.5, px: 2.5, color: activeMenu === item.name ? fstuBlue : "inherit", fontWeight: 700, fontSize: "0.85rem", borderRadius: 0 }}>
                    {item.name} {megaMenuData[item.name] && <KeyboardArrowDown sx={{ fontSize: 16, ml: 0.5 }} />}
                  </Button>

                  <AnimatePresence>
                    {activeMenu === item.name && megaMenuData[item.name] && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        style={{ position: "fixed", left: 0, right: 0, backgroundColor: isDarkMode ? "#1e1e1e" : "white", boxShadow: "0 40px 80px rgba(0,0,0,0.15)", zIndex: 1000, borderTop: `2px solid ${fstuBlue}` }}
                      >
                        <Container maxWidth="xl" sx={{ py: 0, display: "flex" }}>
                          {/* Chap Panel */}
                          <Box sx={{ width: "300px", bgcolor: alpha(fstuBlue, 0.03), p: 6, borderRight: `1px solid ${alpha(fstuBlue, 0.08)}` }}>
                            <Typography variant="h4" sx={{ fontWeight: 600, fontSize: "1.25rem", color: fstuBlue,  textTransform: 'uppercase' }}>{item.name}</Typography>
                            <Box sx={{ width: "50px", height: "4px", bgcolor: fstuBlue, mb: 3 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>Farg'ona Politexnika Instituti {item.name.toLowerCase()} xizmatlari.</Typography>
                          </Box>

                          {/* 5 Ustunli Grid */}
                          <Box sx={{ flex: 1, p: 3, display: 'grid', flexWrap: 'wrap', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                            {megaMenuData[item.name].map((col, idx) => (
                              <Box key={idx}>
                                <Typography sx={{ fontWeight: 800, color: fstuBlue, fontSize: "11px", mb: 2.5, letterSpacing: 1.2, textTransform: 'uppercase' }}>{col.columnName}</Typography>
                                <Stack spacing={1.8}>
                                  {col.items.map((link) => (
                                    <Stack key={link.name} direction="row" spacing={1.5} component="a" href={link.url} sx={{ textDecoration: "none", color: "inherit", "&:hover": { color: fstuBlue, transform: "translateX(5px)" }, transition: "0.2s" }}>
                                      <Box sx={{ color: fstuBlue, opacity: 0.8, display: 'flex' }}>{React.cloneElement(link.icon, { sx: { fontSize: 18 } })}</Box>
                                      <Typography sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: "0.75rem" }}>{link.name}</Typography>
                                    </Stack>
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
          )}
        </Container>
      </AppBar>

      {/* --- MOBILE DRAWER --- */}
      <Drawer 
        anchor="right" 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: '100%', maxWidth: 320 } }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <img src={LogoImg} alt="Logo" style={{ height: 35 }} />
            <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </Stack>
          
          <List disablePadding>
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                <ListItem 
                  button 
                  onClick={() => megaMenuData[item.name] ? handleMobileExpand(item.name) : (window.location.href = item.url)}
                  sx={{ py: 1.8, borderBottom: `1px solid ${alpha('#000', 0.05)}` }}
                >
                  <ListItemText primary={item.name} primaryTypographyProps={{ fontWeight: 700 }} />
                  {megaMenuData[item.name] && (mobileExpanded[item.name] ? <ExpandLess /> : <ExpandMore />)}
                </ListItem>

                {megaMenuData[item.name] && (
                  <Collapse in={mobileExpanded[item.name]} timeout="auto">
                    <Box sx={{ bgcolor: alpha(fstuBlue, 0.02), pl: 2, pb: 2 }}>
                      {megaMenuData[item.name].map((col) => (
                        <Box key={col.columnName} sx={{ mt: 3 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: fstuBlue, ml: 2, textTransform: 'uppercase' }}>{col.columnName}</Typography>
                          {col.items.map((sub) => (
                            <ListItem button key={sub.name} sx={{ py: 1, mt: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 35, color: fstuBlue }}>{sub.icon}</ListItemIcon>
                              <ListItemText primary={sub.name} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                            </ListItem>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
              {['UZ', 'RU', 'EN'].map(l => (
                 <IconButton key={l} onClick={() => setLang(l)} sx={{ border: `1px solid ${lang === l ? fstuBlue : '#eee'}` }}>
                    <Flag src={l === 'UZ' ? "https://flagcdn.com/uz.svg" : l === 'RU' ? "https://flagcdn.com/ru.svg" : "https://flagcdn.com/gb.svg"} />
                 </IconButton>
              ))}
            </Stack>
            <Button fullWidth variant="contained" sx={{ bgcolor: fstuBlue, py: 1.5, fontWeight: 700 }}>LOGIN</Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default TwoNavbar;