import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../../assets/styles/Banner.css";

// Rasm importlarini haqiqiy rasm fayllari bilan almashtiring
import img1 from "../../assets/images/Saty.jpg"; // Yana bir rasm qo'shildi
import img2 from "../../assets/images/Saty.jpg";
import img3 from "../../assets/images/Saty.jpg";

const slides = [
  {
    id: 1,
    img: img1,
    title: "Yangi Rating",
    desc: "Milliy reyting • TOP-5 Universitet",
  },
  {
    id: 2,
    img: img2,
    title: "Xalqaro Qarash",
    desc: "Global standartlar • Kelajak yetakchilari",
  },
  {
    id: 3,
    img: img3,
    title: "Innovatsion Ta'lim",
    desc: "Zamonaviy texnologiyalar • Keng imkoniyatlar",
  },
];

const Banner = () => {
  const [index, setIndex] = useState(0);

  const slideLength = slides.length;

  // Keyingi slayddan oldin/keyin indexni hisoblash funksiyasi
  const next = () => {
    setIndex((prevIndex) => (prevIndex + 1) % slideLength);
  };

  const prev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + slideLength) % slideLength);
  };

  const changeSlide = (newIndex) => {
    setIndex(newIndex);
  };

  // Avtomatik almashtirish
  useEffect(() => {
    const timer = setInterval(next, 6000); // 6 sekund
    return () => clearInterval(timer);
  }, [slideLength]); // slideLength o'zgarmas ekan, bu yerda [next] shart emas

  // Joriy slayd ma'lumotlari
  const currentSlide = slides[index];

  return (
    <Box className="banner">
      {/* Rasm va Kontentni o'z ichiga oluvchi konteyner - Silliq o'tish uchun */}
      <div
        className="banner-slider"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id} className="banner-slide-item">
            <img src={slide.img} alt={slide.title} className="banner-img" />
            <div className="banner-overlay" />
            
            {/* TEXT – BOTTOM LEFT */}
            <div className="banner-text">
              <h1 className="title">{slide.title}</h1>
              <p className="desc">{slide.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* NAV BUTTONS – BOTTOM RIGHT */}
      <div className="banner-nav">
        <button onClick={prev} aria-label="Oldingi slayd">
          <ArrowBackIosNewIcon />
        </button>
        <button onClick={next} aria-label="Keyingi slayd">
          <ArrowForwardIosIcon />
        </button>
      </div>

      {/* DOTS */}
      <div className="banner-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => changeSlide(i)}
          />
        ))}
      </div>
    </Box>
  );
};

export default Banner;