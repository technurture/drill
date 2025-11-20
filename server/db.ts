import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import type { Database } from '../client/src/types/database.types';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_PROJECT_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_API_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
export type { Database };
