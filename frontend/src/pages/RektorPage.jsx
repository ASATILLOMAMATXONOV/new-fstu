import React from 'react';

import '../assets/styles/RektorPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useSetting } from '../hooks/useSetting';
import { createSafeMarkup, getHtmlExcerpt, getLocalizedValue, normalizeRectorSpeechData } from '../utils/cms';
import { getSiteMessages } from '../locales/site';

import rectorImg from '../assets/optimized/rectok.jpg';

function RektorPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).home.rector,
    [currentLanguageCode]
  );
  const { item } = useSetting('rector-speech');

  if (!item) {
    return (
      <main className="rector-page">
        <section className="rector-content">
          <div className="rector-main-text">
            <h2>{texts.defaultTitle}</h2>
            <p>{texts.defaultExcerpt}</p>
          </div>
        </section>
      </main>
    );
  }

  const data = normalizeRectorSpeechData(item);

  if (!data.active) {
    return (
      <main className="rector-page">
        <section className="rector-content">
          <div className="rector-main-text">
            <h2>{texts.defaultTitle}</h2>
            <p>{texts.defaultExcerpt}</p>
          </div>
        </section>
      </main>
    );
  }

  const excerpt = getHtmlExcerpt(getLocalizedValue(data.content), 320);

  return (
    <main className="rector-page">
      <section className="rector-hero-animated">
        <div className="rector-circle circle-1" />
        <div className="rector-circle circle-2" />

        <div className="rector-text-block">
          <span>{texts.miniTitle}</span>
          <h1>{getLocalizedValue(data.title, texts.defaultTitle)}</h1>
          <p>{excerpt || texts.defaultExcerpt}</p>
        </div>

        <div className="rector-photo-block">
          <img src={data.image || rectorImg} alt={texts.defaultName} />

          <div className="rector-name-card">
            <h2>{getLocalizedValue(data.rectorName, texts.defaultName)}</h2>
            <p>{getLocalizedValue(data.position)}</p>
          </div>
        </div>
      </section>

      <section className="rector-content">
        <div className="rector-main-text">
          <h2>{getLocalizedValue(data.title, texts.defaultTitle)}</h2>

          <div
            dangerouslySetInnerHTML={createSafeMarkup(
              getLocalizedValue(data.content),
              `<p>${texts.defaultExcerpt}</p>`
            )}
          />
        </div>
      </section>
    </main>
  );
}

export default RektorPage;
