import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/api/client';

// ── Types ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  login: (identifier: string, password: string, portal: 'STUDENT' | 'STAFF_ADMIN') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const GUEST_KEY = 'auth_guest';

// ── Provider ──────────────────────────────────────────────────────────

/**
 * Wraps the whole app. Persists the JWT and user profile in AsyncStorage
 * so the session survives app restarts.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load persisted session on startup
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser, savedGuest] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(GUEST_KEY),
        ]);
        if (savedGuest === 'true') {
          setIsGuest(true);
        } else if (savedToken && savedUser) {
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
  const login = async (identifier: string, password: string, portal: 'STUDENT' | 'STAFF_ADMIN') => {
    const res = await apiClient.post('/api/auth/login', { identifier, password, portal });
    const { token: newToken, ...profile } = res.data.data as { token: string } & AuthUser;
    await persist(newToken, profile as AuthUser);
    setIsGuest(false);
    await AsyncStorage.removeItem(GUEST_KEY);
  };

  /** Register a new user — does NOT log the user in. The caller must redirect to login. */
  const register = async (name: string, email: string, password: string) => {
    await apiClient.post('/api/auth/register', { name, email, password });
    // Registration succeeds but does NOT log the user in.
    // The user must sign in manually from the login screen.
  };

  /** Set guest mode */
  const loginAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    setIsGuest(true);
  };

  /** Clear the session from memory and AsyncStorage. */
  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, GUEST_KEY]);
    setToken(null);
    setUser(null);
    setIsGuest(false);
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
    <AuthContext.Provider value={{ user, token, isGuest, loading, login, register, loginAsGuest, logout }}>
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
