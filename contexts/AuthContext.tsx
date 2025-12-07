
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, mockSupabaseService } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  useMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const useMockMode = !isSupabaseConfigured;

  // Use either real supabase or mock service
  const client = useMockMode ? mockSupabaseService : supabase!;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await client.auth.getUser();
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name
          });
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event: string, session: any) => {
        if (session?.user) {
            setUser({
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name
            });
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [useMockMode]);

  const signIn = async (email: string, password = 'password') => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
        setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name
        });
    }
    return { error };
  };

  const signUp = async (email: string, password = 'password', fullName?: string) => {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (!error && data.user) {
         setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name
        });
    }
    return { error };
  };

  const signOut = async () => {
    await client.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, useMockMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
