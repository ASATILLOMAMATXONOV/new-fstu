import React from 'react';

import { fetchContentItem, getCachedContentItem, subscribeToCmsChanges } from '../api/cms';
import { useLanguage } from '../context/LanguageContext';

export function useContentItem(resource, id, options = {}) {
  const { currentLanguageCode } = useLanguage();
  const enabled = options.enabled !== false;
  const shouldRevalidate = options.revalidate !== false;
  const cachedItem = React.useMemo(
    () => (enabled && id ? getCachedContentItem(resource, id) : null),
    [enabled, id, resource]
  );
  const [item, setItem] = React.useState(() => cachedItem || null);
  const [loading, setLoading] = React.useState(() => enabled && Boolean(id) && !cachedItem);

  React.useEffect(() => {
    let cancelled = false;

    const load = async (forceRefresh = false) => {
      try {
        if (!enabled || !id) {
          setItem(null);
          setLoading(false);
          return;
        }

        if (cachedItem && !forceRefresh) {
          setItem(cachedItem);
          setLoading(false);
          if (!shouldRevalidate) {
            return;
          }
        }

        setLoading(true);
        const nextItem = await fetchContentItem(resource, id, {
          force: forceRefresh
        });

        if (!cancelled) {
          setItem(nextItem);
        }
      } catch (error) {
        console.error(`Failed to load ${resource}/${id}:`, error);

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

    const unsubscribe = enabled && Boolean(id) && shouldRevalidate
      ? subscribeToCmsChanges(() => {
          load(true);
        })
      : () => {};

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [cachedItem, enabled, id, resource, shouldRevalidate]);

  return { item, loading, currentLanguageCode };
}
