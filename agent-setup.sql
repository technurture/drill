-- Add name and registered_by columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(200) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_by UUID REFERENCES users(id);

-- Create index for name column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_registered_by ON users(registered_by);

-- Create unique constraint for name (only for agents)
-- This will ensure no two agents can have the same name
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_name_unique ON users(name) WHERE name IS NOT NULL;

-- Update RLS policies to allow reading agent names for registered_by dropdown
-- The existing RLS policies should already allow this, but let's make sure
CREATE POLICY IF NOT EXISTS "Users can view agent names for registration" ON users
    FOR SELECT USING (
        is_agent = true OR 
        name IS NOT NULL OR
        auth.uid() = id
    ); 