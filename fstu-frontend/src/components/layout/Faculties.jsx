import React from "react";
import "../../assets/styles/Faculties.css";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const facultyData = [
  { name: "Axborot texnologiyalari va telekommunikatsiya" },
  { name: "Ishlab chiqarishda boshqaruv fakulteti" },
  { name: "Arxitektura va qurilish fakulteti" },
  { name: "Kimyo texnologiya fakulteti" },
  { name: "Energetika muhandisligi fakulteti" },
  { name: "Yengil sanoat va to'qimachilik fakulteti" },
  { name: "Mexanika-mashinasozlik fakulteti" },
  { name: "Axborot texnologiyalari va telekommunikatsiya" },
];

const FacultyCard = ({ name }) => (
  <div className="faculty-card fade-in">
    <div className="card-image-placeholder">
      <div className="card-content slide-up">
        <div className="card-actions">
          <a href="#" className="action-btn-1">Batafsil</a>
          <a href="#" className="action-btn-2">Bakalavr kursi</a>
        </div>
        <h3 className="card-name">{name}</h3>
      </div>
    </div>
  </div>
);

const Faculties = () => {
  const totalPages = 6;
  const currentPage = 1;

  return (
    <>
    <div className="faculties-header">
        <h2 className="faculties-title">Qabul 2025-yil uchun ochiq</h2>
        <a href="#" className="btn-more">Batafsil →</a>
    </div>

      <section className="faculties-section">
        <div className="faculties-grid">
          {facultyData.map((faculty, index) => (
            <FacultyCard key={index} name={faculty.name} />
          ))}
        </div>
      </section>

  <footer className="pagination-footer">
    <div className="footer-content fade-in">
        <h2 className="footer-title">REKTOR MUROJAATI</h2>
    </div>
</footer>

    </>
  );
};

export default Faculties;
