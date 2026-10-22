
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import '../../assets/styles/StatisticsSection.css';

import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';
import { getIntlLocaleForLanguage } from '../../utils/language';

/* ==========================================
   ICON BASE
========================================== */

function IconBase({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ==========================================
   ICONS
========================================== */

function StudentsIcon() {
  return (
    <IconBase>
      <path d="M3 8L12 4L21 8L12 12L3 8Z" />
      <path d="M7 10.5V15.5C7 17 9.2 18.5 12 18.5C14.8 18.5 17 17 17 15.5V10.5" />
      <path d="M21 8V14" />
    </IconBase>
  );
}

function TeachersIcon() {
  return (
    <IconBase>
      <circle cx="8" cy="7" r="4" />
      <path d="M2 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M16 3a4 4 0 0 1 0 8" />
      <path d="M16 15a6 6 0 0 1 6 6" />
    </IconBase>
  );
}

function GlobeIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3 4 6 4 9s-1 6-4 9" />
      <path d="M12 3c-3 3-4 6-4 9s1 6 4 9" />
    </IconBase>
  );
}

function LayersIcon() {
  return (
    <IconBase>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </IconBase>
  );
}

function UniversityIcon() {
  return (
    <IconBase>
      <path d="m3 10 9-7 9 7" />
      <path d="M4 10h16" />
      <path d="M6 10v9M10 10v9M14 10v9M18 10v9" />
      <path d="M3 19h18M2 22h20" />
    </IconBase>
  );
}

function TrophyIcon() {
  return (
    <IconBase>
      <path d="M8 4h8v7a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H4v3a4 4 0 0 0 4 4" />
      <path d="M16 6h4v3a4 4 0 0 1-4 4" />
      <path d="M12 15v4M8 21h8M9 19h6" />
    </IconBase>
  );
}

/* ==========================================
   ICON MAP
========================================== */

const ICON_MAP = {
  UserOutlined: StudentsIcon,
  TeamOutlined: TeachersIcon,
  GlobalOutlined: GlobeIcon,
  ReadOutlined: LayersIcon,
  BankOutlined: UniversityIcon,
  TrophyOutlined: TrophyIcon
};

/* ==========================================
   HELPERS
========================================== */

function parseStatisticCount(value) {
  const digits = String(value ?? '')
    .replace(/[^\d]/g, '');

  if (!digits) return 0;

  const number = Number(digits);

  return Number.isSafeInteger(number)
    ? Math.max(0, number)
    : 0;
}

function shouldUseStatisticImage(item) {
  return Boolean(item?.image) &&
    (item.mediaType === 'image' || item.image);
}

/* ==========================================
   REDUCED MOTION
========================================== */

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches ?? false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const update = () => setReduced(media.matches);

    update();

    media.addEventListener?.('change', update);

    return () => {
      media.removeEventListener?.('change', update);
    };
  }, []);

  return reduced;
}

/* ==========================================
   ANIMATED NUMBER
========================================== */

function AnimatedNumber({
  value,
  locale,
  active,
  reducedMotion,
  duration = 1600
}) {
  const target = useMemo(
    () => parseStatisticCount(value),
    [value]
  );

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    if (reducedMotion) {
      setDisplayValue(target);
      return undefined;
    }

    let frameId;
    let startTime;

    const easeOutCubic = (progress) =>
      1 - Math.pow(1 - progress, 3);

    const animate = (timestamp) => {
      if (startTime === undefined) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const nextValue = Math.round(
        target * easeOutCubic(progress)
      );

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    target,
    active,
    reducedMotion,
    duration
  ]);

  const formattedValue = (
    active ? displayValue : target
  ).toLocaleString(locale);

  return (
    <span className="statistics-count">
      <span className="statistics-count-number">
        {formattedValue}
      </span>

      <span
        className="statistics-count-plus"
        aria-hidden="true"
      >
        +
      </span>
    </span>
  );
}

/* ==========================================
   STATISTIC CARD
========================================== */

function StatisticCard({
  item,
  index,
  active,
  locale,
  reducedMotion
}) {
  const IconComponent =
    ICON_MAP[item.icon] || StudentsIcon;

  const title = getTranslatedField(
    item,
    'title',
    item.title || ''
  );

  return (
    <article
      className={`statistics-item ${
        active ? 'is-visible' : ''
      }`}
      style={{
        '--card-index': index
      }}
      aria-label={`${title}: ${item.count}+`}
    >
      <div className="statistics-card-inner">

        {/* TECH CORNERS */}
        <span className="statistics-corner corner-tl" />
        <span className="statistics-corner corner-tr" />
        <span className="statistics-corner corner-bl" />
        <span className="statistics-corner corner-br" />

        {/* CENTER ICON / IMAGE */}
        <div className="statistics-visual">
          <div className="statistics-tech-ring">
            <span className="statistics-ring-dot" />
          </div>

          <div className="statistics-icon">
            {shouldUseStatisticImage(item) ? (
              <img
                src={item.image}
                alt=""
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <IconComponent />
            )}
          </div>
        </div>

        {/* INFORMATION */}
        <div className="statistics-content">
          <h3 className="statistics-value">
            <AnimatedNumber
              value={item.count}
              locale={locale}
              active={active}
              reducedMotion={reducedMotion}
              duration={1550 + index * 100}
            />
          </h3>

          <p className="statistics-label">
            {title}
          </p>
        </div>

        {/* TECH FOOTER */}
        <div
          className="statistics-tech-footer"
          aria-hidden="true"
        >
          <span />
          <i />
          <span />
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   MAIN STATISTICS SECTION
========================================== */

export default function StatisticsSection() {
  const sectionRef = useRef(null);

  const { currentLanguageCode } = useLanguage();

  const texts = useMemo(
    () =>
      getSiteMessages(currentLanguageCode)
        .home.statistics,
    [currentLanguageCode]
  );

  const currentLocale = useMemo(
    () => getIntlLocaleForLanguage(
      currentLanguageCode
    ),
    [currentLanguageCode]
  );

  const { items } = useContentList('statistics', {
    revalidate: true
  });

  const stats = useMemo(
    () => Array.isArray(items) ? items : [],
    [items]
  );

  const [isVisible, setIsVisible] = useState(false);

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || !stats.length || isVisible) {
      return undefined;
    }

    if (
      reducedMotion ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [
    stats.length,
    isVisible,
    reducedMotion
  ]);

  if (!stats.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`statistics-section ${
        isVisible ? 'statistics-visible' : ''
      }`}
      aria-labelledby="statistics-heading"
    >
      {/* HEADER */}
      <div className="statistics-top">
        <div className="statistics-heading-group">
          <span
            className="statistics-heading-accent"
            aria-hidden="true"
          />

          <h2 id="statistics-heading">
            {texts.title}
          </h2>
        </div>
      </div>

      {/* GRID */}
      <div className="statistics-panel">
        {stats.map((item, index) => (
          <StatisticCard
            key={item.id ?? `${item.title}-${index}`}
            item={item}
            index={index}
            active={isVisible}
            locale={currentLocale}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
