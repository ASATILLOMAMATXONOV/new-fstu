const LOCAL_API_URLS = ['http://localhost:8564', 'http://localhost:4000', 'http://localhost:3010'];
const CUSTOM_DOMAIN_API_URL = 'https://api.new.fstu.uz';

function dedupeUrls(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function parseApiUrls(value = '') {
  return String(value || '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function isLocalApiUrl(url = '') {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(url || '').trim());
}

function resolveDefaultApiUrls() {
  if (typeof window === 'undefined') {
    return LOCAL_API_URLS;
  }

  const hostname = String(window.location.hostname || '').toLowerCase();

  if (
    ['new.fstu.uz', 'www.new.fstu.uz', 'admin.new.fstu.uz', 'api.new.fstu.uz'].includes(hostname)
  ) {
    return [CUSTOM_DOMAIN_API_URL];
  }

  return LOCAL_API_URLS;
}

const configuredApiUrls = parseApiUrls(process.env.REACT_APP_API_URL);

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

export const API_BASE_URL_CANDIDATES = dedupeUrls(
  configuredApiUrls.length
    ? configuredApiUrls.some(isLocalApiUrl)
      ? [...configuredApiUrls, ...resolveDefaultApiUrls()]
      : configuredApiUrls
    : resolveDefaultApiUrls()
);

export const API_BASE_URL = API_BASE_URL_CANDIDATES[0] || LOCAL_API_URLS[0];

export const API_ENDPOINTS = Object.freeze({
  contentRevision: () => '/api/content/__revision',
  contentList: (resource, query = {}) =>
    `/api/content/${resource}?${buildQueryString({
      activeOnly: true,
      imageMode: 'separate',
      summaryOnly: true,
      ...query
    })}`,
  contentTree: (resource, query = {}) =>
    `/api/content/${resource}/tree?${buildQueryString({ activeOnly: true, ...query })}`,
  contentItem: (resource, id, query = {}) =>
    `/api/content/${resource}/${id}?${buildQueryString({
      imageMode: 'separate',
      ...query
    })}`,
  setting: (key) => `/api/settings/${key}`
});

export function buildApiUrl(path = '', baseUrl = API_BASE_URL) {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export const API_CONFIG = Object.freeze({
  baseUrl: API_BASE_URL,
  endpoints: API_ENDPOINTS
});
