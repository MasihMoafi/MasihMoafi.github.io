import { Moon } from 'lucide-react';

interface ThemeSelectorProps {
  onThemeChange: (theme: 'sunny' | 'gloomy' | 'dark-gloomy') => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const toggleTheme = (theme: 'sunny' | 'gloomy' | 'dark-gloomy') => {
    onThemeChange(theme);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Sunny Theme Button */}
      <button
        onClick={() => toggleTheme('sunny')}
        className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <span role="img" aria-label="Sunny">☀️</span>
      </button>

      {/* Gloomy Theme Button */}
      <button
        onClick={() => toggleTheme('gloomy')}
        className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <span role="img" aria-label="Gloomy">🌧️</span>
      </button>

      {/* Dark Gloomy Theme Button */}
      <button
        onClick={() => toggleTheme('dark-gloomy')}
        className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <Moon className="w-6 h-6 text-gray-400" />
      </button>
    </div>
  );
};

export default ThemeSelector;
