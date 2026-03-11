import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, User & { password: string }> = {
  'patient@demo.com': {
    id: 'p1', email: 'patient@demo.com', name: 'Sarah Johnson', role: 'patient',
    phone: '+1 555-0123', address: '123 Health St', createdAt: '2025-01-15', password: 'demo123'
  },
  'doctor@demo.com': {
    id: 'd1', email: 'doctor@demo.com', name: 'Dr. Michael Chen', role: 'doctor',
    phone: '+1 555-0456', address: 'City Hospital', createdAt: '2024-08-01', password: 'demo123'
  },
  'admin@demo.com': {
    id: 'a1', email: 'admin@demo.com', name: 'Admin User', role: 'admin',
    phone: '+1 555-0789', address: 'HQ Office', createdAt: '2024-01-01', password: 'demo123'
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('choleraCare_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    const demo = DEMO_USERS[email];
    if (demo) {
      const { password: _, ...userData } = demo;
      setUser(userData);
      localStorage.setItem('choleraCare_user', JSON.stringify(userData));
      return;
    }
    const saved = localStorage.getItem('choleraCare_users');
    const users = saved ? JSON.parse(saved) : {};
    if (users[email]) {
      setUser(users[email]);
      localStorage.setItem('choleraCare_user', JSON.stringify(users[email]));
      return;
    }
    throw new Error('Invalid credentials');
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string, role: UserRole) => {
    const newUser: User = {
      id: crypto.randomUUID(), email, name, role, createdAt: new Date().toISOString(),
    };
    const saved = localStorage.getItem('choleraCare_users');
    const users = saved ? JSON.parse(saved) : {};
    users[email] = newUser;
    localStorage.setItem('choleraCare_users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('choleraCare_user', JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('choleraCare_user');
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('choleraCare_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
