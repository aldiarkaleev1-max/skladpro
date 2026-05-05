import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Package, ArrowRightLeft, BarChart3, Settings, Sun, Moon, Users } from 'lucide-react';

const pageTitles = {
  '/': 'Главная панель',
  '/inventory': 'Управление запасами',
  '/transactions': 'Движение товаров',
  '/suppliers': 'Поставщики',
  '/reports': 'Отчёты',
  '/settings': 'Настройки',
};

const mobileTitles = {
  '/': 'Дашборд',
  '/inventory': 'Запасы',
  '/transactions': 'Движение',
  '/suppliers': 'Поставщики',
  '/reports': 'Отчёты',
  '/settings': 'Настройки',
};

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Главная' },
  { to: '/inventory', icon: Package, label: 'Запасы' },
  { to: '/transactions', icon: ArrowRightLeft, label: 'Движение' },
  { to: '/suppliers', icon: Users, label: 'Поставщики' },
  { to: '/reports', icon: BarChart3, label: 'Отчёты' },
  { to: '/settings', icon: Settings, label: 'Ещё' },
];

export function Layout() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const { isDark, toggleTheme } = useTheme();

  if (isMobile) {
    return (
      <div className="mobile-app">
        <header className="mobile-header">
          <h1>{mobileTitles[pathname] || 'СкладПро'}</h1>
          <button className="btn-icon" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="mobile-content">
          <Outlet />
        </main>
        <nav className="bottom-nav">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
            >
              <t.icon size={22} />
              <span>{t.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header title={pageTitles[pathname] || 'СкладПро'} />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
