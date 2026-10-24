import React, { useEffect, useMemo, useRef, useState } from 'react';

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

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 10.5H4V6h7v5.5c0 4-2.2 6.3-6.5 7l-.7-2.1c2.5-.6 3.7-1.8 3.7-3.9h-1zm10 0H14V6h7v5.5c0 4-2.2 6.3-6.5 7l-.7-2.1c2.5-.6 3.7-1.8 3.7-3.9h-1z" />
    </svg>
  );
}

export default function RektorMurojaati() {
  const { currentLanguageCode } = useLanguage();
  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).home.rector,
    [currentLanguageCode]
  );
  const { item } = useSetting('rector-speech', { revalidate: true });
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const data = useMemo(
    () => (item ? normalizeRectorSpeechData(item) : null),
    [item]
  );
  const active = Boolean(data?.active);

  useEffect(() => {
    if (!active) return undefined;
    const element = sectionRef.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    setImageFailed(false);
  }, [data?.image]);

  if (!active) return null;

  const title = getLocalizedValue(data.title, texts.defaultTitle);
  const message = getLocalizedValue(data.content);
  const excerpt = getHtmlExcerpt(message, 420) || texts.defaultExcerpt;
  const rectorName = getLocalizedValue(data.rectorName, texts.defaultName);
  const rectorPosition = getLocalizedValue(data.position);
  const imageSrc = imageFailed ? rektorImg : (data.image || rektorImg);

  return (
    <section
      ref={sectionRef}
      className={`rektor-section${isVisible ? ' is-visible' : ''}`}
      aria-labelledby="rektor-heading"
    >
      <div className="rektor-container">
        <div className="rektor-content">
          <div className="rektor-eyebrow rektor-animate">
            <span className="rektor-eyebrow-line" aria-hidden="true" />
            <span>{texts.miniTitle}</span>
          </div>

          <h2 id="rektor-heading" className="rektor-heading rektor-animate">
            {title}
          </h2>

          <div className="rektor-heading-divider rektor-animate" aria-hidden="true">
            <span /><span />
          </div>

          <div className="rektor-message rektor-animate">
            <span className="rektor-quote-mark" aria-hidden="true"><QuoteIcon /></span>
            <p>{excerpt}</p>
          </div>

          <div className="rektor-actions rektor-animate">
            <AppLink href="/rektor" className="rektor-button">
              <span>{texts.cta}</span>
              <span className="rektor-button-icon" aria-hidden="true"><ArrowIcon /></span>
            </AppLink>
          </div>
        </div>

        <div className="rektor-visual">
          <div className="rektor-visual-accent" aria-hidden="true" />
          <div className="rektor-image-wrapper">
            <div className="rektor-image-reveal">
              <img
                src={imageSrc}
                onError={() => { if (!imageFailed) setImageFailed(true); }}
                alt={rectorName || texts.alt || 'Rektor'}
                className="rektor-image"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="rektor-image-corner" aria-hidden="true" />
          </div>

          <div className="rektor-info-card">
            <div className="rektor-info-line" aria-hidden="true" />
            <div className="rektor-info-content">
              <h3>{rectorName}</h3>
              {rectorPosition && <p>{rectorPosition}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="rektor-decor rektor-decor-one" aria-hidden="true" />
      <div className="rektor-decor rektor-decor-two" aria-hidden="true" />
    </section>
  );
}
