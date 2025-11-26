import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../../assets/styles/Banner.css";

import img1 from "../../assets/images/21.jpg";
import img2 from "../../assets/images/en_reyting_new.png";
import img3 from "../../assets/images/new_ru_rr.png";

const slides = [
  {
    img: img1,
    title: "University Life",
    desc: "Modern • Innovative • Trusted Education",
  },
  {
    img: img2,
    title: "Top Rating",
    desc: "National ranking • TOP-5 University",
  },
  {
    img: img3,
    title: "International Vision",
    desc: "Global standards • Future leaders",
  },
];

const Banner = () => {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const changeSlide = useCallback(
    (next) => {
      if (animating) return;
      setAnimating(true);
      setIndex(next);
      setTimeout(() => setAnimating(false), 700);
    },
    [animating]
  );

  const next = () => changeSlide((index + 1) % slides.length);
  const prev = () =>
    changeSlide((index - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <Box className="banner">
      {/* IMAGE */}
      <img
        src={slides[index].img}
        alt="banner"
        className={`banner-img ${animating ? "zoom" : ""}`}
      />

      {/* DARK OVERLAY */}
      <div className="banner-overlay" />

      {/* TEXT – BOTTOM LEFT */}
      <div className="banner-text">
        <h1 key={slides[index].title}>{slides[index].title}</h1>
        <p key={slides[index].desc}>{slides[index].desc}</p>
      </div>

      {/* NAV BUTTONS – BOTTOM RIGHT */}
      <div className="banner-nav">
        <button onClick={prev}>
          <ArrowBackIosNewIcon />
        </button>
        <button onClick={next}>
          <ArrowForwardIosIcon />
        </button>
      </div>

      {/* DOTS */}
      <div className="banner-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={i === index ? "active" : ""}
            onClick={() => changeSlide(i)}
          />
        ))}
      </div>
    </Box>
  );
};

export default Banner;
