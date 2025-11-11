-- Markets Table Setup
-- This script creates the markets table and sets up the relationship with locations

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_markets_location_id ON markets(location_id);
CREATE INDEX IF NOT EXISTS idx_markets_name ON markets(name);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at);

-- Add unique constraint to prevent duplicate market names within the same location
ALTER TABLE markets ADD CONSTRAINT unique_market_per_location UNIQUE (location_id, name);

-- Update stores table to include market_id
ALTER TABLE stores ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES markets(id) ON DELETE SET NULL;

-- Create index for stores market_id
CREATE INDEX IF NOT EXISTS idx_stores_market_id ON stores(market_id);

-- Insert sample markets for each location (you can modify these as needed)
-- This will create some sample markets for demonstration

-- Sample markets for Lagos
INSERT INTO markets (name, location_id) 
SELECT 'Alaba International Market', id FROM locations WHERE name = 'Lagos'
ON CONFLICT (location_id, name) DO NOTHING;

INSERT INTO markets (name, location_id) 
SELECT 'Balogun Market', id FROM locations WHERE name = 'Lagos'
ON CONFLICT (location_id, name) DO NOTHING;

INSERT INTO markets (name, location_id) 
SELECT 'Computer Village', id FROM locations WHERE name = 'Lagos'
ON CONFLICT (location_id, name) DO NOTHING;

-- Sample markets for Kano
INSERT INTO markets (name, location_id) 
SELECT 'Kurmi Market', id FROM locations WHERE name = 'Kano'
ON CONFLICT (location_id, name) DO NOTHING;

INSERT INTO markets (name, location_id) 
SELECT 'Kantin Kwari Market', id FROM locations WHERE name = 'Kano'
ON CONFLICT (location_id, name) DO NOTHING;

-- Sample markets for Rivers
INSERT INTO markets (name, location_id) 
SELECT 'Port Harcourt Main Market', id FROM locations WHERE name = 'Rivers'
ON CONFLICT (location_id, name) DO NOTHING;

-- Sample markets for Kaduna
INSERT INTO markets (name, location_id) 
SELECT 'Kasuwan Barci', id FROM locations WHERE name = 'Kaduna'
ON CONFLICT (location_id, name) DO NOTHING;

-- Sample markets for Oyo
INSERT INTO markets (name, location_id) 
SELECT 'Bodija Market', id FROM locations WHERE name = 'Oyo'
ON CONFLICT (location_id, name) DO NOTHING;

-- Sample markets for Borno
INSERT INTO markets (name, location_id) 
SELECT 'Monday Market', id FROM locations WHERE name = 'Borno'
ON CONFLICT (location_id, name) DO NOTHING;

-- Create RLS policies for markets table
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read markets
CREATE POLICY "Allow authenticated users to read markets" ON markets
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users to insert, update, delete markets
CREATE POLICY "Allow admin users to manage markets" ON markets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_agent = true
        )
    );

-- Create a view for store statistics with financial data
CREATE OR REPLACE VIEW store_statistics AS
SELECT 
    s.id as store_id,
    s.store_name,
    s.description,
    s.created_at,
    s.updated_at,
    s.location_id,
    s.market_id,
    l.name as location_name,
    m.name as market_name,
    u.id as owner_id,
    u.email as owner_email,
    u.name as owner_name,
    u.is_agent as owner_is_agent,
    -- Financial calculations
    COALESCE(SUM(CASE WHEN f.type = 'income' THEN f.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN f.type = 'expense' THEN f.amount ELSE 0 END), 0) as total_expenditure,
    COALESCE(SUM(CASE WHEN f.type = 'income' THEN f.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN f.type = 'expense' THEN f.amount ELSE 0 END), 0) as total_profit,
    -- Savings calculation
    COALESCE(SUM(CASE WHEN sa.status = 'completed' THEN sa.amount ELSE 0 END), 0) as total_savings,
    -- Sales count
    COUNT(DISTINCT sl.id) as sales_count,
    -- Products count
    COUNT(DISTINCT p.id) as products_count
FROM stores s
LEFT JOIN locations l ON s.location_id = l.id
LEFT JOIN markets m ON s.market_id = m.id
LEFT JOIN users u ON s.owner_id = u.id
LEFT JOIN finance f ON s.id = f.store_id
LEFT JOIN savings sa ON s.id = sa.store_id
LEFT JOIN sales sl ON s.id = sl.store_id
LEFT JOIN products p ON s.id = p.store_id
GROUP BY s.id, s.store_name, s.description, s.created_at, s.updated_at, 
         s.location_id, s.market_id, l.name, m.name, u.id, u.email, u.name, u.is_agent;

-- Create RLS policy for the view
CREATE POLICY "Allow authenticated users to read store statistics" ON store_statistics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Function to get markets by location
CREATE OR REPLACE FUNCTION get_markets_by_location(loc_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    location_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, m.location_id, m.created_at
    FROM markets m
    WHERE m.location_id = loc_id
    ORDER BY m.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new market
CREATE OR REPLACE FUNCTION create_market(
    market_name VARCHAR(255),
    loc_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_market_id UUID;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.is_agent = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can create markets';
    END IF;

    -- Insert new market
    INSERT INTO markets (name, location_id)
    VALUES (market_name, loc_id)
    RETURNING id INTO new_market_id;

    RETURN new_market_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a market
CREATE OR REPLACE FUNCTION delete_market(market_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.is_agent = true
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can delete markets';
    END IF;

    -- Check if market is being used by any stores
    IF EXISTS (
        SELECT 1 FROM stores WHERE market_id = market_id
    ) THEN
        RAISE EXCEPTION 'Cannot delete market: It is being used by stores';
    END IF;

    -- Delete the market
    DELETE FROM markets WHERE id = market_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 