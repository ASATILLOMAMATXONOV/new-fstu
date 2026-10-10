import React from 'react';

import { fetchContentTree, getCachedContentTree, subscribeToCmsChanges } from '../api/cms';
import { useLanguage } from '../context/LanguageContext';
import { getRootMenuNodes } from '../utils/menu';

export function useMenuTree(resource = 'menus', options = {}) {
  const { currentLanguageCode } = useLanguage();
  const enabled = options.enabled !== false;
  const shouldRevalidate = options.revalidate !== false;
  const cachedMenus = React.useMemo(() => {
    if (!enabled) {
      return null;
    }

    const nextMenus = getCachedContentTree(resource);
    return nextMenus ? getRootMenuNodes(nextMenus) : null;
  }, [enabled, resource]);
  const [menus, setMenus] = React.useState(() => cachedMenus || []);
  const [loading, setLoading] = React.useState(() => enabled && !cachedMenus);

  React.useEffect(() => {
    let cancelled = false;

    const load = async (forceRefresh = false) => {
      if (!enabled) {
        setMenus([]);
        setLoading(false);
        return;
      }

      try {
        if (cachedMenus && !forceRefresh) {
          setMenus(cachedMenus);
          setLoading(false);
          if (!shouldRevalidate) {
            return;
          }
        }

        setLoading(true);
        const nextMenus = await fetchContentTree(resource, {}, {
          force: shouldRevalidate || forceRefresh
        });

        if (!cancelled) {
          setMenus(getRootMenuNodes(nextMenus));
        }
      } catch (error) {
        console.error(`Failed to load ${resource} tree:`, error);

        if (!cancelled) {
          setMenus([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    const unsubscribe = shouldRevalidate
      ? subscribeToCmsChanges(() => {
          load(true);
        })
      : () => {};

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [cachedMenus, enabled, resource, shouldRevalidate]);

  return {
    menus,
    loading,
    currentLanguageCode
  };
}
