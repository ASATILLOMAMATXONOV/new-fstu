import React, { useEffect, useRef, useState } from 'react';

import '../../assets/styles/RektorMurojaati.css';
import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useSetting } from '../../hooks/useSetting';
import {
  getHtmlExcerpt,
  getLocalizedValue,
  normalizeRectorSpeechData
} from '../../utils/cms';
import { getSiteMessages } from '../../locales/site';

import rektorImg from '../../assets/optimized/rectok.jpg';

const ArrowIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const QuoteIcon = () => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6.5 10.5H4V6h7v5.5c0 4-2.2 6.3-6.5 7l-.7-2.1c2.5-.6 3.7-1.8 3.7-3.9h-1zm10 0H14V6h7v5.5c0 4-2.2 6.3-6.5 7l-.7-2.1c2.5-.6 3.7-1.8 3.7-3.9h-1z" />
  </svg>
);

const RektorMurojaati = () => {
  const { currentLanguageCode } = useLanguage();

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.rector,
    [currentLanguageCode]
  );

  const { item } = useSetting('rector-speech', {
    revalidate: true
  });

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [item]);

  if (!item) return null;

  const data = normalizeRectorSpeechData(item);

  if (!data.active) return null;

  const title = getLocalizedValue(
    data.title,
    texts.defaultTitle
  );

  const excerpt = getHtmlExcerpt(
    getLocalizedValue(data.content),
    310
  );

  const rectorName = getLocalizedValue(
    data.rectorName,
    texts.defaultName
  );

  const rectorPosition = getLocalizedValue(data.position);

  return (
    <section
      ref={sectionRef}
      className={`rektor-section ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="rektor-container">

        {/* LEFT CONTENT */}
        <div className="rektor-content">

          <div className="rektor-eyebrow rektor-animate">
            <span className="rektor-eyebrow-line" />
            <span>{texts.miniTitle}</span>
          </div>

          <h2 className="rektor-heading rektor-animate">
            {title}
          </h2>

          <div className="rektor-heading-divider rektor-animate">
            <span />
            <span />
          </div>

          <div className="rektor-message rektor-animate">
            <span className="rektor-quote-mark">
              <QuoteIcon />
            </span>

            <p>
              {excerpt || texts.defaultExcerpt}
            </p>
          </div>

          <div className="rektor-actions rektor-animate">
            <AppLink
              href="/rektor"
              className="rektor-button"
            >
              <span>{texts.cta}</span>

              <span className="rektor-button-icon">
                <ArrowIcon />
              </span>
            </AppLink>
          </div>

          <div className="rektor-bottom-line rektor-animate">
            <span className="rektor-bottom-dot" />
            <span>{texts.miniTitle}</span>
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="rektor-visual">

          <div className="rektor-visual-accent" />

          <div className="rektor-image-wrapper">

            <div className="rektor-image-reveal">
              <img
                src={data.image || rektorImg}
                alt={texts.alt || rectorName}
                className="rektor-image"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="rektor-image-overlay" />

            <div className="rektor-image-corner">
              <span />
              <span />
            </div>

          </div>

          <div className="rektor-info-card">
            <div className="rektor-info-decoration" />

            <div className="rektor-info-content">
              <div className="rektor-info-line" />

              <h3>{rectorName}</h3>

              {rectorPosition && (
                <p>{rectorPosition}</p>
              )}
            </div>

            <div className="rektor-info-arrow">
              <ArrowIcon />
            </div>
          </div>

          <div className="rektor-visual-outline" />

        </div>

      </div>

      <div className="rektor-decor rektor-decor-one" />
      <div className="rektor-decor rektor-decor-two" />
    </section>
  );
};

export default RektorMurojaati;