
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import '../../assets/styles/UniversityRankings.css';
import { useSetting } from '../../hooks/useSetting';

/* ============================================
   FSTU — UNIVERSITY RANKINGS
   Responsive / Animated / Clean
============================================ */

const TEXT_FIELDS = ['title', 'titleAccent', 'description', 'heroTitle', 'heroTitleAccent', 'heroDescription'];

function localizedText(value, language) {
  if (typeof value === 'string') return value.trim();
  return String(value?.[language]?.trim() || value?.uz || '').trim();
}

function safeCardLink(value) {
  const href = String(value || '').trim();
  if (/^\/(?!\/)/.test(href) && !/[\\\s]/.test(href)) return href;
  try {
    return /^https?:$/.test(new URL(href).protocol) ? href : '';
  } catch {
    return '';
  }
}

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

function RankingHeader({ text }) {
  const [headerRef, visible] = useInViewOnce(0.2);

  return (
    <header
      ref={headerRef}
      className={
        `pr-header ${visible ? 'is-visible' : ''}`
      }
    >
      {(text.title || text.titleAccent) && <h2 id="pr-heading" className="pr-header-title">
        {text.title}{text.titleAccent && <> <span>{text.titleAccent}</span></>}
      </h2>}

      {text.description && <p className="pr-header-description">
        {text.description}
      </p>}
    </header>
  );
}

/* ============================================
   LEFT — TEXT ONLY
============================================ */

function RankingHero({ text }) {
  const [heroRef, visible] = useInViewOnce(0.1);

  return (
    <div
      ref={heroRef}
      className={`pr-hero ${visible ? 'is-visible' : ''}`}
    >
      <div className="pr-hero-text-showcase">
        {(text.heroTitle || text.heroTitleAccent) && <h3 className="pr-hero-title">
          {text.heroTitle}
          {text.heroTitleAccent && <span className="pr-hero-title-accent">
            {text.heroTitleAccent}
          </span>}
        </h3>}

        {text.heroDescription && <p className="pr-hero-description">
          {text.heroDescription}
        </p>}
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
        target={item.sourceUrl.startsWith('/') ? undefined : '_blank'}
        rel={item.sourceUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
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

export default function UniversityRankings() {
  const { item: setting, currentLanguageCode } = useSetting('university-rankings');
  const text = Object.fromEntries(TEXT_FIELDS.map(key => [
    key, localizedText(setting?.[key], currentLanguageCode)
  ]));
  const rankings = useMemo(() => {
    const cards = Array.isArray(setting?.rankings) ? setting.rankings : [];
    return cards.filter(item => item && item.active !== false).map(item => ({
      ...item,
      title: localizedText(item.title, currentLanguageCode),
      result: localizedText(item.result ?? item.value, currentLanguageCode),
      logo: item.image ?? item.logo,
      sourceUrl: safeCardLink(item.sourceUrl)
    })).filter(item => item.title && item.result);
  }, [setting, currentLanguageCode]);

  if (!setting || setting.active === false || !rankings.length) return null;

  const hasHeading = Boolean(text.title || text.titleAccent);
  const hasHero = Boolean(text.heroTitle || text.heroTitleAccent || text.heroDescription);

  return (
    <section
      className="pr-section"
      aria-labelledby={hasHeading ? 'pr-heading' : undefined}
    >
      <div className="pr-container">

        {(hasHeading || text.description) && <RankingHeader text={text} />}

        <div className={`pr-layout${hasHero ? '' : ' pr-layout--cards-only'}`}>
          {hasHero && <RankingHero text={text} />}

          <div className="pr-ranking-grid">
            {rankings.map((item, index) => (
                <RankingCard
                  key={item.id ?? index}
                  item={item}
                  index={index}
                />
              ))}
          </div>
        </div>

      </div>
    </section>
  );
}
