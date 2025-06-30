import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';

interface ThemeContextType {
  theme: 'system' | 'light' | 'dark';
  background: 'white' | 'pink' | 'green';
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setBackground: (background: 'white' | 'pink' | 'green') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [background, setBackground] = useState<'white' | 'pink' | 'green'>('white');

  // Load theme preferences from user data
  useEffect(() => {
    if (user) {
      const userTheme = (user.theme as 'system' | 'light' | 'dark') || 'system';
      const userBackground = (user.background as 'white' | 'pink' | 'green') || 'white';
      
      setTheme(userTheme);
      setBackground(userBackground);
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Apply background to body
  useEffect(() => {
    const body = document.body;
    
    // Remove existing background classes
    body.classList.remove('bg-white', 'bg-pink', 'bg-green');
    
    // Add current background class
    body.classList.add(`bg-${background}`);
  }, [background]);

  return (
    <ThemeContext.Provider value={{ theme, background, setTheme, setBackground }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}