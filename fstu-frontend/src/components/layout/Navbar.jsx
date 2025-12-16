import React, { useState, useEffect } from "react";
import "../../assets/styles/Navbar.css";
import "../../assets/styles/style.css";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTelegram, FaTwitter, FaYoutube, FaYoutubeSquare } from "react-icons/fa";
import {
  Box,
  Drawer,
  Typography,
  Link,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logo from "../../assets/images/logo.png";

/* ================= CONSTANT ================= */
const PRIMARY_COLOR = "#00438f";

/* ================= CONTACT ================= */
const ContactInfo = () => (
  <Box className="contact-wrapper">
    <Box className="contact-info">
      <Box className="contact-item">
        <Box className="icon-circle">
          <i className="contact-icon phone-icon" />
        </Box>
        <Typography color={PRIMARY_COLOR}>73 241 12 06</Typography>
      </Box>

      <Box className="contact-item">
        <Box className="icon-circle">
          <i className="contact-icon address-icon" />
        </Box>
        <Typography color={PRIMARY_COLOR}>
          Farg‘ona shahar, Farg‘ona ko‘chasi 86-uy
        </Typography>
      </Box>
    </Box>

    <hr className="contact-divider" />

    <Box className="contact-bottom">
      <Box className="contact-links">
        {["@SDGS", "✉ Hujjat almashinuvi", "📩Korporativ pochta", "HEMIS"].map((t) => (
          <Link key={t} href="#" underline="none">
            {t}
          </Link>
        ))}
      </Box>

      <Box className="lang-switch">
        {["UZ", "RU", "EN"].map((l, i) => (
          <button key={l} className={i === 0 ? "active" : ""}>
            {l}
          </button>
        ))}
      </Box>
    </Box>
  </Box>
);

/* ================= NAV LINKS ================= */
const NavLinks = ({
  openMenu,
  setOpenMenu,
  openSubMenu,
  setOpenSubMenu,
  isMobile,
}) => {
  const toggleMenu = (name, e) => {
    if (!isMobile) return;
    e.stopPropagation();
    setOpenMenu(openMenu === name ? null : name);
    setOpenSubMenu(null);
  };

  const toggleSub = (e) => {
    if (!isMobile) return;
    e.stopPropagation();
    setOpenSubMenu(openSubMenu ? null : "sub");
  };

  return (
    <ul className="nav-links">
      <li className="nav-item active"><a href="/">Universitet</a></li>
      <li className="nav-item"><a href="/">About Us</a></li>

      <li
        className={`nav-item dropdown ${openMenu === "services" ? "open" : ""}`}
        onClick={(e) => toggleMenu("services", e)}
      >
        <a href="#">Services <span className="arrow">▼</span></a>

        <ul className="dropdown-menu">
          <li><a href="#"><span className="menu-text">Home Care</span></a></li>
          <li><a href="#"><span className="menu-text">Nursing Care</span></a></li>
          <li><a href="#"><span className="menu-text">Rehabilitation</span></a></li>

          <li
            className={`sub-dropdown ${openSubMenu ? "open" : ""}`}
            onClick={toggleSub}
          >
            <a href="#">
              <span className="menu-text">Personal Support</span>
              <span className="sub-arrow">▼</span>
            </a>

            <ul className="sub-dropdown-menu">
              <li><a href="#"><span className="menu-text">Live-in Care</span></a></li>
              <li><a href="#"><span className="menu-text">Disability Support</span></a></li>
            </ul>
          </li>
        </ul>
      </li>

    <li
  className={`nav-item dropdown ${openMenu === "shop" ? "open" : ""}`}
  onClick={(e) => toggleMenu("shop", e)}
>
  <a href="#">
    Shop <span className="arrow">▼</span>
  </a>

  <ul className="dropdown-menu">
    <li>
      <a href="#">
        <span className="menu-text">Medical Equipment</span>
      </a>
    </li>

    <li>
      <a href="#">
        <span className="menu-text">Senior Products</span>
      </a>
    </li>
  </ul>
</li>

      <li className="nav-item"><a href="#">Contact Us</a></li>
    </ul>
  );
};

/* ================= NAVBAR ================= */
const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    if (!isDesktop) return;
    const closeAll = () => {
      setOpenMenu(null);
      setOpenSubMenu(null);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, [isDesktop]);

  return (
    <nav className="xtra-navbar">
      <div className="top-header">
        <img src={logo} className="logo-img" alt="Logo" />

        {isDesktop && <ContactInfo />}

        {!isDesktop && (
          <IconButton onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
      </div>

      {isDesktop && (
        <div className="bottom-nav">
          <div className="nav-divider" />
          <NavLinks
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            openSubMenu={openSubMenu}
            setOpenSubMenu={setOpenSubMenu}
          />
          <div className="social-links">
            <FaFacebookF />
            <FaInstagram />
            <FaYoutube />
            <FaTelegram />
          </div>
        </div>
      )}

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
          <ContactInfo />
          <NavLinks
            isMobile
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            openSubMenu={openSubMenu}
            setOpenSubMenu={setOpenSubMenu}
          />
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navbar;
