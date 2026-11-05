// CMS images served by the backend accept a `w` query parameter and are
// re-encoded (WebP) at that width. These helpers build srcset values for them.

const OPTIMIZABLE_IMAGE_PATTERN =
  /\/api\/(?:content\/[^/?#]+\/\d+\/(?:image|asset)|settings\/[^/?#]+\/asset|media\/images\/)/i;

export const DEFAULT_IMAGE_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600, 1920];

export function isOptimizableImage(url) {
  return typeof url === 'string' && OPTIMIZABLE_IMAGE_PATTERN.test(url);
}

export function withImageWidth(url, width) {
  if (!isOptimizableImage(url) || !width) return url;

  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(url, base);
    parsed.searchParams.set('w', String(width));
    return /^https?:\/\//i.test(url) ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function buildSrcSet(url, widths = DEFAULT_IMAGE_WIDTHS) {
  if (!isOptimizableImage(url)) return undefined;
  return widths.map((width) => `${withImageWidth(url, width)} ${width}w`).join(', ');
}

/**
 * Props for an <img>: `sizes` describes the rendered width, e.g. "100vw" or
 * "(max-width: 640px) 50vw, 240px". Non-CMS URLs are returned untouched.
 */
export function responsiveImageProps(url, sizes, widths = DEFAULT_IMAGE_WIDTHS) {
  if (!isOptimizableImage(url)) return { src: url };

  return {
    src: withImageWidth(url, widths[Math.min(widths.length - 1, Math.floor(widths.length / 2))]),
    srcSet: buildSrcSet(url, widths),
    sizes
  };
}
