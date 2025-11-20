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
  Container
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

/* BO'LIMLARGA MOS ICONLAR */

import MenuBookIcon from "@mui/icons-material/MenuBook";  



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
      { title: "ABITURIYENTLAR", items: ["Qabul tartibi", "Imtihonlar", "Grantlar"] }
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
  }
];

/* ICONLAR BO‘LIMGA MOS */
const menuIcons = {
  talim: <MenuBookIcon fontSize="small" className="link-icon" />,
};

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const handleOpen = (key) => setOpenMenu(key);
  const handleClose = () => setOpenMenu(null);

  return (
    <AppBar position="sticky" sx={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ height: "80px", display: "flex", justifyContent: "space-between" }} disableGutters>

          {/* LOGO */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
            <img src={logoImage} style={{ width: "150px", objectFit: "contain" }} />
          </Box>

          {/* DESKTOP MENU */}
          <Box sx={{ display: { xs: "none", md: "flex" }, height: "100%" }}>
            {menuData.map((menu) => {
              const isSimpleDropdown = menu.columns.length === 1;

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

                  {/* DROPDOWN */}
                  <Box
                    className={`
                      dropdown-wrapper
                      ${isSimpleDropdown ? "simple-menu" : "mega-menu"}
                      ${openMenu === menu.key ? "open" : ""}
                    `}
                  >
                    <div className={isSimpleDropdown ? "simple-container" : "mega-container"}>
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
          <IconButton sx={{ display: { xs: "flex", md: "none" } }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* MOBIL DRAVER */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 250 }}>
          {menuData.map((menu) => (
            <ListItemButton key={menu.key}>{menu.label}</ListItemButton>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}
