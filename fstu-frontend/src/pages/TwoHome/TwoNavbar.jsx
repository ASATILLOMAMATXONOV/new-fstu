import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Stack,
  Typography,
  alpha,
  useScrollTrigger,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ChevronRight,
  Language,
  Search,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../components/theme/ColorModeContext";

import LogoImg from "../../assets/images/logo.png";

const megaMenuData = {
  "FAOLIYAT": [
    {
      category: "INNOVATSIYALAR",
      links: ["Ilmiy tadqiqot faoliyati", "Startup va tadbirkorlik", "Yoshlar siyosati"]
    },
    {
      category: "ILMIY FAOLIYAT",
      links: ["Ilmiy faoliyat", "Oliy ta'limdan keyingi ta'lim", "Ilm fan"]
    },
    {
      category: "ERASMUS PLUS",
      links: ["Erasmus+", "MechaUz", "Spacecom"]
    }
  ],
  "TA'LIM": [
    {
      category: "O'QUV FAOLIYAT",
      links: ["O'quv faoliyat", "Normativ hujjatlar", "Bakalavriat"]
    },
    {
      category: "MASOFAVIY TA'LIM",
      links: ["Moodle tizimi", "Video darslar"]
    }
  ]
};

const navItems = ["UNIVERSITET", "FAOLIYAT", "TA'LIM", "KAMPUS HAQUDA", "AXBOROT XIZMATI"];

const TwoNavbar = () => {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
          boxShadow: trigger ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: "0.3s ease-in-out",
          backgroundImage: "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ height: { xs: 70, md: 90 }, justifyContent: "space-between", px: "0 !important" }}>
            
            {/* 1. LOGO */}
            <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <img src={LogoImg} alt="Logo" style={{ height: "50px", objectFit: "contain" }} />
            </Box>

            {/* 2. DESKTOP NAV */}
            <Box sx={{ display: { xs: "none", md: "flex" }, height: "100%", gap: 1 }}>
              {navItems.map((item) => (
                <Box
                  key={item}
                  onMouseEnter={() => setActiveMenu(item)}
                  onMouseLeave={() => setActiveMenu(null)}
                  sx={{ position: "relative", display: "flex", alignItems: "center", height: "100%" }}
                >
                  <Button
                    disableRipple
                    endIcon={megaMenuData[item] && <KeyboardArrowDown sx={{ 
                      fontSize: 18, transition: "0.3s", 
                      transform: activeMenu === item ? "rotate(180deg)" : "none" 
                    }} />}
                    sx={{
                      color: activeMenu === item ? "#0067ff" : (theme.palette.mode === "dark" ? "white" : "#02509eff"),
                      fontWeight: 700, px: 2, fontSize: "0.85rem", height: "100%", borderRadius: 0,
                      "&:hover": { bgcolor: "transparent" } // HOVER BACKGROUND O'CHIRILDI
                    }}
                  >
                    {item}
                  </Button>

                  <AnimatePresence>
                    {activeMenu === item && megaMenuData[item] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: "absolute", top: "90%", left: 0,
                          backgroundColor: theme.palette.mode === "dark" ? "#1E1E1E" : "white",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                          borderTop: "3px solid #0067ff", borderRadius: "0 0 8px 8px",
                          padding: "25px", zIndex: 100,
                          display: "flex", gap: "30px", width: "max-content"
                        }}
                      >
                        {megaMenuData[item].map((section, idx) => (
                          <Box key={idx} sx={{ minWidth: "180px" }}>
                            <Typography variant="caption" fontWeight={900} sx={{ color: "#02509eff", mb: 2, display: "block", letterSpacing: 1 }}>
                              {section.category}
                            </Typography>
                            <Stack spacing={0.5}>
                              {section.links.map((link, lIdx) => (
                                <MenuLinkItem key={lIdx} text={link} />
                              ))}
                            </Stack>
                          </Box>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              ))}
            </Box>

            {/* 3. TOOLS */}
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={toggleColorMode} sx={{ color: theme.palette.mode === "dark" ? "#0067ff" : "#02509eff" }}>
                {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: "none" }, color: "#02509eff" }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: "85%", maxWidth: 350 } }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img src={LogoImg} alt="Logo" style={{ height: "40px" }} />
          <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {navItems.map((item) => (
            <Box key={item}>
              <ListItem 
                button 
                disableRipple
                onClick={() => megaMenuData[item] ? setMobileSubMenu(mobileSubMenu === item ? null : item) : null}
                sx={{ "&:hover": { bgcolor: "transparent" } }} // MOBILE HOVER BACKGROUND O'CHIRILDI
              >
                <ListItemText primary={item} primaryTypographyProps={{ fontWeight: 700, color: mobileSubMenu === item ? "#0067ff" : "inherit" }} />
                {megaMenuData[item] && (mobileSubMenu === item ? <ExpandLess sx={{color:"#0067ff"}} /> : <ExpandMore />)}
              </ListItem>
              {megaMenuData[item] && (
                <Collapse in={mobileSubMenu === item} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ ml: 2 }}>
                    {megaMenuData[item].map((sec) => (
                      <Box key={sec.category} sx={{ py: 1, px: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#0067ff" }}>{sec.category}</Typography>
                        {sec.links.map((link) => (
                          <ListItem button disableRipple key={link} sx={{ "&:hover": { bgcolor: "transparent" }, pl: 1 }}>
                            <ListItemText primary={link} primaryTypographyProps={{ fontSize: "0.85rem" }} />
                          </ListItem>
                        ))}
                      </Box>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Drawer>
      <Toolbar />
    </>
  );
};

// Hover Link Komponenti (Bunda background yo'q edi, chiziq animatsiyasi qoldi)
const MenuLinkItem = ({ text }) => {
  const [hover, setHover] = useState(false);
  return (
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} 
         sx={{ display: "flex", alignItems: "center", cursor: "pointer", py: 0.5 }}>
      <motion.div animate={{ opacity: hover ? 1 : 0, x: hover ? 0 : -5 }} style={{ display: "flex", color: "#0067ff", marginRight: "5px" }}>
        <ChevronRight sx={{ fontSize: "14px" }} />
      </motion.div>
      <Box sx={{ position: "relative" }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: hover ? 600 : 400, color: hover ? "#0067ff" : "inherit", transition: "0.2s" }}>
          {text}
        </Typography>
        <Box sx={{ position: "absolute", bottom: -1, left: 0, width: hover ? "100%" : "0%", height: "1.5px", bgcolor: "#0067ff", transition: "0.3s" }} />
      </Box>
    </Box>
  );
};

export default TwoNavbar;