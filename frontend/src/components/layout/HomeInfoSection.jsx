import React, { useEffect, useMemo, useState } from 'react';
import '../../assets/styles/HomeInfoSection.css';

import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { useSetting } from '../../hooks/useSetting';
import { getSiteMessages } from '../../locales/site';
import {
  formatCmsDate,
  getHtmlExcerpt,
  getLocalizedValue,
  getTranslatedField,
  sortContentByNewest,
  stripHtml
} from '../../utils/cms';

import card1 from '../../assets/optimized/card-1.jpg';
import card2 from '../../assets/optimized/card-2.jpg';
import card3 from '../../assets/optimized/card-3.jpg';

function SectionArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function DirectionIcon() {
  return (
    <span className="direction-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3L19.5 7.5V16.5L12 21L4.5 16.5V7.5L12 3Z" />
        <path d="M12 8.2A2.2 2.2 0 1 1 9.8 10.4A2.2 2.2 0 0 1 12 8.2Z" />
        <path d="M12 12.6V15.8" />
      </svg>
    </span>
  );
}

function AdmissionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 8L12 4L21 8L12 12L3 8Z" />
      <path d="M7 10.5V15.5C7 17 9.2 18.5 12 18.5C14.8 18.5 17 17 17 15.5V10.5" />
      <path d="M21 8V14" />
    </svg>
  );
}

function getDirectionHref(item) {
  if (!item) return '/departments';

  const customUrl = item.url || item.href || item.link;

  if (
    customUrl &&
    customUrl !== '/' &&
    customUrl !== '#' &&
    customUrl !== '/#' &&
    !customUrl.includes('undefined') &&
    !customUrl.includes('null')
  ) {
    return customUrl;
  }

  if (item.facultyId && item.departmentId) {
    return `/departments/${item.facultyId}/${item.departmentId}`;
  }

  if (item.facultyId) {
    return `/faculties/${item.facultyId}`;
  }

  return '/departments';
}

function getDirectionDetailsHref(item) {
  if (item?.facultyId && item?.departmentId) {
    return `/departments/${item.facultyId}/${item.departmentId}#attached-directions`;
  }

  return getDirectionHref(item);
}

function sortByOrder(items = []) {
  return [...items].sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
}

