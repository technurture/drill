# Database Configuration Guide

## SheBalance Database Architecture

**SheBalance uses Supabase exclusively for all database operations.**

## Why Supabase?

✅ **Current Setup**: All authentication, data storage, and real-time features use Supabase
✅ **Benefits**:
- Built-in authentication system
- Real-time data synchronization
- Automatic REST API generation
- Row-level security
- No server-side code needed for most operations

## Database Configuration

### On Replit

The application uses Replit Secrets to store Supabase credentials:
- `VITE_SUPABASE_PROJECT_URL`: Your Supabase project URL
- `VITE_SUPABASE_API_KEY`: Your Supabase anonymous/public key

These are automatically loaded into your application environment.

### Locally

Create a `.env` file with:
```env
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
```

## Supabase Client Configuration

The Supabase client is configured in: `client/src/integrations/supabase/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'stockwise-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

## Database Operations

All database operations use the Supabase client:

```typescript
import { supabase } from '@/integrations/supabase/supabase';

// Example: Query data
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Example: Insert data
const { data, error } = await supabase
  .from('your_table')
  .insert({ column: 'value' });
```

## PostgreSQL Integration Note

⚠️ **Important**: While there may be a PostgreSQL integration visible in Replit:
- This is **NOT** used by the SheBalance application
- The application connects **ONLY** to Supabase
- Any PostgreSQL-related environment variables (DATABASE_URL, PGHOST, etc.) are not used by the app
- Removing the PostgreSQL integration will not affect the application

## How to Verify Supabase Connection

1. **Check Browser Console**: When the app loads, you should see Supabase-related logs
2. **Check Network Tab**: API calls should go to `https://cfwfcxzlyqaspqkgmsxb.supabase.co`
3. **Test Authentication**: Sign up/login should work through Supabase

## Preventing Accidental PostgreSQL Usage

To ensure the application never accidentally uses PostgreSQL:

### 1. Environment Variable Check
The application ONLY reads these variables:
- `VITE_SUPABASE_PROJECT_URL`
- `VITE_SUPABASE_API_KEY`

It does **NOT** use:
- `DATABASE_URL`
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, etc.

### 2. No Server-Side Database Code
The Express server in `server/index.ts` is **only** used to serve the Vite application. It does not connect to any database.

### 3. Code Verification
All database imports should be from Supabase:
```typescript
// ✅ CORRECT - Uses Supabase
import { supabase } from '@/integrations/supabase/supabase';

// ❌ WRONG - Would use PostgreSQL (not present in this app)
import { db } from '@/server/db';
```

## Adding New Database Features

When adding new features that require database operations:

1. **Use Supabase client** from `@/integrations/supabase/supabase`
2. **Create tables** in your Supabase dashboard
3. **Set up Row Level Security (RLS)** policies in Supabase
4. **Use Supabase queries** in your React components or hooks

## Switching Databases (If Needed in Future)

If you ever need to switch from Supabase to PostgreSQL:
1. Update environment variables
2. Modify `client/src/integrations/supabase/supabase.ts`
3. Update all database queries throughout the application
4. Test thoroughly before deploying

**Current Recommendation**: Continue using Supabase - it's working perfectly!

## Troubleshooting

### "Database not connected" errors
- Verify your Supabase credentials are correct
- Check that environment variables are loaded (Replit Secrets or `.env` file)
- Confirm your Supabase project is active

### "Can't find database" errors
- Ensure you're using `import { supabase } from '@/integrations/supabase/supabase'`
- Check that tables exist in your Supabase dashboard
- Verify RLS policies allow the operations you're attempting

## Summary

✅ **Database**: Supabase (PostgreSQL-compatible cloud database)
✅ **Configuration File**: `client/src/integrations/supabase/supabase.ts`
✅ **Environment Variables**: `VITE_SUPABASE_PROJECT_URL` and `VITE_SUPABASE_API_KEY`
✅ **Authentication**: Handled by Supabase Auth
✅ **Data Storage**: All data stored in Supabase tables
❌ **Not Using**: Replit PostgreSQL database or any local PostgreSQL instance
