import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  Container,
  Collapse,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

import "../../assets/styles/Navbar.css";
import { useLocation } from "react-router-dom";
import logoImage from "../../assets/images/logo.png";

/* MENU DATA */
const menuData = [
  {
    label: "UNIVERSITET",
    key: "universitet",
    columns: [
      { title: "ASOSIY", items: ["Rektor murojaati", "Fakultetlar", "Kafedralar"] },
      { title: "XODIMLAR", items: ["Universitet haqida", "Maʼmuriyat", "Bitiruvchilar"] },
      { title: "HAMKORLIK", items: ["Xalqaro bo'lim", "Almashinuv dasturi"] }
    ],
  },
  {
    label: "QABUL 2025",
    key: "qabul",
    columns: [
      { title: "INFRATUZILMA", items: ["Yotoqxona", "Sport majmuasi"] },
      { title: "ABITURIYENTLAR", items: ["Xalqaro almashinuv dasturlari to'g'risida batafsil ma'lumot", "Imtihonlar", "Grantlar"] },
      { title: "INFRAbTUZILMA", items: ["Yobtoqxona", "Sport majmuasi"] },
      { title: "INFRATUZILMA", items: ["Yotoqxona", "Sport majmuasi"] },
      { title: "ABITURIYENTLAR", items: ["Xalqaro almashinuv dasturlari to'g'risida batafsil ma'lumot", "Imtihonlar", "Grantlar"] },
      { title: "INFRAbTUZILMA", items: ["Yobtoqxona", "Sport majmuasi"] },
      { title: "INFRATUZILMA", items: ["Yotoqxona", "Sport majmuasi"] },
      { title: "ABITURIYENTLAR", items: ["Xalqaro almashinuv dasturlari to'g'risida batafsil ma'lumot", "Imtihonlar", "Grantlar"] },
      { title: "INFRAbTUZILMA", items: ["Yobtoqxona", "Sport majmuasi"] },
    ]
  },
  {
    label: "KAMPUS",
    key: "kampus",
    columns: [
      { title: "INFRATUZILMA", items: ["Yotoqxona", "Sport majmuasi"] },
      { title: "XIZMATLAR", items: ["Wi-Fi zonalar", "Oshxona"] },
      { title: "XAVFSIZLIK", items: ["Qo'riqlash", "Tez yordam"] }
    ]
  },
  {
    label: "faoliyat",
    key: "faoliyat",
    columns: [
      { title: "INFRATUZILMA", items: ["Yotoqxona", "Sport majmuasi"] },
    ]
  }
];

const menuIcons = {
  talim: <MenuBookIcon fontSize="small" className="link-icon" />,
};

