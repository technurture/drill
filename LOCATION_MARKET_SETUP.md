# Location and Market Setup

## Overview
This document outlines the implementation of location and market functionality for stores in the SheBalance application.

## Database Changes

### New Tables Created

1. **locations** - Contains all 36 Nigerian states
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR, Unique)
   - `created_at` (TIMESTAMP)

2. **markets** - Contains markets linked to locations
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR)
   - `location_id` (UUID, Foreign Key to locations)
   - `created_at` (TIMESTAMP)

### Modified Tables

1. **stores** - Added new columns
   - `location_id` (UUID, Foreign Key to locations)
   - `market_id` (UUID, Foreign Key to markets)

## SQL Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create locations table (Nigerian States)
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add location_id to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS market_id UUID REFERENCES markets(id);

-- Insert Nigerian States
INSERT INTO locations (name) VALUES 
('Abia'), ('Adamawa'), ('Akwa Ibom'), ('Anambra'), ('Bauchi'),
('Bayelsa'), ('Benue'), ('Borno'), ('Cross River'), ('Delta'),
('Ebonyi'), ('Edo'), ('Ekiti'), ('Enugu'), ('Federal Capital Territory'),
('Gombe'), ('Imo'), ('Jigawa'), ('Kaduna'), ('Kano'),
('Katsina'), ('Kebbi'), ('Kogi'), ('Kwara'), ('Lagos'),
('Nasarawa'), ('Niger'), ('Ogun'), ('Ondo'), ('Osun'),
('Oyo'), ('Plateau'), ('Rivers'), ('Sokoto'), ('Taraba'),
('Yobe'), ('Zamfara')
ON CONFLICT (name) DO NOTHING;

-- Insert default "No Available Market" for each state
INSERT INTO markets (name, location_id)
SELECT 'No Available Market', id FROM locations
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_markets_location_id ON markets(location_id);
CREATE INDEX IF NOT EXISTS idx_stores_location_id ON stores(location_id);
CREATE INDEX IF NOT EXISTS idx_stores_market_id ON stores(market_id);

-- RLS Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations are viewable by everyone" ON locations FOR SELECT USING (true);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Markets are viewable by everyone" ON markets FOR SELECT USING (true);
```

## Frontend Changes

### New Hooks Created
- `useLocations()` - Fetches all Nigerian states
- `useMarketsByLocation(locationId)` - Fetches markets for a specific location
- `useUpdateStoreLocation()` - Updates store location and market

### Updated Components

1. **CreateStore.tsx**
   - Added location select dropdown with all 36 Nigerian states
   - Added market select dropdown that changes based on selected location
   - Default market shows "No Available Market" for all locations
   - Form now saves `location_id` and `market_id` to stores table

2. **Settings.tsx**
   - Added location and market editing functionality
   - Users can change their store's location and market
   - Shows current location and market names
   - Edit mode allows selecting new location and market

3. **SalesTable.tsx & SalesMobileView.tsx**
   - Removed all note functionality as requested
   - Simplified table structure
   - Removed note editing capabilities

### Type Definitions
- Added `Location` and `Market` interfaces
- Updated `Store` interface to include `location_id` and `market_id`

## Features Implemented

✅ **Note Functionality Removed**
- Removed add/edit note buttons from sales table
- Removed note display from sales mobile view
- Removed note-related state and functions

✅ **Location System**
- 36 Nigerian states available for selection
- Location selection in CreateStore page
- Location editing in Settings page

✅ **Market System**
- Markets linked to locations
- "No Available Market" default for all locations
- Market selection changes based on location
- Market editing in Settings page

✅ **Database Integration**
- Proper foreign key relationships
- RLS policies for security
- Indexes for performance
- Default data population

## Usage

1. **Creating a Store**: Users must select a location (state) and market
2. **Editing Store**: Users can change location and market from Settings
3. **Market Management**: Currently shows "No Available Market" for all locations
4. **Future Enhancement**: Can add specific markets for each location

## Next Steps

To add specific markets for locations:
1. Update the markets table with real market data
2. Replace "No Available Market" entries with actual market names
3. The UI will automatically show the new markets when locations are selected 