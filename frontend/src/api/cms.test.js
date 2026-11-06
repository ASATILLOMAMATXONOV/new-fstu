import { clearCmsCache, fetchContentList, getCachedContentList, subscribeToCmsChanges } from './cms';
import { API_ENDPOINTS } from '../config/api';

const CACHE_KEY = 'fstu_frontend_api_cache_v1';
const response = data => ({ ok: true, headers: { get: () => '' }, json: async () => data });
const originalFetch = global.fetch;
const originalEventSource = window.EventSource;
let subscriptions = [];

beforeEach(() => {
  jest.useFakeTimers();
  clearCmsCache();
  window.sessionStorage.clear();
  global.fetch = jest.fn().mockResolvedValue(response({ items: [{ id: 1 }] }));
});

afterEach(() => {
  subscriptions.forEach(unsubscribe => unsubscribe());
  subscriptions = [];
  // Kuzatuv kechikish bilan to'xtaydi; keyingi test toza holatdan boshlansin.
  jest.advanceTimersByTime(15000);
  window.EventSource = originalEventSource;
  clearCmsCache();
  jest.restoreAllMocks();
  jest.useRealTimers();
  global.fetch = originalFetch;
});

test('one live stream refreshes only the changed CMS resource and closes after unmount', async () => {
  const streams = [];
  window.EventSource = jest.fn(function (url) {
    this.url = url;
    this.readyState = 1;
    this.close = jest.fn();
    streams.push(this);
  });
  const banners = jest.fn();
  const news = jest.fn();
  subscriptions.push(subscribeToCmsChanges(banners, { resource: 'banners' }));
  subscriptions.push(subscribeToCmsChanges(news, { resource: 'news' }));
  await Promise.resolve();
  streams[0].onmessage({ data: JSON.stringify({ revision: 100, updatedAt: 'first' }) });
  await fetchContentList('banners');
  streams[0].onmessage({ data: JSON.stringify({ revision: 101, updatedAt: 'second', resource: 'banners' }) });

  expect(window.EventSource).toHaveBeenCalledTimes(1);
  expect(streams[0].url).toContain('/api/content/__events');
  expect(banners).toHaveBeenCalledTimes(1);
  expect(news).not.toHaveBeenCalled();
  expect(getCachedContentList('banners')).toBeNull();
  subscriptions[0]();
  expect(streams[0].close).not.toHaveBeenCalled();
  subscriptions[1]();
  expect(streams[0].close).not.toHaveBeenCalled();
  jest.advanceTimersByTime(15000);
  expect(streams[0].close).toHaveBeenCalledTimes(1);
  subscriptions = [];
});

test('page navigation reuses the live stream instead of reconnecting and re-polling', async () => {
  const streams = [];
  window.EventSource = jest.fn(function () {
    this.readyState = 1;
    this.close = jest.fn();
    streams.push(this);
  });
  global.fetch.mockResolvedValue(response({ revision: 5, updatedAt: 'x' }));
  subscriptions.push(subscribeToCmsChanges(jest.fn()));
  await Promise.resolve();
  const revisionCalls = global.fetch.mock.calls.length;
  // Eski sahifa unmount, yangi sahifa mount bo'ladi.
  subscriptions.shift()();
  subscriptions.push(subscribeToCmsChanges(jest.fn()));
  await Promise.resolve();
  jest.advanceTimersByTime(15000);
  expect(window.EventSource).toHaveBeenCalledTimes(1);
  expect(streams[0].close).not.toHaveBeenCalled();
  expect(global.fetch.mock.calls.length).toBe(revisionCalls);
});

test('an old in-flight response cannot replace the cache after a saved CMS change', async () => {
  let resolveOld;
  global.fetch.mockReturnValueOnce(new Promise(resolve => { resolveOld = resolve; }));
  const oldRequest = fetchContentList('banners');
  clearCmsCache();
  global.fetch.mockResolvedValueOnce(response({ items: [{ id: 2 }] }));
  await fetchContentList('banners', {}, { force: true });
  resolveOld(response({ items: [{ id: 1 }] }));
  await oldRequest;
  expect(getCachedContentList('banners')).toEqual([{ id: 2 }]);
});

test('live updates reconnect after the backend was temporarily unavailable', async () => {
  const streams = [];
  window.EventSource = jest.fn(function () {
    this.readyState = 0;
    this.close = jest.fn();
    streams.push(this);
  });
  subscriptions.push(subscribeToCmsChanges(jest.fn()));
  await Promise.resolve();
  streams[0].readyState = 2;
  jest.advanceTimersByTime(5000);
  expect(streams[0].close).toHaveBeenCalledTimes(1);
  expect(window.EventSource).toHaveBeenCalledTimes(2);
});

test('forced refresh ignores old HTML prefetches, while initial banner load can reuse its fresh prefetch', async () => {
  const url = 'http://localhost:8564' + API_ENDPOINTS.contentList('banners');
  window.__FSTU_PREFETCH__ = { [url]: Promise.resolve(response({ items: [{ id: 'prefetch' }] })) };
  expect(await fetchContentList('banners', {}, { force: true })).toEqual([{ id: 1 }]);
  expect(await fetchContentList('banners', {}, { force: true, allowPrefetch: true })).toEqual([{ id: 'prefetch' }]);
  delete window.__FSTU_PREFETCH__;
});

test('concurrent consumers and revisits share one cached request', async () => {
  const [first, second] = await Promise.all([fetchContentList('news'), fetchContentList('news')]);
  expect(first).toEqual(second);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  await fetchContentList('news');
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('batches JSON storage writes for concurrent responses', async () => {
  const write = jest.spyOn(Storage.prototype, 'setItem');
  await Promise.all([fetchContentList('news'), fetchContentList('students')]);
  expect(write).not.toHaveBeenCalled();
  jest.advanceTimersByTime(250);
  expect(write).toHaveBeenCalledTimes(1);
  expect(JSON.parse(window.sessionStorage.getItem(CACHE_KEY))).toHaveLength(2);
});

test('limits persisted JSON while retaining responses in memory', async () => {
  global.fetch.mockResolvedValue(response({ items: [{ content: 'a'.repeat(260000) }] }));
  await Promise.all(['news', 'students', 'faculties', 'partners'].map(resource => fetchContentList(resource)));
  jest.advanceTimersByTime(250);
  const snapshot = window.sessionStorage.getItem(CACHE_KEY);
  expect(snapshot.length * 2).toBeLessThanOrEqual(1024 * 1024);
  expect(JSON.parse(snapshot).length).toBeLessThan(4);
  expect(getCachedContentList('partners')[0].content.length).toBe(260000);
});

test('discards expired persisted data and refreshes expired memory entries', async () => {
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify([
    [API_ENDPOINTS.contentList('news'), { data: { items: [{ id: 99 }] }, expiresAt: Date.now() - 1 }]
  ]));
  expect(getCachedContentList('news')).toBeNull();
  await fetchContentList('news');
  jest.advanceTimersByTime(181000);
  await fetchContentList('news');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
