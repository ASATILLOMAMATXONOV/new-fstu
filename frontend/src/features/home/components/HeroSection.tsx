import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
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
    title: 'Kelajakni bilim va innovatsiya bilan quramiz',
    description:
      'Zamonaviy ta’lim, ilmiy izlanish va texnologik taraqqiyot uyg‘unlashgan yangi avlod universiteti.',
    image: '/images/banner/banner-1.png',
  },
  {
    id: 2,
    eyebrow: 'ZAMONAVIY TA’LIM',
    title: 'Sifatli ta’lim — kuchli kelajak poydevori',
    description:
      'Talabalar uchun zamonaviy laboratoriyalar, tajribali professor-o‘qituvchilar va xalqaro imkoniyatlar.',
    image: '/images/banner/banner-2.png',
  },
  {
    id: 3,
    eyebrow: 'ILM-FAN VA INNOVATSIYA',
    title: 'G‘oyadan natijagacha birgalikda',
    description:
      'Ilmiy loyihalar, startaplar va innovatsion tashabbuslar uchun keng imkoniyatlar.',
    image: '/images/banner/banner-3.png',
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) =>
        current === slides.length - 1
          ? 0
          : current + 1,
      );
    }, 7000);

    return () => {
      window.clearInterval(interval);
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
    <section className="hero">
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={[
              'hero-slide',
              index === activeSlide && 'active',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          >
            <div className="hero-overlay" />

            <div className="container hero-content">
              <div className="hero-copy">
                <span className="hero-eyebrow">
                  {slide.eyebrow}
                </span>

                <h1>{slide.title}</h1>

                <p>
                  {slide.description}
                </p>

                <div className="hero-actions">
                  <Link
                    to={ROUTES.about}
                    className="hero-button hero-button-primary"
                  >
                    Universitet haqida

                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    to={ROUTES.admissions}
                    className="hero-button hero-button-outline"
                  >
                    Qabul haqida
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="container hero-bottom">
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-icon">
              <Users size={20} />
            </span>

            <div>
              <strong>10 000+</strong>
              <span>Talabalar</span>
            </div>
          </div>

          <div className="hero-stat">
            <span className="hero-stat-icon">
              <GraduationCap size={20} />
            </span>

            <div>
              <strong>500+</strong>
              <span>Professor-o‘qituvchilar</span>
            </div>
          </div>
        </div>

        <div className="hero-controls">
          <button
            type="button"
            className="hero-control"
            onClick={handlePrev}
            aria-label="Oldingi banner"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={[
                  'hero-dot',
                  index === activeSlide && 'active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveSlide(index)}
                aria-label={`${index + 1}-banner`}
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-control"
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