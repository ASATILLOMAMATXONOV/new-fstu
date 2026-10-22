import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import '../../assets/styles/HeroBanner.css';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';

const SLIDE_DURATION = 1600;
const SLIDE_INTERVAL = 7000;
const getImageKey = slide => `${slide.desktopImage}|${slide.mobileImage}`;

function HeroBanner() {
  const { currentLanguageCode } = useLanguage();
  const texts = useMemo(() => getSiteMessages(currentLanguageCode).home.heroBanner, [currentLanguageCode]);
  const { items } = useContentList('banners', { revalidate: true });
  const [carousel, setCarousel] = useState({ position: 1, moving: false });
  const [readyImages, setReadyImages] = useState(() => new Set());
  const [reducedMotion, setReducedMotion] = useState(false);
  const movingRef = useRef(false);
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

  const hasMultipleSlides = slides.length > 1;
  const slideKey = slides.map(slide => `${slide.id}:${getImageKey(slide)}`).join(';');
  const activeSlide = hasMultipleSlides
    ? (carousel.position - 1 + slides.length) % slides.length
    : 0;
  const trackSlides = useMemo(() => hasMultipleSlides
    ? [slides[slides.length - 1], ...slides, slides[0]]
    : slides, [slides, hasMultipleSlides]);

  useLayoutEffect(() => {
    movingRef.current = false;
    setCarousel({ position: hasMultipleSlides ? 1 : 0, moving: false });
  }, [slideKey, hasMultipleSlides]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const isReady = useCallback(slide => Boolean(slide) &&
    (!slide.desktopImage || readyImages.has(getImageKey(slide))), [readyImages]);

  const markImageReady = useCallback(async (image, slide) => {
    try {
      await image.decode?.();
    } catch {
      // The loaded image can still be displayed if decoding is unsupported.
    }
    const key = getImageKey(slide);
    setReadyImages(previous => previous.has(key) ? previous : new Set([...previous, key]));
  }, []);

  const finishTransition = useCallback(() => {
    movingRef.current = false;
    setCarousel(previous => ({
      position: previous.position === 0 ? slides.length
        : previous.position === slides.length + 1 ? 1 : previous.position,
      moving: false
    }));
  }, [slides.length]);

  const goToSlide = useCallback((index, step = 0) => {
    if (!hasMultipleSlides || movingRef.current || index === activeSlide || !isReady(slides[index])) return;
    const position = step ? carousel.position + step : index + 1;
    movingRef.current = !reducedMotion;
    setCarousel({ position: reducedMotion ? index + 1 : position, moving: !reducedMotion });
  }, [activeSlide, carousel.position, hasMultipleSlides, isReady, reducedMotion, slides]);

  useEffect(() => {
    if (!hasMultipleSlides || reducedMotion || carousel.moving) return undefined;
    const nextIndex = (activeSlide + 1) % slides.length;
    if (!isReady(slides[nextIndex])) return undefined;
    const timer = window.setTimeout(() => goToSlide(nextIndex, 1), SLIDE_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeSlide, carousel.moving, goToSlide, hasMultipleSlides, isReady, reducedMotion, slides]);

  useEffect(() => {
    if (!carousel.moving) return undefined;
    if (reducedMotion) {
      finishTransition();
      return undefined;
    }
    const timer = window.setTimeout(finishTransition, SLIDE_DURATION + 100);
    return () => window.clearTimeout(timer);
  }, [carousel.moving, finishTransition, reducedMotion]);

  if (!slides.length) return null;
  const previousIndex = (activeSlide - 1 + slides.length) % slides.length;
  const nextIndex = (activeSlide + 1) % slides.length;
  const visiblePosition = hasMultipleSlides ? carousel.position : 0;

  return (
    <section className="hero-slider" aria-label="Asosiy banner">
      <div className="hero-stage">
        <div
          className={`hero-track${carousel.moving ? ' is-moving' : ''}`}
          style={{ transform: `translate3d(-${visiblePosition * 100}%, 0, 0)`, '--hero-slide-duration': `${SLIDE_DURATION}ms` }}
          onTransitionEnd={event => {
            if (event.target === event.currentTarget && event.propertyName === 'transform') finishTransition();
          }}
        >
          {trackSlides.map((slide, index) => {
            const hasButton = Boolean(slide.primaryButtonText && slide.primaryButtonLink);
            const hasContent = Boolean(slide.title || slide.text || hasButton);
            const isVisible = index === visiblePosition;
            return (
              <div className="hero-slide" key={`${index}-${slide.id}`} aria-hidden={!isVisible} inert={!isVisible || undefined}>
                <div className="hero-media" aria-hidden="true">
                  {slide.desktopImage && (
                    <picture>
                      {slide.mobileImage && <source media="(max-width: 640px)" srcSet={slide.mobileImage} />}
                      <img
                        className="hero-slide-image"
                        src={slide.desktopImage}
                        alt=""
                        fetchPriority={index === (hasMultipleSlides ? 1 : 0) ? 'high' : 'low'}
                        loading="eager"
                        decoding="async"
                        onLoad={event => markImageReady(event.currentTarget, slide)}
                        onError={event => markImageReady(event.currentTarget, slide)}
                      />
                    </picture>
                  )}
                </div>
                <div className="hero-gradient" aria-hidden="true" />
                {hasContent && (
                  <div className="hero-content-shell">
                    <div className="hero-content">
                      {slide.text && <p>{slide.text}</p>}
                      {slide.title && <h1>{slide.title}</h1>}
                      {hasButton && <a className="hero-btn primary" href={slide.primaryButtonLink}>{slide.primaryButtonText}</a>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {hasMultipleSlides && (
          <div className="slider-controls" aria-label="Banner boshqaruvi">
            <button type="button" className="slider-arrow left" disabled={carousel.moving || !isReady(slides[previousIndex])} onClick={() => goToSlide(previousIndex, -1)} aria-label={texts?.previousSlide || 'Oldingi banner'}>‹</button>
            <div className="slider-dots" role="group" aria-label="Slaydlar">
              {slides.map((slide, index) => <button type="button" key={slide.id ?? index} className={activeSlide === index ? 'active' : ''} disabled={carousel.moving || !isReady(slide)} onClick={() => goToSlide(index)} aria-label={`${index + 1}-banner`} aria-current={activeSlide === index ? 'true' : undefined} />)}
            </div>
            <button type="button" className="slider-arrow right" disabled={carousel.moving || !isReady(slides[nextIndex])} onClick={() => goToSlide(nextIndex, 1)} aria-label={texts?.nextSlide || 'Keyingi banner'}>›</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroBanner;
