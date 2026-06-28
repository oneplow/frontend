import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'en' | 'th';

interface AppSettingsContextType {
  theme: AppTheme;
  language: AppLanguage;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
}

const THEME_STORAGE_KEY = 'APP_THEME';
const LANGUAGE_STORAGE_KEY = 'APP_LANGUAGE';

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const applyThemeToDocument = (theme: AppTheme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = theme === 'dark' ? '#0f1115' : '#f5f7fb';

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#0f1115' : '#f5f7fb');
  }
};

const getInitialTheme = (): AppTheme => {
  const presetTheme = document.documentElement.dataset.theme;
  if (presetTheme === 'light' || presetTheme === 'dark') {
    return presetTheme;
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialLanguage = (): AppLanguage => {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === 'en' || savedLanguage === 'th') {
    return savedLanguage;
  }

  return navigator.language.toLowerCase().startsWith('th') ? 'th' : 'en';
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<AppSettingsContextType>(
    () => ({
      theme,
      language,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
      setLanguage: setLanguageState,
      toggleLanguage: () => setLanguageState((currentLanguage) => (currentLanguage === 'en' ? 'th' : 'en')),
    }),
    [theme, language],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }

  return context;
};
