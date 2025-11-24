import React, { useState } from "react";
import "../../assets/styles/Faculties.css";

// Rasmlar
import atImage from "../../assets/images/Axborot texnologiyalari va telekommunikatsiya.png";
import boshqaruvImage from "../../assets/images/ICH.png";
import arxitekturaImage from "../../assets/images/A va Q.png";
import kimyoImage from "../../assets/images/kimyo.png";
import energetikaImage from "../../assets/images/ee.png";
import yengilImage from "../../assets/images/yst.png";
import mexanikaImage from "../../assets/images/mmf.png";

const tabs = [
  { id: "all", label: "ALL", icon: "🌐" },
  { id: "fakultet", label: "FAKULTETLAR", icon: "🏛️" },
  { id: "reyting", label: "REYTING KO'RSATKICHLAR", icon: "📊" },
  { id: "axborot", label: "AXBOROT TIZIMLARI", icon: "💻" }
];

const facultyData = [
  { name: "Axborot texnologiyalari va telekommunikatsiya", img: atImage },
  { name: "Ishlab chiqarishda boshqaruv fakulteti", img: boshqaruvImage },
  { name: "Arxitektura va qurilish fakulteti", img: arxitekturaImage },
  { name: "Kimyo texnologiya fakulteti", img: kimyoImage },
  { name: "Energetika muhandisligi fakulteti", img: energetikaImage },
  { name: "Yengil sanoat va to'qimachilik fakulteti", img: yengilImage },
  { name: "Mexanika-mashinasozlik fakulteti", img: mexanikaImage }
];

const FacultyCard = ({ name, img }) => (
  <div className="faculty-card fade-in">
    <div className="card-image-placeholder">
      <img src={img} alt={name} className="faculty-img" />
    </div>
    <div className="card-content slide-up">
      <h3 className="card-name">{name}</h3>
    </div>
  </div>
);

const Faculties = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <>
      {/* HEADER */}
      <div className="faculties-header">
        <h2 className="faculties-title">Qabul 2025-yil uchun ochiq</h2>
        <a href="#" className="btn-more">Batafsil →</a>
      </div>

      {/* 🔥 ICONLI, ANIMATSIYALI TABS */}
      <div className="tabs-container">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            {t.label}
            <div className="tab-underline"></div>
          </button>
        ))}
      </div>

      {/* CONTENT ----------------------------------------- */}
      {activeTab === "all" && (
        <section className="faculties-section">
          <div className="faculties-grid">
            {facultyData.map((f, i) => (
              <FacultyCard key={i} name={f.name} img={f.img} />
            ))}
          </div>

          <div className="tab-box"><h2>Reyting ko‘rsatkichlari</h2></div>
          <div className="tab-box"><h2>Axborot tizimlari</h2></div>
        </section>
      )}

      {activeTab === "fakultet" && (
        <section className="faculties-section">
          <div className="faculties-grid">
            {facultyData.map((f, i) => (
              <FacultyCard key={i} name={f.name} img={f.img} />
            ))}
          </div>
        </section>
      )}

      {activeTab === "reyting" && (
        <div className="tab-box"><h2>Reyting ma’lumotlari...</h2></div>
      )}

      {activeTab === "axborot" && (
        <div className="tab-box"><h2>AXBOROT TIZIMLARI...</h2></div>
      )}
    </>
  );
};

export default Faculties;
