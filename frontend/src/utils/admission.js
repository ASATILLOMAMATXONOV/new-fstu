export function normalizeAdmissionUrl(value = '') {
  const normalized = String(value || '').trim();

  if (!normalized || normalized === '#apply') {
    return '/admission';
  }

  return normalized;
}

export function isAdmissionPageUrl(value = '') {
  return normalizeAdmissionUrl(value) === '/admission';
}
