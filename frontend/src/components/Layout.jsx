import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Закрываем сайдбар при изменении размера экрана на десктоп
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Блокируем скролл body когда мобильное меню открыто
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Overlay для мобильного меню */}
      {sidebarOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Боковая панель */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 safe-bottom">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
