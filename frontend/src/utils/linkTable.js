export function normalizeLinkTableItems(items = []) {
  return (items || [])
    .map((item, index) => ({
      id: item?.id || `link-table-${index + 1}`,
      href: String(item?.href || item?.link || '').trim(),
      order: item?.order ?? index + 1,
      active: item?.active ?? true,
      uz: {
        title: item?.uz?.title || item?.translations?.uz?.title || item?.title || ''
      },
      ru: {
        title: item?.ru?.title || item?.translations?.ru?.title || ''
      },
      en: {
        title: item?.en?.title || item?.translations?.en?.title || ''
      }
    }))
    .filter((item) => item.active !== false && item.href)
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
}
