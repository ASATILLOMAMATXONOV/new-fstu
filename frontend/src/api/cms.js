import { API_BASE_URL, API_BASE_URL_CANDIDATES, API_ENDPOINTS, buildApiUrl } from '../config/api';

const responseCache = new Map();
const pendingRequests = new Map();
const PERSISTED_CACHE_STORAGE_KEY = 'fstu_frontend_api_cache_v1';
const REVISION_STORAGE_KEY = 'fstu_frontend_content_revision_v1';
const MAX_PERSISTED_CACHE_ENTRIES = 40;
const MAX_PERSISTED_ENTRY_BYTES = 512 * 1024;
const REVISION_POLL_INTERVAL_MS = 3000;
let persistedCacheLoaded = false;
let currentRevisionSignature = '';
let revisionPollTimer = null;
let pendingRevisionRequest = null;
const revisionListeners = new Set();

const DEFAULT_CACHE_TTL_MS = 60 * 1000;
const LONG_CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheTtl(path = '') {
  if (path.startsWith('/api/settings/')) {
    return LONG_CACHE_TTL_MS;
  }

  if (path.includes('/tree?') || path.includes('faculty-page-menus') || path.includes('academic-menus')) {
    return LONG_CACHE_TTL_MS;
  }

  return DEFAULT_CACHE_TTL_MS;
}

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function ensurePersistedCacheLoaded() {
  if (persistedCacheLoaded || !canUseSessionStorage()) {
    return;
  }

  persistedCacheLoaded = true;

  try {
    const raw = window.sessionStorage.getItem(PERSISTED_CACHE_STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      window.sessionStorage.removeItem(PERSISTED_CACHE_STORAGE_KEY);
      return;
    }

    parsed.forEach((entry) => {
      if (!Array.isArray(entry) || entry.length !== 2) {
        return;
      }

      const [path, value] = entry;

      if (
        typeof path === 'string' &&
        value &&
        typeof value === 'object' &&
        Number.isFinite(value.expiresAt)
      ) {
        responseCache.set(path, value);
      }
    });
  } catch (_error) {
    try {
      window.sessionStorage.removeItem(PERSISTED_CACHE_STORAGE_KEY);
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
      .filter(([, value]) => value?.persist !== false && value.expiresAt > Date.now())
      .sort((left, right) => Number(right[1]?.updatedAt || 0) - Number(left[1]?.updatedAt || 0))
      .slice(0, MAX_PERSISTED_CACHE_ENTRIES);

    window.sessionStorage.setItem(PERSISTED_CACHE_STORAGE_KEY, JSON.stringify(serializableEntries));
  } catch (_error) {
    try {
      window.sessionStorage.removeItem(PERSISTED_CACHE_STORAGE_KEY);
    } catch (_storageError) {
      // ignore
    }
  }
}

function readStoredRevisionSignature() {
  if (!canUseSessionStorage()) {
    return '';
  }

  try {
    return String(window.sessionStorage.getItem(REVISION_STORAGE_KEY) || '');
  } catch (_error) {
    return '';
  }
}

function writeStoredRevisionSignature(signature = '') {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    if (signature) {
      window.sessionStorage.setItem(REVISION_STORAGE_KEY, signature);
      return;
    }

    window.sessionStorage.removeItem(REVISION_STORAGE_KEY);
  } catch (_error) {
    // ignore
  }
}

function getResponseCacheTtl(path = '', response) {
  const cacheControl = response?.headers?.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 0;

  if (Number.isFinite(maxAgeSeconds) && maxAgeSeconds > 0) {
    return maxAgeSeconds * 1000;
  }

  return getCacheTtl(path);
}

function readCachedResponse(path) {
  ensurePersistedCacheLoaded();
  const cached = responseCache.get(path);

  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(path);
    persistCacheSnapshot();
    return undefined;
  }

  return cached.data;
}

export function clearCmsCache() {
  responseCache.clear();
  pendingRequests.clear();
  persistedCacheLoaded = false;

  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(PERSISTED_CACHE_STORAGE_KEY);
  } catch (_error) {
    // ignore
  }
}

function writeCachedResponse(path, data, ttlMs = getCacheTtl(path)) {
  const shouldPersist = (() => {
    try {
      return JSON.stringify(data).length <= MAX_PERSISTED_ENTRY_BYTES;
    } catch (_error) {
      return false;
    }
  })();

  responseCache.set(path, {
    data,
    expiresAt: Date.now() + ttlMs,
    updatedAt: Date.now(),
    persist: shouldPersist
  });

  persistCacheSnapshot();

  return data;
}

function buildRevisionSignature(value = {}) {
  return `${Number(value?.revision || 0)}:${String(value?.updatedAt || '')}`;
}

function normalizeMediaUrl(value, baseUrl) {
  if (typeof value !== 'string' || !value.startsWith('/api/')) {
    return value;
  }

  return buildApiUrl(value, baseUrl);
}

function normalizeCmsPayload(value, baseUrl) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeCmsPayload(item, baseUrl));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((accumulator, [key, itemValue]) => {
    if ((key === 'image' || key === 'imageUrl') && typeof itemValue === 'string') {
      accumulator[key] = normalizeMediaUrl(itemValue, baseUrl);
      return accumulator;
    }

    accumulator[key] = normalizeCmsPayload(itemValue, baseUrl);
    return accumulator;
  }, {});
}

