import sharp from 'sharp';

// Resizes and re-encodes CMS images on the fly (WebP when the browser accepts it)
// and keeps the results in a bounded in-memory LRU cache.

const RESPONSIVE_WIDTHS = [160, 320, 480, 640, 768, 960, 1280, 1600, 1920];
const DEFAULT_MAX_WIDTH = 1920;
const MAX_CACHE_BYTES = 96 * 1024 * 1024;
const OPTIMIZABLE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/tiff']);

const cache = new Map();
const pending = new Map();
let cacheBytes = 0;

sharp.cache(false);

function rememberResult(key, result) {
  if (result.body.length > MAX_CACHE_BYTES / 8) return;
  cache.set(key, result);
  cacheBytes += result.body.length;

  for (const [oldKey, oldValue] of cache) {
    if (cacheBytes <= MAX_CACHE_BYTES) break;
    cache.delete(oldKey);
    cacheBytes -= oldValue.body.length;
  }
}

function readCached(key) {
  const value = cache.get(key);
  if (!value) return null;
  cache.delete(key);
  cache.set(key, value);
  return value;
}

export function pickResponsiveWidth(value) {
  const requested = Number.parseInt(value, 10);
  if (!Number.isFinite(requested) || requested <= 0) return DEFAULT_MAX_WIDTH;
  return RESPONSIVE_WIDTHS.find((width) => width >= requested) || DEFAULT_MAX_WIDTH;
}

async function transform(buffer, mimeType, width, format) {
  const pipeline = sharp(buffer, { failOn: 'none', limitInputPixels: 80_000_000 })
    .rotate()
    .resize({ width, withoutEnlargement: true });

  if (format === 'webp') {
    return { body: await pipeline.webp({ quality: 72, effort: 4 }).toBuffer(), mimeType: 'image/webp' };
  }

  if (mimeType === 'image/png') {
    return { body: await pipeline.png({ compressionLevel: 9, palette: true, quality: 85 }).toBuffer(), mimeType };
  }

  return { body: await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer(), mimeType: 'image/jpeg' };
}

/**
 * Sends `buffer` as an optimized image. `cacheKey` must change whenever the
 * source image changes (include the entry's updated timestamp).
 */
export async function sendOptimizedImage(req, res, { buffer, mimeType, cacheKey }) {
  const normalizedType = String(mimeType || '').toLowerCase();
  res.vary('Accept');

  if (!OPTIMIZABLE_TYPES.has(normalizedType)) {
    res.type(normalizedType || 'application/octet-stream');
    res.send(buffer);
    return;
  }

  const width = pickResponsiveWidth(req.query.w);
  const format = /image\/webp/i.test(req.get('accept') || '') ? 'webp' : 'original';
  const key = `${cacheKey}|${width}|${format}`;

  let result = readCached(key);

  if (!result) {
    if (!pending.has(key)) {
      pending.set(
        key,
        transform(buffer, normalizedType, width, format)
          .then((output) => {
            const optimized = output.body.length < buffer.length ? output : { body: buffer, mimeType: normalizedType };
            rememberResult(key, optimized);
            return optimized;
          })
          .catch(() => ({ body: buffer, mimeType: normalizedType }))
          .finally(() => pending.delete(key))
      );
    }
    result = await pending.get(key);
  }

  res.type(result.mimeType);
  res.send(result.body);
}

export function setImageCacheHeaders(req, res) {
  res.set(
    'Cache-Control',
    req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=86400, stale-while-revalidate=604800'
  );
}
