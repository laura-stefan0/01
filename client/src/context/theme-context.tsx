import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';

interface ThemeContextType {
  theme: 'system' | 'light' | 'dark';
  background: 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image';
  customImageUrl: string | null;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setBackground: (background: 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image') => void;
  setCustomImageUrl: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [background, setBackground] = useState<'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image'>('white');
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  // Load theme preferences from user data
  useEffect(() => {
    if (user) {
      const userTheme = (user.theme as 'system' | 'light' | 'dark') || 'system';
      const userBackground = (user.background as 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image') || 'white';
      const userCustomImageUrl = user.custom_background_url || null;
      
      setTheme(userTheme);
      setBackground(userBackground);
      setCustomImageUrl(userCustomImageUrl);
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
    
    // Remove existing background classes and custom styles
    body.classList.remove('bg-white', 'bg-pink', 'bg-green', 'bg-blue', 'bg-purple', 'bg-orange', 'bg-gradient-sunset', 'bg-gradient-ocean', 'bg-gradient-forest', 'bg-custom-image');
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundAttachment = '';
    
    if (background === 'custom-image' && customImageUrl) {
      // Apply custom background image
      body.classList.add('bg-custom-image');
      body.style.backgroundImage = `url(${customImageUrl})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
    } else {
      // Add current background class
      body.classList.add(`bg-${background}`);
    }
  }, [background, customImageUrl]);

  return (
    <ThemeContext.Provider value={{ theme, background, customImageUrl, setTheme, setBackground, setCustomImageUrl }}>
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