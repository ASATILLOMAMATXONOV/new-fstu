import { useEffect, useState } from 'react';

import { fetchContentList, subscribeToCmsChanges } from '../api/cms';
import { useLanguage } from '../context/LanguageContext';
import { findEmployeeBySlug, normalizeEmployeeSlug } from '../utils/employees';

export function useEmployeePortfolioBySlug(slug) {
  const { currentLanguageCode } = useLanguage();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (forceRefresh = false) => {
      try {
        setLoading(true);
        const normalizedSlug = normalizeEmployeeSlug(slug);
        const matchingItems = normalizedSlug
          ? await fetchContentList('employees-portfolios', {
              slug: normalizedSlug,
              limit: 1,
              summaryOnly: false
            }, {
              force: forceRefresh
            })
          : [];
        const matchedItem = matchingItems[0] || findEmployeeBySlug(matchingItems, slug);

        if (!cancelled) {
          setItem(matchedItem || null);
        }
      } catch (error) {
        console.error(`Failed to load employee profile ${slug}:`, error);

        if (!cancelled) {
          setItem(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      load();
    } else {
      setItem(null);
      setLoading(false);
    }

    const unsubscribe = slug
      ? subscribeToCmsChanges(() => {
          load(true);
        })
      : () => {};

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [slug]);

  return { item, loading, currentLanguageCode };
}
