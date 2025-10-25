// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// These values come from your .env (Vite, CRA, or Next.js environment variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Create and export a single supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
