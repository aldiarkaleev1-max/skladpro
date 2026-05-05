import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Search } from 'lucide-react';

export function Header({ title }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="header">
      <h1 className="header-title">{title || 'Обзор'}</h1>
      <div className="header-right">
        <button className="btn-icon" onClick={toggleTheme} title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
