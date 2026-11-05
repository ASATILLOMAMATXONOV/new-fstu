import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../assets/styles/LaboratoryPage.css";
import { useLanguage } from "../../context/LanguageContext";
import { useContentList } from "../../hooks/useContentList";
import { getTranslatedField } from "../../utils/cms";
import { responsiveImageProps } from '../../utils/responsiveImage';

function LabCard({ item, isActive, onHover, onLeave, onFocus, onBlur, onOpen }) {
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
        onClick={() => onOpen(item)}
        onPointerEnter={(event) => event.pointerType === "mouse" && onHover()}
        aria-label={`${item.title}: batafsil`}
      >
        <span className="laboratory-card__plate" aria-hidden="true">
          <img {...responsiveImageProps(item.image, '(max-width: 640px) 92vw, 420px', [320, 480, 640, 768, 960])} alt="" loading="lazy" decoding="async" />
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

    </div>
  );
}

export default function LaboratoryPage() {
  const navigate = useNavigate();
  const { currentLanguageCode } = useLanguage();
  const { items = [] } = useContentList("laboratories", { orderBy: "order" });
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const activeId = hoveredId ?? focusedId;

  const laboratories = useMemo(() => {
    const colors = ["#f5d51c", "#ed6331", "#34a9c4", "#2569a4"];
    const cmsItems = items
      .filter((item) => item && item.active !== false)
      .sort((left, right) => Number(left.order || 0) - Number(right.order || 0))
      .map((item, index) => {
        return {
          id: item.id,
          number: String(index + 1).padStart(2, "0"),
          title: getTranslatedField(item, "title", item.title, currentLanguageCode),
          image: item.image || "/images/laboratory/lab-1.jpg",
          color: colors[index % colors.length]
        };
      })
      .filter((item) => item.title);

    return cmsItems;
  }, [currentLanguageCode, items]);

  const clearSelection = () => {
    setHoveredId(null);
    setFocusedId(null);
  };

  if (!laboratories.length) {
    return null;
  }

  const activeLaboratory = activeId
    ? laboratories.find((item) => item.id === activeId)
    : null;

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
        {activeLaboratory && (
          <div
            key={activeLaboratory.id}
            className="laboratory-backdrop is-visible"
            style={{ backgroundImage: `url("${activeLaboratory.image}")` }}
          />
        )}
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
              <button
                type="button"
                className="laboratory-intro__meta-arrow"
                aria-label="Barcha laboratoriyalar"
                onClick={() => navigate("/laboratories")}
              >
                ↗
              </button>
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
                onOpen={(item) => navigate(`/laboratories/${item.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
