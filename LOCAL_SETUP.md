# Local Setup Guide for SheBalance

This guide will help you run the SheBalance application on your local machine.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## Step-by-Step Setup

### 1. Clone or Download the Repository

If you haven't already, clone the repository to your local machine:
```bash
git clone <your-repo-url>
cd <repository-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory of the project:

```bash
touch .env
```

Open the `.env` file in your text editor and add the following:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
```

**Important Notes:**
- The `.env` file is already in `.gitignore`, so it won't be committed to your repository
- These are your Supabase credentials - keep them secure
- Never share or commit this file to version control

### 4. Understanding the Port Configuration

The application is configured to run on different ports depending on the environment:

- **On Replit**: Port 5000 (required for Replit's webview)
- **Locally**: You can use the default Vite port (5173) or port 5000

The current configuration uses **port 5000** for both environments. If you prefer to use port 5173 locally, you can modify `vite.config.ts`:

```typescript
server: {
  host: "0.0.0.0",
  port: 5173,  // Change this to 5173 for local development
  strictPort: true,
  allowedHosts: true,
  hmr: {
    host: "0.0.0.0",
    port: 5173,  // Change this to 5173 for local development
    protocol: "ws",
  },
},
```

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at:
- **http://localhost:5000** (or http://localhost:5173 if you changed the port)

### 6. Verify Everything Works

Open your browser and navigate to the local URL. You should see the SheBalance login page with:
- SheBalance logo
- Email and password input fields
- Sign in button
- Links to sign up and learn more

## Troubleshooting

### Blank Screen Issue

If you see a blank screen:

1. **Check the browser console** (F12 or right-click → Inspect → Console tab)
   - Look for any error messages, especially about environment variables

2. **Verify environment variables are loaded**
   - The console should show your Supabase URL if properly configured
   - If you see `undefined` for Supabase credentials, the `.env` file wasn't loaded

3. **Clear browser cache**
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) to hard refresh

4. **Restart the development server**
   - Stop the server (`Ctrl+C`)
   - Delete `node_modules/.vite` folder: `rm -rf node_modules/.vite`
   - Run `npm run dev` again

### Port Already in Use

If port 5000 is already in use:
- Change the port in `vite.config.ts` to 5173 or another available port
- Or stop the process using port 5000

### Module Not Found Errors

If you see module errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Key Features

Once running, you'll have access to:
- User authentication (sign up/login via Supabase)
- Inventory management
- Business analytics
- PWA support (works offline)
- Multi-store management

## Next Steps

1. Create an account using the "Sign up for free" link
2. Log in with your credentials
3. Start managing your inventory and business!

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Check the terminal where `npm run dev` is running
3. Verify your `.env` file has the correct values
4. Make sure all dependencies are installed with `npm install`

## Environment Variables Reference

Your `.env` file should contain:
- `VITE_SUPABASE_PROJECT_URL`: Your Supabase project URL
- `VITE_SUPABASE_API_KEY`: Your Supabase anonymous key (public key)

These are public keys and safe to use in client-side code. Never expose your Supabase service role key!
