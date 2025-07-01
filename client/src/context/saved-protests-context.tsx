
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Protest } from '@shared/schema';

interface SavedProtestsContextType {
  savedProtests: Protest[];
  isProtestSaved: (protestId: string) => boolean;
  saveProtest: (protest: Protest) => void;
  unsaveProtest: (protestId: string) => void;
}

const SavedProtestsContext = createContext<SavedProtestsContextType | undefined>(undefined);

export function SavedProtestsProvider({ children }: { children: React.ReactNode }) {
  const [savedProtests, setSavedProtests] = useState<Protest[]>([]);

  // Load saved protests from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('corteo_saved_protests');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSavedProtests(parsed);
      } catch (error) {
        console.error('Error parsing saved protests:', error);
      }
    }
  }, []);

  // Save to localStorage whenever savedProtests changes
  useEffect(() => {
    localStorage.setItem('corteo_saved_protests', JSON.stringify(savedProtests));
  }, [savedProtests]);

  const isProtestSaved = (protestId: string) => {
    return savedProtests.some(protest => protest.id === protestId);
  };

  const saveProtest = (protest: Protest) => {
    setSavedProtests(prev => {
      if (prev.some(p => p.id === protest.id)) {
        return prev; // Already saved
      }
      return [...prev, protest];
    });
  };

  const unsaveProtest = (protestId: string) => {
    setSavedProtests(prev => prev.filter(protest => protest.id !== protestId));
  };

  return (
    <SavedProtestsContext.Provider value={{
      savedProtests,
      isProtestSaved,
      saveProtest,
      unsaveProtest
    }}>
      {children}
    </SavedProtestsContext.Provider>
  );
}

export function useSavedProtests() {
  const context = useContext(SavedProtestsContext);
  if (context === undefined) {
    throw new Error('useSavedProtests must be used within a SavedProtestsProvider');
  }
  return context;
}
