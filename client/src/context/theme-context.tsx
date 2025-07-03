import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';

interface ThemeContextType {
  theme: 'system' | 'light' | 'dark';
  background: 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'gradient-aurora' | 'gradient-fire' | 'gradient-mint' | string;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setBackground: (background: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('light');
  const [background, setBackground] = useState<string>('gradient-subtle');

  // Load theme preferences from user data
  useEffect(() => {
    if (user) {
      const userTheme = (user.theme as 'system' | 'light' | 'dark') || 'light';
      const userBackground = user.background || 'gradient-subtle';
      
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
    body.classList.remove('bg-white', 'bg-pink', 'bg-green', 'bg-blue', 'bg-purple', 'bg-orange', 'bg-gradient-subtle', 'bg-gradient-sunset', 'bg-gradient-ocean', 'bg-gradient-forest', 'bg-gradient-aurora', 'bg-gradient-fire', 'bg-gradient-mint');
    
    // Remove any existing custom background styles
    body.style.removeProperty('background-image');
    body.style.removeProperty('background-size');
    body.style.removeProperty('background-position');
    body.style.removeProperty('background-attachment');
    
    // Handle custom image backgrounds
    if (background.startsWith('custom-image-')) {
      const imageName = background.replace('custom-image-', '');
      body.style.backgroundImage = `url('/backgrounds/${imageName}')`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
    } else {
      // Add predefined background class
      body.classList.add(`bg-${background}`);
    }
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