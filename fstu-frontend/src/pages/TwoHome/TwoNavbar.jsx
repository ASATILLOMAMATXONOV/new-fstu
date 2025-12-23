import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Facebook,
  X as XIcon,
  Instagram,
  Menu as MenuIcon,
  Close as CloseIcon,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import { ColorModeContext } from "../../components/theme/ColorModeContext";

/* ================= NAV LINKS ================= */
const navLinks = [
  { name: "ASOSIY", path: "/twopages" },
  {
    name: "UNIVERSITET",
    hasDropdown: true,
    sub: ["Ma'muriyat", "Nizom", "Galereya"],
  },
  {
    name: "TUZILMA",
    hasDropdown: true,
    sub: [
      { name: "Fakultetlar" },
      { name: "Kafedralar" },
      { name: "Markazlar" },
    ],
  },
  {
    name: "TALABALAR",
    hasDropdown: true,
    sub: ["HEMIS Student", "O'quv rejalar", "Kutubxona"],
  },
  { name: "ALOQA", path: "/contact" },
];

/* ================= COMPONENT ================= */
const TwoNavbar = () => {
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: theme.palette.background.paper,
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 90 } }}>
          <Container
            maxWidth="xl"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* LOGO */}
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => navigate("/twopages")}
            >
              <Box sx={{ bgcolor: "#ff7a00", px: 1 }}>
                <Typography fontWeight={900} color="#000">
                  F
                </Typography>
              </Box>
              <Typography fontWeight={900}>STU</Typography>
            </Box>

            {/* DESKTOP MENU */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ display: { xs: "none", md: "flex" }, height: "90px" }}
            >
              {navLinks.map((link) => (
                <Box
                  key={link.name}
                  onMouseEnter={() =>
                    link.hasDropdown && setActiveMenu(link.name)
                  }
                  onMouseLeave={() => setActiveMenu(null)}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Button
                    onClick={() => link.path && navigate(link.path)}
                    endIcon={
                      link.hasDropdown ? (
                        <KeyboardArrowDown
                          sx={{
                            transition: "0.3s",
                            transform:
                              activeMenu === link.name
                                ? "rotate(180deg)"
                                : "none",
                          }}
                        />
                      ) : null
                    }
                    sx={{
                      height: "100%",
                      px: 2,
                      fontWeight: 700,
                      fontSize: "13px",
                      color: isActive(link.path)
                        ? "#ff7a00"
                        : "text.primary",
                      "&:hover": {
                        bgcolor: "transparent",
                        color: "#ff7a00",
                      },
                    }}
                  >
                    {link.name}
                  </Button>

                  {/* DROPDOWN */}
                  <AnimatePresence>
                    {activeMenu === link.name && link.hasDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: "absolute",
                          top: "90px",
                          left: 0,
                          background: theme.palette.background.paper,
                          minWidth: "220px",
                          borderTop: "4px solid #ff7a00",
                          boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                          zIndex: 10,
                        }}
                      >
                        {link.sub.map((sub, i) => (
                          <Button
                            key={i}
                            fullWidth
                            sx={{
                              justifyContent: "flex-start",
                              color: "text.secondary",
                              p: 2,
                              "&:hover": {
                                color: "#ff7a00",
                                bgcolor: "action.hover",
                                pl: 3,
                              },
                            }}
                          >
                            {sub.name || sub}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              ))}
            </Stack>

            {/* ACTIONS */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ display: { xs: "none", lg: "flex" } }}>
                <IconButton>
                  <Facebook />
                </IconButton>
                <IconButton>
                  <XIcon />
                </IconButton>
                <IconButton>
                  <Instagram />
                </IconButton>
              </Box>

              {/* THEME TOGGLE */}
              <IconButton onClick={toggleColorMode}>
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>

              {/* MOBILE MENU BTN */}
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      {/* ================= MOBILE DRAWER ================= */}
      <Drawer open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 280 }}>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography fontWeight={700}>MENU</Typography>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          <List>
            {navLinks.map((link) => (
              <Box key={link.name}>
                <ListItem
                  button
                  onClick={() => {
                    if (link.path) {
                      navigate(link.path);
                      setMobileOpen(false);
                    } else {
                      setMobileDropdown(
                        mobileDropdown === link.name ? null : link.name
                      );
                    }
                  }}
                >
                  <ListItemText primary={link.name} />
                  {link.hasDropdown &&
                    (mobileDropdown === link.name ? (
                      <KeyboardArrowDown />
                    ) : (
                      <KeyboardArrowRight />
                    ))}
                </ListItem>

                <Collapse in={mobileDropdown === link.name}>
                  {link.sub?.map((s, i) => (
                    <ListItem key={i} sx={{ pl: 4 }}>
                      <ListItemText primary={s.name || s} />
                    </ListItem>
                  ))}
                </Collapse>
              </Box>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default TwoNavbar;
