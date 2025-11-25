import React, { useState, useEffect } from "react";
import "../../assets/styles/Navbar.css";
import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import logo from "../../assets/images/logo.png";



const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Prevent closing when clicking inside dropdown
  const stopPropagation = (e) => e.stopPropagation();

  // Dropdown toggle
  const handleDropdownToggle = (name) => {
    if (isMobile) {
      setOpenDropdown(openDropdown === name ? null : name);
    }
  };

  return (
    <nav className="xtra-navbar" onClick={stopPropagation}>

      {/* ===== TOP HEADER ===== */}
     <div className="top-header">
  <div className="logo-section">

    {/* LOGO IMG */}
    <img 
      src={logo}
      alt="XTRA Elderly Care Services Logo"
      className="logo-img"
    />


  </div>

  {/* Contact Info */}
  <div className="contact-info">
    <div className="contact-item">
      <div className="icon-circle"><i className="contact-icon phone-icon"></i></div>
      <div className="info-text">
        <span className="label">Phone:</span>
        <span className="value"><strong>+1 (800) 333 445</strong></span>
      </div>
    </div>

    <div className="contact-item">
      <div className="icon-circle"><i className="contact-icon address-icon"></i></div>
      <div className="info-text">
        <span className="label">Address:</span>
        <span className="value"><strong>1738, King Street, LA</strong></span>
      </div>
    </div>
  </div>
</div>


      {/* ===== NAVIGATION ===== */}
      <div className="bottom-nav">
        <hr className="nav-divider" />

        <ul className="nav-links">

          <li className="nav-item active">
            <a href="#">Home</a>
          </li>

          <li className="nav-item">
            <a href="#">About Us</a>
          </li>

{/* --- SERVICES DROPDOWN --- */}
<li
  className={`nav-item dropdown ${openDropdown === "services" ? "open" : ""}`}
  onClick={() => handleDropdownToggle("services")}
>
  <a href="#">Services <span className="arrow">▼</span></a>

  <ul className="dropdown-menu">
    <li><a href="#"><span className="drop-icon">›</span> Home Care</a></li>
    <li><a href="#"><span className="drop-icon">›</span> Nursing Care</a></li>
    <li><a href="#"><span className="drop-icon">›</span> Rehabilitation</a></li>

    {/* SUB-DROPDOWN (2-level) */}
    <li className="sub-dropdown">
      <a href="#"><span className="drop-icon">›</span> Personal Support</a>

      <ul className="sub-dropdown-menu">
        <li><a href="#"><span className="drop-icon">›</span> Live-in Care</a></li>
        <li><a href="#"><span className="drop-icon">›</span> Disability Support</a></li>
      </ul>
    </li>
  </ul>
</li>



{/* --- SHOP DROPDOWN --- */}
<li
  className={`nav-item dropdown ${openDropdown === "shop" ? "open" : ""}`}
  onClick={() => handleDropdownToggle("shop")}
>
  <a href="#">Shop <span className="arrow">▼</span></a>

  <ul className="dropdown-menu">
    <li><a href="#"><span className="drop-icon">›</span> Medical Equipment</a></li>
    <li><a href="#"><span className="drop-icon">›</span> Senior Products</a></li>
    <li><a href="#"><span className="drop-icon">›</span> Gift Cards</a></li>
  </ul>
</li>



          <li className="nav-item">
            <a href="#">Contact Us</a>
          </li>
        </ul>

        {/* Social Icons */}
        <div className="social-links">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaLinkedinIn /></a>
          <a href="#"><FaTwitter /></a>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