// 🌟 Mobile Menu Element
const MobileMenuItem = ({ menu, menuIcons, setDrawerOpen }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  
  const handleLinkClick = () => {
      setDrawerOpen(false);
  }

  return (
    <React.Fragment>
      <ListItemButton onClick={handleClick} className="mobile-menu-item">
        <Typography variant="body1" component="span" className="mobile-menu-label">
          {menu.label}
        </Typography>
        {open ? <ExpandLess sx={{ color: "#0652a8" }} /> : <ExpandMore sx={{ color: "#0652a8" }} />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className="mobile-sub-menu">
          {menu.columns.map((col, idx) => (
            <Box key={idx}>
              <ListItemButton sx={{ pl: 4, pt: 1, pb: 0, '&:hover': { background: 'transparent' } }}>
                <Typography className="mobile-column-title">| {col.title}</Typography>
              </ListItemButton>
              {col.items.map((item, j) => (
                <ListItemButton 
                  key={j} 
                  sx={{ pl: 6 }} 
                  className="mobile-link-item" 
                  onClick={handleLinkClick}
                >
                  {menuIcons[menu.key] ?? <MenuBookIcon fontSize="small" className="mobile-link-icon" />}
                  <Typography variant="body2" component="span">{item}</Typography>
                </ListItemButton>
              ))}
              {idx < menu.columns.length - 1 && <Divider component="li" sx={{ ml: 6, mr: 2 }} />}
            </Box>
          ))}
        </List>
      </Collapse>
    </React.Fragment>
  );
};

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const handleOpen = (key) => setOpenMenu(key);
  const handleClose = () => setOpenMenu(null);

  return (
    <AppBar position="sticky" sx={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Container to'liq kenglikda va skrolni hisobga oladi */}
      <Container maxWidth="xl" disableGutters={false}>
        <Toolbar sx={{ height: "80px", display: "flex", justifyContent: "space-between" }} disableGutters>

          {/* LOGO */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
            <img src={logoImage} alt="Logo" style={{ width: "150px", objectFit: "contain" }} />
          </Box>

          {/* DESKTOP MENU */}
          <Box sx={{ display: { xs: "none", md: "flex" }, height: "100%" }}>
            {menuData.map((menu) => {
              // Bitta ustunli menyu bo'lsa ham, uni Mega Menu sifatida render qilish uchun
              const isSimpleDropdown = menu.columns.length === 1 && false; // Har doim Mega Menu uslubini ishlatish

              return (
                <Box
                  key={menu.key}
                  sx={{ 
                    position: isSimpleDropdown ? "relative" : "static",
                    height: "100%",
                    display: "flex",
                    alignItems: "center"
                  }}
                  onMouseEnter={() => handleOpen(menu.key)}
                  onMouseLeave={handleClose}
                >
                  <Button
                    className={`nav-btn ${openMenu === menu.key ? "active-nav" : ""}`}
                    disableRipple
                  >
                    {menu.label}
                  </Button>

                  {/* DROPDOWN (Barcha menyular mega-menu sifatida ko'rsatiladi) */}
                  <Box
                    className={`
                      dropdown-wrapper
                      mega-menu 
                      ${openMenu === menu.key ? "open" : ""}
                    `}
                  >
                    <div className="mega-container">
                      {menu.columns.map((col, idx) => (
                        <Box key={idx} className="menu-column">
                          <Typography className="column-title">| {col.title}</Typography>
                          {col.items.map((item, j) => (
                            <Box key={j} className="menu-link">
                              {menuIcons[menu.key] ?? (
                                <MenuBookIcon fontSize="small" className="link-icon" />
                              )}
                              <span>{item}</span>
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </div>
                  </Box>
                </Box>
              );
            })}

            {/* SDGs BUTTON */}
            <Button className="sdg-btn" disableRipple>SDGs</Button>
          </Box>

          {/* MOBILE BUTTON */}
          <IconButton 
             sx={{ display: { xs: "flex", md: "none" }, color: '#0652a8' }} 
             onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon sx={{ fontSize: 30 }}/>
          </IconButton>
        </Toolbar>
      </Container>

      {/* MOBIL DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { 
            width: 300, 
            background: '#ffffff',
            boxShadow: '-4px 0 10px rgba(0,0,0,0.1)' 
          } 
        }}
      >
        <List className="mobile-drawer-list">
          {/* LOGO va Yopish Tugmasi (Drawer ichidagi) */}
          <Box className="mobile-drawer-header">
            <img src={logoImage} alt="Logo" style={{ width: "120px", objectFit: "contain" }} />
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#0652a8' }}>
                <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          
          {/* Menu Elementlari */}
          {menuData.map((menu) => (
            <MobileMenuItem 
                key={menu.key} 
                menu={menu} 
                menuIcons={menuIcons} 
                setDrawerOpen={setDrawerOpen}
            />
          ))}

          <Divider sx={{ mt: 1, mb: 2 }} />

          {/* SDGs Button mobil menyuda */}
          <ListItemButton sx={{ mt: 1, justifyContent: 'center' }}>
             <Button className="sdg-btn mobile-sdg-btn" disableRipple>SDGs</Button>
          </ListItemButton>
        </List>
      </Drawer>
    </AppBar>
  );
}