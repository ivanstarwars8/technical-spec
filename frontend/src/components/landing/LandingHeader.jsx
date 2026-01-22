import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu } from 'lucide-react';
import { landingButtonClasses } from './LandingButton';

const navItems = [
  { href: '#features', label: 'Возможности' },
  { href: '#ai', label: 'AI-генератор' },
  { href: '#pricing', label: 'Цены' },
  { href: '#contact', label: 'Контакты' },
];

export const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Дош-ло</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-gray-600 hover:text-gray-900 transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className={landingButtonClasses({ variant: 'ghost' })}>
              Войти
            </Link>
            <Link
              to="/register"
              className={landingButtonClasses({ className: 'bg-blue-600 hover:bg-blue-700 text-white' })}
            >
              Начать бесплатно
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Открыть меню"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="block text-gray-600 hover:text-gray-900">
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              <Link to="/login" className={landingButtonClasses({ variant: 'outline', className: 'w-full' })}>
                Войти
              </Link>
              <Link
                to="/register"
                className={landingButtonClasses({ className: 'bg-blue-600 hover:bg-blue-700 text-white w-full' })}
              >
                Начать бесплатно
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
