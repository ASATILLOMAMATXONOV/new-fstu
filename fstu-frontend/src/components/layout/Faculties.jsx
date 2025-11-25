import React, { useState, useRef, useEffect } from "react";
import "../../assets/styles/Faculties.css";
import {
  faNewspaper,
  faUniversity,
  faBuilding,
  faBriefcase,
  faPhone,
  faBookOpen,
  faUsers,
  faUserTie,
  faLaptopCode
} from "@fortawesome/free-solid-svg-icons";
// Rasmlar
import atImage from "../../assets/images/fakultet-logo/Axborot texnologiyalari va telekommunikatsiya.png";
import boshqaruvImage from "../../assets/images/fakultet-logo/ICH.png";
import arxitekturaImage from "../../assets/images/fakultet-logo/A va Q.png";
import kimyoImage from "../../assets/images/fakultet-logo/kimyo.png";
import energetikaImage from "../../assets/images/fakultet-logo/ee.png";
import yengilImage from "../../assets/images/fakultet-logo/yst.png";
import mexanikaImage from "../../assets/images/fakultet-logo/mmf.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const tabs = [
  { id: "hammasi", label: "Hammasi" },
  { id: "fakultet", label: "FAKULTETLAR" },
  { id: "reyting", label: "REYTING KO'RSATKICHLAR" },
  { id: "axborot", label: "AXBOROT TIZIMLARI" }
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
const Hammasi = [
  { name: "BO'SH ISH O'RINLARI", icon: faNewspaper },
  { name: "FAKULTETLAR", icon: faUniversity },
  { name: "KAFEDRALAR", icon: faBriefcase },
  { name: "MARKAZLAR VA BO‘LIMLAR", icon: faBuilding },
  { name: "ALOQA", icon: faPhone },
  { name: "UNLIBRARY", icon: faBookOpen },
  { name: "JAPANESE TRAINING PROGRAM", icon: faUsers },
  { name: "MA’MURIYAT", icon: faUserTie },
  { name: "AXBOROT TIZIMLARI", icon: faLaptopCode }
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
const HammasiCard = ({ name, img }) => (
  <div className="faculty-card fade-in">
    <div className="card-image-placeholder">
      <img src={img} alt={name} className="faculty-img" />
    </div>
    <div className="card-content slide-up">
      <h3 className="card-name">{name}</h3>
    </div>
  </div>
);



const InfoCard = ({ name, icon, active }) => (
  <div className={`info-card ${active ? "active-card" : ""}`}>
    <FontAwesomeIcon icon={icon} className="info-icon" />

    <div className="info-line"></div>
    <p className="info-title">{name}</p>
  </div>
);

const Faculties = () => {
  const [activeTab, setActiveTab] = useState("hammasi");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef([]);
  // Indikator (ko'k doira) joylashuvini hisoblash
  const [lineAnimate, setLineAnimate] = useState(false);

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        transform: `translateX(${activeTabElement.offsetLeft}px)`,
      });
    }

     setLineAnimate(true);

     // Animatsiya qaytadi (yaxshi UX uchun)
    const timer = setTimeout(() => setLineAnimate(false), 500);
    return () => clearTimeout(timer);

  }, [activeTab]);

  return (
    // Umumiy container qo'shildi
    <div className="faculties-container"> 
      
      {/* TEPADAGI CHIZIQ VA TABS */}
      <div className="top-section">
        
        {/* Chapdagi uzun chiziq */}
        <div className="line-flow">
          <div className={`line ${lineAnimate ? "animate-line" : ""}`}></div>
        </div>

        {/* Tabs (o‘ng yonida turadi) */}
     <div className="tabs-rounded">

  <div className="tab-indicator" style={indicatorStyle}></div>

  {tabs.map((t, i) => (
    <button
      key={t.id}
      ref={(el) => (tabsRef.current[i] = el)}
      className={`round-tab ${activeTab === t.id ? "active" : ""}`}
      onClick={() => setActiveTab(t.id)}
    >
      {t.label}
    </button>
  ))}
</div>


      </div>

    {/* TITLE — har bir tab uchun dinamik sarlavha */}
    <h2 className={`tab-title ${activeTab}`}>{ 
      activeTab === "hammasi" && "Hammasi" ||
      activeTab === "fakultet" && "Fakultetlar" ||
      activeTab === "reyting" && "Reyting ko‘rsatkichlari" ||
      activeTab === "axborot" && "Axborot tizimlari"
    }</h2>

      {/* CONTENT ----------------------------------------- */}

 {activeTab === "hammasi" && (
  <section className="faculties-section">
    <div className="info-grid">
      {Hammasi.map((item, i) => (
        <InfoCard 
          key={i}
          name={item.name}
          icon={item.icon}
        />
      ))}
    </div>
  </section>
)}


      {activeTab === "fakultet" && (
        <>

          <section className="faculties-section">
            <div className="faculties-grid">
              {facultyData.map((f, i) => (
                <FacultyCard key={i} name={f.name} img={f.img} />
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "reyting" && (
        <div className="tab-box">
          <h2>Reyting ma’lumotlari...</h2>
        </div>
      )}

      {activeTab === "axborot" && (
        <div className="tab-box">
          <h2>AXBOROT TIZIMLARI...</h2>
        </div>
      )}

    </div>
  );
};

export default Faculties;