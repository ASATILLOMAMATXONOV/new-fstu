import React, { useEffect, useRef, useState } from 'react';

import '../../assets/styles/StatisticsSection.css';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';
import { getIntlLocaleForLanguage } from '../../utils/language';

function StudentsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 8L12 4L21 8L12 12L3 8Z" />
      <path d="M7 10.5V15.5C7 17 9.2 18.5 12 18.5C14.8 18.5 17 17 17 15.5V10.5" />
      <path d="M21 8V14" />
    </svg>
  );
}

function TeachersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 11C10.2 11 12 9.2 12 7C12 4.8 10.2 3 8 3C5.8 3 4 4.8 4 7C4 9.2 5.8 11 8 11Z" />
      <path d="M16 11C18.2 11 20 9.2 20 7C20 4.8 18.2 3 16 3" />
      <path d="M2 21C2 17.7 4.7 15 8 15C11.3 15 14 17.7 14 21" />
      <path d="M14 15C17.3 15 20 17.7 20 21" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21C17 21 21 17 21 12C21 7 17 3 12 3C7 3 3 7 3 12C3 17 7 21 12 21Z" />
      <path d="M3 12H21" />
      <path d="M12 3C14 5.5 15 8.5 15 12C15 15.5 14 18.5 12 21" />
      <path d="M12 3C10 5.5 9 8.5 9 12C9 15.5 10 18.5 12 21" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4L20 8L12 12L4 8L12 4Z" />
      <path d="M4 12L12 16L20 12" />
      <path d="M4 16L12 20L20 16" />
    </svg>
  );
}

const iconMap = {
  UserOutlined: StudentsIcon,
  TeamOutlined: TeachersIcon,
  GlobalOutlined: GlobeIcon,
  ReadOutlined: LayersIcon,
  BankOutlined: LayersIcon,
  TrophyOutlined: GlobeIcon
};

function parseStatisticCount(value) {
  const digits = String(value ?? '')
    .replace(/[^\d]/g, '')
    .trim();

  return digits ? Number(digits) : 0;
}

function formatStatisticCount(value, languageCode) {
  return parseStatisticCount(value).toLocaleString(getIntlLocaleForLanguage(languageCode));
}

function shouldUseStatisticImage(item) {
  return (item.mediaType === 'image' || item.image) && Boolean(item.image);
}

function StatisticsSection() {
  const sectionRef = useRef(null);
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.statistics,
    [currentLanguageCode]
  );
  const currentLocale = React.useMemo(
    () => getIntlLocaleForLanguage(currentLanguageCode),
    [currentLanguageCode]
  );
  const { items } = useContentList('statistics', {
    revalidate: true
  });
  const stats = items;
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    setCounts(stats.map(() => 0));
  }, [stats]);

  useEffect(() => {
    const sectionNode = sectionRef.current;

    if (!stats.length || !sectionNode) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionNode);

    return () => observer.disconnect();
  }, [stats.length]);

  useEffect(() => {
    if (!shouldAnimate) {
      return undefined;
    }

    const duration = 1200;
    let frameId;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);

      setCounts(
        stats.map((item) => Math.round(parseStatisticCount(item.count) * easedProgress))
      );

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [shouldAnimate, stats]);

  if (!stats.length) {
    return null;
  }

  return (
    <section className="statistics-section" ref={sectionRef}>
      <div className="statistics-top">
        <h2>{texts.title}</h2>
      </div>

      <div className="statistics-panel">
        {stats.map((item, index) => {
          const IconComponent = iconMap[item.icon] || StudentsIcon;

          return (
            <div className="statistics-item" key={item.id || item.title}>
              <div className="statistics-icon">
                {shouldUseStatisticImage(item) ? (
                  <img
                    src={item.image}
                    alt={getTranslatedField(item, 'title', item.title)}
                    width="28"
                    height="28"
                  />
                ) : (
                  <IconComponent />
                )}
              </div>

              <h4>
                {shouldAnimate
                  ? counts[index].toLocaleString(currentLocale)
                  : formatStatisticCount(item.count, currentLanguageCode)}{' '}
                +
              </h4>
              <span>{getTranslatedField(item, 'title', item.title)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default StatisticsSection;