function HomeInfoSection() {
  const { currentLanguageCode } = useLanguage();

  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.homeInfo,
    [currentLanguageCode]
  );

  const [activeDirectionIndex, setActiveDirectionIndex] = useState(0);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

  const { item: admissionSetting } = useSetting('admission-cta', {
    revalidate: true
  });
  const { items: newsItems } = useContentList('news', {
    limit: 8,
    orderBy: 'recent',
    revalidate: true
  });
  const { items: directionItems } = useContentList('directions', {
    summaryOnly: false,
    revalidate: true
  });

  const featuredNews = useMemo(() => sortContentByNewest(newsItems).slice(0, 4), [newsItems]);

  const directions = useMemo(
    () =>
      sortByOrder(directionItems)
        .map((item, index) => {
          const title = getTranslatedField(item, 'title', item.title || texts.facultyFallbackTitle);
          const content = getHtmlExcerpt(getTranslatedField(item, 'content') || '', 170);
          const order = Number(item.order || index + 1);

          return {
            id: item.id || item._id || index,
            title,
            href: getDirectionHref(item),
            detailsHref: getDirectionDetailsHref(item),
            image: item.image || [card1, card2, card3][index % 3],
            promoTitle: title,
            promoText:
              content || texts.directionPromoFallback || `${title} ${texts.detailsAction || 'Batafsil'}`,
            promoTag: texts.directionOrderTag ? texts.directionOrderTag(order) : `${order}`
          };
        }),
    [directionItems, texts]
  );

  const activeDirection = directions[activeDirectionIndex] || null;

  useEffect(() => {
    if (!directions.length) {
      setActiveDirectionIndex(0);
      return;
    }

    if (activeDirectionIndex > directions.length - 1) {
      setActiveDirectionIndex(0);
    }
  }, [activeDirectionIndex, directions.length]);

  useEffect(() => {
    if (directions.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveDirectionIndex((currentIndex) => (currentIndex + 1) % directions.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [directions.length]);

  useEffect(() => {
    if (!featuredNews.length) {
      setActiveNewsIndex(0);
      return;
    }

    if (activeNewsIndex > featuredNews.length - 1) {
      setActiveNewsIndex(0);
    }
  }, [activeNewsIndex, featuredNews.length]);

  useEffect(() => {
    if (featuredNews.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveNewsIndex((currentIndex) => (currentIndex + 1) % featuredNews.length);
    }, 3600);

    return () => window.clearInterval(intervalId);
  }, [featuredNews.length]);

  const admissionData = useMemo(() => {
    const isConfigured = Boolean(admissionSetting);
    const isVisible = !isConfigured || admissionSetting.active !== false;

    return {
      isVisible,
      title: getLocalizedValue(admissionSetting?.title, texts.admissionTitle),
      content: stripHtml(getLocalizedValue(admissionSetting?.content, texts.admissionText))
    };
  }, [admissionSetting, texts]);

  const handleDirectionClick = (_item, index) => {
    setActiveDirectionIndex(index);
  };

  return (
    <section className="home-info-section">
      <div className="home-info-shell">
        <div className="home-info-grid">
          <article className="directions-studio">
            <div className="directions-panel">
              <div className="card-header">
                <h3>{texts.directionsTitle}</h3>

                <AppLink href="/departments" className="card-link">
                  <span>{texts.seeAll}</span>
                  <SectionArrowIcon />
                </AppLink>
              </div>

              <div className="directions-stage">
                {directions.length ? (
                  <>
                    <ul className="directions-list">
                      {directions.map((item, index) => (
                        <li key={item.id || item.title}>
                          <button
                            type="button"
                            className={`direction-link ${
                              index === activeDirectionIndex ? 'active' : ''
                            }`}
                            onMouseEnter={() => setActiveDirectionIndex(index)}
                            onFocus={() => setActiveDirectionIndex(index)}
                            onClick={() => handleDirectionClick(item, index)}
                          >
                            <DirectionIcon />
                            <span>{item.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="direction-preview" key={activeDirection.id || activeDirection.title}>
                      <img
                        src={activeDirection.image}
                        alt={activeDirection.title}
                        width="560"
                        height="350"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="direction-preview-copy">
                        <span className="promo-tag">{activeDirection.promoTag}</span>
                        <h3>{activeDirection.promoTitle}</h3>
                        <p>{activeDirection.promoText}</p>

                        <AppLink href={activeDirection.detailsHref || activeDirection.href} className="promo-details-link">
                          <span>{texts.detailsAction || 'Batafsil'}</span>
                          <SectionArrowIcon />
                        </AppLink>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="directions-empty-state">
                    <p>{texts.directionsEmptyTitle}</p>

                    <AppLink href="/departments" className="card-link">
                      <span>{texts.directionsEmptyAction}</span>
                      <SectionArrowIcon />
                    </AppLink>
                  </div>
                )}
              </div>
            </div>
          </article>

          {admissionData.isVisible ? (
            <aside className="admission-card" aria-label={admissionData.title}>
              <div className="admission-copy">
                <span className="admission-kicker">{texts.directionsPromoTag}</span>
                <h3>{admissionData.title}</h3>
                <p>{admissionData.content}</p>
              </div>

              <div className="admission-bg-icon">
                <AdmissionIcon />
              </div>
            </aside>
          ) : null}

          <article className="news-studio">
            <div className="card-header">
              <h3>{texts.newsTitle}</h3>

              <AppLink href="/news" className="card-link">
                <span>{texts.seeAll}</span>
                <SectionArrowIcon />
              </AppLink>
            </div>

            {featuredNews.length ? (
              <div className="news-slider" aria-live="polite">
                <div
                  className="news-track"
                  style={{ transform: `translateX(-${activeNewsIndex * 100}%)` }}
                >
                  {featuredNews.map((item, index) => {
                    const title = getTranslatedField(item, 'title', item.title || texts.newsFallbackTitle);
                    const image = item.image || [card1, card2, card3][index % 3];
                    const nextItem = featuredNews[(index + 1) % featuredNews.length];
                    const hoverImage = nextItem?.image || [card2, card3, card1][index % 3];
                    const dateLabel = formatCmsDate(item.createdAt);
                    const machineDate = item.createdAt
                      ? new Date(item.createdAt).toISOString()
                      : undefined;

                    return (
                      <div className="news-slide" key={item.id || title}>
                        <AppLink href={`/news/page/${item.id}`} className="news-item">
                          <span className="news-flip-media">
                            <img
                              className="news-img-front"
                              src={image}
                              alt={title}
                              width="420"
                              height="240"
                              loading="lazy"
                              decoding="async"
                            />
                            <img
                              className="news-img-back"
                              src={hoverImage}
                              alt=""
                              width="420"
                              height="240"
                              loading="lazy"
                              decoding="async"
                            />
                          </span>

                          <span className="news-copy">
                            <time dateTime={machineDate}>{dateLabel || texts.noDate}</time>
                            <span className="news-title">{title}</span>
                          </span>
                        </AppLink>
                      </div>
                    );
                  })}
                </div>

                <div className="news-dots" aria-hidden="true">
                  {featuredNews.map((item, index) => (
                    <span
                      className={index === activeNewsIndex ? 'active' : ''}
                      key={item.id || index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="news-empty-state">
                <p>{texts.newsEmptyTitle}</p>

                <AppLink href="/news" className="card-link">
                  <span>{texts.newsEmptyAction}</span>
                  <SectionArrowIcon />
                </AppLink>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export default HomeInfoSection;
