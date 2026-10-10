const SEASON_DEFINITIONS = {
  spring: {
    preset: 'flower',
    count: 14,
    size: 28,
    speed: 18
  },
  summer: {
    preset: 'raindrop',
    count: 12,
    size: 24,
    speed: 16
  },
  autumn: {
    preset: 'leaf',
    count: 16,
    size: 30,
    speed: 20
  },
  winter: {
    preset: 'snow',
    count: 20,
    size: 22,
    speed: 22
  }
};

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function normalizeSeasonConfig(seasonKey, value = {}) {
  const fallback = SEASON_DEFINITIONS[seasonKey];
  const preset = String(value.preset || fallback.preset).trim();

  return {
    enabled: value.enabled ?? true,
    preset,
    assetUrl: String(value.assetUrl || '').trim(),
    count: clampNumber(value.count, 4, 40, fallback.count),
    size: clampNumber(value.size, 10, 64, fallback.size),
    speed: clampNumber(value.speed, 8, 40, fallback.speed)
  };
}

export function getCurrentSeasonKey(date = new Date()) {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) {
    return 'spring';
  }

  if (month >= 5 && month <= 7) {
    return 'summer';
  }

  if (month >= 8 && month <= 10) {
    return 'autumn';
  }

  return 'winter';
}

export function normalizeSeasonalEffectsSetting(data = {}) {
  return {
    active: data.active ?? true,
    seasonMode: data.seasonMode === 'manual' ? 'manual' : 'auto',
    manualSeason: SEASON_DEFINITIONS[data.manualSeason] ? data.manualSeason : 'spring',
    seasons: {
      spring: normalizeSeasonConfig('spring', data?.seasons?.spring),
      summer: normalizeSeasonConfig('summer', data?.seasons?.summer),
      autumn: normalizeSeasonConfig('autumn', data?.seasons?.autumn),
      winter: normalizeSeasonConfig('winter', data?.seasons?.winter)
    }
  };
}

export function getActiveSeasonEffectsConfig(data = {}) {
  const normalized = normalizeSeasonalEffectsSetting(data);
  const activeSeasonKey =
    normalized.seasonMode === 'manual'
      ? normalized.manualSeason
      : getCurrentSeasonKey();

  return {
    seasonKey: activeSeasonKey,
    settings: normalized,
    config: normalized.seasons[activeSeasonKey]
  };
}

function seededRandom(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function getSeasonSeed(seasonKey) {
  return Array.from(String(seasonKey || '')).reduce(
    (total, symbol, index) => total + symbol.charCodeAt(0) * (index + 3),
    97
  );
}

export function createSeasonParticles(seasonKey, config) {
  const seed = getSeasonSeed(seasonKey);

  return Array.from({ length: config.count }, (_item, index) => {
    const base = seed + index * 17;
    const duration = config.speed * (0.72 + seededRandom(base + 1) * 0.72);
    const size = config.size * (0.62 + seededRandom(base + 2) * 0.85);
    const drift = (seededRandom(base + 3) - 0.5) * 180;
    const sway = 3 + seededRandom(base + 4) * 4.5;
    const opacity = 0.34 + seededRandom(base + 5) * 0.56;
    const rotate = Math.round(seededRandom(base + 6) * 360);
    const blur = seededRandom(base + 7) > 0.82 ? 0.5 : 0;

    return {
      id: `${seasonKey}-${index}`,
      left: `${(seededRandom(base + 8) * 100).toFixed(3)}%`,
      delay: `-${(seededRandom(base + 9) * duration).toFixed(2)}s`,
      duration: `${duration.toFixed(2)}s`,
      swayDuration: `${sway.toFixed(2)}s`,
      size: `${Math.max(10, Math.round(size))}px`,
      drift: `${drift.toFixed(1)}px`,
      opacity: opacity.toFixed(2),
      rotate: `${rotate}deg`,
      blur: `${blur}px`
    };
  });
}
