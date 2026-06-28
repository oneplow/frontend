import { Moon, Sun } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';
import { siteCopy } from '../content/siteCopy';

interface AppControlsProps {
  compact?: boolean;
}

export const AppControls = ({ compact = false }: AppControlsProps) => {
  const { theme, toggleTheme, language, setLanguage } = useAppSettings();
  const copy = siteCopy[language];

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      <div className="app-panel-subtle inline-flex items-center gap-1 rounded-full p-1">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
          aria-label={copy.controls.english}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('th')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            language === 'th'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
          aria-label={copy.controls.thai}
        >
          TH
        </button>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className={`app-button-secondary inline-flex items-center justify-center rounded-full ${
          compact ? 'h-10 w-10' : 'h-11 w-11'
        }`}
        aria-label={copy.controls.switchTheme}
        title={theme === 'light' ? copy.controls.darkMode : copy.controls.lightMode}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
};
