import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Package, ArrowRightLeft, BarChart3, Settings, Sun, Moon } from 'lucide-react';

const titles = { '/': 'Дашборд', '/inventory': 'Запасы', '/transactions': 'Движение', '/reports': 'Отчёты', '/settings': 'Настройки' };

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Главная' },
  { to: '/inventory', icon: Package, label: 'Запасы' },
  { to: '/transactions', icon: ArrowRightLeft, label: 'Движение' },
  { to: '/reports', icon: BarChart3, label: 'Отчёты' },
  { to: '/settings', icon: Settings, label: 'Ещё' },
];

export function MobileLayout() {
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <header className="mobile-header">
        <h1>{titles[pathname] || 'СкладПро'}</h1>
        <button className="btn-icon" onClick={toggleTheme}>
          {isDark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </header>
      <main className="mobile-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to==='/'} className={({isActive})=>`tab-item ${isActive?'active':''}`}>
            <t.icon size={22}/>
            <span>{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
