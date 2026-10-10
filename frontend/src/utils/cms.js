import { getCurrentLanguageCode, getIntlLocaleForLanguage } from './language';

export function formatCmsDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(getIntlLocaleForLanguage(getCurrentLanguageCode()), {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function htmlToPlainText(html = '') {
  const source = String(html || '');

  if (typeof document !== 'undefined') {
    const decode = (value) => {
      const container = document.createElement('div');
      container.innerHTML = value;

      return String(container.textContent || container.innerText || '');
    };

    const decoded = decode(decode(source));

    return decoded.replace(/<[^>]+>/g, ' ').replace(/\u00a0/g, ' ');
  }

  return source
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<[^>]+>/g, ' ');
}

export function stripHtml(html = '') {
  return htmlToPlainText(html).replace(/\s+/g, ' ').trim();
}

export function getHtmlExcerpt(html = '', maxLength = 220) {
  const text = stripHtml(html);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function sanitizeUrlValue(value = '') {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return '';
  }

  if (
    normalized.startsWith('/') ||
    normalized.startsWith('./') ||
    normalized.startsWith('../') ||
    normalized.startsWith('#') ||
    normalized.startsWith('?')
  ) {
    return normalized;
  }

  if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(normalized)) {
    return normalized;
  }

  if (/^(javascript|vbscript|data:text\/html|data:application\/javascript)/i.test(normalized)) {
    return '';
  }

  if (/^(https?:|mailto:|tel:)/i.test(normalized)) {
    return normalized;
  }

  return normalized;
}

function normalizeFileLinkValue(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function decodeFileNameFromHref(value = '') {
  const source = String(value || '').trim();

  if (!source) {
    return '';
  }

  const cleanValue = source.split('#')[0].split('?')[0];
  const fileName = cleanValue.split('/').pop() || '';

  if (!fileName) {
    return '';
  }

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

function markInlineFileLinks(root) {
  root.querySelectorAll('a').forEach((anchor) => {
    if (anchor.classList.contains('attached-files-item')) {
      return;
    }

    const isFileLink =
      anchor.classList.contains('content-file-link') || anchor.hasAttribute('download');

    if (!isFileLink) {
      anchor.classList.remove('content-file-link--file-name');
      return;
    }

    const label = normalizeFileLinkValue(anchor.textContent || '');

    if (!label) {
      anchor.classList.remove('content-file-link--file-name');
      return;
    }

    const candidates = [
      anchor.getAttribute('data-file-name'),
      anchor.getAttribute('download'),
      anchor.getAttribute('title'),
      decodeFileNameFromHref(anchor.getAttribute('href'))
    ]
      .map((value) => normalizeFileLinkValue(value))
      .filter(Boolean);

    if (candidates.includes(label)) {
      anchor.classList.add('content-file-link--file-name');
      return;
    }

    anchor.classList.remove('content-file-link--file-name');
  });
}

export function sanitizeHtml(html = '') {
  const source = String(html || '');

  if (!source) {
    return '';
  }

  if (typeof document !== 'undefined') {
    const template = document.createElement('template');
    template.innerHTML = source;

    template.content
      .querySelectorAll('script, style, iframe, object, embed, link, meta, base, form')
      .forEach((node) => node.remove());

    template.content.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value;

        if (name.startsWith('on') || name === 'srcdoc') {
          element.removeAttribute(attribute.name);
          return;
        }

        if (['href', 'src', 'xlink:href', 'action', 'formaction', 'poster'].includes(name)) {
          const safeValue = sanitizeUrlValue(value);

          if (!safeValue) {
            element.removeAttribute(attribute.name);
            return;
          }

          if (safeValue !== value) {
            element.setAttribute(attribute.name, safeValue);
          }
        }
      });
    });

    markInlineFileLinks(template.content);

    return template.innerHTML;
  }

  return source
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z-]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|xlink:href|action|formaction|poster)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '')
    .replace(/\s+srcdoc\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '');
}

export function createSafeMarkup(html = '', fallback = '') {
  return {
    __html: sanitizeHtml(html || fallback)
  };
}

export function getTranslatedField(item, field, fallback = '') {
  const languageCode = getCurrentLanguageCode();

  return (
    item?.[languageCode]?.[field] ||
    item?.translations?.[languageCode]?.[field] ||
    item?.uz?.[field] ||
    item?.translations?.uz?.[field] ||
    item?.en?.[field] ||
    item?.translations?.en?.[field] ||
    item?.ru?.[field] ||
    item?.translations?.ru?.[field] ||
    fallback
  );
}

export function getLocalizedValue(value = {}, fallback = '') {
  const languageCode = getCurrentLanguageCode();

  return (
    value?.[languageCode] ||
    value?.uz ||
    value?.en ||
    value?.ru ||
    fallback
  );
}

export function normalizeLocalizedMap(value = {}) {
  return {
    uz: value?.uz || '',
    ru: value?.ru || '',
    en: value?.en || '',
  };
}

function getContentCreatedTimestamp(item = {}) {
  const createdTimestamp = new Date(item?.createdAt || item?.updatedAt || 0).getTime();

  if (Number.isFinite(createdTimestamp) && createdTimestamp > 0) {
    return createdTimestamp;
  }

  const numericId = Number(item?.id || item?._id || 0);
  return Number.isFinite(numericId) ? numericId : 0;
}

export function sortContentByNewest(items = []) {
  return [...items].sort((left, right) => {
    const timestampDifference =
      getContentCreatedTimestamp(right) - getContentCreatedTimestamp(left);

    if (timestampDifference !== 0) {
      return timestampDifference;
    }

    const rightId = Number(right?.id || right?._id || 0);
    const leftId = Number(left?.id || left?._id || 0);

    if (Number.isFinite(rightId) && Number.isFinite(leftId)) {
      return rightId - leftId;
    }

    return 0;
  });
}

export function normalizeRectorSpeechData(item = {}) {
  return {
    active: item.active ?? true,
    image: item.image || '',
    rectorName: normalizeLocalizedMap(item.rectorName),
    position: normalizeLocalizedMap(item.position),
    title: normalizeLocalizedMap(item.title),
    content: normalizeLocalizedMap(item.content)
  };
}
