import React, { useEffect, useRef, useState } from "react";
import "../../assets/styles/LaboratoryPage.css";

const laboratories = [
  {
    id: 1,
    number: "01",
    title: "Laboratoriya faoliyati",
    details:
      "Laboratoriyada zamonaviy uskunalar yordamida ilmiy tadqiqotlar, amaliy mashg'ulotlar va innovatsion loyihalar amalga oshiriladi.",
    image: "/images/laboratory/lab-1.jpg",
    color: "#f5d51c",
  },
  {
    id: 2,
    number: "02",
    title: "Amaliy mashg'ulotlar",
    details:
      "Talabalar laboratoriya sharoitida amaliy tajribalar o'tkazadilar, nazariy bilimlarini mustahkamlaydilar va zamonaviy texnologiyalar bilan ishlashni o'rganadilar.",
    image: "/images/laboratory/lab-2.jpg",
    color: "#ed6331",
  },
  {
    id: 3,
    number: "03",
    title: "Ilmiy tadqiqotlar",
    details:
      "Professor-o'qituvchilar va talabalar ilmiy tadqiqotlar o'tkazib, texnologik yechimlar va yangi ilmiy ishlanmalarni ishlab chiqadilar.",
    image: "/images/laboratory/lab-3.jpg",
    color: "#34a9c4",
  },
  {
    id: 4,
    number: "04",
    title: "Innovatsion loyihalar",
    details:
      "Ilmiy faoliyat natijalari asosida innovatsion loyihalar ishlab chiqilib, ularni amaliyotga joriy etish imkoniyatlari yaratiladi.",
    image: "/images/laboratory/lab-4.jpg",
    color: "#2569a4",
  },
];

function LabCard({ item, isActive, onHover, onLeave, onFocus, onBlur, onSelect, onMore }) {
  return (
    <div
      className={`laboratory-item ${isActive ? "is-active" : ""}`}
      style={{ "--lab-color": item.color }}
      onPointerLeave={(event) => event.pointerType === "mouse" && onLeave()}
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) onFocus();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur();
      }}
    >
      <button
        type="button"
        className="laboratory-card"
        onClick={onSelect}
        onPointerEnter={(event) => event.pointerType === "mouse" && onHover()}
        aria-expanded={isActive}
        aria-controls={`laboratory-details-${item.id}`}
        aria-label={item.title}
      >
        <span className="laboratory-card__plate" aria-hidden="true">
          <img src={item.image} alt="" loading="lazy" decoding="async" />
        </span>
        <span className="laboratory-card__inner">
          <span className="laboratory-card__number">
            <strong>{item.number}</strong>
          </span>

          <span className="laboratory-card__body">
            <span className="laboratory-card__title">
              {item.title}
            </span>

            <span className="laboratory-card__arrow" aria-hidden="true">↗</span>
          </span>
        </span>
      </button>

      <div
        id={`laboratory-details-${item.id}`}
        className="laboratory-item__details"
        aria-hidden={!isActive}
      >
        <div className="laboratory-item__details-inner">
          <span className="laboratory-item__label">
            YO‘NALISH {item.number}
          </span>

          <h3>{item.title}</h3>
          <p>{item.details}</p>
          <button
            type="button"
            className="laboratory-item__more"
            onClick={() => onMore(item)}
            tabIndex={isActive ? 0 : -1}
            aria-label={`${item.title}: batafsil`}
          >
            Batafsil <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function LaboratoryDialog({ item, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      className="laboratory-dialog"
      aria-labelledby="laboratory-dialog-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {item && (
        <article className="laboratory-dialog__content" style={{ "--lab-color": item.color }}>
          <img className="laboratory-dialog__image" src={item.image} alt={item.title} />
          <button type="button" className="laboratory-dialog__close" aria-label="Yopish" onClick={onClose}>×</button>
          <div className="laboratory-dialog__body">
            <span className="laboratory-item__label">YO‘NALISH {item.number}</span>
            <h2 id="laboratory-dialog-title">{item.title}</h2>
            <p>{item.details}</p>
          </div>
        </article>
      )}
    </dialog>
  );
}

export default function LaboratoryPage() {
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const activeId = hoveredId ?? focusedId ?? selectedId;

  const clearSelection = () => {
    setHoveredId(null);
    setFocusedId(null);
    setSelectedId(null);
  };

  return (
    <section
      className={`laboratory-page${activeId ? " has-active-lab" : ""}`}
      aria-labelledby="laboratory-heading"
      onKeyDown={(event) => {
        if (event.key === "Escape") clearSelection();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) clearSelection();
      }}
    >
      <div className="laboratory-backdrops" aria-hidden="true">
        {laboratories.map((item) => (
          <div
            key={item.id}
            className={`laboratory-backdrop${activeId === item.id ? " is-visible" : ""}`}
            style={{ backgroundImage: `url("${item.image}")` }}
          />
        ))}
      </div>
      <div className="laboratory-layout">
        <div className="laboratory-intro">
          <div className="laboratory-intro__content">
            <p className="laboratory-intro__eyebrow">
              <span aria-hidden="true" /> ILMIY VA AMALIY FAOLIYAT
            </p>
            <h2 id="laboratory-heading">Laboratoriyalar<span aria-hidden="true">.</span></h2>
            <p>
              Zamonaviy laboratoriyalar, amaliy
              mashg'ulotlar va innovatsion ilmiy
              tadqiqotlar.
            </p>
            <div className="laboratory-intro__meta">
              <span>{String(laboratories.length).padStart(2, "0")}</span>
              <p>Ilmiy va amaliy<br />yo‘nalish</p>
              <span className="laboratory-intro__meta-arrow" aria-hidden="true">↗</span>
            </div>
          </div>
        </div>

        <div className="laboratory-timeline">
          <div className="laboratory-timeline__items">
            {laboratories.map((item) => (
              <LabCard
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onHover={() => setHoveredId(item.id)}
                onLeave={() => setHoveredId(null)}
                onFocus={() => setFocusedId(item.id)}
                onBlur={() => setFocusedId(null)}
                onSelect={(event) => {
                  if (window.matchMedia("(hover: none)").matches) {
                    setSelectedId((current) => current === item.id ? null : item.id);
                    setFocusedId(null);
                  } else if (event.detail === 0) {
                    setFocusedId(item.id);
                  }
                }}
                onMore={setDetailItem}
              />
            ))}
          </div>
        </div>
      </div>
      <LaboratoryDialog item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}
