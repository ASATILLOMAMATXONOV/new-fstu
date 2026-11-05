import { isIP } from 'node:net';

export function normalizeIp(value) {
  const raw = String(value || '').trim().replace(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i, '$1');
  if (!isIP(raw) || raw.includes('%')) return null;
  return isIP(raw) === 6 ? new URL(`http://[${raw}]`).hostname.slice(1, -1) : raw;
}

export function clientIp(req) {
  // Express only accepts forwarded addresses from explicitly configured trusted proxies.
  return normalizeIp(req.ip || req.socket?.remoteAddress);
}

export function safeText(value, length = 240) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, length);
}

export function safePath(req) {
  return safeText(String(req.originalUrl || req.url || '/').split('?')[0])
    .replace(/[A-Za-z0-9_-]{64,}/g, '[redacted]');
}

function decode(value) {
  let result = value;
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(result);
      if (next === result) break;
      result = next;
    } catch { break; }
  }
  return result;
}

// Only high-confidence URL probes are rejected. CMS HTML, passwords and uploaded
// files are never searched with generic SQL/XSS expressions or written to logs.
export function classifyRequest(req) {
  const raw = String(req.originalUrl || req.url || '/');
  if (raw.length > 8192) return { type: 'oversized_url', severity: 'medium', summary: 'So‘rov manzili ruxsat etilgan hajmdan katta.' };
  const url = decode(raw).replace(/\\/g, '/');
  const path = url.split('?')[0];
  if (/(?:^|\/)\.\.(?:\/|$)|\x00/.test(url)) {
    return { type: 'path_traversal', severity: 'high', summary: 'Fayl tizimiga ruxsatsiz yo‘l orqali kirish urinishi.' };
  }
  if (/(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git|\.svn|wp-admin|wp-login\.php|phpmyadmin|xmlrpc\.php)(?:\/|$)|\/etc\/passwd|\/proc\/self\//i.test(path)) {
    return { type: 'sensitive_probe', severity: 'high', summary: 'Maxfiy fayl yoki mavjud bo‘lmagan boshqaruv tizimi qidirildi.' };
  }
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1).replace(/\+/g, ' ') : '';
  if (/\bunion\s+(?:all\s+)?select\b|\b(?:pg_sleep|sleep|benchmark)\s*\(|;\s*(?:drop|truncate)\s+table\b/i.test(query)) {
    return { type: 'sql_probe', severity: 'high', summary: 'URL parametrlarida SQL hujumiga xos ifoda aniqlandi.' };
  }
  if (/<\s*script\b|javascript\s*:|<[^>]{0,200}\bon(?:error|load)\s*=/i.test(query)) {
    return { type: 'xss_probe', severity: 'high', summary: 'URL parametrlarida zararli skript urinishi aniqlandi.' };
  }
  if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(req.method)) {
    return { type: 'invalid_method', severity: 'medium', summary: 'Ruxsat etilmagan HTTP usuli.' };
  }
  return null;
}

export function responseEvent(req, status) {
  const path = String(req.originalUrl || req.url || '').split('?')[0].replace(/\/+$/, '').toLowerCase();
  if (path.startsWith('/api/account/login/') && [400,401,423,429].includes(status)) {
    return { type: 'mfa_failure', severity: 'high', summary: 'Ko‘p bosqichli kirishning tasdiqlash urinishi rad etildi.' };
  }
  if (/^\/api\/admin-users(?:\/|$)/.test(path) && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && status >= 200 && status < 300) {
    return { type: 'admin_change', severity: 'info', summary: 'Super admin administrator hisobini o‘zgartirdi.' };
  }
  if (path === '/api/account/login' && req.method === 'POST') {
    if (status >= 200 && status < 300) return { type: 'login_success', severity: 'info', summary: 'Administrator tizimga kirdi.' };
    if ([400, 401, 423, 429].includes(status)) return { type: 'login_failure', severity: 'medium', summary: 'Muvaffaqiyatsiz login yoki bloklangan hisobga kirish urinishi.' };
  }
  if (status === 401) return { type: 'authentication_failure', severity: 'medium', summary: 'Himoyalangan manzilga tasdiqlanmagan kirish urinishi.' };
  if (status === 403) return { type: 'access_denied', severity: 'medium', summary: 'Ruxsat yetarli bo‘lmagan amal rad etildi.' };
  if (status === 413) return { type: 'oversized_body', severity: 'medium', summary: 'So‘rov tanasi ruxsat etilgan hajmdan katta.' };
  if (status >= 500) return { type: 'server_error', severity: 'high', summary: 'Server so‘rovni bajarishda xatoga uchradi.' };
  return null;
}
