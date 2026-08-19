'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('wb_theme') || 'system';
    setThemeState(savedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const computeIsDark = (currentTheme) => {
      if (currentTheme === 'dark') return true;
      if (currentTheme === 'light') return false;
      return mediaQuery.matches;
    };

    const dark = computeIsDark(savedTheme);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleChange = () => {
      if (savedTheme === 'system') {
        const darkSystem = mediaQuery.matches;
        setIsDark(darkSystem);
        if (darkSystem) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('wb_theme', newTheme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const dark = newTheme === 'dark' || (newTheme === 'system' && mediaQuery.matches);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
