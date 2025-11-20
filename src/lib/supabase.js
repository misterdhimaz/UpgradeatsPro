import { createClient } from '@supabase/supabase-js';

// Pastikan variabel lingkungan ini ada di file .env Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL atau Anon Key hilang. Cek file .env Anda.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);