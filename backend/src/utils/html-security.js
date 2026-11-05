import cleanHtml from 'sanitize-html';

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

  if (/[\u0000-\u0020\u007f\\]/.test(normalized) || normalized.startsWith('//')) return '';

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

  if (/^(https?:|mailto:|tel:)/i.test(normalized)) {
    return normalized;
  }
  // Relative file/page names are allowed; unrecognized URL schemes are rejected.
  return /^[^:/?#]+:/.test(normalized) ? '' : normalized;
}

export function sanitizeHtml(value = '') {
  return cleanHtml(String(value || ''), {
    allowedTags: [...cleanHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      '*': ['class', 'style'],
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      table: ['border', 'cellpadding', 'cellspacing'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'], col: ['span']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowProtocolRelative: false,
    allowedStyles: { '*': {
      'text-align': [/^(?:left|right|center|justify|start|end)$/],
      'font-size': [/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/],
      'font-weight': [/^(?:normal|bold|[1-9]00)$/],
      'font-style': [/^(?:normal|italic)$/],
      'text-decoration': [/^(?:none|underline|line-through)$/],
      'color': [/^#[a-f0-9]{3,8}$/i, /^[a-z]+$/i, /^rgba?\([\d\s,.%]+\)$/],
      'background-color': [/^#[a-f0-9]{3,8}$/i, /^[a-z]+$/i, /^rgba?\([\d\s,.%]+\)$/],
      'width': [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/],
      'height': [/^\d+(?:\.\d+)?(?:px|em|rem|%)$/]
    } },
    transformTags: {
      a: (_tag, attrs) => ({ tagName: 'a', attribs: { ...attrs, href: sanitizeUrl(attrs.href),
        ...(attrs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}) } }),
      img: (_tag, attrs) => ({ tagName: 'img', attribs: { ...attrs, src: sanitizeUrl(attrs.src, { allowDataImage: true }) } })
    }
  });
}

export function sanitizeStructuredContent(value, key = '') {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeStructuredContent(item, key));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      if (['__proto__', 'constructor', 'prototype'].includes(entryKey)) return accumulator;
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
