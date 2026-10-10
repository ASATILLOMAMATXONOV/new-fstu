const LOCAL_API_URLS = ['http://localhost:8564', 'http://localhost:4000', 'http://localhost:3010'];
const CUSTOM_DOMAIN_API_URL = 'https://api.new.fstu.uz';
const AUTH_TOKEN_KEY = 'serviceToken';
const AUTH_USER_KEY = 'serviceUser';
const API_CACHE_KEY = 'fstu_admin_api_cache_v1';
const DEFAULT_GET_CACHE_TTL_MS = 45 * 1000;
const LONG_GET_CACHE_TTL_MS = 5 * 60 * 1000;
const responseCache = new Map();
const pendingRequests = new Map();
let persistedCacheLoaded = false;

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

function resolveDefaultFallbackApiUrls() {
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

function resolveApiBaseUrls() {
  const configuredUrls = parseApiUrls(import.meta.env.VITE_APP_API_URL);

  if (!configuredUrls.length) {
    return dedupeUrls(resolveDefaultFallbackApiUrls());
  }

  if (configuredUrls.some((url) => url.includes('mock-data-api-nextjs.vercel.app'))) {
    return dedupeUrls(resolveDefaultFallbackApiUrls());
  }

  if (configuredUrls.some(isLocalApiUrl)) {
    return dedupeUrls([...configuredUrls, ...resolveDefaultFallbackApiUrls()]);
  }

  return configuredUrls;
}

const API_BASE_URL_CANDIDATES = dedupeUrls(resolveApiBaseUrls());
const DEFAULT_API_URL = API_BASE_URL_CANDIDATES[0] || LOCAL_API_URLS[0];

function buildUrl(path, baseUrl = DEFAULT_API_URL) {
  const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_USER_KEY);
  responseCache.clear();
  pendingRequests.clear();
  window.sessionStorage.removeItem(API_CACHE_KEY);
}

function getAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY) ||
    window.sessionStorage.getItem(AUTH_TOKEN_KEY) ||
    ''
  );
}

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function ensurePersistedCacheLoaded() {
  if (persistedCacheLoaded || !canUseSessionStorage()) {
    return;
  }

  persistedCacheLoaded = true;

  try {
    const raw = window.sessionStorage.getItem(API_CACHE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      window.sessionStorage.removeItem(API_CACHE_KEY);
      return;
    }

    parsed.forEach((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2) {
        return;
      }

      const [cacheKey, value] = entry;

      if (
        typeof cacheKey === 'string' &&
        value &&
        typeof value === 'object' &&
        Number.isFinite(value.expiresAt)
      ) {
        responseCache.set(cacheKey, value);
      }
    });
  } catch (_error) {
    try {
      window.sessionStorage.removeItem(API_CACHE_KEY);
    } catch (_storageError) {
      // ignore
    }
  }
}

function persistCacheSnapshot() {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    const serializableEntries = Array.from(responseCache.entries())
      .filter(([, value]) => value?.expiresAt > Date.now())
      .sort((left, right) => Number(right[1]?.updatedAt || 0) - Number(left[1]?.updatedAt || 0))
      .slice(0, 40);

    window.sessionStorage.setItem(API_CACHE_KEY, JSON.stringify(serializableEntries));
  } catch (_error) {
    try {
      window.sessionStorage.removeItem(API_CACHE_KEY);
    } catch (_storageError) {
      // ignore
    }
  }
}

function getCacheTtl(path = '') {
  if (path.startsWith('/api/settings/')) {
    return LONG_GET_CACHE_TTL_MS;
  }

  if (path.includes('/tree') || path.includes('faculty-page-menus') || path.includes('academic-menus')) {
    return LONG_GET_CACHE_TTL_MS;
  }

  return DEFAULT_GET_CACHE_TTL_MS;
}

function readCachedResponse(cacheKey) {
  ensurePersistedCacheLoaded();
  const cached = responseCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey);
    persistCacheSnapshot();
    return null;
  }

  return cached.data;
}

function writeCachedResponse(cacheKey, data, ttlMs) {
  responseCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
    updatedAt: Date.now()
  });
  persistCacheSnapshot();
  return data;
}

function clearApiCache() {
  responseCache.clear();
  pendingRequests.clear();

  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(API_CACHE_KEY);
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function buildErrorMessage(status, data) {
  if (data && typeof data === 'object' && typeof data.message === 'string') {
    return data.message;
  }

  return `Request failed: ${status}`;
}

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, signal } = options;
  const token = getAuthToken();
  const normalizedMethod = String(method || 'GET').toUpperCase();
  const requestHeaders = {
    ...headers
  };

  if (token && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const cacheKey = `${normalizedMethod}:${path}`;
  const canUseCache =
    normalizedMethod === 'GET' &&
    !path.startsWith('/api/account/') &&
    options.useCache !== false;

  if (canUseCache) {
    const cached = readCachedResponse(cacheKey);

    if (cached) {
      return cached;
    }

    const pending = pendingRequests.get(cacheKey);

    if (pending) {
      return pending;
    }
  } else if (normalizedMethod !== 'GET') {
    clearApiCache();
  }

  try {
    const errors = [];
    const requestPromise = (async () => {
      for (const baseUrl of API_BASE_URL_CANDIDATES) {
        try {
          const response = await fetch(buildUrl(path, baseUrl), {
            method: normalizedMethod,
            cache: 'no-store',
            headers: requestHeaders,
            body:
              body === undefined
                ? undefined
                : body instanceof FormData
                  ? body
                  : JSON.stringify(body),
            signal
          });

          const data = await parseResponse(response);

          if (!response.ok) {
            const error = new Error(buildErrorMessage(response.status, data));
            error.status = response.status;
            error.data = data;

            if (
              response.status === 401 &&
              typeof window !== 'undefined' &&
              !window.location.href.includes('/login')
            ) {
              clearStoredAuth();
              window.location.assign('/login');
            }

            throw error;
          }

          const result = { data, status: response.status, headers: response.headers };
          return canUseCache ? writeCachedResponse(cacheKey, result, getCacheTtl(path)) : result;
        } catch (error) {
          if (error?.status) {
            throw error;
          }

          errors.push(error);
        }
      }

      const networkError = new Error('Backend server bilan aloqa yo‘q.');
      networkError.code = 'ERR_NETWORK';
      networkError.cause = errors[errors.length - 1];
      throw networkError;
    })();

    if (canUseCache) {
      pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      return await requestPromise;
    } finally {
      if (canUseCache) {
        pendingRequests.delete(cacheKey);
      }
    }
  } catch (error) {
    if (error.status) {
      throw error;
    }

    const networkError = new Error('Backend server bilan aloqa yo‘q.');
    networkError.code = 'ERR_NETWORK';
    networkError.cause = error;
    throw networkError;
  }
}

export async function apiGet(path, options) {
  return request(path, { ...options, method: 'GET' });
}

export async function apiPost(path, body, options) {
  return request(path, { ...options, method: 'POST', body });
}

export async function apiPut(path, body, options) {
  return request(path, { ...options, method: 'PUT', body });
}

export async function apiDelete(path, options) {
  return request(path, { ...options, method: 'DELETE' });
}

export async function fetcher(args) {
  const [url, config] = Array.isArray(args) ? args : [args];
  const response = await apiGet(url, config);
  return response.data;
}

export { clearStoredAuth, resolveApiBaseUrls, AUTH_TOKEN_KEY, AUTH_USER_KEY };
