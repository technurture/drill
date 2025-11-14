import { supabase } from '@/integrations/supabase';
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();


const supabaseUrl = process.env.VITE_SUPABASE_PROJECT_URL as string;
const supabaseKey = process.env.VITE_SUPABASE_API_KEY as string;
// const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'stockwise-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
