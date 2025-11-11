-- Debug Stores Table Structure and RLS Policies
-- Run this in Supabase SQL editor to check the current state

-- 1. Check if RLS is enabled on stores table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'stores';

-- 2. Check RLS policies on stores table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'stores';

-- 3. Check stores table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
ORDER BY ordinal_position;

-- 4. Check if there are any constraints on the stores table
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'stores'::regclass;

-- 5. Check if there are any triggers on the stores table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'stores';

-- 6. Test a simple update to see what error we get
-- (This will help identify the exact issue)
UPDATE stores 
SET name = name 
WHERE id = '125207d0-6b01-4bf1-b542-3a1ec23dca31' 
LIMIT 1;
