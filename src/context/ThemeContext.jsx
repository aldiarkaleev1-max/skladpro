import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const item = window.localStorage.getItem('inventory-theme-dark');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('inventory-theme-dark', JSON.stringify(isDark));
    } catch (e) {}
    
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
