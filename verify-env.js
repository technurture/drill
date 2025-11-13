#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * 
 * Run this script to verify your .env file is properly configured
 * Usage: node verify-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 SheBalance Environment Verification\n');
console.log('=' .repeat(50));

// Check 1: .env file exists
const envPath = path.join(__dirname, '.env');
console.log('\n1. Checking for .env file...');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found at:', envPath);
} else {
  console.log('   ❌ .env file NOT found!');
  console.log('   📝 Create a .env file in the root directory with:');
  console.log('');
  console.log('   VITE_SUPABASE_PROJECT_URL=https://cfwfcxzlyqaspqkgmsxb.supabase.co');
  console.log('   VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2ZjeHpseXFhc3Bxa2dtc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDEyNTEsImV4cCI6MjA2OTg3NzI1MX0.hMhKWhzrfslc3LIFjuq-q9ik9YSWx81OPmgUVet617c');
  console.log('');
  process.exit(1);
}

// Check 2: Read .env file
console.log('\n2. Reading .env file contents...');
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
lines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Check 3: Verify required variables
console.log('\n3. Checking required environment variables...');
const requiredVars = {
  'VITE_SUPABASE_PROJECT_URL': 'https://cfwfcxzlyqaspqkgmsxb.supabase.co',
  'VITE_SUPABASE_API_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
};

let allGood = true;

for (const [key, expectedStart] of Object.entries(requiredVars)) {
  if (envVars[key]) {
    if (envVars[key].startsWith(expectedStart)) {
      console.log(`   ✅ ${key}: Configured correctly`);
    } else {
      console.log(`   ⚠️  ${key}: Found but value looks incorrect`);
      console.log(`      Expected to start with: ${expectedStart}...`);
      allGood = false;
    }
  } else {
    console.log(`   ❌ ${key}: MISSING`);
    allGood = false;
  }
}

// Check 4: File location
console.log('\n4. Verifying file location...');
const packageJsonPath = path.join(__dirname, 'package.json');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');

if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ .env is in the same directory as package.json');
} else {
  console.log('   ⚠️  package.json not found in the same directory');
}

if (fs.existsSync(viteConfigPath)) {
  console.log('   ✅ .env is in the same directory as vite.config.ts');
} else {
  console.log('   ⚠️  vite.config.ts not found in the same directory');
}

// Final verdict
console.log('\n' + '=' .repeat(50));
if (allGood) {
  console.log('\n✅ Environment configuration looks good!');
  console.log('\nNext steps:');
  console.log('  1. Stop your development server (Ctrl+C)');
  console.log('  2. Run: npm run dev');
  console.log('  3. Hard refresh your browser (Ctrl+Shift+R)');
  console.log('\nYour app should now load correctly! 🎉\n');
} else {
  console.log('\n❌ Environment configuration has issues!');
  console.log('\nPlease fix the issues above and run this script again.\n');
  process.exit(1);
}
