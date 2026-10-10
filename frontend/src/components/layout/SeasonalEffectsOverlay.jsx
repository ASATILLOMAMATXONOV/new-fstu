import React from 'react';

import '../../assets/styles/SeasonalEffectsOverlay.css';
import { useSetting } from '../../hooks/useSetting';
import {
  createSeasonParticles,
  getActiveSeasonEffectsConfig,
  normalizeSeasonalEffectsSetting
} from '../../utils/seasonal-effects';

function FlowerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 7.1C12.8 4.9 15.2 3.8 17 5.1C18.7 6.3 18.9 8.9 17.4 10.2C19.7 10.1 21.4 12.2 20.7 14.4C20.1 16.4 17.8 17.3 16 16.4C16.3 18.8 14.3 20.7 12 20.2C9.8 19.7 8.7 17.2 9.4 15.3C7.4 16.6 4.8 15.9 3.9 13.8C3 11.7 4.3 9.4 6.6 9.1C4.8 7.8 4.7 5.2 6.4 4.1C8.2 2.8 10.6 3.9 11.4 6.1Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
      <path d="M18 15L18.8 17.2L21 18L18.8 18.8L18 21L17.2 18.8L15 18L17.2 17.2L18 15Z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.2 4.3C14.2 4.4 9.8 6.8 7.2 10.4C5.2 13.2 4.8 16.1 5.4 18.8C8.1 19.4 11 19 13.8 17C17.4 14.4 19.8 10 19.9 5C19.9 4.6 19.6 4.3 19.2 4.3Z" />
      <path d="M7 17C9.6 14.9 12 12.5 14.2 9.6" />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2V22" />
      <path d="M4 7L20 17" />
      <path d="M4 17L20 7" />
      <path d="M12 2L14.4 4.4" />
      <path d="M12 2L9.6 4.4" />
      <path d="M12 22L14.4 19.6" />
      <path d="M12 22L9.6 19.6" />
      <path d="M4 7L7.1 7.4" />
      <path d="M4 7L5.4 10" />
      <path d="M20 17L16.9 16.6" />
      <path d="M20 17L18.6 14" />
      <path d="M4 17L5.4 14" />
      <path d="M4 17L7.1 16.6" />
      <path d="M20 7L18.6 10" />
      <path d="M20 7L16.9 7.4" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C12 2 7 9 7 12.4C7 15.2 9.2 17.5 12 17.5C14.8 17.5 17 15.2 17 12.4C17 9 12 2 12 2Z" />
      <path d="M12 18.7V22" />
    </svg>
  );
}

function renderPresetIcon(preset) {
  if (preset === 'flower') {
    return <FlowerIcon />;
  }

  if (preset === 'leaf') {
    return <LeafIcon />;
  }

  if (preset === 'snow') {
    return <SnowIcon />;
  }

  if (preset === 'raindrop') {
    return <RainIcon />;
  }

  return <SparkIcon />;
}

function SeasonalParticle({ particle, config, seasonKey }) {
  const style = {
    '--particle-left': particle.left,
    '--particle-delay': particle.delay,
    '--particle-duration': particle.duration,
    '--particle-sway-duration': particle.swayDuration,
    '--particle-size': particle.size,
    '--particle-drift': particle.drift,
    '--particle-opacity': particle.opacity,
    '--particle-rotate': particle.rotate,
    '--particle-blur': particle.blur
  };

  return (
    <span
      className={`seasonal-particle seasonal-particle--${seasonKey}`}
      style={style}
      aria-hidden="true"
    >
      <span className="seasonal-particle-inner">
        {config.assetUrl ? (
          <img src={config.assetUrl} alt="" />
        ) : (
          renderPresetIcon(config.preset)
        )}
      </span>
    </span>
  );
}

function SeasonalEffectsOverlay() {
  const { item } = useSetting('seasonal-effects', {
    revalidate: true
  });

  const activeEffect = React.useMemo(() => {
    if (!item) {
      return null;
    }

    return getActiveSeasonEffectsConfig(normalizeSeasonalEffectsSetting(item));
  }, [item]);

  const particles = React.useMemo(() => {
    if (!activeEffect?.config?.enabled) {
      return [];
    }

    return createSeasonParticles(activeEffect.seasonKey, activeEffect.config);
  }, [activeEffect]);

  if (!activeEffect?.settings?.active || !activeEffect?.config?.enabled || !particles.length) {
    return null;
  }

  return (
    <div
      className={`seasonal-effects-overlay seasonal-effects-overlay--${activeEffect.seasonKey}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <SeasonalParticle
          key={particle.id}
          particle={particle}
          config={activeEffect.config}
          seasonKey={activeEffect.seasonKey}
        />
      ))}
    </div>
  );
}

export default SeasonalEffectsOverlay;
