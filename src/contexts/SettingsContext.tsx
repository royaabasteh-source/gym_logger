'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getUserSettings, updateUserSettings, UserSettings } from '@/lib/firestore';

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  updateUnit: (unit: 'kg' | 'lbs') => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadSettings = async () => {
        const loadedSettings = await getUserSettings(user.uid);
        setSettings(loadedSettings || { theme: 'system', unit: 'kg' });
        setLoading(false);
      };
      loadSettings();
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    if (user) {
      const newSettings = { ...settings!, theme };
      setSettings(newSettings);
      await updateUserSettings(user.uid, { theme });
    }
  };

  const updateUnit = async (unit: 'kg' | 'lbs') => {
    if (user) {
      const newSettings = { ...settings!, unit };
      setSettings(newSettings);
      await updateUserSettings(user.uid, { unit });
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateTheme, updateUnit }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
