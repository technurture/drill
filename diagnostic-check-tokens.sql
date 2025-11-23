-- Diagnostic: Check if FCM tokens exist and are valid
-- Run this in Supabase SQL Editor to see all registered tokens

SELECT 
    dt.id,
    dt.user_id,
    dt.token,
    dt.created_at,
    u.email
FROM devices_token dt
LEFT JOIN users u ON u.id = dt.user_id
ORDER BY dt.created_at DESC;

-- Check if there are any tokens at all
SELECT COUNT(*) as total_tokens FROM devices_token;

-- Check tokens for a specific user (replace with your user_id)
SELECT * FROM devices_token 
WHERE user_id = '1172d67c-c5a2-40fe-8c4a-6f5c6d1b8081';
