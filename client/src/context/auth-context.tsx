import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  notifications: boolean;
  location: boolean;
  emails: boolean;
  language: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already signed in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('corteo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('corteo_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll accept the demo credentials or any valid-looking credentials
      if ((username === 'alex_rodriguez' && password === 'password123') || 
          (username.length > 0 && password.length > 0)) {
        
        // Get user profile from API
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('corteo_user', JSON.stringify(userData));
        } else {
          throw new Error('Failed to get user profile');
        }
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Create user account via API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password, // Server will hash this
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // After successful registration, sign the user in
      await signIn(username, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('corteo_user');
    // Redirect to sign-in page after sign out
    window.location.href = '/sign-in';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}