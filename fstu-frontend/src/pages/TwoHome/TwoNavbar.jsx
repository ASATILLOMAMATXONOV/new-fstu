import React, { useState, useContext } from "react";
import {
  AppBar, Toolbar, Box, Container, Stack, Typography, alpha,
  useScrollTrigger, Button, IconButton, Drawer, List, ListItem,
  ListItemText, Collapse, Divider, Menu, MenuItem
} from "@mui/material";
import {
  KeyboardArrowDown, ChevronRight, Brightness4, Brightness7,
  Menu as MenuIcon, Close as CloseIcon, ExpandLess, ExpandMore,
  Translate, Check, Telegram, YouTube, Instagram
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../components/theme/ColorModeContext";

import LogoImg from "../../assets/images/logo.png";

/* ===== DATA ===== */
  const megaMenuData = {
    "FAOLIYAT": [
      {
        category: "INNOVATSIYALAR",
        links: [
          { name: "Ilmiy tadqiqot faoliyati", url: "/scientific-research" },
          { name: "Startup va tadbirkorlik", url: "/startup" },
          { name: "Yoshlar siyosati", url: "/youth-policy" }
        ]
      },
      {
        category: "ILMIY FAOLIYAT",
        links: [
          { name: "Ilmiy faoliyat", url: "/science" },
          { name: "Oliy ta'limdan keyingi ta'lim", url: "/postgraduate" },
          { name: "Ilm fan", url: "/research" }
        ]
      }
    ]
  };

  const navItems = [
    { name: "UNIVERSITET", url: "/twopages" },
    { name: "FAOLIYAT", url: "#" },
    { name: "TA'LIM", url: "#" },
    { name: "KAMPUS HAQUDA", url: "/campus" },
    { name: "AXBOROT XIZMATI", url: "/news" }
  ];

const languages = [
  { code: "uz", label: "UZ",  },
  { code: "ru", label: "RU",  },
  { code: "en", label: "EN",  },
];


  const TwoNavbar = () => {
    const theme = useTheme();
    const { toggleColorMode } = useContext(ColorModeContext);
    const [activeMenu, setActiveMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [langAnchor, setLangAnchor] = useState(null);
const [currentLang, setCurrentLang] = useState("uz");

    const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

    return (
      <>
        <AppBar
          position="fixed"
          sx={{
            bgcolor: theme.palette.background.paper,
            boxShadow: trigger ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: "0.3s",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ height: { xs: 70, md: 90 }, justifyContent: "space-between", px: 0 }}>
              
              {/* LOGO */}
              <Box component="a" href="/" sx={{ display: "flex", alignItems: "center" }}>
                <img src={LogoImg} alt="Logo" style={{ height: 50 }} />
              </Box>

              {/* DESKTOP MENU */}
              <Box sx={{ display: { xs: "none", md: "flex" }, height: "100%", gap: 0.5 }}>
                {navItems.map(item => (
                  <Box
                    key={item.name}
                    onMouseEnter={() => setActiveMenu(item.name)}
                    onMouseLeave={() => setActiveMenu(null)}
                    sx={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
                  >
                    <Button
                      href={item.url}
                      disableRipple // ✅ Bosganda silkinishni o'chiradi
                      disableTouchRipple // ✅ Sensorli ekranlarda silkinishni o'chiradi
                      endIcon={megaMenuData[item.name] && <KeyboardArrowDown sx={{ fontSize: "1rem" }} />}
                      sx={{
                        color: activeMenu === item.name ? "primary.main" : "text.primary",
                        fontWeight: 700,
                        px: 2,
                        height: "100%",
                        borderRadius: 0,
                        fontSize: "0.85rem",
                        "&:hover": { bgcolor: "transparent" }, // Hoverda fon o'zgarmaydi
                        "&:active": { transform: "none" } // Bosilganda siljimaydi
                      }}
                    >
                      {item.name}
                    </Button>

                    <AnimatePresence>
                      {activeMenu === item.name && megaMenuData[item.name] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            position: "absolute",
                            top: "85%",
                            left: 0,
                            width: "max-content",
                            backgroundColor: theme.palette.background.paper,
                            borderTop: `3px solid ${theme.palette.primary.main}`,
                            boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
                            zIndex: 1100,
                            borderRadius: "0 0 8px 8px",
                            padding: "20px"
                          }}
                        >
                          <Stack direction="row" spacing={4}>
                            {megaMenuData[item.name].map((section) => (
                              <Box key={section.category} sx={{ minWidth: "180px" }}>
                                <Typography variant="caption" fontWeight={900} color="primary" sx={{ mb: 1.5, display: "block", textTransform: "uppercase" }}>
                                  {section.category}
                                </Typography>
                                <Stack spacing={1}>
                                  {section.links.map((link) => (
                                    <MenuLinkItem key={link.name} text={link.name} url={link.url} />
                                  ))}
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                ))}
              </Box>

              {/* TOOLS & SOCIALS */}
              <Stack direction="row" spacing={1} alignItems="center">
                
                {/* IJTIMOIY TARMOQLAR */}
                <Stack direction="row" spacing={0.5} sx={{ mr: 1, display: { xs: "none", lg: "flex" } }}>
                  <IconButton size="small" component="a" href="https://t.me/yourchannel" target="_blank" sx={{ color: "#26A5E4" }}>
                    <Telegram fontSize="small" />
                  </IconButton>
                  <IconButton size="small" component="a" href="https://instagram.com/yourprofile" target="_blank" sx={{ color: "#E4405F" }}>
                    <Instagram fontSize="small" />
                  </IconButton>
                  <IconButton size="small" component="a" href="https://youtube.com/yourchannel" target="_blank" sx={{ color: "#FF0000" }}>
                    <YouTube fontSize="small" />
                  </IconButton>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 60, my: "auto", display: { xs: "none", lg: "block" } }} />

                {/* TIL TUGMASI */}
               <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: "3px",
                    px: 0.5,
                    py: 0.25,
                  }}
                >

                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      disableRipple
                      onClick={() => setCurrentLang(lang.code)}
                      sx={{
                        minWidth: 42,
                        height: 30,
                        px: 1,
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        borderRadius: "3px",
                        display: "flex",
                        gap: 0.4,
                        color:
                          currentLang === lang.code
                            ? theme.palette.primary.contrastText
                            : "text.secondary",
                        bgcolor:
                          currentLang === lang.code
                            ? "primary.main"
                            : "transparent",
                        "&:hover": {
                          bgcolor:
                            currentLang === lang.code
                              ? "primary.main"
                              : alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {lang.label}
                    </Button>
                  ))}
                </Stack>


                <Menu anchorEl={langAnchor} open={!!langAnchor} onClose={() => setLangAnchor(null)}>
                  {languages.map(lang => (
                    <MenuItem key={lang.code} onClick={() => { setCurrentLang(lang); setLangAnchor(null); }} selected={currentLang.code === lang.code}>
                      <ListItemText primary={lang.label} />
                      {currentLang.code === lang.code && <Check fontSize="small" sx={{ ml: 1 }} />}
                    </MenuItem>
                  ))}
                </Menu>

                <IconButton onClick={toggleColorMode} color="primary" disableRipple>
                  {theme.palette.mode === "dark" ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                </IconButton>

                <IconButton sx={{ display: { md: "none" } }} onClick={() => setMobileOpen(true)} disableRipple>
                  <MenuIcon />
                </IconButton>
                
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>
        <Toolbar />
      </>
    );
  };

const MenuLinkItem = ({ text, url }) => {
  return (
    <Box
      component="a"
      href={url}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        textDecoration: "none",
        color: "text.secondary",
        transition: "0.2s",
        "&:hover": { color: "primary.main", transform: "translateX(4px)" }
      }}
    >
      <ChevronRight sx={{ fontSize: 14, color: "primary.main" }} />
      <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{text}</Typography>
    </Box>
  );
};

export default TwoNavbar;