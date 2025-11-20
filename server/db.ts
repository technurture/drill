/**
 * Database Connection
 * 
 * This file provides database access for server-side operations.
 * Uses Supabase client configured for server-side use.
 * 
 * For server-side database operations, you can:
 * 1. Use the Supabase client with service role key (for admin operations)
 * 2. Or use direct PostgreSQL connection for better performance
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = process.env.VITE_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Database operations may not work.');
}

// Create server-side Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
