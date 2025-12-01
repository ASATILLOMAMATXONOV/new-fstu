import React, { useEffect, useState } from "react";
import "../../assets/styles/niews.css";

const news = [
  {
    title: "Sun’iy intellekt markazi ishga tushdi",
    img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72",
    date: "12 May, 2025",
  },
  {
    title: "Talabalar uchun yangi stipendiya",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    date: "10 May, 2025",
  },
  {
    title: "Xalqaro IT forum bo‘lib o‘tdi",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    date: "08 May, 2025",
  },
];

const Niewss = () => {
  const [active, setActive] = useState(0);

  /* AUTOPLAY */
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % news.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="glass-news">
      <div className="glass-header">
        <span>YANGILIKLAR</span>
        <h2>So‘nggi voqealar</h2>
      </div>

      <div className="glass-carousel">
        {news.map((item, i) => (
          <div
            key={i}
            className={`glass-slide ${i === active ? "active" : ""}`}
            style={{ backgroundImage: `url(${item.img})` }}
          >
            <div className="glass-overlay">
              <h3>{item.title}</h3>
              <p>{item.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="glass-pagination">
        {news.map((_, i) => (
          <span
            key={i}
            className={`line ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  );
};

export default Niewss;
