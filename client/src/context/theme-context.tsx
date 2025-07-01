import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';

export type BackgroundOption = 'white' | 'pink' | 'green' | 'blue' | 'purple' | 'orange' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'custom-image';

interface ThemeContextType {
  theme: 'system' | 'light' | 'dark';
  background: BackgroundOption;
  customImageUrl?: string;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setBackground: (background: BackgroundOption, customImageUrl?: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'system' | 'light' | 'dark'>('system');
  const [background, setBackgroundState] = useState<BackgroundOption>('white');
  const [customImageUrl, setCustomImageUrl] = useState<string>();

  const setTheme = useCallback((newTheme: 'system' | 'light' | 'dark') => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const setBackground = useCallback((newBackground: BackgroundOption, newCustomImageUrl?: string) => {
    setBackgroundState(newBackground);
    setCustomImageUrl(newCustomImageUrl);

    // Remove all background classes
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('bg-'))
      .join(' ');

    // Add new background class
    document.body.classList.add(`bg-${newBackground}`);

    // Apply custom image if provided
    if (newBackground === 'custom-image' && newCustomImageUrl) {
      document.body.style.backgroundImage = `url(${newCustomImageUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      background,
      customImageUrl,
      setTheme,
      setBackground,
    }}>
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