import React from "react";
import "../../assets/styles/Rektor.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import rektorImg from "../../assets/images/rector.jpg";

const Rektor = () => {
  return (
    <>
    

       <section className="pagination-section">
        <div className="section-content fade-in">
            <h2 className="section-title">REKTOR MUROJAATI</h2>
        </div>
      </section>
    <section className="rektor-section">

      <div className="rektor-container">

        {/* Rektor rasmi */}
        <div className="rektor-image-wrapper">
          <img src={rektorImg} alt="Rektor" className="rektor-image" />
        </div>

        {/* Matn qismi */}
        <div className="rektor-content">
          
          <h2 className="rektor-name fade-text">
            SALOMOV O‘KTAM RAHIMOVICH
          </h2>

          <p className="rektor-text fade-slow">
            Yangi O‘zbekiston taraqqiyot strategiyasida eng muhim ustuvor yo‘nalishlardan biri — raqobatbardosh, salohiyatli va keng dunyoqarashga ega kadrlarni tayyorlash sanaladi. Bu yo‘lda zamonaviy ilm-fan yutuqlari, innovatsion texnologiyalar va fundamental tadqiqotlar asosiy tayanch sifatida qaralmoqda...
          </p>

       <div className="rektor-actions">
    <a href="#" className="btn-batafsil-line">
        <span className="btn-text">Batafsil</span>
        <ArrowForwardIcon className="btn-line-icon" />
    </a>
</div>

        </div>
      </div>
    </section>

    </>
  );
};

export default Rektor;
