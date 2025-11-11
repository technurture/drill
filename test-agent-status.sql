-- Test script to check and update agent status
-- Run this in Supabase SQL editor to test

-- First, let's see what users exist and their agent status
SELECT id, email, is_agent, name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Update a test user to be an agent (replace 'your-email@example.com' with actual email)
-- UPDATE users 
-- SET is_agent = true, name = 'Test Agent'
-- WHERE email = 'your-email@example.com';

-- Check if the is_agent column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_agent'; 