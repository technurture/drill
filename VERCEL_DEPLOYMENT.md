# Vercel Deployment Guide for SheBalance

## Project Configuration

Your SheBalance project has been configured for seamless deployment on Vercel. All necessary configurations are in place.

## Configuration Files

### 1. `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. `vite.config.ts`
- Build output directory: `dist` (root level)
- Configured for production builds with proper PWA support

### 3. `package.json`
- Build script: `npm run build` (runs TypeScript compilation and Vite build)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com) and sign in
2. **Import Project**: Click "Add New Project" → "Import Git Repository"
3. **Select Repository**: Choose your SheBalance repository
4. **Configure Project**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables**: Add these required secrets:
   - `VITE_SUPABASE_PROJECT_URL`
   - `VITE_SUPABASE_API_KEY`
6. **Deploy**: Click "Deploy" and wait for the build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts** to configure your project

5. **Add Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_PROJECT_URL
   vercel env add VITE_SUPABASE_API_KEY
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to add these environment variables in your Vercel project settings:

| Variable Name | Description |
|--------------|-------------|
| `VITE_SUPABASE_PROJECT_URL` | Your Supabase project URL |
| `VITE_SUPABASE_API_KEY` | Your Supabase anonymous/public API key |

## Build Output

The build process generates:
- ✅ `dist/index.html` - Main HTML file
- ✅ `dist/assets/` - JavaScript and CSS bundles
- ✅ `dist/manifest.webmanifest` - PWA manifest
- ✅ `dist/sw-custom.js` - Service worker for offline functionality
- ✅ `dist/registerSW.js` - Service worker registration
- ✅ Static assets (images, icons, audio files)

## Testing the Build Locally

Before deploying, you can test the production build locally:

```bash
# Build the project
npm run build

# Preview the build (install serve if needed)
npx serve dist
```

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check that TypeScript compiles without errors: `npx tsc`
- Verify environment variables are set correctly

### App Not Loading
- Check browser console for errors
- Verify Supabase environment variables are correctly set in Vercel
- Ensure Supabase project URL and API key are valid

### Service Worker Issues
- Clear browser cache and service workers
- Check that HTTPS is enabled (required for service workers)
- Verify service worker registration in browser DevTools

## Post-Deployment

After successful deployment:

1. **Test all features**: Login, store management, offline mode, etc.
2. **Monitor logs**: Check Vercel deployment logs for any runtime errors
3. **Configure custom domain** (optional): Add your custom domain in Vercel settings
4. **Enable Vercel Analytics** (optional): Monitor performance and user behavior

## Important Notes

- The application is configured as a Progressive Web App (PWA)
- Service workers require HTTPS to function (Vercel provides this automatically)
- The build creates an optimized production bundle
- Large chunk warning is expected due to the comprehensive feature set
- Consider implementing code splitting for better performance (future optimization)

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev/guide/
- Supabase Documentation: https://supabase.com/docs

---

**Your SheBalance app is now ready for Vercel deployment!** 🚀
