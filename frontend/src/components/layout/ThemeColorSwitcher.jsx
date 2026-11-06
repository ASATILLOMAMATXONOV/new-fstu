import React from 'react';

import '../../assets/styles/ThemeColorSwitcher.css';
import { useSetting } from '../../hooks/useSetting';

const STORAGE_KEY = 'fstu-theme-color';

const THEMES = [
  {
    id: 'blue',
    label: "Ko'k",
    primary: '#2563eb',
    dark: '#1d4ed8',
    deep: '#172554',
    soft: '#dbeafe',
    muted: '#eff6ff',
    rgb: '37, 99, 235',
    darkRgb: '29, 78, 216',
    deepRgb: '23, 37, 84'
  },
  {
    id: 'ocean',
    label: 'Moviy',
    primary: '#077fae',
    dark: '#05688f',
    deep: '#044b69',
    soft: '#e2f3fa',
    muted: '#f1f9fc',
    rgb: '7, 127, 174',
    darkRgb: '5, 104, 143',
    deepRgb: '4, 75, 105'
  },
  {
    id: 'green',
    label: 'Yashil',
    primary: '#079447',
    dark: '#047a3a',
    deep: '#052e16',
    soft: '#dcfce7',
    muted: '#f0fdf4',
    rgb: '7, 148, 71',
    darkRgb: '4, 122, 58',
    deepRgb: '5, 46, 22'
  },
  {
    id: 'teal',
    label: 'Moviy yashil',
    primary: '#14b8a6',
    dark: '#02645c',
    deep: '#013f3a',
    soft: '#dffaf6',
    muted: '#f2fffd',
    rgb: '20, 184, 166',
    darkRgb: '2, 100, 92',
    deepRgb: '1, 63, 58'
  },
  {
    id: 'sky',
    label: "Och ko'k",
    primary: '#1683f5',
    dark: '#0f5ec7',
    deep: '#082f49',
    soft: '#e0f2fe',
    muted: '#f0f9ff',
    rgb: '22, 131, 245',
    darkRgb: '15, 94, 199',
    deepRgb: '8, 47, 73'
  },
  {
    id: 'amber',
    label: "To'q sariq",
    primary: '#f97316',
    dark: '#c2410c',
    deep: '#451a03',
    soft: '#fef3c7',
    muted: '#fffbeb',
    rgb: '249, 115, 22',
    darkRgb: '194, 65, 12',
    deepRgb: '69, 26, 3'
  },
  {
    id: 'cyan',
    label: 'Sian',
    primary: '#2aa8b0',
    dark: '#0e7490',
    deep: '#164e63',
    soft: '#cffafe',
    muted: '#ecfeff',
    rgb: '42, 168, 176',
    darkRgb: '14, 116, 144',
    deepRgb: '22, 78, 99'
  },
  {
    id: 'emerald',
    label: 'Zumrad',
    primary: '#06a65a',
    dark: '#047857',
    deep: '#064e3b',
    soft: '#d1fae5',
    muted: '#ecfdf5',
    rgb: '6, 166, 90',
    darkRgb: '4, 120, 87',
    deepRgb: '6, 78, 59'
  }
];

