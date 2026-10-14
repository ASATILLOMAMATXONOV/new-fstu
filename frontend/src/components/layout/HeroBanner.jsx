import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../../assets/styles/HeroBanner.css';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';

function HeroBanner() {
  const { currentLanguageCode } = useLanguage();
  const texts = useMemo(() => getSiteMessages(currentLanguageCode).home.heroBanner, [currentLanguageCode]);
  const { items } = useContentList('banners', { revalidate: true });
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = useMemo(() => (items || [])
    .filter(item => item?.active !== false)
    .map(item => {
      const field = key => String(item?.[currentLanguageCode]?.[key] || item?.translations?.[currentLanguageCode]?.[key] || getTranslatedField(item, key) || '').trim();
      return {
        id: item.id,
        desktopImage: item.image || '',
        mobileImage: item.mobileImage || item.image || '',
        title: field('title'),
        text: field('subtitle'),
        primaryButtonText: field('primaryButtonText'),
        primaryButtonLink: String(item.primaryButtonLink || '').trim(),
        order: Number(item.order) || 0
      };
    })
    .filter(item => item.desktopImage || item.title || item.text || item.primaryButtonText)
    .sort((a, b) => a.order - b.order), [items, currentLanguageCode]);

  useEffect(() => { setActiveSlide(0); }, [currentLanguageCode, slides.length]);
  useEffect(() => {
    if (slides.length <= 1 || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return undefined;
    const timer = window.setInterval(() => setActiveSlide(prev => (prev + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const nextSlide = useCallback(() => setActiveSlide(prev => (prev + 1) % slides.length), [slides.length]);
  const prevSlide = useCallback(() => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length), [slides.length]);
  if (!slides.length) return null;
  const activeItem = slides[activeSlide] || slides[0];
  const hasButton = Boolean(activeItem.primaryButtonText && activeItem.primaryButtonLink);

  return (
    <section className="hero-slider" aria-label="Asosiy banner">
      <div className="hero-stage">
        <div className="hero-media" aria-hidden="true" key={`image-${activeItem.id}-${activeSlide}`}>
          {activeItem.desktopImage && (
            <picture>
              {activeItem.mobileImage && <source media="(max-width: 640px)" srcSet={activeItem.mobileImage} />}
              <img className="hero-slide-image" src={activeItem.desktopImage} alt="" fetchPriority={activeSlide === 0 ? 'high' : 'auto'} decoding="async" />
            </picture>
          )}
        </div>
        <div className="hero-gradient" aria-hidden="true" />
        <div className="hero-content-shell">
          <div className="hero-content" key={`content-${activeItem.id}-${activeSlide}`}>
            {activeItem.title && <h1>{activeItem.title}</h1>}
            {activeItem.text && <p>{activeItem.text}</p>}
            {hasButton && <a className="hero-btn primary" href={activeItem.primaryButtonLink}>{activeItem.primaryButtonText}<span aria-hidden="true">↗</span></a>}
          </div>
        </div>
        {slides.length > 1 && (
          <div className="slider-controls" aria-label="Banner boshqaruvi">
            <button type="button" className="slider-arrow left" onClick={prevSlide} aria-label={texts?.previousSlide || 'Oldingi banner'}>‹</button>
            <div className="slider-dots" role="group" aria-label="Slaydlar">
              {slides.map((slide, index) => <button type="button" key={slide.id ?? index} className={activeSlide === index ? 'active' : ''} onClick={() => setActiveSlide(index)} aria-label={`${index + 1}-banner`} aria-current={activeSlide === index ? 'true' : undefined} />)}
            </div>
            <button type="button" className="slider-arrow right" onClick={nextSlide} aria-label={texts?.nextSlide || 'Keyingi banner'}>›</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroBanner;
