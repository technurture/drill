# How to Create the .env File

You're seeing a blank screen because your local machine doesn't have the environment variables needed to connect to Supabase.

## Quick Fix (3 Steps)

### Step 1: Create the File

Create a new file named **`.env`** (yes, it starts with a dot) in your project's root folder.

**Where to create it:**
- In the same folder as `package.json` and `vite.config.ts`
- NOT inside the `client/` folder
- NOT inside the `server/` folder

### Step 2: Add This Content

Copy and paste this **exactly** into the `.env` file:

```
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
```

**Important:**
- No spaces around the `=` sign
- No quotes around the values
- Make sure there are no extra spaces at the end of lines

### Step 3: Restart

1. **Stop the dev server:** Press `Ctrl+C` in your terminal
2. **Start it again:** Run `npm run dev`
3. **Hard refresh browser:** Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

## Different Ways to Create the File

### Option A: Using Command Line

**On Mac/Linux:**
```bash
cat > .env << 'EOF'
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
EOF
```

**On Windows (PowerShell):**
```powershell
@"
VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c
"@ | Out-File -FilePath .env -Encoding UTF8
```

### Option B: Using Text Editor

1. Open your code editor (VS Code, Sublime, etc.)
2. Create a new file
3. Paste the content from Step 2 above
4. Save it as `.env` in the root folder

**In VS Code:**
- Click File → New File
- Paste the content
- Click File → Save As
- Name it `.env` (include the dot!)
- Save in the project root folder

### Option C: Copy the Example File

If you have `.env.example`, you can copy it:

**Mac/Linux:**
```bash
cp .env.example .env
```

**Windows:**
```cmd
copy .env.example .env
```

Then edit `.env` and replace the placeholder values with the real ones.

## Verify It Works

Run this verification script:
```bash
node verify-env.js
```

It will check if your `.env` file is configured correctly.

## Expected Result

After creating the file and restarting:
- ✅ No more "supabaseUrl is required" error
- ✅ SheBalance login page appears
- ✅ You can sign up and log in

## Common Mistakes

❌ **Wrong location:** Don't put `.env` inside `client/` or `server/`
❌ **Wrong filename:** It should be `.env` not `env` or `.env.txt`
❌ **Hidden file:** On Mac/Linux, files starting with `.` are hidden (this is normal!)
❌ **Extra spaces:** Make sure no spaces around `=` sign
❌ **Quotes:** Don't add quotes around the values

## Still Not Working?

If you've created the file correctly and it still doesn't work:

1. **Check the file exists:**
   ```bash
   ls -la | grep .env
   ```
   You should see `.env` in the list

2. **Check the file content:**
   ```bash
   cat .env
   ```
   Make sure it shows the correct values

3. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

4. **Check browser console:** 
   - Open DevTools (F12)
   - Look for any errors
   - Should NOT see "supabaseUrl is required"

## Security Note

The `.env` file is already in `.gitignore`, so it won't be committed to your repository. These are public API keys (anonymous keys), which are safe to use in client-side code.

## Questions?

If you're still having issues:
1. Check which folder you're in: `pwd` (Mac/Linux) or `cd` (Windows)
2. Make sure you're in the project root
3. Verify the file was created: `ls -la` (Mac/Linux) or `dir` (Windows)
