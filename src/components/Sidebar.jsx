import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowRightLeft, Users, BarChart3, Settings, Box } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Дашборд' },
    { to: '/inventory', icon: <Package size={20} />, label: 'Запасы' },
    { to: '/transactions', icon: <ArrowRightLeft size={20} />, label: 'Движение' },
    { to: '/suppliers', icon: <Users size={20} />, label: 'Поставщики' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Отчёты' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Настройки' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Box size={22} />
        </div>
        <span className="sidebar-title">СкладПро</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">© 2026 СкладПро v2.0</div>
    </aside>
  );
}
