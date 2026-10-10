import React, { useEffect, useMemo, useState } from 'react';

import '../../assets/styles/HeroBanner.css';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';

function HeroBanner() {
  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () => getSiteMessages(currentLanguageCode).home.heroBanner,
    [currentLanguageCode]
  );

  const { items } = useContentList('banners', {
    revalidate: true
  });

  const [activeSlide, setActiveSlide] = useState(0);

  const slides = useMemo(() => {
    return (items || [])
      .filter((item) => item?.active !== false)
      .map((item) => {
        const getLocalizedBannerField = (field) =>
          (
            item?.[currentLanguageCode]?.[field] ||
            item?.translations?.[currentLanguageCode]?.[field] ||
            getTranslatedField(item, field) ||
            ''
          ).trim();

        const title =
          getLocalizedBannerField('title');

        const text =
          getLocalizedBannerField('subtitle');

        const primaryButtonText =
          getLocalizedBannerField('primaryButtonText');

        const primaryButtonLink =
          item?.primaryButtonLink?.trim?.() || '';

        return {
          id: item.id,

          desktopImage: item.image || '',
          mobileImage: item.mobileImage || item.image || '',

          title,
          text,

          primaryButtonText,
          primaryButtonLink,

          order: Number(item.order) || 0
        };
      })
      .filter((item) => {
        return (
          item.desktopImage ||
          item.title ||
          item.text ||
          item.primaryButtonText
        );
      })
      .sort((a, b) => a.order - b.order);
  }, [items, currentLanguageCode]);

  useEffect(() => {
    setActiveSlide(0);
  }, [slides.length, currentLanguageCode]);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        return (prev + 1) % slides.length;
      });
    }, 4500);

    return () => {
      clearInterval(interval);
    };
  }, [slides.length]);

  const nextSlide = () => {
    if (slides.length <= 1) return;

    setActiveSlide((prev) => {
      return (prev + 1) % slides.length;
    });
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;

    setActiveSlide((prev) => {
      return (prev - 1 + slides.length) % slides.length;
    });
  };

  if (!slides.length) {
    return null;
  }

  const activeItem = slides[activeSlide] || slides[0];

  const hasTitle = Boolean(activeItem.title);
  const hasText = Boolean(activeItem.text);

  const hasPrimaryButton =
    Boolean(activeItem.primaryButtonText) &&
    Boolean(activeItem.primaryButtonLink);

  const hasTextContent =
    hasTitle ||
    hasText ||
    hasPrimaryButton;

  const hasImage = Boolean(activeItem.desktopImage);
  return (
    <section
      className={`hero-slider ${
        !hasTextContent ? 'hero-slider-image-only' : ''
      }`}
    >
      {hasImage && (
        <div className="hero-media" aria-hidden="true">
          <picture key={`${activeItem.id}-${activeSlide}`}>
            {activeItem.mobileImage && (
              <source
                media="(max-width: 900px)"
                srcSet={activeItem.mobileImage}
              />
            )}

            <img
              className="hero-slide-image"
              src={activeItem.desktopImage}
              alt=""
              width="1600"
              height="640"
              fetchPriority={activeSlide === 0 ? 'high' : 'auto'}
              loading={activeSlide === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </picture>
        </div>
      )}

      {hasTextContent && (
        <div className="hero-gradient" />
      )}

      {hasTextContent && (
        <div className="hero-shell hero-content-shell">
          <div className="hero-content" key={`content-${activeItem.id}-${activeSlide}`}>
            {hasTitle && (
              <h1>{activeItem.title}</h1>
            )}

            {hasText && (
              <p>{activeItem.text}</p>
            )}

            {hasPrimaryButton && (
              <div className="hero-buttons">
                <a
                  href={activeItem.primaryButtonLink}
                  className="hero-btn primary"
                >
                  {activeItem.primaryButtonText}

                  <span aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="slider-arrow left"
            onClick={prevSlide}
            aria-label={
              texts?.previousSlide || 'Oldingi banner'
            }
          >
            ‹
          </button>

          <button
            type="button"
            className="slider-arrow right"
            onClick={nextSlide}
            aria-label={
              texts?.nextSlide || 'Keyingi banner'
            }
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}

export default HeroBanner;
