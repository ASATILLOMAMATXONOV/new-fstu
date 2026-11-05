// Public CMS responses used to embed images and files as base64 data URLs,
// which made a single JSON response several megabytes. These helpers replace
// large data URLs with stable asset URLs and resolve them back on request.

const MIN_EXTERNAL_LENGTH = 2048;
const DATA_URL_SOURCE = 'data:([a-z]+\\/[a-z0-9.+-]+)((?:;[a-z0-9-]+=[^;,"\'\\s]+)*);base64,([a-z0-9+/=]+)';
const FULL_DATA_URL = new RegExp(`^${DATA_URL_SOURCE}$`, 'i');
const createEmbeddedPattern = () => new RegExp(DATA_URL_SOURCE, 'gi');

function decode(match) {
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[3], 'base64')
  };
}

/**
 * Returns a copy of `value` where every large data URL is replaced by
 * `buildUrl(path, index)`. `path` is the dot-joined key path of the string;
 * `index` is set only for data URLs embedded inside a larger string (HTML).
 */
export function externalizeInlineAssets(value, buildUrl, path = []) {
  if (typeof value === 'string') {
    if (value.length < MIN_EXTERNAL_LENGTH || !value.includes('data:')) return value;

    const pathKey = path.join('.');
    if (FULL_DATA_URL.test(value)) return buildUrl(pathKey);

    let index = -1;
    return value.replace(createEmbeddedPattern(), (match) => {
      index += 1;
      return match.length < MIN_EXTERNAL_LENGTH ? match : buildUrl(pathKey, index);
    });
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => externalizeInlineAssets(item, buildUrl, [...path, String(index)]));
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, externalizeInlineAssets(item, buildUrl, [...path, key])])
    );
  }

  return value;
}

/** Finds the data URL that `externalizeInlineAssets` replaced at `pathKey`/`index`. */
export function resolveInlineAsset(root, pathKey = '', index = null) {
  const value = String(pathKey || '')
    .split('.')
    .filter(Boolean)
    .reduce((current, key) => (current && typeof current === 'object' ? current[key] : undefined), root);

  if (typeof value !== 'string') return null;

  if (index === null || index === undefined || index === '') {
    const match = value.match(FULL_DATA_URL);
    return match ? decode(match) : null;
  }

  const position = Number(index);
  if (!Number.isInteger(position) || position < 0) return null;

  const matches = [...value.matchAll(createEmbeddedPattern())];
  return matches[position] ? decode(matches[position]) : null;
}

export function getRequestOrigin(req) {
  const forwardedProtocol = String(req.get('x-forwarded-proto') || '').split(',')[0].trim();
  return `${forwardedProtocol || req.protocol}://${req.get('host')}`;
}

export function buildAssetQuery(pathKey, index, version) {
  const params = new URLSearchParams({ path: pathKey });
  if (index !== undefined && index !== null) params.set('i', String(index));
  if (version) params.set('v', String(version));
  return params.toString();
}

export function isPublicRequest(req) {
  return !req.headers.authorization && !req.user;
}
