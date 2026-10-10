import React from 'react';

import {
  DEFAULT_LANGUAGE_CODE,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  getCurrentLanguageCode,
  normalizeLanguageCode,
  syncCurrentLanguageCode
} from '../utils/language';

const LanguageContext = React.createContext({
  currentLanguageCode: DEFAULT_LANGUAGE_CODE,
  currentLanguage: LANGUAGE_OPTIONS[0],
  languageOptions: LANGUAGE_OPTIONS,
  setLanguage: () => {}
});

export function LanguageProvider({ children }) {
  const [currentLanguageCode, setCurrentLanguageCode] = React.useState(() =>
    getCurrentLanguageCode()
  );

  React.useEffect(() => {
    const nextCode = syncCurrentLanguageCode(currentLanguageCode);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextCode);
      } catch (error) {
        console.error('Failed to persist language:', error);
      }
    }
  }, [currentLanguageCode]);

  const value = React.useMemo(() => {
    const currentLanguage =
      LANGUAGE_OPTIONS.find((item) => item.code === currentLanguageCode) ||
      LANGUAGE_OPTIONS[0];

    return {
      currentLanguageCode,
      currentLanguage,
      languageOptions: LANGUAGE_OPTIONS,
      setLanguage: (language) => {
        const nextCode =
          typeof language === 'string' ? language : language?.code || DEFAULT_LANGUAGE_CODE;
        const normalizedCode = normalizeLanguageCode(nextCode);

        syncCurrentLanguageCode(normalizedCode);
        setCurrentLanguageCode(normalizedCode);
      }
    };
  }, [currentLanguageCode]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
