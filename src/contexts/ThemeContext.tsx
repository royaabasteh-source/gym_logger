'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settings = useSettings();
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const applyTheme = (t: 'light' | 'dark' | 'system') => {
      let finalTheme: 'light' | 'dark' = 'light';
      if (t === 'system') {
        finalTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        finalTheme = t;
      }
      setThemeState(finalTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(finalTheme);
    };

    applyTheme(settings.settings?.theme || 'system');
    
    if (settings.settings?.theme === 'system') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (e: MediaQueryListEvent) => {
            applyTheme('system');
        };
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }
  }, [settings.settings?.theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: settings.updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
