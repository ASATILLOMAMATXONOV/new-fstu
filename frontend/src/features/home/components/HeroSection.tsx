import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';

import '../styles/hero.css';

const slides = [
  {
    id: 1,
    eyebrow: 'FARG‘ONA DAVLAT TEXNIKA UNIVERSITETI',
    title: 'Bilim va taraqqiyot maskani',
    description:
      'Zamonaviy ta’lim, ilm-fan va innovatsion rivojlanish uchun keng imkoniyatlar.',
    image: '/images/banner/banner-1.png',
  },
  {
    id: 2,
    eyebrow: 'ZAMONAVIY TA’LIM',
    title: 'Sifatli ta’lim — kuchli kelajak',
    description:
      'Talabalar uchun zamonaviy o‘quv muhiti va amaliy imkoniyatlar.',
    image: '/images/banner/banner-2.png',
  },
  {
    id: 3,
    eyebrow: 'ILM-FAN VA INNOVATSIYA',
    title: 'Yangi g‘oyalar sari',
    description:
      'Ilmiy tadqiqot, texnologiya va innovatsiya yo‘nalishida yangi imkoniyatlar.',
    image: '/images/banner/banner-3.png',
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) =>
        current === slides.length - 1
          ? 0
          : current + 1,
      );
    }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const handlePrev = () => {
    setActiveSlide((current) =>
      current === 0
        ? slides.length - 1
        : current - 1,
    );
  };

  const handleNext = () => {
    setActiveSlide((current) =>
      current === slides.length - 1
        ? 0
        : current + 1,
    );
  };

  return (
    <section className="university-hero">
      <div className="university-hero-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={[
              'university-hero-slide',
              index === activeSlide && 'active',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <img
              src={slide.image}
              alt={slide.title}
            />

            <div className="university-hero-overlay" />

            <div className="container university-hero-content">
              <div
                key={activeSlide}
                className="university-hero-text"
              >
                <span className="university-hero-eyebrow">
                  {slide.eyebrow}
                </span>

                <h1>
                  {slide.title}
                </h1>

                <p>
                  {slide.description}
                </p>

                <div className="university-hero-actions">
                  <Link
                    to={ROUTES.about}
                    className="university-hero-primary"
                  >
                    Universitet haqida
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    to={ROUTES.admissions}
                    className="university-hero-secondary"
                  >
                    Qabul haqida
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="container university-hero-bottom">
        <div className="university-hero-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={[
                'university-hero-dot',
                activeSlide === index && 'active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActiveSlide(index)}
              aria-label={`${index + 1}-banner`}
            />
          ))}
        </div>

        <div className="university-hero-controls">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Oldingi banner"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Keyingi banner"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}