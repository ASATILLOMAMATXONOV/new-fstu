import React from 'react';

import { fetchContentList, getCachedContentList, subscribeToCmsChanges } from '../api/cms';
import { useLanguage } from '../context/LanguageContext';

export function useContentList(resource, options = {}) {
  const { currentLanguageCode } = useLanguage();
  const optionsKey = JSON.stringify(options || {});
  const parsedOptions = React.useMemo(() => JSON.parse(optionsKey), [optionsKey]);
  const enabled = parsedOptions.enabled !== false;
  const shouldRevalidate = parsedOptions.revalidate !== false;
  const refreshOnMount = parsedOptions.refreshOnMount === true;
  const query = React.useMemo(() => {
    const { enabled: _enabled, revalidate: _revalidate, refreshOnMount: _refreshOnMount, ...rest } = parsedOptions;
    return rest;
  }, [parsedOptions]);
  const cachedItems = React.useMemo(
    () => (enabled ? getCachedContentList(resource, query) : null),
    [enabled, query, resource]
  );
  const [items, setItems] = React.useState(() => cachedItems || []);
  const [loading, setLoading] = React.useState(() => enabled && !cachedItems);

  React.useEffect(() => {
    let cancelled = false;
    let requestSequence = 0;
    const hasCachedItems = cachedItems !== null;

    const load = async (forceRefresh = false) => {
      const sequence = ++requestSequence;
      if (!enabled) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        if (hasCachedItems && !forceRefresh) {
          setItems(cachedItems);
          setLoading(false);
          if (!shouldRevalidate) {
            return;
          }
        }

        // Cached content remains visible while it is refreshed in the background.
        // A CMS revision refresh should also avoid blanking an already rendered page.
        if (!hasCachedItems && !forceRefresh) {
          setLoading(true);
        }
        const nextItems = await fetchContentList(resource, query, {
          force: forceRefresh,
          ...(refreshOnMount && sequence === 1 ? { allowPrefetch: true } : {})
        });

        if (!cancelled && sequence === requestSequence) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error(`Failed to load ${resource}:`, error);

        if (!cancelled && sequence === requestSequence && !hasCachedItems && !forceRefresh) {
          setItems([]);
        }
      } finally {
        if (!cancelled && sequence === requestSequence) {
          setLoading(false);
        }
      }
    };

    load(refreshOnMount);

    const unsubscribe = enabled && shouldRevalidate
      ? subscribeToCmsChanges(() => {
          load(true);
        }, { resource })
      : () => {};

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [cachedItems, enabled, query, refreshOnMount, resource, shouldRevalidate]);

  return { items, loading, setItems, currentLanguageCode };
}