export function getCachedContentList(resource, query = {}) {
  const data = readCachedResponse(API_ENDPOINTS.contentList(resource, query));
  return data?.items || null;
}

export function isCmsContentLoading() {
  return pendingRequests.size > 0;
}

export function getCachedContentTree(resource, query = {}) {
  const data = readCachedResponse(API_ENDPOINTS.contentTree(resource, query));
  return data?.items || null;
}

export function getCachedContentItem(resource, id) {
  if (!id) {
    return null;
  }

  const data = readCachedResponse(API_ENDPOINTS.contentItem(resource, id));
  return data?.item || null;
}

export function getCachedSetting(key) {
  if (!key) {
    return null;
  }

  const data = readCachedResponse(API_ENDPOINTS.setting(key));
  return data?.item || null;
}

async function request(path, options = {}) {
  const force = options?.force === true;
  const pendingKey = `${force ? 'force' : 'default'}:${path}`;

  if (!force) {
    const cached = readCachedResponse(path);

    if (cached !== undefined) {
      return cached;
    }
  }

  const pending = pendingRequests.get(pendingKey);

  if (pending) {
    return pending;
  }

  const requestPromise = (async () => {
    const errors = [];

    for (const baseUrl of API_BASE_URL_CANDIDATES) {
      try {
        const response = await fetch(buildApiUrl(path, baseUrl), {
          cache: 'no-store'
        });

        if (!response.ok) {
          const error = new Error(`Request failed: ${response.status}`);
          error.status = response.status;
          throw error;
        }

        const data = normalizeCmsPayload(await response.json(), baseUrl);
        return writeCachedResponse(path, data, getResponseCacheTtl(path, response));
      } catch (error) {
        if (error?.status) {
          throw error;
        }

        errors.push(error);
      }
    }

    const networkError = new Error('Backend server bilan aloqa yo‘q.');
    networkError.cause = errors[errors.length - 1];
    throw networkError;
  })();

  pendingRequests.set(pendingKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    pendingRequests.delete(pendingKey);
  }
}

async function requestContentRevision() {
  const errors = [];

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.contentRevision(), baseUrl), {
        cache: 'no-store'
      });

      if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error?.status) {
        throw error;
      }

      errors.push(error);
    }
  }

  const networkError = new Error('Backend server bilan aloqa yo‘q.');
  networkError.cause = errors[errors.length - 1];
  throw networkError;
}

async function pollContentRevision() {
  if (!canUseDom()) {
    return null;
  }

  if (pendingRevisionRequest) {
    return pendingRevisionRequest;
  }

  pendingRevisionRequest = (async () => {
    try {
      const revision = await requestContentRevision();
      const nextSignature = buildRevisionSignature(revision);
      const previousSignature = currentRevisionSignature || readStoredRevisionSignature();

      currentRevisionSignature = nextSignature;
      writeStoredRevisionSignature(nextSignature);

      if (previousSignature && previousSignature !== nextSignature) {
        clearCmsCache();
        revisionListeners.forEach((listener) => listener(revision));
      }

      return revision;
    } catch (error) {
      console.error('Failed to refresh content revision:', error);
      return null;
    } finally {
      pendingRevisionRequest = null;
    }
  })();

  return pendingRevisionRequest;
}

function handleRevisionVisibilityChange() {
  if (document.visibilityState === 'visible') {
    void pollContentRevision();
  }
}

function startRevisionPolling() {
  if (!canUseDom() || revisionPollTimer || !revisionListeners.size) {
    return;
  }

  window.addEventListener('focus', handleRevisionVisibilityChange);
  document.addEventListener('visibilitychange', handleRevisionVisibilityChange);

  revisionPollTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      void pollContentRevision();
    }
  }, REVISION_POLL_INTERVAL_MS);

  void pollContentRevision();
}

function stopRevisionPolling() {
  if (!canUseDom() || revisionListeners.size || !revisionPollTimer) {
    return;
  }

  window.clearInterval(revisionPollTimer);
  revisionPollTimer = null;
  window.removeEventListener('focus', handleRevisionVisibilityChange);
  document.removeEventListener('visibilitychange', handleRevisionVisibilityChange);
}

export function subscribeToCmsChanges(listener) {
  if (typeof listener !== 'function' || !canUseDom()) {
    return () => {};
  }

  revisionListeners.add(listener);
  startRevisionPolling();

  return () => {
    revisionListeners.delete(listener);
    stopRevisionPolling();
  };
}

export async function fetchContentList(resource, query = {}, options = {}) {
  const data = await request(API_ENDPOINTS.contentList(resource, query), options);
  return data.items || [];
}

export async function fetchContentTree(resource, query = {}, options = {}) {
  const data = await request(API_ENDPOINTS.contentTree(resource, query), options);
  return data.items || [];
}

export async function fetchContentItem(resource, id, options = {}) {
  const data = await request(API_ENDPOINTS.contentItem(resource, id), options);
  return data.item || null;
}

export async function fetchSetting(key, options = {}) {
  try {
    const data = await request(API_ENDPOINTS.setting(key), options);
    return data.item || null;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
}

export { API_BASE_URL };
