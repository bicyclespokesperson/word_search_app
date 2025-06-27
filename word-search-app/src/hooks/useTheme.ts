import { useState, useEffect } from 'react';
import type { Theme } from '../types';

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
    targetWordHighlight: '#007bff',
    bonusWordHighlight: '#28a745',
    selectionHighlight: '#ffc107'
  }
};

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    primary: '#4dabf7',
    secondary: '#adb5bd',
    accent: '#51cf66',
    targetWordHighlight: '#4dabf7',
    bonusWordHighlight: '#51cf66',
    selectionHighlight: '#ffd43b'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? darkTheme : lightTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current.name === 'light' ? darkTheme : lightTheme);
  };

  return { theme, toggleTheme };
};