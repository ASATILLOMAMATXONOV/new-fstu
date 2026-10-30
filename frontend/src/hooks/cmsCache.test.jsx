import { act, renderHook, waitFor } from '@testing-library/react';
import { useContentItem } from './useContentItem';
import { useContentList } from './useContentList';
import { useSetting } from './useSetting';
import { useMenuTree } from './useMenuTree';
import * as cms from '../api/cms';

jest.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguageCode: 'uz' })
}));
jest.mock('../api/cms', () => ({
  getCachedContentItem: jest.fn(), getCachedContentList: jest.fn(),
  getCachedSetting: jest.fn(), getCachedContentTree: jest.fn(),
  fetchContentItem: jest.fn(), fetchContentList: jest.fn(),
  fetchSetting: jest.fn(), fetchContentTree: jest.fn(),
  subscribeToCmsChanges: jest.fn()
}));

beforeEach(() => {
  jest.resetAllMocks();
  cms.subscribeToCmsChanges.mockReturnValue(jest.fn());
});

const cases = [
  ['item', () => useContentItem('news', '7'), 'getCachedContentItem', 'fetchContentItem', 'item', { id: 7 }],
  ['list', () => useContentList('news'), 'getCachedContentList', 'fetchContentList', 'items', [{ id: 7 }]],
  ['setting', () => useSetting('admission-cta'), 'getCachedSetting', 'fetchSetting', 'item', { title: 'Qabul' }],
  ['menu', () => useMenuTree(), 'getCachedContentTree', 'fetchContentTree', 'menus', [{ id: 7, nodeType: 'menu', children: [] }]]
];

test.each(cases)('%s uses the shared cache without forcing a duplicate request', async (_name, useHook, cache, fetch, field, data) => {
  cms[cache].mockReturnValue(data);
  cms[fetch].mockResolvedValue(data);
  const { result } = renderHook(useHook);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current[field]).toEqual(data);
  const args = cms[fetch].mock.calls[0];
  expect(args[args.length - 1]).toEqual({ force: false });

  await act(async () => cms.subscribeToCmsChanges.mock.calls[0][0]());
  const refreshedArgs = cms[fetch].mock.calls[1];
  expect(refreshedArgs[refreshedArgs.length - 1]).toEqual({ force: true });
});

test.each([
  () => useContentItem('news', undefined),
  () => useContentItem('news', '7', { enabled: false }),
  () => useContentList('news', { enabled: false }),
  () => useSetting('admission-cta', { enabled: false }),
  () => useMenuTree('menus', { enabled: false })
])('inactive data hooks do not fetch or subscribe', (useHook) => {
  renderHook(useHook);
  expect(cms.fetchContentItem).not.toHaveBeenCalled();
  expect(cms.fetchContentList).not.toHaveBeenCalled();
  expect(cms.fetchSetting).not.toHaveBeenCalled();
  expect(cms.fetchContentTree).not.toHaveBeenCalled();
  expect(cms.subscribeToCmsChanges).not.toHaveBeenCalled();
});
