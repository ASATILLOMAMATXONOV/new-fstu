export function buildPublicDirectionUrl(item) {
  if (!item?.id || !item.facultyId || !item.departmentId) return '';

  const environment = import.meta.env || {};
  const localUrl = new URL(window.location.origin);
  localUrl.port = '3000';
  const baseUrl = environment.VITE_APP_SITE_URL || (environment.DEV ? localUrl.origin : 'https://new.fstu.uz');
  const path = `/departments/${encodeURIComponent(item.facultyId)}/${encodeURIComponent(item.departmentId)}`;
  const url = new URL(path, baseUrl);
  url.searchParams.set('direction', String(item.id));
  url.hash = 'attached-directions';
  return url.href;
}