function normalizeColor(value, fallback) {
  const color = String(value || '').trim();
  if (/^#[\da-f]{6}$/i.test(color)) return color;
  if (/^#[\da-f]{3}$/i.test(color)) return `#${[...color.slice(1)].map((digit) => digit + digit).join('')}`;
  return fallback;
}

function colorChannels(color) {
  return [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16));
}

function mixColor(color, target, amount) {
  const targetChannels = colorChannels(target);
  return `#${colorChannels(color).map((channel, index) =>
    Math.round(channel * (1 - amount) + targetChannels[index] * amount).toString(16).padStart(2, '0')
  ).join('')}`;
}

function getSavedThemeId() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function normalizeTheme(theme = {}, fallback = THEMES[0]) {
  const source = theme.palette || theme;
  const preset = THEMES.find((item) => item.id === theme.id) || fallback;
  const primary = normalizeColor(source.primary, preset.primary);
  const isPresetColor = primary.toLowerCase() === preset.primary.toLowerCase();
  const dark = normalizeColor(source.dark || source.primaryDark, isPresetColor ? preset.dark : mixColor(primary, '#000000', 0.3));
  const deep = normalizeColor(source.deep || source.primaryDeep, isPresetColor ? preset.deep : mixColor(primary, '#000000', 0.65));

  return {
    id: String(theme.id || source.id || fallback.id),
    label: String(theme.label || source.label || fallback.label),
    primary,
    dark,
    deep,
    soft: normalizeColor(source.soft || source.primarySoft, isPresetColor ? preset.soft : mixColor(primary, '#ffffff', 0.86)),
    muted: normalizeColor(source.muted || source.primaryMuted, isPresetColor ? preset.muted : mixColor(primary, '#ffffff', 0.96)),
    rgb: colorChannels(primary).join(', '),
    darkRgb: colorChannels(dark).join(', '),
    deepRgb: colorChannels(deep).join(', ')
  };
}

function buildThemeList(setting) {
  setting = setting?.data || setting;
  const configuredThemes = Array.isArray(setting?.themes) ? setting.themes : [];
  const customTheme = setting?.palette || setting?.primary ? [setting] : [];
  const list = configuredThemes.length ? configuredThemes : customTheme;

  if (!list.length) {
    return THEMES;
  }

  return list.map((theme, index) => normalizeTheme(theme, THEMES[index] || THEMES[0]));
}

function applyTheme(theme) {
  const root = document.documentElement;
  const highlight = mixColor(theme.primary, '#ffffff', 0.5);

  root.style.setProperty('--brand-primary', theme.primary);
  root.style.setProperty('--brand-primary-dark', theme.dark);
  root.style.setProperty('--brand-primary-deep', theme.deep);
  root.style.setProperty('--brand-primary-soft', theme.soft);
  root.style.setProperty('--brand-primary-muted', theme.muted);
  root.style.setProperty('--brand-primary-highlight', highlight);
  root.style.setProperty('--theme-primary-rgb', theme.rgb);
  root.style.setProperty('--theme-dark-rgb', theme.darkRgb);
  root.style.setProperty('--theme-deep-rgb', theme.deepRgb);
  root.style.setProperty('--theme-highlight-rgb', colorChannels(highlight).join(', '));
  root.style.setProperty('--theme-soft-rgb', colorChannels(theme.soft).join(', '));
  root.style.setProperty('--theme-muted-rgb', colorChannels(theme.muted).join(', '));
  root.style.setProperty('--text-on-brand', '#ffffff');
  root.style.setProperty('--heading-color', theme.deep);
  root.style.setProperty('--link-color', theme.dark);
  root.style.setProperty('--hover-color', theme.deep);
  root.style.setProperty('--surface', '#ffffff');
  root.style.setProperty('--surface-tint', theme.muted);
  root.style.setProperty('--surface-soft', mixColor(theme.primary, '#ffffff', 0.98));
  root.style.setProperty('--surface-border', mixColor(theme.primary, '#ffffff', 0.84));
  root.style.setProperty('--surface-border-strong', mixColor(theme.primary, '#ffffff', 0.5));
  root.style.setProperty('--page-bg-start', '#ffffff');
  root.style.setProperty('--page-bg-end', theme.muted);
  root.style.setProperty('--shadow-brand', `rgba(${theme.rgb}, 0.14)`);
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-dark', theme.dark);
  root.style.setProperty('--color-primary-light', theme.soft);
  root.style.setProperty('--color-accent', theme.primary);
  root.style.setProperty('--color-text', 'var(--text-primary)');
  root.style.setProperty('--color-text-light', 'var(--text-secondary)');
  root.style.setProperty('--color-border', 'var(--surface-border)');
  root.dataset.themeColor = theme.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.primary);
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return THEMES[0];
  }

  const savedTheme = getSavedThemeId();
  return THEMES.find((theme) => theme.id === savedTheme) || THEMES[0];
}

export default function ThemeColorSwitcher() {
  const { item: themeSetting } = useSetting('site-theme', {
    revalidate: true
  });
  const themes = React.useMemo(() => buildThemeList(themeSetting), [themeSetting]);
  const [selectedTheme, setSelectedTheme] = React.useState(getInitialTheme);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasAutoShownRef = React.useRef(false);
  const userSelectedThemeId = React.useRef('');

  React.useEffect(() => {
    const savedTheme = userSelectedThemeId.current || getSavedThemeId();
    const themeConfig = themeSetting?.data || themeSetting;
    const defaultThemeId = themeConfig?.defaultTheme || themeConfig?.themeId || themeConfig?.activeTheme;
    const nextTheme =
      themes.find((theme) => theme.id === savedTheme) ||
      themes.find((theme) => theme.id === defaultThemeId) ||
      themes[0] ||
      THEMES[0];

    setSelectedTheme(nextTheme);
  }, [themeSetting, themes]);

  React.useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  React.useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 140;

      setIsVisible(shouldShow);

      if (shouldShow && !hasAutoShownRef.current) {
        hasAutoShownRef.current = true;
        setIsExpanded(true);
      }

      if (!shouldShow) {
        setIsExpanded(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (!isVisible || !isExpanded) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      setIsExpanded(false);
    }, 2000);

    return () => window.clearTimeout(closeTimer);
  }, [isVisible, isExpanded, selectedTheme.id]);

  const handleThemeSelect = (theme) => {
    userSelectedThemeId.current = theme.id;
    setSelectedTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme.id);
    } catch {
      // The selected palette still applies when browser storage is unavailable.
    }
  };

  return (
    <>
      <div
        className={`theme-color-switcher${
          isVisible && isExpanded ? ' is-visible' : ''
        }`}
        aria-label="Sayt rangini tanlash"
      >
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-color-swatch${
              selectedTheme.id === theme.id ? ' is-active' : ''
            }`}
            style={{ '--swatch-color': theme.primary, '--swatch-dark': theme.dark }}
            aria-label={theme.label}
            aria-pressed={selectedTheme.id === theme.id}
            title={theme.label}
            onClick={() => handleThemeSelect(theme)}
          />
        ))}
      </div>

      <button
        type="button"
        className={`theme-color-toggle${
          isVisible && !isExpanded ? ' is-visible' : ''
        }`}
        aria-label="Ranglarni ochish"
        onClick={() => setIsExpanded(true)}
      >
        <span aria-hidden="true">&gt;</span>
      </button>
    </>
  );
}
