import React from 'react';

import AppLink from '../components/common/AppLink';
import '../assets/styles/AdmissionPage.css';
import { useLanguage } from '../context/LanguageContext';
import { useSetting } from '../hooks/useSetting';
import { getSiteMessages } from '../locales/site';
import { isAdmissionPageUrl, normalizeAdmissionUrl } from '../utils/admission';
import { createSafeMarkup, getLocalizedValue } from '../utils/cms';

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAdmissionHtml(value, fallback) {
  const source = String(value || '').trim();

  if (!source) {
    return `<p>${escapeHtml(fallback)}</p>`;
  }

  if (/<[a-z][\s\S]*>/i.test(source)) {
    return source;
  }

  return source
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function AdmissionPage() {
  const { currentLanguageCode } = useLanguage();
  const texts = React.useMemo(
    () => getSiteMessages(currentLanguageCode).pages.admissionPage,
    [currentLanguageCode]
  );
  const { item } = useSetting('admission-cta');

  const title = getLocalizedValue(item?.title, texts.title);
  const content = getLocalizedValue(item?.content, texts.emptyContent);
  const buttonText = getLocalizedValue(item?.buttonText, texts.action);
  const buttonUrl = normalizeAdmissionUrl(item?.buttonUrl);
  const showAction = !isAdmissionPageUrl(buttonUrl);

  return (
    <main className="admission-page">
      <div className="admission-page-shell">
        <section className="admission-page-card">
          <header className="admission-page-head">
            <span className="admission-page-label">{texts.label}</span>
            <h1>{title}</h1>
            <p>{texts.description}</p>
          </header>

          <div
            className="admission-page-body"
            dangerouslySetInnerHTML={createSafeMarkup(
              formatAdmissionHtml(content, texts.emptyContent)
            )}
          />

          {showAction ? (
            <div className="admission-page-actions">
              <AppLink href={buttonUrl} className="admission-page-btn">
                <span>{buttonText}</span>
              </AppLink>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default AdmissionPage;
