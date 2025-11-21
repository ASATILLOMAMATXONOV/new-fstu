import React, { useState, useEffect } from "react";
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

const doTransition = (nextIndex) => {
  if (isAnimating) return;

  setIsAnimating(true);
  setPrevIndex(currentIndex);

  setTimeout(() => {
    setCurrentIndex(nextIndex);
  }, 500);

  setTimeout(() => {
    setIsAnimating(false);
  }, 1500);

  
};

  const goNext = () =>
    doTransition((currentIndex + 1) % images.length);

  const goPrev = () =>
    doTransition((currentIndex - 1 + images.length) % images.length);

  // AUTO slider: 10 sekund
  useEffect(() => {
    const timer = setInterval(goNext, 10000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <Box className="banner-slider">

      {/* ======================
            OLD IMG (slide-out)
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
            NEW IMG (fade/slide)
         ====================== */}
      <img
        key={`current-${currentIndex}`}
        src={images[currentIndex]}
        className="banner-img active"
        alt="current-img"
      />

      {/* ======================
           NAV BUTTONS
         ====================== */}
      <button className="banner-nav-btn banner-prev-btn" onClick={goPrev}>
        <ArrowBackIosIcon fontSize="large" />
      </button>

      <button className="banner-nav-btn banner-next-btn" onClick={goNext}>
        <ArrowForwardIosIcon fontSize="large" />
      </button>

      {/* ======================
           STRIPES TRANSITION
         ====================== */}
        <div className={`stripes ${isAnimating ? "stripes-active" : ""}`}>
    <div className="stripeA"></div>
    <div className="stripeB"></div>
        </div>


    </Box>
  );
};

export default Banner;
