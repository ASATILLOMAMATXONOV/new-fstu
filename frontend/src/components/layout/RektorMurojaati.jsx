import React from 'react';

import '../../assets/styles/RektorMurojaati.css';
import AppLink from '../common/AppLink';
import { useLanguage } from '../../context/LanguageContext';
import { useSetting } from '../../hooks/useSetting';
import { getHtmlExcerpt, getLocalizedValue, normalizeRectorSpeechData } from '../../utils/cms';
import { getSiteMessages } from '../../locales/site';

import rektorImg from '../../assets/optimized/rectok.jpg';

const RektorMurojaati = () => {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.rector,
    [currentLanguageCode]
  );
  const { item } = useSetting('rector-speech', {
    revalidate: true
  });

  if (!item) {
    return null;
  }

  const data = normalizeRectorSpeechData(item);

  if (!data.active) {
    return null;
  }

  const excerpt = getHtmlExcerpt(getLocalizedValue(data.content), 220);

  return (
    <section className="rektor-fullscreen">
      <div className="rektor-bg-shape shape-one" />
      <div className="rektor-bg-shape shape-two" />

      <div className="rektor-layout">
        <div className="rektor-text">
          <span className="rektor-mini-title">{texts.miniTitle}</span>
          <h1>{getLocalizedValue(data.title, texts.defaultTitle)}</h1>
          <p>{excerpt || texts.defaultExcerpt}</p>

          <AppLink href="/rektor" className="rektor-cta">
            {texts.cta}
          </AppLink>
        </div>

        <div className="rektor-visual">
          <div className="rektor-photo-card">
            <img
              src={data.image || rektorImg}
              alt={texts.alt}
              className="rektor-photo-img"
            />

            <div className="rektor-name">
              <h2>{getLocalizedValue(data.rectorName, texts.defaultName)}</h2>
              <p>{getLocalizedValue(data.position)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RektorMurojaati;
