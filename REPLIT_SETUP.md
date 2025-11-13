# Running SheBalance on Replit

## Quick Start

Your SheBalance application is already configured and running on Replit! Just click the **Run** button to start the application.

## Environment Configuration

The application uses **Replit Secrets** to securely store your Supabase credentials:

### Already Configured Secrets ✅
- `VITE_SUPABASE_PROJECT_URL`: Your Supabase project URL
- `VITE_SUPABASE_API_KEY`: Your Supabase anonymous key

These secrets are automatically loaded into the application environment.

## Database Information

**Important**: SheBalance uses **Supabase** as its database, NOT the Replit PostgreSQL database.

### Why Supabase?
- ✅ All your authentication and user data is already in Supabase
- ✅ Provides real-time features and built-in authentication
- ✅ Works the same on Replit and locally
- ✅ No additional setup required

### PostgreSQL Integration
You may see a PostgreSQL integration in your Replit project. This is **not used** by SheBalance. The application connects exclusively to Supabase regardless of what other integrations are installed.

**You can safely ignore or remove the PostgreSQL integration** - it won't affect your application.

## Accessing Your Application

Once running, your application will be available at:
- **Port 5000** on Replit's webview (visible on the right side)
- The application displays the SheBalance login page

## Making Changes

### Adding New Features
All database operations should use the Supabase client:
```typescript
import { supabase } from '@/integrations/supabase/supabase';
```

### Environment Variables
To add or update environment variables:
1. Click the **Secrets** tab in Replit (lock icon in left sidebar)
2. Add or edit the key-value pairs
3. Restart the workflow to apply changes

## Troubleshooting

### Application Not Loading
1. Check that the workflow is running (green dot)
2. Verify Supabase credentials in Secrets tab
3. Check console logs for errors

### Blank Screen
1. Ensure `VITE_SUPABASE_PROJECT_URL` and `VITE_SUPABASE_API_KEY` are set in Secrets
2. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for error messages

### Database Connection Errors
1. Verify your Supabase credentials are correct
2. Check that your Supabase project is active
3. Confirm you're using the anonymous/public key, not the service role key

## Development Workflow

### Making Code Changes
1. Edit files in the Replit editor
2. Changes will auto-reload in the webview
3. Check console for any errors

### Restarting the Application
Click the **Restart** button or run:
```bash
npm run dev
```

### Viewing Logs
- Workflow logs appear in the console at the bottom
- Browser logs visible in browser DevTools (F12)

## Project Structure

```
SheBalance/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── integrations/supabase/  # Supabase configuration
│   │   ├── pages/                   # Page components
│   │   ├── components/              # Reusable UI components
│   │   └── ...
│   └── public/          # Static assets
├── server/              # Express server (serves Vite)
├── vite.config.ts       # Vite configuration (port 5000)
├── package.json         # Dependencies
└── .env.example         # Environment variable template
```

## Key Files

- **Supabase Configuration**: `client/src/integrations/supabase/supabase.ts`
- **Vite Config**: `vite.config.ts` (configured for port 5000)
- **Server**: `server/index.ts` (serves the app, no database logic)
- **Database Guide**: `DATABASE_CONFIGURATION.md`

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Important Notes

1. **Port Configuration**: The app runs on port 5000 (required for Replit webview)
2. **Database**: Always uses Supabase, never PostgreSQL
3. **Environment**: Secrets are managed through Replit Secrets tab
4. **No Docker**: Replit uses Nix, not Docker

## Getting Help

If you encounter issues:
1. Check `DATABASE_CONFIGURATION.md` for database setup
2. Check `LOCAL_SETUP.md` for local development
3. Review browser console and workflow logs
4. Verify Supabase credentials in Secrets tab

## Features

Once running, you'll have access to:
- User authentication (signup/login)
- Inventory management
- Sales tracking
- Financial records
- Savings plans
- Loan management
- Multi-store support
- PWA offline capabilities
- Multi-language support (English, Igbo, Yoruba, Hausa, Pidgin)

Enjoy using SheBalance! 🎉
