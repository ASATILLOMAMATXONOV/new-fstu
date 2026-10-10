import React from 'react';

import { fetchSetting, getCachedSetting, subscribeToCmsChanges } from '../api/cms';
import { useLanguage } from '../context/LanguageContext';

export function useSetting(key, options = {}) {
  const { currentLanguageCode } = useLanguage();
  const enabled = options.enabled !== false;
  const shouldRevalidate = options.revalidate !== false;
  const cachedItem = React.useMemo(
    () => (enabled && key ? getCachedSetting(key) : null),
    [enabled, key]
  );
  const [item, setItem] = React.useState(() => cachedItem || null);
  const [loading, setLoading] = React.useState(() => enabled && Boolean(key) && !cachedItem);

  React.useEffect(() => {
    let cancelled = false;

    const load = async (forceRefresh = false) => {
      if (!enabled || !key) {
        setItem(null);
        setLoading(false);
        return;
      }

      try {
        if (cachedItem && !forceRefresh) {
          setItem(cachedItem);
          setLoading(false);
          if (!shouldRevalidate) {
            return;
          }
        }

        setLoading(true);
        const nextItem = await fetchSetting(key, {
          force: shouldRevalidate || forceRefresh
        });

        if (!cancelled) {
          setItem(nextItem);
        }
      } catch (error) {
        console.error(`Failed to load setting ${key}:`, error);

        if (!cancelled) {
          setItem(null);
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
  }, [cachedItem, enabled, key, shouldRevalidate]);

  return { item, loading, currentLanguageCode };
}
