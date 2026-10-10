import React from 'react';

import '../assets/styles/PartnersPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getSiteMessages } from '../locales/site';
import { getTranslatedField } from '../utils/cms';

function PartnersPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.partnersPage,
    [currentLanguageCode]
  );
  const { items: partners } = useContentList('partners');

  return (
    <main className="partners-page" id="xalqaro">
      <section className="partners-neo-hero">
        <div className="partners-hero-content">
          <p>{texts.heroDescription}</p>

          <div className="partners-hero-actions">
            <a href="#partners-grid" className="partners-secondary-btn">
              {texts.heroAction}
            </a>
          </div>
        </div>

        <div className="partners-hero-stat">
          <div>
            <strong>{partners.length}</strong>
            <span>{texts.partnersStat}</span>
          </div>

          <div>
            <strong>Korea</strong>
            <span>{texts.secondaryStat}</span>
          </div>
        </div>
      </section>

      <section className="partners-content">
        <div className="partners-title-row">
          <div>
            <span>{texts.listEyebrow}</span>
            <h2>{texts.listTitle}</h2>
          </div>

          <p>{texts.listDescription}</p>
        </div>

        <div className="partners-new-grid" id="partners-grid">
          {partners.map((partner, index) => (
            <article
              className="partner-new-card"
              key={partner.id}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="partner-logo-box">
                <img
                  src={partner.image}
                  alt={getTranslatedField(partner, 'title', partner.title)}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="partner-card-body">
                <span>{texts.partnerBadge}</span>
                <h3>{getTranslatedField(partner, 'title', partner.title)}</h3>
                <p>{partner.link}</p>

                <a href={partner.link} target="_blank" rel="noreferrer">
                  {texts.officialSite} →
                </a>
              </div>
            </article>
          ))}
        </div>

        <section className="partners-format-section">
          <div className="partners-format-left">
            <span>{texts.formatsEyebrow}</span>
            <h2>{texts.formatsTitle}</h2>
            <p>{texts.formatsDescription}</p>
          </div>

          <div className="partners-format-grid">
            {texts.collaborationAreas.map((area, index) => (
              <div
                className="partners-format-card"
                key={area}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <strong>0{index + 1}</strong>
                <p>{area}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default PartnersPage;
