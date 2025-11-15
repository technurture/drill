# Environment Variables Setup Guide

## Overview

SheBalance uses environment variables to store configuration values like API keys and project URLs. This guide explains how to set them up for different environments.

## Configuration

### ✅ Current Setup

Your project is now configured to load environment variables from the **root directory** (`.env` file), regardless of where your code files are located. This means:

- ✅ Variables work in root directory scripts
- ✅ Variables work in client directory code
- ✅ Variables work in both development and production builds
- ✅ Same `.env` file for all environments

### How It Works

The `vite.config.ts` file has been configured with:

```typescript
export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "client"),  // Source code is in client/
  envDir: path.resolve(__dirname),          // But .env files are in root!
  // ... other config
}));
```

This setup ensures that Vite always looks for `.env` files in the root directory, even though the source code is in the `client/` folder.

## Setting Up Environment Variables

### Step 1: Create Your .env File

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your actual credentials

### Step 2: Required Variables

At minimum, you need these Supabase variables:

```env
VITE_SUPABASE_PROJECT_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your-anon-public-key-here
```

### Step 3: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_PROJECT_URL`
   - **anon/public key** → `VITE_SUPABASE_API_KEY`

## Using Environment Variables in Code

### In TypeScript/React Files

Access variables using `import.meta.env`:

```typescript
// Example: client/src/integrations/supabase/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
```

### TypeScript Type Safety

Vite provides types for environment variables. They're defined in `client/src/vite-env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly VITE_SUPABASE_PROJECT_URL: string;
  readonly VITE_SUPABASE_API_KEY: string;
  // ... other variables
}
```

### Environment Variable Naming Rules

1. **Must start with `VITE_`** - Only variables prefixed with `VITE_` are exposed to client code
2. **Case sensitive** - Use UPPERCASE_WITH_UNDERSCORES
3. **No sensitive data** - Don't store private keys or secrets in VITE_ variables (they're public!)

## Different Environments

### Development (Replit)

Create `.env` in the root directory:

```env
VITE_SUPABASE_PROJECT_URL=https://dev-project.supabase.co
VITE_SUPABASE_API_KEY=dev-anon-key
```

**For Replit Secrets:**
- Use the Secrets tab in Replit
- Variables will be automatically available to your app
- No need to create `.env` file if using Replit Secrets

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `VITE_SUPABASE_PROJECT_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production (or All)
4. Redeploy your application

### Local Development

1. Create `.env` in root directory
2. Add your variables
3. Run `npm run dev`
4. Variables will be loaded automatically

## Verification

### Check if Variables are Loaded

Create a simple test file or add to an existing component:

```typescript
// Check in browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_PROJECT_URL);
console.log('Has API Key:', !!import.meta.env.VITE_SUPABASE_API_KEY);
```

**Note:** Never log actual API keys in production!

### Build Time

During build, you'll see warnings if required variables are missing:

```bash
npm run build
```

## File Locations

```
shebalance/
├── .env                          # ← Environment variables HERE (root)
├── .env.example                  # ← Template file (committed to git)
├── vite.config.ts               # ← Points to root for .env files
├── client/
│   ├── src/
│   │   ├── components/          # ← Can use import.meta.env here
│   │   ├── integrations/        # ← And here
│   │   └── vite-env.d.ts        # ← Type definitions
│   └── index.html
└── ...
```

## Security Best Practices

### ✅ DO:
- Keep `.env` in `.gitignore` (already configured)
- Use `VITE_` prefix for client-safe values only
- Store API keys in Replit Secrets or Vercel Environment Variables
- Use different values for development and production
- Commit `.env.example` as a template

### ❌ DON'T:
- Commit `.env` files to Git
- Store sensitive secrets in `VITE_` variables
- Share your `.env` file or API keys
- Use production credentials in development

## Troubleshooting

### Variables Not Loading?

1. **Check the filename**: Must be exactly `.env` (not `.env.txt` or `.env.local`)
2. **Check location**: Must be in root directory, not `client/`
3. **Check prefix**: Variables must start with `VITE_`
4. **Restart dev server**: Run `npm run dev` again after changing `.env`
5. **Check Vite config**: Ensure `envDir: path.resolve(__dirname)` is present

### Variables Undefined?

```typescript
// Check if variable exists
if (!import.meta.env.VITE_SUPABASE_PROJECT_URL) {
  console.error('Missing VITE_SUPABASE_PROJECT_URL environment variable!');
}
```

### Build Failing?

Ensure all required variables are set in your deployment environment (Vercel, Replit, etc.)

## Example Complete .env File

```env
# Supabase
VITE_SUPABASE_PROJECT_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Firebase (optional)
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=myapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=myapp-12345
VITE_FIREBASE_STORAGE_BUCKET=myapp-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_VAPID_KEY=BM7dkj...
```

## Summary

✅ **Environment files location**: Root directory (`.env`)  
✅ **Access in code**: `import.meta.env.VITE_VARIABLE_NAME`  
✅ **Works everywhere**: Root scripts, client code, anywhere!  
✅ **Secure**: `.env` is in `.gitignore`  
✅ **Deployment**: Add variables to Vercel/Replit settings  

Your SheBalance app is now properly configured for environment variables! 🎉
