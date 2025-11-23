-- Add push_notifications_enabled column to users table
-- This column stores user preference for push notifications
-- Default is TRUE (enabled) for all users

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT TRUE;

-- Update existing users to have notifications enabled by default
UPDATE users 
SET push_notifications_enabled = TRUE 
WHERE push_notifications_enabled IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'push_notifications_enabled';
