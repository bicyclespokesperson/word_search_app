import { useState, useEffect } from 'react';
import type { Theme } from '../types';

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    surface: '#ced4da', // Darker grey for better contrast
    text: '#212529',
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
    targetWordHighlight: '#007bff',
    bonusWordHighlight: '#28a745',
    selectionHighlight: '#ffc107',
    answerHighlight: '#9b59b6'
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
    selectionHighlight: '#ffd43b',
    answerHighlight: '#c69ae6'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved preference first, fallback to system preference
    const savedTheme = localStorage.getItem('word-search-theme');
    if (savedTheme === 'light') return lightTheme;
    if (savedTheme === 'dark') return darkTheme;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? darkTheme : lightTheme;
  });

  const [isManualOverride, setIsManualOverride] = useState(() => {
    return localStorage.getItem('word-search-theme') !== null;
  });

  useEffect(() => {
    // Only listen to system changes if user hasn't manually set a preference
    if (isManualOverride) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? darkTheme : lightTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isManualOverride]);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme.name === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    setIsManualOverride(true);
    localStorage.setItem('word-search-theme', newTheme.name);
  };

  const resetToSystemTheme = () => {
    setIsManualOverride(false);
    localStorage.removeItem('word-search-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? darkTheme : lightTheme);
  };

  return { theme, toggleTheme, resetToSystemTheme, isManualOverride };
};