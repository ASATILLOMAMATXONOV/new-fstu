
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import '../../assets/styles/UniversityRankings.css';

/* ============================================
   FSTU — UNIVERSITY RANKINGS
   Responsive / Animated / Clean
============================================ */

const DEFAULT_RANKINGS = [
  {
    id: 'national',
    title: 'O‘zbekiston milliy reytingi',
    result: 'TOP 5',
    logo: '/images/rankings/uz-national.png'
  },
  {
    id: 'impact',
    title: 'THE Impact Rankings',
    result: 'TOP 400+',
    logo: '/images/rankings/the-impact.png'
  },
  {
    id: 'world',
    title: 'THE World University Rankings',
    result: 'Reporter',
    logo: '/images/rankings/the-world.png'
  },
  {
    id: 'technical',
    title: 'Texnika sohasi bo‘yicha milliy reyting',
    result: 'TOP 3',
    logo: '/images/rankings/uz-technical.png'
  },
  {
    id: 'asia',
    title: 'QS Asian University Rankings',
    result: 'TOP 801+',
    logo: '/images/rankings/qs-asia.png'
  },
  {
    id: 'central',
    title: 'QS Ranking Central Asia',
    result: 'TOP 50',
    logo: '/images/rankings/qs-central.png'
  }
];

/* ============================================
   REDUCED MOTION
============================================ */

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
}

/* ============================================
   ONE-TIME VISIBILITY OBSERVER
============================================ */

function useInViewOnce(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    if (
      typeof IntersectionObserver === 'undefined' ||
      prefersReducedMotion()
    ) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [visible, threshold]);

  return [ref, visible];
}

/* ============================================
   LOGO
============================================ */

function RankingLogo({ item }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [item.logo]);

  const initials = String(item.title || 'FSTU')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();

  if (!item.logo || failed) {
    return (
      <span className="pr-logo-fallback">
        {initials}
      </span>
    );
  }

  return (
    <img
      src={item.logo}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/* ============================================
   NUMBER COUNTER
============================================ */

function AnimatedRanking({
  value,
  duration = 1500
}) {
  const label = String(value ?? '—');
  const [elementRef, visible] = useInViewOnce(0.1);

  const parsed = useMemo(() => {
    const match = label.match(/^(.*?)(\d+)(.*)$/);

    if (!match) return null;

    return {
      prefix: match[1],
      target: Number(match[2]),
      suffix: match[3]
    };
  }, [label]);

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible || !parsed) return undefined;

    const target = parsed.target;

    if (prefersReducedMotion()) {
      setCount(target);
      return undefined;
    }

    let frameId = null;
    let startTime = null;

    const animate = timestamp => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const nextCount = Math.round(target * eased);

      setCount(nextCount);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [visible, parsed, duration]);

  return (
    <span
      ref={elementRef}
      className="pr-result"
      aria-label={label}
    >
      {parsed ? (
        <span className="pr-ranking-number" aria-hidden="true">
          <span>{parsed.prefix}</span>

          <span className="pr-ranking-digits">
            {count}
          </span>

          <span>{parsed.suffix}</span>
        </span>
      ) : (
        <span
          className={
            `pr-ranking-text ${visible ? 'is-visible' : ''}`
          }
        >
          {label}
        </span>
      )}
    </span>
  );
}

/* ============================================
   HEADER WITH ENTRANCE ANIMATION
============================================ */

function RankingHeader() {
  const [headerRef, visible] = useInViewOnce(0.2);

  return (
    <header
      ref={headerRef}
      className={
        `pr-header ${visible ? 'is-visible' : ''}`
      }
    >
      <h2 id="pr-heading" className="pr-header-title">
        Reyting <span>ko‘rsatkichlari</span>
      </h2>

      <p className="pr-header-description">
        Universitetning milliy va xalqaro reytinglarda
        qayd etilgan natijalari.
      </p>
    </header>
  );
}

/* ============================================
   LEFT — TEXT ONLY
============================================ */

function RankingHero() {
  const [heroRef, visible] = useInViewOnce(0.1);

  return (
    <div
      ref={heroRef}
      className={`pr-hero ${visible ? 'is-visible' : ''}`}
    >
      <div className="pr-hero-text-showcase">
        <h3 className="pr-hero-title">
          Ilm-fan va
          <span className="pr-hero-title-accent">
            global e’tirof.
          </span>
        </h3>

        <p className="pr-hero-description">
          Milliy va xalqaro reytinglardagi natijalar
          universitet rivojlanishining muhim
          ko‘rsatkichlaridan biridir.
        </p>
      </div>
    </div>
  );
}

/* ============================================
   RANKING CARD
============================================ */

function RankingCard({ item, index }) {
  const [cardRef, visible] = useInViewOnce(0.1);

  const content = (
    <>
      <div className="pr-card-logo">
        <RankingLogo item={item} />
      </div>

      <div className="pr-card-info">
        <h3>{item.title}</h3>

        <strong>
          <AnimatedRanking
            value={item.result ?? item.value ?? '—'}
            duration={1300 + index * 120}
          />
        </strong>
      </div>

      <span className="pr-card-accent" />
    </>
  );

  const className = `pr-card ${visible ? 'is-visible' : ''}`;

  const sharedProps = {
    ref: cardRef,
    className,
    style: {
      '--pr-order': index
    }
  };

  if (item.sourceUrl) {
    return (
      <a
        {...sharedProps}
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.title}: ${item.result ?? item.value}`}
      >
        {content}
      </a>
    );
  }

  return (
    <article {...sharedProps}>
      {content}
    </article>
  );
}

/* ============================================
   MAIN COMPONENT
============================================ */

export default function UniversityRankings({ data }) {
  const rankings = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.rankings)) {
      return data.rankings;
    }

    return DEFAULT_RANKINGS;
  }, [data]);

  return (
    <section
      className="pr-section"
      aria-labelledby="pr-heading"
    >
      <div className="pr-container">

        <RankingHeader />

        <div className="pr-layout">
          <RankingHero />

          <div className="pr-ranking-grid">
            {rankings.length > 0 ? (
              rankings.map((item, index) => (
                <RankingCard
                  key={item.id ?? index}
                  item={item}
                  index={index}
                />
              ))
            ) : (
              <div className="pr-empty">
                Hozircha reyting ma’lumotlari mavjud emas.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
