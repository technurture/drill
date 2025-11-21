# SheBalance - Leapcel Deployment Guide

## Common Issues & Solutions

### Issue 1: Environment Variables Not Set ⚠️
**This is the #1 cause of silent deployment failures!**

Your app requires these environment variables to work:

#### Required Variables:
```bash
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
NODE_ENV=production
```

#### Optional (for push notifications):
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

**How to Add in Leapcel:**
1. Go to your Leapcel project settings
2. Find "Environment Variables" section
3. Add each variable one by one
4. Rebuild and redeploy

---

### Issue 2: Port Configuration 🔌

Leapcel might use a different port variable. Update `server/index.ts`:

**Current line 37:**
```typescript
const PORT = parseInt(process.env.PORT || "8080", 10);
```

**Try this instead:**
```typescript
const PORT = parseInt(process.env.PORT || process.env.LEAPCEL_PORT || "8080", 10);
```

---

### Issue 3: Build & Start Commands 🛠️

**Build Command (in Leapcel settings):**
```bash
npm install && npm run build
```

**Start Command (in Leapcel settings):**
```bash
npm start
```

**OR if the above doesn't work:**
```bash
NODE_ENV=production node dist/server/index.js
```

---

### Issue 4: Node Version 📦

This app requires Node.js 20+. 

**Check your Leapcel Node version:**
- Look for "Node Version" or "Runtime" settings in Leapcel
- Set it to: `20` or `20.x` or `20.19.3`

**If Leapcel uses a `.node-version` file, create one:**
```bash
echo "20" > .node-version
```

---

### Issue 5: Root Directory Configuration 📁

Make sure Leapcel is deploying from the **root** directory, not from `client/` or `server/`

---

### Issue 6: Health Check Endpoint 🏥

Your app has a health check endpoint at `/.replit-status-check`

**In Leapcel settings, set:**
- Health Check Path: `/.replit-status-check`
- Expected Response: `200 OK`

---

## Debugging Steps

### Step 1: Check Build Logs
Look for errors in Leapcel's build logs:
- Missing dependencies?
- TypeScript errors?
- Build failures?

### Step 2: Check Runtime Logs
Once deployed, check the runtime logs for:
```
Server running on port XXXX
```

If you see:
```
Client build not found at /app/dist
```
This means the build didn't complete or files weren't uploaded.

### Step 3: Test Locally
Before deploying, always test locally:
```bash
npm run build
npm start
```

Visit `http://localhost:8080` - if it doesn't work locally, it won't work on Leapcel!

---

## Quick Checklist ✅

Before deploying to Leapcel, verify:

- [ ] All environment variables are set in Leapcel
- [ ] Build command is: `npm install && npm run build`
- [ ] Start command is: `npm start`
- [ ] Node version is set to 20+
- [ ] Root directory is set correctly
- [ ] Health check endpoint is configured
- [ ] App works locally after running `npm run build && npm start`

---

## Still Not Working?

If deployment still fails silently, check these:

### 1. Memory/Resource Limits
- Your app has a large bundle (3.2MB). Make sure Leapcel has enough memory allocated.
- Recommended: At least 512MB RAM

### 2. Missing Files
Make sure these are NOT in `.gitignore`:
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.server.json`

### 3. Enable Detailed Logging
Add this at the top of `server/index.ts` (after imports):
```typescript
console.log('🚀 Starting SheBalance server...');
console.log('📝 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT);
console.log('📂 Working directory:', process.cwd());
console.log('📁 Dist folder exists:', fs.existsSync('dist'));
```

This will help you see what's happening in Leapcel's logs!

---

## Alternative: Deploy to Replit

If Leapcel continues to have issues, you can deploy directly on Replit:

1. Click "Publish" button in Replit
2. Choose "Autoscale Deployment"
3. Set:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Port: 8080
4. Add your environment variables in Secrets
5. Click Publish!

Your app is already configured for Replit deployment! 🎉
