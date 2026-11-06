import { API_BASE_URL, API_BASE_URL_CANDIDATES, API_ENDPOINTS, buildApiUrl } from '../config/api';

const responseCache = new Map();
const pendingRequests = new Map();
const PERSISTED_CACHE_STORAGE_KEY = 'fstu_frontend_api_cache_v1';
const REVISION_STORAGE_KEY = 'fstu_frontend_content_revision_v1';
const MAX_PERSISTED_CACHE_ENTRIES = 40;
const MAX_PERSISTED_ENTRY_BYTES = 512 * 1024;
const REVISION_POLL_INTERVAL_MS = 30000;
const MAX_PERSISTED_CACHE_BYTES = 1024 * 1024;
let cachePersistTimer = null;
let persistedCacheLoaded = false;
let currentRevisionSignature = '';
let revisionPollTimer = null;
let pendingRevisionRequest = null;
let revisionStream = null;
let lastRevisionCheckAt = 0;
let revisionStopTimer = null;
// Sahifa almashganda komponentlar unmount/mount bo'ladi: kuzatuvni darhol to'xtatib
// qayta boshlash har safar yangi __revision so'rovi va SSE ulanishini ochadi.
const REVISION_STOP_GRACE_MS = 15000;
const REVISION_MIN_CHECK_GAP_MS = 5000;
let cacheGeneration = 0;
const revisionListeners = new Set();

const DEFAULT_CACHE_TTL_MS = 3 * 60 * 1000;
const LONG_CACHE_TTL_MS = 10 * 60 * 1000;

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
  try {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  } catch (_error) {
    return false;
  }
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
        Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()
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

    const entries = [];
    let bytes = 2;
    for (const entry of serializableEntries) {
      const serialized = JSON.stringify(entry);
      const entryBytes = serialized.length * 2 + 2;
      if (bytes + entryBytes > MAX_PERSISTED_CACHE_BYTES) continue;
      entries.push(serialized);
      bytes += entryBytes;
    }
    window.sessionStorage.setItem(PERSISTED_CACHE_STORAGE_KEY, `[${entries.join(',')}]`);
  } catch (_error) {
    try {
      window.sessionStorage.removeItem(PERSISTED_CACHE_STORAGE_KEY);
    } catch (_storageError) {
      // ignore
    }
  }
}

function scheduleCachePersist() {
  if (!canUseDom() || cachePersistTimer !== null) return;
  // Batch concurrent responses instead of serializing the entire cache for each one.
  cachePersistTimer = window.setTimeout(() => {
    cachePersistTimer = null;
    persistCacheSnapshot();
  }, 250);
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
    scheduleCachePersist();
    return undefined;
  }

  return cached.data;
}

