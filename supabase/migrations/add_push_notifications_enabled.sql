-- Add push_notifications_enabled column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true;

-- Add comment to column
COMMENT ON COLUMN users.push_notifications_enabled IS 'User preference for enabling/disabling push notifications';
