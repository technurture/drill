/**
 * Database Connection
 * 
 * This file provides database access for server-side operations.
 * Currently uses Supabase client for database interactions.
 * 
 * For server-side database operations, you can:
 * 1. Use the Supabase client with service role key (for admin operations)
 * 2. Or use direct PostgreSQL connection for better performance
 */

import { supabase } from '../client/src/integrations/supabase/supabase';

export { supabase };
export type { Database } from '../client/src/types/database.types';
