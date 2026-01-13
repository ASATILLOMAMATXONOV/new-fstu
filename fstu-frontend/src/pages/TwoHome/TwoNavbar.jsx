import React, { useState, useContext } from "react";
import {
  AppBar, Toolbar, Box, Container, Stack, Typography, alpha,
  useScrollTrigger, Button, IconButton, InputBase, Drawer,
  List, ListItem, ListItemText, Divider, Collapse, useMediaQuery, ListItemIcon
} from "@mui/material";
import {
  KeyboardArrowDown, Search, Brightness4, Brightness7, School,
  Person, AccountBalance, Groups, Biotech, Settings, Public, 
  VolunteerActivism, Facebook, Instagram, YouTube, Telegram,
  Phone, History, WorkspacePremium, MenuBook, Campaign, HelpOutline,
  Menu as MenuIcon, Close, Assignment, Engineering, ExpandLess, ExpandMore
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../../components/theme/ColorModeContext";
import LogoImg from "../../assets/images/logo.png";
import uzFlag from "../../assets/flags/uz.jpeg";
import ruFlag from "../../assets/flags/ru.jpeg";
import gbFlag from "../../assets/flags/en.png";

const FLAGS = { UZ: uzFlag, RU: ruFlag, EN: gbFlag };
const fstuBlue = "#00355eff";

const Flag = ({ src, sx }) => (
  <Box component="img" src={src} sx={{ width: 22, height: 14, borderRadius: "2px", objectFit: "cover", display: "block", ...sx }} />
);

const megaMenuData = {
  UNIVERSITET: [
    { columnName: "UMUMIY", items: [{ name: "Rektor murojaati", icon: <Campaign />, url: "/" }, { name: "Universitet haqida", icon: <AccountBalance />, url: "/" }, { name: "Ustav", icon: <MenuBook />, url: "/" }] },
    { columnName: "TUZILMA", items: [{ name: "Ma'muriyat", icon: <Groups />, url: "/" }, { name: "Fakultetlar", icon: <AccountBalance />, url: "/" }, { name: "Kafedralar", icon: <AccountBalance />, url: "/" }, { name: "Markazlar", icon: <Groups />, url: "/" }, { name: "Nazorat kengashi", icon: <Engineering />, url: "/" }] },
    { columnName: "NAZORAT", items: [{ name: "Sifat nazorati", icon: <WorkspacePremium />, url: "/" }, { name: "Korrupsiyaga qarshi", icon: <Settings />, url: "/" }, { name: "E'tirozlar", icon: <HelpOutline />, url: "/" }, { name: "Matbuot xizmati", icon: <Campaign />, url: "/" }] },
    { columnName: "ALOQA", items: [{ name: "Bog'lanish", icon: <Phone />, url: "/" }] },
  ],
  FAOLIYAT: [
    { columnName: "MA’NAVIY FAOLIYAT", items: [{ name: "Ma'naviyat", icon: <VolunteerActivism />, url: "/" }, { name: "Sport", icon: <History />, url: "/" }, { name: "Madaniyat", icon: <Campaign />, url: "/" }] },
    { columnName: "O'QUV FAOLIYAT", items: [{ name: "Bakalavriat", icon: <School />, url: "/" }, { name: "Magistratura", icon: <School />, url: "/" }, { name: "NORMATIV XUJJATLAR", icon: <MenuBook />, url: "/" }] },
    { columnName: "ILMIY INNOVATSION", items: [{ name: "Doktorantura", icon: <Biotech />, url: "/" }, { name: "Jurnallar", icon: <MenuBook />, url: "/" }] },
    { columnName: "XALQARO FAOLIYAT", items: [{ name: "Xalqaro hamkorlik", icon: <Public />, url: "/" }] },
  ],
};

const navItems = [
  { name: "UNIVERSITET" },
  { name: "FAOLIYAT" },
  { name: "TALABALAR", url: "/" },
  { name: "ABITURIYENT", url: "/" },
  { name: "YANGILIKLAR", url: "/" },
];

const TwoNavbar = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("lg")); // lg dan kichik ekranlar uchun mobil rejim
  const { toggleColorMode } = useContext(ColorModeContext);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 20 });
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [lang, setLang] = useState("UZ");

  const handleMobileExpand = (name) => {
    setMobileExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: isDarkMode ? "#121212" : "white", color: isDarkMode ? "white" : fstuBlue, boxShadow: trigger ? "0 4px 20px rgba(0,0,0,0.1)" : "none", backgroundImage: "none" }}>
        
        {/* --- TOP BAR --- */}
        {!isMobile && (
          <Box sx={{ bgcolor: fstuBlue, color: "white", py: 0.8 }}>
            <Container maxWidth="xl">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2.5} alignItems="center">
                  <Facebook fontSize="small" /> <Instagram fontSize="small" /> <Telegram fontSize="small" /> <YouTube fontSize="small" />
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.2)", height: 16 }} />
                  <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.7 }}><Phone sx={{ fontSize: 14 }} /> +998 (73) 241-12-06</Typography>
                </Stack>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Stack direction="row" spacing={2.5}>
                    <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.6 }}><Public sx={{ fontSize: 14 }} /> SDGS</Typography>
                    <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.6 }}><Assignment sx={{ fontSize: 14 }} /> Hujjat almashinuvi</Typography>
                    <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.6, fontWeight: 700 }}><Person sx={{ fontSize: 14 }} /> HEMIS</Typography>
                  </Stack>
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.2)", height: 16 }} />
                  <Stack direction="row" spacing={1.5}>
                    {["UZ", "RU", "EN"].map((l) => (
                      <Box key={l} onClick={() => setLang(l)} sx={{ cursor: "pointer", opacity: lang === l ? 1 : 0.4 }}><Flag src={FLAGS[l]} /></Box>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Container>
          </Box>
        )}

        {/* --- MAIN NAVBAR --- */}
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between", py: isMobile ? 1 : 1.5 }}>
            <Box component="a" href="/" sx={{ flexShrink: 0 }}>
              <img src={LogoImg} alt="Logo" style={{ height: isMobile ? 45 : 95, display: "block" }} />
            </Box>

            <Stack direction="column" alignItems="flex-end" spacing={1} sx={{ flexGrow: 1 }}>
              {!isMobile ? (
                <>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ display: "flex", alignItems: "center", bgcolor: alpha(fstuBlue, 0.05), px: 2, py: 0.5, borderRadius: "4px" }}>
                      <Search sx={{ color: "#777", mr: 1, fontSize: 18 }} />
                      <InputBase placeholder="Qidiruv..." sx={{ fontSize: "0.85rem", width: "180px" }} />
                    </Box>
                    <IconButton onClick={toggleColorMode} size="small" sx={{ border: `1px solid ${alpha(fstuBlue, 0.1)}` }}>
                      {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
                    </IconButton>
                    <Button variant="outlined" sx={{ borderColor: fstuBlue, color: fstuBlue, fontWeight: 700, px: 3, height: "36px" }}>LOGIN</Button>
                  </Stack>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {navItems.map((item) => (
                      <Box key={item.name} onMouseEnter={() => megaMenuData[item.name] && setActiveMenu(item.name)} onMouseLeave={() => setActiveMenu(null)} sx={{ position: "relative" }}>
                        <Button component={item.url ? "a" : "button"} href={item.url} sx={{ py: 1, px: 2, color: activeMenu === item.name ? fstuBlue : "inherit", fontWeight: 700, fontSize: "0.85rem" }}>
                          {item.name} {megaMenuData[item.name] && <KeyboardArrowDown sx={{ fontSize: 16, ml: 0.5 }} />}
                        </Button>
                        <AnimatePresence>
                          {activeMenu === item.name && megaMenuData[item.name] && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                              style={{ position: "fixed", left: 0, right: 0, backgroundColor: isDarkMode ? "#1e1e1e" : "white", boxShadow: "0 40px 80px rgba(0,0,0,0.15)", zIndex: 1000, borderTop: `2px solid ${fstuBlue}` }}>
                              <Container maxWidth="xl" sx={{ py: 0, display: "flex" }}>
                                <Box sx={{ width: "300px", bgcolor: alpha(fstuBlue, 0.03), p: 6, borderRight: `1px solid ${alpha(fstuBlue, 0.08)}` }}>
                                  <Typography variant="h4" sx={{ fontWeight: 600, fontSize: "1.25rem", color: fstuBlue }}>{item.name}</Typography>
                                  <Box sx={{ width: "50px", height: "4px", bgcolor: fstuBlue, mb: 3 }} />
                                  <Typography variant="body2" color="text.secondary">Farg'ona davlat texnika unversiteti</Typography>
                                </Box>
                                <Box sx={{ flex: 1, p: 3, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                                  {megaMenuData[item.name].map((col, idx) => (
                                    <Box key={idx}>
                                      <Typography sx={{ fontWeight: 800, color: fstuBlue, fontSize: "11px", mb: 2.5, textTransform: "uppercase" }}>{col.columnName}</Typography>
                                      <Stack spacing={1.8}>
                                        {col.items.map((link) => (
                                          <Stack key={link.name} direction="row" spacing={1.5} component="a" href={link.url} sx={{ textDecoration: "none", color: "inherit", "&:hover": { color: fstuBlue, transform: "translateX(5px)" }, transition: "0.2s" }}>
                                            <Box sx={{ color: fstuBlue, display: "flex" }}>{link.icon}</Box>
                                            <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>{link.name}</Typography>
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
                </>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton onClick={toggleColorMode} color="inherit">
                    {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                  <IconButton onClick={() => setMobileOpen(true)} color="inherit"><MenuIcon fontSize="large" /></IconButton>
                </Stack>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- RESPONSIVE MOBILE DRAWER --- */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: "85%", maxWidth: 360 } }}>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <img src={LogoImg} alt="Logo" style={{ height: 40 }} />
            <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </Stack>

          {/* Mobil Qidiruv */}
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#f5f5f5", px: 2, py: 1, borderRadius: "8px", mb: 2 }}>
            <Search sx={{ color: "#777", mr: 1 }} />
            <InputBase placeholder="Qidiruv..." fullWidth />
          </Box>

          <List disablePadding>
            {navItems.map((item) => (
              <React.Fragment key={item.name}>
                <ListItem button onClick={() => megaMenuData[item.name] ? handleMobileExpand(item.name) : (window.location.href = item.url)} sx={{ py: 1.5, borderBottom: "1px solid #eee" }}>
                  <ListItemText primary={item.name} primaryTypographyProps={{ fontWeight: 700, color: fstuBlue }} />
                  {megaMenuData[item.name] && (mobileExpanded[item.name] ? <ExpandLess /> : <ExpandMore />)}
                </ListItem>
                {megaMenuData[item.name] && (
                  <Collapse in={mobileExpanded[item.name]} timeout="auto">
                    <Box sx={{ bgcolor: alpha(fstuBlue, 0.02), pl: 2, pb: 2 }}>
                      {megaMenuData[item.name].map((col) => (
                        <Box key={col.columnName} sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: "#999", ml: 2, textTransform: "uppercase" }}>{col.columnName}</Typography>
                          {col.items.map((sub) => (
                            <ListItem button key={sub.name} component="a" href={sub.url} sx={{ py: 1 }}>
                              <ListItemIcon sx={{ minWidth: 35, color: fstuBlue }}>{sub.icon}</ListItemIcon>
                              <ListItemText primary={sub.name} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }} />
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

          <Box sx={{ mt: 3, p: 2 }}>
            <Button fullWidth variant="contained" sx={{ bgcolor: fstuBlue, mb: 2, fontWeight: 700 }}>LOGIN</Button>
            <Stack direction="row" justifyContent="center" spacing={2}>
              {["UZ", "RU", "EN"].map((l) => (
                <IconButton key={l} onClick={() => setLang(l)} sx={{ border: lang === l ? `2px solid ${fstuBlue}` : "1px solid #eee" }}>
                  <Flag src={FLAGS[l]} />
                </IconButton>
              ))}
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default TwoNavbar;