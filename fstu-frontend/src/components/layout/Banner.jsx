import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../../assets/styles/Banner.css";

import img1 from "../../assets/images/21.jpg";
import img2 from "../../assets/images/en_reyting_new.png";
import img3 from "../../assets/images/new_ru_rr.png";

const images = [img1, img2, img3];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animatsiya boshlanishi va tugashini boshqarish funksiyasi
  const doTransition = (nextIndex) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setPrevIndex(currentIndex);

    // Stripe animatsiyasi boshlanadi, 0.5s dan keyin rasm almashadi
    setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, 500);

    // Animatsiya tugagandan keyin 1.5s da isAnimating false bo'ladi
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  // Navigatsiyani keyingi rasmga o'tkazish funksiyasi
  // currentIndex o'zgarganda bu funksiya qayta yaratiladi
  const goNext = useCallback(() => {
    doTransition((currentIndex + 1) % images.length);
  }, [currentIndex, doTransition]); // doTransition ham bog'liqlikka qo'shildi

  // Navigatsiyani oldingi rasmga o'tkazish funksiyasi
  const goPrev = () =>
    doTransition((currentIndex - 1 + images.length) % images.length);

  // 🔄 AUTO slider: Har 5 sekundda doimiy aylanish
  useEffect(() => {
    // goNext ni chaqiradigan intervalni o'rnatamiz
    const timer = setInterval(goNext, 5000);
    
    // Komponent o'chirilganda yoki goNext o'zgarganda intervalni tozalash
    return () => clearInterval(timer);
  }, [goNext]); // 👈 goNext funksiyasiga bog'liq

  return (
    <Box className="banner-slider">

      {/* ======================
      // OLD IMG (slide-out)
      ====================== */}
      {prevIndex !== null && prevIndex !== currentIndex && (
        <img
          key={`prev-${prevIndex}`}
          src={images[prevIndex]}
          className="banner-img slide-out"
          alt="prev-img"
        />
      )}

      {/* ======================
      // NEW IMG (fade/slide)
      ====================== */}
      <img
        key={`current-${currentIndex}`}
        src={images[currentIndex]}
        className="banner-img active"
        alt="current-img"
      />

      {/* ======================
      // NAV BUTTONS
      ====================== */}
      <button className="banner-nav-btn banner-prev-btn" onClick={goPrev} disabled={isAnimating}>
        <ArrowBackIosIcon fontSize="large" />
      </button>

      <button className="banner-nav-btn banner-next-btn" onClick={goNext} disabled={isAnimating}>
        <ArrowForwardIosIcon fontSize="large" />
      </button>

      {/* ======================
      // STRIPES TRANSITION
      ====================== */}
      <div className={`stripes ${isAnimating ? "stripes-active" : ""}`}>
        <div className="stripeA"></div>
        <div className="stripeB"></div>
      </div>
    </Box>
  );
};

export default Banner;