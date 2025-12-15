import { createClient, SupabaseClient } from '@supabase/supabase-js';

// NOTA: En un entorno de producción real, estas variables vendrían de process.env
// Para este entorno de demostración, permitimos que el usuario las ingrese o usamos placeholders.
// Si no están configuradas, la app mostrará una pantalla de configuración.

export const getSupabase = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not found in environment.");
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
};