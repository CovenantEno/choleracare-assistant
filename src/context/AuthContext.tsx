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

function getRequestedRole(supabaseUser: SupabaseUser): UserRole {
  const requestedRole = supabaseUser.user_metadata?.requested_role;
  return isUserRole(requestedRole) ? requestedRole : 'patient';
}

function buildFallbackUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || '',
    role: getRequestedRole(supabaseUser),
    avatar: undefined,
    phone: undefined,
    address: undefined,
    createdAt: supabaseUser.created_at,
  };
}

function getHighestPriorityRole(rows: Array<{ role: UserRole }> | null): UserRole | null {
  if (!rows || rows.length === 0) return null;
  const roles = rows.map((row) => row.role);
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('doctor')) return 'doctor';
  if (roles.includes('patient')) return 'patient';
  return null;
}

async function fetchUserData(supabaseUser: SupabaseUser): Promise<User> {
  const fallbackUser = buildFallbackUser(supabaseUser);

  const [{ data: profile, error: profileError }, { data: roleRows, error: roleError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id),
  ]);

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }

  if (roleError) {
    throw roleError;
  }

  let resolvedProfile = profile;

  if (!resolvedProfile) {
    const { data: createdProfile, error: upsertProfileError } = await supabase
      .from('profiles')
      .upsert({ user_id: supabaseUser.id, name: fallbackUser.name }, { onConflict: 'user_id' })
      .select('*')
      .maybeSingle();

    if (!upsertProfileError && createdProfile) {
      resolvedProfile = createdProfile;
    }
  }

  let resolvedRole = getHighestPriorityRole((roleRows as Array<{ role: UserRole }> | null) ?? null);

  if (!resolvedRole) {
    const preferredRole = getRequestedRole(supabaseUser);
    const { error: insertRoleError } = await supabase
      .from('user_roles')
      .insert({ user_id: supabaseUser.id, role: preferredRole });

    if (insertRoleError && insertRoleError.code !== '23505') {
      console.error('Error creating default role:', insertRoleError);
    }

    resolvedRole = preferredRole;
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: resolvedProfile?.name || fallbackUser.name,
    role: resolvedRole,
    avatar: resolvedProfile?.avatar_url || undefined,
    phone: resolvedProfile?.phone || undefined,
    address: resolvedProfile?.address || undefined,
    createdAt: resolvedProfile?.created_at || supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let requestCounter = 0;

    const syncUser = async (supabaseUser: SupabaseUser) => {
      const currentRequest = ++requestCounter;

      try {
        const userData = await fetchUserData(supabaseUser);
        if (!mounted || currentRequest !== requestCounter) return;
        setUser(userData);
      } catch (e) {
        console.error('Error fetching user data:', e);
        if (!mounted || currentRequest !== requestCounter) return;

        const fallback = buildFallbackUser(supabaseUser);
        setUser((prev) => (prev?.id === supabaseUser.id ? prev : fallback));
      } finally {
        if (mounted && currentRequest === requestCounter) {
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

      if (event === 'TOKEN_REFRESHED') {
        setLoading(false);
        return;
      }

      setLoading(true);
      void syncUser(session.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
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

    if (data.user && data.session) {
      const [roleInsert, profileUpsert] = await Promise.all([
        supabase.from('user_roles').insert({ user_id: data.user.id, role }),
        supabase.from('profiles').upsert({ user_id: data.user.id, name }, { onConflict: 'user_id' }),
      ]);

      if (roleInsert.error && roleInsert.error.code !== '23505') {
        throw roleInsert.error;
      }

      if (profileUpsert.error) {
        throw profileUpsert.error;
      }
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
