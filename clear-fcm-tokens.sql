-- Clear all FCM tokens from devices_token table
-- This will force all users to re-register for push notifications

-- Option 1: Delete all tokens (recommended for fresh start)
DELETE FROM devices_token;

-- Option 2: Delete tokens for a specific user (if you only want to clear one user)
-- DELETE FROM devices_token WHERE user_id = 'YOUR_USER_ID_HERE';

-- Option 3: Delete only invalid/old tokens (keeps recent ones)
-- DELETE FROM devices_token WHERE created_at < NOW() - INTERVAL '30 days';

-- Verify the deletion
SELECT COUNT(*) as remaining_tokens FROM devices_token;
