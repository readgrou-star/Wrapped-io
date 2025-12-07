
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real environment, these would come from process.env or import.meta.env
// For this demo, we check if they are set in the browser's global scope or manually provided
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * HELPER: If Supabase is not configured, this mock service allows the UI 
 * to function for demonstration purposes by using LocalStorage.
 * This ensures the preview doesn't break for the user.
 */
export const mockSupabaseService = {
  auth: {
    getUser: async () => {
      const user = localStorage.getItem('wf_mock_user');
      return { data: { user: user ? JSON.parse(user) : null }, error: null };
    },
    signInWithPassword: async ({ email }: any) => {
      const user = { id: 'mock-user-1', email, user_metadata: { full_name: 'Demo User' } };
      localStorage.setItem('wf_mock_user', JSON.stringify(user));
      return { data: { user, session: { access_token: 'mock-token' } }, error: null };
    },
    signUp: async ({ email, options }: any) => {
      const user = { id: 'mock-user-1', email, user_metadata: options?.data || {} };
      localStorage.setItem('wf_mock_user', JSON.stringify(user));
      return { data: { user, session: { access_token: 'mock-token' } }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('wf_mock_user');
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Mock subscription
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};
