import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

export interface SignupResult {
  needsEmailConfirmation: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<SignupResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isUserRole(value: unknown): value is UserRole {
  return value === 'patient' || value === 'doctor' || value === 'admin';
}

async function fetchUserData(supabaseUser: SupabaseUser): Promise<User> {
  const fallbackName = supabaseUser.user_metadata?.name || '';
  const fallbackRole: UserRole = isUserRole(supabaseUser.user_metadata?.requested_role)
    ? supabaseUser.user_metadata.requested_role
    : 'patient';

  // Fetch profile (use maybeSingle to avoid 406 on missing rows)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', supabaseUser.id)
    .maybeSingle();

  // Fetch role (use regular select, returns array)
  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id);

  // Determine role from DB rows
  let resolvedRole: UserRole = fallbackRole;
  if (roleRows && roleRows.length > 0) {
    const dbRole = roleRows[0].role;
    if (isUserRole(dbRole)) {
      resolvedRole = dbRole;
    }
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || fallbackName,
    role: resolvedRole,
    avatar: profile?.avatar_url || undefined,
    phone: profile?.phone || undefined,
    address: profile?.address || undefined,
    createdAt: profile?.created_at || supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let requestId = 0;

    const syncUser = async (supabaseUser: SupabaseUser) => {
      const thisRequest = ++requestId;
      try {
        const userData = await fetchUserData(supabaseUser);
        if (mounted && thisRequest === requestId) {
          setUser(userData);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error fetching user data:', e);
        if (mounted && thisRequest === requestId) {
          // Use fallback user so we don't lose the session
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || '',
            role: 'patient',
            createdAt: supabaseUser.created_at,
          });
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Skip re-fetching on token refresh to avoid rate limiting
      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      void syncUser(session.user);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        void syncUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

const login = useCallback(async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  if (data.user) {
    const userData = await fetchUserData(data.user);
    setUser(userData);
  }
}, []);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<SignupResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, requested_role: role },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) throw error;

    // If session exists, user was auto-confirmed — insert role & profile
    if (data.user && data.session) {
      await Promise.allSettled([
        supabase.from('user_roles').insert({ user_id: data.user.id, role }),
        supabase.from('profiles').upsert({ user_id: data.user.id, name }, { onConflict: 'user_id' }),
      ]);
    }

    return { needsEmailConfirmation: !data.session };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.address !== undefined) updates.address = data.address;
    if (data.avatar !== undefined) updates.avatar_url = data.avatar;

    await supabase.from('profiles').update(updates).eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
