# Vercel Deployment Guide for SheBalance

## What Was Fixed

The push notification API endpoints were returning `405 Method Not Allowed` errors because Vercel requires serverless functions instead of a traditional Express server.

### Changes Made:

1. **Created Vercel Serverless Functions** (`/api/notifications/`)
   - `send-to-user.ts` - Handles user-specific notifications
   - `send-to-store.ts` - Handles store-wide notifications

2. **Updated `vercel.json`**
   - Added proper API route rewrites
   - Configured CORS headers for API endpoints
   - Maintained static site routing for the frontend

3. **Added Dependencies**
   - Installed `@vercel/node` for TypeScript support

## How to Deploy

### 1. Push Changes to Git

```bash
git add .
git commit -m "Fix: Add Vercel serverless functions for push notifications"
git push
```

### 2. Redeploy on Vercel

If you have automatic deployments enabled, Vercel will automatically redeploy. Otherwise:

1. Go to your Vercel dashboard
2. Find your SheBalance project
3. Click "Redeploy" on the latest deployment

### 3. Verify Environment Variables

Make sure these environment variables are set in Vercel:

**Required for Push Notifications:**
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PROJECT_ID`
- `VITE_FIREBASE_VAPID_KEY`

**Required for Supabase:**
- `VITE_SUPABASE_PROJECT_URL`
- `VITE_SUPABASE_API_KEY`

**Other Required Variables:**
- `VITE_PAYSTACK_API_KEY`
- `VITE_PAYSTACK_PAYMENT_KEY`
- (and any other environment variables your app uses)

To add/verify environment variables in Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy after adding new variables

## Testing Push Notifications

After deployment, test the notifications by:

1. Log in to your SheBalance account
2. Perform an action that triggers a notification (e.g., create a sale, add product)
3. Check browser console for any errors
4. Verify notifications appear in-app and as push notifications

## Troubleshooting

### Still Getting 405 Errors?

1. **Clear Vercel build cache:**
   ```bash
   vercel --force
   ```

2. **Check function logs in Vercel dashboard:**
   - Go to Deployments → Click on your deployment
   - Navigate to Functions → Find your API function
   - Check the logs for errors

### CORS Errors?

- The `vercel.json` has been configured with CORS headers
- If you need to restrict origins, update the `Access-Control-Allow-Origin` header in `vercel.json`

### Import Errors?

- Make sure the `server/` directory is included in your deployment
- Check that all TypeScript files are compiled properly

## API Endpoints

After deployment, these endpoints will be available:

- `POST https://www.shebalance.org/api/notifications/send-to-user`
- `POST https://www.shebalance.org/api/notifications/send-to-store`

## Notes

- The serverless functions automatically handle CORS
- Each API call is stateless (no persistent Express server)
- Firebase Admin SDK is initialized per-function (cold start may add latency)
- Consider implementing caching if notification volume is high
