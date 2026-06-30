import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { api } from '../api/client';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'cybershield_users';
const AUTH_KEY = 'cybershield_auth';
const TOKEN_KEY = 'cybershield_token';

function getStoredUsers(): Record<string, { name: string; email: string; password: string; user: User }> {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { }
  return {};
}

function storeUsers(users: Record<string, { name: string; email: string; password: string; user: User }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveAuthState(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

function clearAuthState() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function saveUserToLocalStore(name: string, email: string, password: string, user: User) {
  const users = getStoredUsers();
  users[email.toLowerCase()] = { name, email: email.toLowerCase(), password, user };
  storeUsers(users);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...parsed, isLoading: false };
      }
    } catch { }
    return { user: null, token: null, isAuthenticated: false, isLoading: true };
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.auth.me()
        .then((user: User) => {
          const newState = { user, token, isAuthenticated: true, isLoading: false };
          setState(newState);
          saveAuthState(newState);
        })
        .catch(() => {
          const stored = localStorage.getItem(AUTH_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.isAuthenticated && parsed.user) {
                setState({ ...parsed, isLoading: false });
                return;
              }
            } catch { }
          }
          clearAuthState();
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const localRegister = useCallback((name: string, email: string, password: string): boolean => {
    const users = getStoredUsers();
    const key = email.toLowerCase();
    if (users[key]) return false;

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: key,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      totalScans: 0,
      threatDetected: 0,
    };

    saveUserToLocalStore(name, email, password, newUser);

    const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email, exp: Date.now() + 86400000 }));
    const newState = { user: newUser, token, isAuthenticated: true, isLoading: false };
    setState(newState);
    saveAuthState(newState);
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  }, []);

  const localLogin = useCallback((email: string, password: string): boolean => {
    const users = getStoredUsers();
    const stored = users[email.toLowerCase()];
    if (stored && stored.password === password) {
      const user = { ...stored.user, lastLogin: new Date().toISOString() };
      saveUserToLocalStore(stored.name, stored.email, stored.password, user);

      const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 86400000 }));
      const newState = { user, token, isAuthenticated: true, isLoading: false };
      setState(newState);
      saveAuthState(newState);
      localStorage.setItem(TOKEN_KEY, token);
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.register(name, email, password);
      const { token, user } = response;
      const newState = { user, token, isAuthenticated: true, isLoading: false };
      setState(newState);
      saveAuthState(newState);
      localStorage.setItem(TOKEN_KEY, token);
      // Also save to localStorage for offline fallback
      saveUserToLocalStore(name, email, password, user);
      return true;
    } catch {
      return localRegister(name, email, password);
    }
  }, [localRegister]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(email, password);
      const { token, user } = response;
      const newState = { user, token, isAuthenticated: true, isLoading: false };
      setState(newState);
      saveAuthState(newState);
      localStorage.setItem(TOKEN_KEY, token);
      // Also save to localStorage for offline fallback
      const users = getStoredUsers();
      const key = email.toLowerCase();
      if (users[key]) {
        saveUserToLocalStore(users[key].name, email, password, user);
      }
      return true;
    } catch {
      return localLogin(email, password);
    }
  }, [localLogin]);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    clearAuthState();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const user = await api.auth.updateProfile(updates.name || '', updates.email || '');
      setState(prev => {
        if (!prev.user) return prev;
        const newState = { ...prev, user };
        saveAuthState(newState);
        return newState;
      });
      // Sync to localStorage
      const users = getStoredUsers();
      const key = user.email.toLowerCase();
      if (users[key]) {
        saveUserToLocalStore(updates.name || users[key].name, user.email, users[key].password, user);
      }
    } catch {
      setState(prev => {
        if (!prev.user) return prev;
        const updatedUser = { ...prev.user, ...updates };
        const newState = { ...prev, user: updatedUser };
        saveAuthState(newState);
        const users = getStoredUsers();
        const key = updatedUser.email.toLowerCase();
        if (users[key]) {
          saveUserToLocalStore(updatedUser.name, updatedUser.email, users[key].password, updatedUser);
        }
        return newState;
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
