import React from 'react';

import AppLink from '../common/AppLink';
import '../../assets/styles/HomePartnersSection.css';
import { useLanguage } from '../../context/LanguageContext';
import { useContentList } from '../../hooks/useContentList';
import { getSiteMessages } from '../../locales/site';
import { getTranslatedField } from '../../utils/cms';

function HomePartnersSection() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.partners,
    [currentLanguageCode]
  );
  const { items } = useContentList('partners', {
    revalidate: true
  });

  const renderPartners = (isClone = false) =>
    items.map((item) => {
      const partnerTitle = getTranslatedField(item, 'title', item.title || 'Partner');

      return (
        <a
          key={`${item.id}-${isClone ? 'clone' : 'main'}`}
          className="home-partner-item"
          href={item.link || '#partners'}
          target="_blank"
          rel="noreferrer"
          aria-label={`${partnerTitle} ${texts.siteVisitSuffix}`}
          tabIndex={isClone ? -1 : 0}
        >
          <img
            className="home-partner-logo"
            src={item.image}
            alt={`${partnerTitle} ${texts.logoSuffix}`}
            width="260"
            height="70"
            loading="lazy"
            decoding="async"
          />
        </a>
      );
    });

  if (!items.length) {
    return null;
  }

  return (
    <section className="home-partners-section" aria-label={texts.ariaLabel}>
      <div className="home-partners-panel">
        <div className="home-partners-header">
          <h2>{texts.sectionTitle}</h2>

          <AppLink href="/partners" className="home-partners-link">
            {texts.seeAll} →
          </AppLink>
        </div>

        <div className="home-partners-marquee">
          <div className="home-partners-track">
            <div className="home-partners-group">{renderPartners()}</div>
            <div className="home-partners-group" aria-hidden="true">
              {renderPartners(true)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePartnersSection;
