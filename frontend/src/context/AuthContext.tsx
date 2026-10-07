import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/api/client';

// ── Types ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ── Provider ──────────────────────────────────────────────────────────

/**
 * Wraps the whole app. Persists the JWT and user profile in AsyncStorage
 * so the session survives app restarts.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load persisted session on startup
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // Storage read failed — treat as logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** Authenticate, persist the token + user, and update state. */
  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/api/auth/login', { email, password });
    const { token: newToken, ...profile } = res.data.data as { token: string } & AuthUser;
    await persist(newToken, profile as AuthUser);
  };

  /** Register a new STUDENT account and log them in immediately. */
  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient.post('/api/auth/register', { name, email, password });
    const { token: newToken, ...profile } = res.data.data as { token: string } & AuthUser;
    await persist(newToken, profile as AuthUser);
  };

  /** Clear the session from memory and AsyncStorage. */
  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  };

  // ── Private helper ────────────────────────────────────────────────

  const persist = async (newToken: string, newUser: AuthUser) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────

/** Access auth state and actions from any component. */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
