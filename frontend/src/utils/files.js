export function formatFileSize(bytes = 0) {
  const size = Number(bytes || 0);

  if (!Number.isFinite(size) || size <= 0) {
    return '';
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function getNameFromHref(href = '') {
  const value = String(href || '').trim();

  if (!value || value.startsWith('data:')) {
    return '';
  }

  const cleanValue = value.split('?')[0].split('#')[0];
  const parts = cleanValue.split('/');

  return decodeURIComponent(parts[parts.length - 1] || '');
}

export function normalizeAttachedFiles(items = []) {
  return (items || [])
    .map((item, index) => ({
      id: item?.id || `attached-file-${index + 1}`,
      href: String(item?.href || item?.url || item?.link || '').trim(),
      name:
        String(item?.name || item?.fileName || item?.filename || '').trim() ||
        getNameFromHref(item?.href || item?.url || item?.link),
      mimeType: String(item?.mimeType || item?.type || '').trim(),
      size: Number(item?.size || 0),
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

export function getFileTypeLabel(item = {}) {
  const explicitType = String(item?.mimeType || '').trim();

  if (explicitType) {
    if (explicitType.includes('/')) {
      return explicitType.split('/').pop()?.toUpperCase() || explicitType.toUpperCase();
    }

    return explicitType.toUpperCase();
  }

  const fileName = String(item?.name || '').trim();
  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';

  return extension ? extension.toUpperCase() : 'FILE';
}
