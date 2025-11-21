# 🚀 Leapcel Deployment - Quick Fix Guide

## ✅ What I Fixed

1. **Port Configuration** - Added support for multiple deployment platforms (Leapcel, Railway, Render)
2. **Health Check Endpoints** - Added `/health` and `/api/health` for Leapcel monitoring
3. **Enhanced Logging** - Added detailed startup logs to debug deployment issues
4. **Node Version** - Created `.node-version` file to ensure Node 20 is used
5. **Leapcel Config** - Created `leapcel.json` with deployment configuration

---

## 🔧 Required Settings in Leapcel

### 1. Environment Variables (MOST IMPORTANT!)
Add these in Leapcel's Environment Variables section:

```
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
NODE_ENV=production
```

### 2. Build Command
```bash
npm install && npm run build
```

### 3. Start Command
```bash
npm start
```

### 4. Health Check
- **Path:** `/health`
- **Expected Status:** 200 OK

### 5. Port
- **Default:** 8080
- The app will auto-detect Leapcel's port

### 6. Node Version
- **Version:** 20 or 20.x

---

## 🔍 How to Debug

### Check Build Logs
Look for these success messages:
```
✓ 4375 modules transformed.
✓ built in XX.XXs
PWA v1.1.0
```

### Check Runtime Logs
Look for these startup messages:
```
🚀 Starting SheBalance server...
📝 Environment: production
🔌 Port: 8080
Server running on port 8080
```

### If You See This Error:
```
Client build not found at /app/dist
```

**Solution:** The build didn't complete or upload properly.
- Double-check build command in Leapcel
- Ensure `dist/` folder is not in `.gitignore`
- Try rebuilding the project

---

## 🎯 Common Issues & Solutions

### Issue: "Cannot GET /"
**Cause:** Environment variables not set  
**Fix:** Add all environment variables in Leapcel

### Issue: "Port already in use"
**Cause:** Wrong port configuration  
**Fix:** The code now auto-detects Leapcel's port

### Issue: App builds but won't start
**Cause:** Missing `NODE_ENV=production`  
**Fix:** Add `NODE_ENV=production` to environment variables

### Issue: 503 Service Unavailable
**Cause:** Health check failing  
**Fix:** Set health check path to `/health` in Leapcel

---

## ✨ Test Locally First

Before deploying to Leapcel, always test locally:

```bash
# Clean build
rm -rf dist node_modules
npm install

# Build
npm run build

# Test production mode
NODE_ENV=production npm start
```

Visit `http://localhost:8080` - if it works, it will work on Leapcel!

---

## 📞 Still Having Issues?

1. **Check Leapcel Logs** - They contain the actual error messages
2. **Verify Environment Variables** - Make sure they're all set correctly
3. **Test Locally** - If it doesn't work locally, it won't work on Leapcel
4. **Contact Leapcel Support** - They can see platform-specific errors

---

## 🎉 Success Indicators

When deployment is successful, you should be able to:

1. ✅ Visit your Leapcel URL and see the SheBalance landing page
2. ✅ Access `/health` and see: `{"status":"healthy","service":"SheBalance"}`
3. ✅ No errors in Leapcel's runtime logs
4. ✅ All features work (login, inventory, sales, etc.)

---

**Need more help?** See the full `DEPLOYMENT.md` guide for detailed troubleshooting!
