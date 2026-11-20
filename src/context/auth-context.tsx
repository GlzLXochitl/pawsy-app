import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface UsuarioAuth {
  id: number;
  nombre_usuario: string;
}

interface AuthContextType {
  user: UsuarioAuth | null;
  isLoggedIn: boolean;
  signIn: (userData: UsuarioAuth) => void;
  signOut: () => void;
}

const STORAGE_KEY = '@pawsy_auth_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioAuth | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: UsuarioAuth = JSON.parse(saved);
          if (parsed?.id) {
            setUser(parsed);
            setIsLoggedIn(true);
          }
        }
      } catch (e) {
        console.error('Error leyendo sesión:', e);
      }
    }
  }, []);

  const signIn = (userData: UsuarioAuth) => {
    setUser(userData);
    setIsLoggedIn(true);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  };

  const signOut = () => {
    setUser(null);
    setIsLoggedIn(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}