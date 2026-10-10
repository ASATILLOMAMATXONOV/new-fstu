export const DEFAULT_LANGUAGE_CODE = 'uz';
export const LANGUAGE_STORAGE_KEY = 'fstu-language';

export const LANGUAGE_OPTIONS = [
  {
    code: 'uz',
    label: 'UZ',
    name: 'O‘zbekcha'
  },
  {
    code: 'ru',
    label: 'RU',
    name: 'Русский'
  },
  {
    code: 'en',
    label: 'EN',
    name: 'English'
  }
];

export function normalizeLanguageCode(code) {
  const nextCode = String(code || '').trim().toLowerCase();

  return LANGUAGE_OPTIONS.some((item) => item.code === nextCode)
    ? nextCode
    : DEFAULT_LANGUAGE_CODE;
}

function resolveInitialLanguageCode() {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE_CODE;
  }

  try {
    return normalizeLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch (error) {
    return DEFAULT_LANGUAGE_CODE;
  }
}

let currentLanguageCode = resolveInitialLanguageCode();

export function getCurrentLanguageCode() {
  return currentLanguageCode;
}

export function syncCurrentLanguageCode(code) {
  currentLanguageCode = normalizeLanguageCode(code);

  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLanguageCode;
  }

  return currentLanguageCode;
}

export function getIntlLocaleForLanguage(code = DEFAULT_LANGUAGE_CODE) {
  const normalizedCode = normalizeLanguageCode(code);

  if (normalizedCode === 'ru') {
    return 'ru-RU';
  }

  if (normalizedCode === 'en') {
    return 'en-US';
  }
return 'uz-UZ';
}
