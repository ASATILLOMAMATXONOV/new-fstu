import { getPublicSiteRevision } from '../modules/content/public-site-revision.service.js';
import { getRequestOrigin, isPublicRequest } from './inline-assets.js';

// Ommaviy (login qilinmagan) GET javoblari uchun xotiradagi kesh.
//
// Kalit sayt revision raqamini o'z ichiga oladi: admin har qanday kontent yoki
// sozlamani saqlaganda revision oshadi (touchPublicSiteRevision), shuning uchun
// eski javob hech qachon qaytarilmaydi. Revision har so'rovda bazadan o'qiladi —
// bir nechta backend nusxasi (k8s) bo'lsa ham to'g'ri ishlaydi.

const MAX_CACHE_BYTES = 48 * 1024 * 1024;
const MAX_ENTRY_BYTES = 8 * 1024 * 1024;

const cache = new Map();
let cacheBytes = 0;
let cachedRevision = null;

function resetIfRevisionChanged(revision) {
  if (cachedRevision === revision) return;
  cache.clear();
  cacheBytes = 0;
  cachedRevision = revision;
}

function remember(key, body) {
  const size = Buffer.byteLength(body);
  if (size > MAX_ENTRY_BYTES) return;
  cache.set(key, body);
  cacheBytes += size;
  for (const [oldKey, oldBody] of cache) {
    if (cacheBytes <= MAX_CACHE_BYTES) break;
    cache.delete(oldKey);
    cacheBytes -= Buffer.byteLength(oldBody);
  }
}

function read(key) {
  const body = cache.get(key);
  if (body === undefined) return undefined;
  cache.delete(key);
  cache.set(key, body);
  return body;
}

/**
 * `build()` javob obyektini qaytaradi. Ommaviy so'rovda natija keshlanadi,
 * admin (autentifikatsiyalangan) so'rovlarda har doim yangidan hisoblanadi.
 */
export async function sendPublicJson(req, res, build) {
  if (!isPublicRequest(req)) {
    res.json(await build());
    return;
  }

  const { revision } = await getPublicSiteRevision();
  resetIfRevisionChanged(revision);

  // Javobdagi asset URL'lari so'rov origin'iga bog'liq.
  const key = `${getRequestOrigin(req)}|${req.originalUrl}`;
  let body = read(key);

  if (body === undefined) {
    body = JSON.stringify(await build());
    // build() davomida boshqa so'rov yangi revision'ni ko'rgan bo'lsa, eski natijani
    // yangi revision keshiga yozmaymiz. Aks holda keyingi so'rov keshni o'zi tozalaydi.
    if (cachedRevision === revision) remember(key, body);
  }

  res.type('application/json').send(body);
}

export function clearPublicResponseCache() {
  cache.clear();
  cacheBytes = 0;
  cachedRevision = null;
}
