-- Stores Table RLS Setup
-- This script adds Row Level Security policies to the stores table

-- Enable RLS on stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own stores
CREATE POLICY "Users can view their own stores" ON stores
    FOR SELECT USING (owner_id = auth.uid());

-- Policy to allow users to update their own stores
CREATE POLICY "Users can update their own stores" ON stores
    FOR UPDATE USING (owner_id = auth.uid());

-- Policy to allow users to insert their own stores
CREATE POLICY "Users can insert their own stores" ON stores
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Policy to allow users to delete their own stores
CREATE POLICY "Users can delete their own stores" ON stores
    FOR DELETE USING (owner_id = auth.uid());

-- Policy to allow admins to view all stores (if needed)
CREATE POLICY "Admins can view all stores" ON stores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_agent = true
        )
    );

-- Policy to allow admins to update all stores (if needed)
CREATE POLICY "Admins can update all stores" ON stores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_agent = true
        )
    );
