import { clearCmsCache, fetchContentList, getCachedContentList } from './cms';
import { API_ENDPOINTS } from '../config/api';

const CACHE_KEY = 'fstu_frontend_api_cache_v1';
const response = data => ({ ok: true, headers: { get: () => '' }, json: async () => data });
const originalFetch = global.fetch;

beforeEach(() => {
  jest.useFakeTimers();
  clearCmsCache();
  window.sessionStorage.clear();
  global.fetch = jest.fn().mockResolvedValue(response({ items: [{ id: 1 }] }));
});

afterEach(() => {
  clearCmsCache();
  jest.restoreAllMocks();
  jest.useRealTimers();
  global.fetch = originalFetch;
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
  jest.advanceTimersByTime(61000);
  await fetchContentList('news');
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
