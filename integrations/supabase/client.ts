import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper function to safely get environment variables in both Vite and Next.js environments
const getEnvVar = (key: string): string | undefined => {
  // Check for Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  // Check for process.env (handled by Vite define replacement)
  try {
    // Direct access to process.env properties which Vite replaces at build time
    // We access it as 'process.env' so the token is matched
    if (process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  return undefined;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

// Singleton instance
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

if (!supabase) {
  console.warn("Supabase credentials not found. The app will run in Demo/Offline mode or require manual login implementation.");
}