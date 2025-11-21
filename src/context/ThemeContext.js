import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const ThemeContext = createContext(null);

const THEME_KEY = 'app:theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const systemTheme = Appearance.getColorScheme() || 'light';
        setTheme(systemTheme);
      }
    } catch (error) {
      // Default to light theme
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const setThemeMode = async (mode) => {
    setTheme(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  };

  const isDark = theme === 'dark';

  const colors = {
    background: isDark ? '#111827' : '#ffffff',
    backgroundSecondary: isDark ? '#1F2937' : '#F9FAFB',
    text: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    card: isDark ? '#1F2937' : '#ffffff',
    primary: '#4F46E5',
    primaryText: '#ffffff',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode, colors, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
