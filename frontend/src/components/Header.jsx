import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { LogOut, User, Menu, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Закрываем меню темы при клике снаружи
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-3 sm:px-6 flex items-center justify-between gap-2 theme-transition safe-top">
      {/* Кнопка мобильного меню */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
        aria-label={isSidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={isSidebarOpen}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Лого для мобильных */}
      <div className="lg:hidden flex-1 text-center">
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">Дош-ло</span>
      </div>

      {/* Пустое пространство для десктопа */}
      <div className="hidden lg:block flex-1"></div>

      {/* Правая часть */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Переключатель темы */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            aria-label="Переключить тему"
            aria-expanded={themeMenuOpen}
          >
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {/* Dropdown меню темы */}
          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
              <button
                onClick={() => {
                  setLightTheme();
                  setThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  theme === 'light' && localStorage.getItem('theme')
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Светлая</span>
              </button>
              <button
                onClick={() => {
                  setDarkTheme();
                  setThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  theme === 'dark' && localStorage.getItem('theme')
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Тёмная</span>
              </button>
              <button
                onClick={() => {
                  setSystemTheme();
                  setThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  !localStorage.getItem('theme')
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Системная</span>
              </button>
            </div>
          )}
        </div>

        {/* Информация о пользователе */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          <span className="font-medium text-gray-900 dark:text-slate-100 truncate max-w-[100px] md:max-w-none">
            {user?.name}
          </span>
          <span className="text-gray-500 dark:text-slate-500 hidden md:inline">•</span>
          <span className="text-primary-600 dark:text-primary-400 font-medium hidden md:inline">
            {user?.ai_credits_left} кредитов
          </span>
        </div>

        {/* Мобильный индикатор кредитов */}
        <div className="sm:hidden text-xs text-primary-600 dark:text-primary-400 font-medium">
          {user?.ai_credits_left} AI
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Выйти"
          aria-label="Выйти из аккаунта"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