export function clearCmsCache() {
  cacheGeneration += 1;
  if (cachePersistTimer !== null) {
    window.clearTimeout(cachePersistTimer);
    cachePersistTimer = null;
  }
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

  scheduleCachePersist();

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
    if ((key === 'image' || key === 'imageUrl' || key === 'mobileImage') && typeof itemValue === 'string') {
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

const loadingListeners = new Set();

function notifyLoadingListeners() {
  loadingListeners.forEach((listener) => listener(pendingRequests.size > 0));
}

export function subscribeToCmsLoading(listener) {
  loadingListeners.add(listener);
  return () => loadingListeners.delete(listener);
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

// index.html starts some requests (hero banners) before the app bundle loads.
function takePrefetchedResponse(url) {
  if (typeof window === 'undefined' || !window.__FSTU_PREFETCH__) return null;
  const pending = window.__FSTU_PREFETCH__[url];
  delete window.__FSTU_PREFETCH__[url];
  return pending ? pending.catch(() => fetch(url, { cache: 'no-store' })) : null;
}

async function request(path, options = {}) {
  const force = options?.force === true;
  const generation = cacheGeneration;
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
        const url = buildApiUrl(path, baseUrl);
        const response = await (((!force || options.allowPrefetch) && takePrefetchedResponse(url)) || fetch(url, {
          cache: 'no-store'
        }));

        if (!response.ok) {
          const error = new Error(`Request failed: ${response.status}`);
          error.status = response.status;
          throw error;
        }

        const data = normalizeCmsPayload(await response.json(), baseUrl);
        return generation === cacheGeneration
          ? writeCachedResponse(path, data, getResponseCacheTtl(path, response))
          : data;
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
  notifyLoadingListeners();

  try {
    return await requestPromise;
  } finally {
    if (pendingRequests.get(pendingKey) === requestPromise) pendingRequests.delete(pendingKey);
    notifyLoadingListeners();
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

function acceptContentRevision(revision) {
  if (!Number.isFinite(Number(revision?.revision)) || Number(revision.revision) < 1) return;
  const nextSignature = buildRevisionSignature(revision);
  const previousSignature = currentRevisionSignature || readStoredRevisionSignature();
  if (previousSignature && Number(revision.revision) < Number(previousSignature.split(':')[0])) return;
  currentRevisionSignature = nextSignature;
  writeStoredRevisionSignature(nextSignature);
  if (previousSignature && previousSignature !== nextSignature) {
    clearCmsCache();
    revisionListeners.forEach((listener) => listener(revision));
  }
}

function startRevisionStream() {
  if (revisionStream || typeof window.EventSource !== 'function') return;
  revisionStream = new window.EventSource(buildApiUrl(API_ENDPOINTS.contentEvents()));
  revisionStream.onmessage = (event) => {
    try { acceptContentRevision(JSON.parse(event.data)); } catch { /* Ignore malformed stream messages. */ }
  };
  revisionStream.onerror = () => { void pollContentRevision(); };
}

async function pollContentRevision() {
  if (!canUseDom()) {
    return null;
  }

  if (pendingRevisionRequest) {
    return pendingRevisionRequest;
  }

  pendingRevisionRequest = (async () => {
    lastRevisionCheckAt = Date.now();
    try {
      const revision = await requestContentRevision();
      acceptContentRevision(revision);

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
  if (canUseDom() && revisionStopTimer !== null) {
    window.clearTimeout(revisionStopTimer);
    revisionStopTimer = null;
  }

  if (!canUseDom() || revisionPollTimer || !revisionListeners.size) {
    return;
  }

  window.addEventListener('focus', handleRevisionVisibilityChange);
  document.addEventListener('visibilitychange', handleRevisionVisibilityChange);
  startRevisionStream();

  revisionPollTimer = window.setInterval(() => {
    if (revisionStream?.readyState === 2) {
      revisionStream.close();
      revisionStream = null;
    }
    if (document.visibilityState === 'visible') startRevisionStream();
    const streamConnected = revisionStream?.readyState === 1;
    if (document.visibilityState === 'visible' && (!streamConnected || Date.now() - lastRevisionCheckAt >= REVISION_POLL_INTERVAL_MS)) {
      void pollContentRevision();
    }
  }, 5000);

  if (Date.now() - lastRevisionCheckAt >= REVISION_MIN_CHECK_GAP_MS) {
    void pollContentRevision();
  }
}

function stopRevisionPolling() {
  if (!canUseDom() || revisionListeners.size || !revisionPollTimer || revisionStopTimer !== null) {
    return;
  }

  revisionStopTimer = window.setTimeout(() => {
    revisionStopTimer = null;
    stopRevisionPollingNow();
  }, REVISION_STOP_GRACE_MS);
}

function stopRevisionPollingNow() {
  if (revisionListeners.size || !revisionPollTimer) {
    return;
  }

  window.clearInterval(revisionPollTimer);
  revisionPollTimer = null;
  revisionStream?.close();
  revisionStream = null;
  window.removeEventListener('focus', handleRevisionVisibilityChange);
  document.removeEventListener('visibilitychange', handleRevisionVisibilityChange);
}

export function subscribeToCmsChanges(listener, scope = {}) {
  if (typeof listener !== 'function' || !canUseDom()) {
    return () => {};
  }

  const normalizeResource = (value) => value === 'academic-menus' ? 'menus' : value;
  const scopedListener = (revision) => {
    if ((!scope.resource && !scope.setting) || (!revision.resource && !revision.setting) ||
      (scope.resource && normalizeResource(scope.resource) === normalizeResource(revision.resource)) ||
      (scope.setting && scope.setting === revision.setting)) listener(revision);
  };
  revisionListeners.add(scopedListener);
  startRevisionPolling();

  return () => {
    revisionListeners.delete(scopedListener);
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
