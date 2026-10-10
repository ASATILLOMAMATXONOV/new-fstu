const HTML_FIELD_NAMES = new Set([
  'content',
  'description',
  'body',
  'text',
  'about',
  'message',
  'intro',
  'subtitle',
  'excerpt',
  'summary'
]);

const URL_FIELD_NAMES = new Set([
  'url',
  'href',
  'link',
  'buttonurl',
  'primarybuttonlink',
  'secondarybuttonlink',
  'telegram',
  'instagram',
  'facebook',
  'youtube',
  'website',
  'sourceurl',
  'image',
  'imageurl',
  'logo'
]);

const SAFE_DATA_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i;

function normalizeKey(key = '') {
  return String(key || '').trim().toLowerCase();
}

export function stripHtmlToPlainText(value = '') {
  return String(value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value = '', maxLength = 320) {
  const text = String(value || '').trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function sanitizeUrl(value = '', { allowDataImage = false } = {}) {
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

  if (allowDataImage && SAFE_DATA_IMAGE_PATTERN.test(normalized)) {
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

export function sanitizeHtml(value = '') {
  return String(value || '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z-]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|xlink:href|action|formaction|poster)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '')
    .replace(/\s+srcdoc\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '');
}

export function sanitizeStructuredContent(value, key = '') {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeStructuredContent(item, key));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      accumulator[entryKey] = sanitizeStructuredContent(entryValue, entryKey);
      return accumulator;
    }, {});
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalizedKey = normalizeKey(key);

  if (URL_FIELD_NAMES.has(normalizedKey)) {
    return sanitizeUrl(value, {
      allowDataImage: normalizedKey === 'image' || normalizedKey === 'imageurl' || normalizedKey === 'logo'
    });
  }

  if (HTML_FIELD_NAMES.has(normalizedKey) || /<\s*[a-z!/][^>]*>/i.test(value)) {
    return sanitizeHtml(value);
  }

  return value;
}

export function summarizeStructuredContent(value, key = '') {
  if (Array.isArray(value)) {
    return value.map((item) => summarizeStructuredContent(item, key));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      accumulator[entryKey] = summarizeStructuredContent(entryValue, entryKey);
      return accumulator;
    }, {});
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalizedKey = normalizeKey(key);

  if (HTML_FIELD_NAMES.has(normalizedKey) || /<\s*[a-z!/][^>]*>/i.test(value)) {
    return truncateText(stripHtmlToPlainText(value));
  }

  return value;
}
