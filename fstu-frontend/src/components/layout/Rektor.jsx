import React from "react";
import "../../assets/styles/Rektor.css";
import QuoteIcon from "@mui/icons-material/FormatQuote"; 

// Rasmni import qilish
import rektorImg from "../../assets/images/rector.jpg";

const Rektor = () => {
  return (
    <section className="rektor-section fade-in">
      <div className="rektor-container slide-up">
        
        {/* Rektor rasmi */}
        <div className="rektor-image">
          <img src={rektorImg} alt="Rektor rasmi" />
        </div>

        {/* Matn qismi */}
        <div className="rektor-content">
          <h2 className="rektor-name">SALOMOV O‘KTAM RAHIMOVICH</h2>

          <p className="rektor-text">
            Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting 
            Industry. Lorem Ipsum Has Been The Industry’s Standard Dummy Text 
            Ever Since The 1500s, When An Unknown Printer Took A Galley Of 
            Type And Scrambled It To Make A Type Specimen Book.
          </p>

          <div className="rektor-quote">
            <QuoteIcon className="quote-icon" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Rektor;
