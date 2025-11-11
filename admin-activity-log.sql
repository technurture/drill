-- Admin Activity Log Setup
-- This script creates the activity log table and functions for tracking real-time activities

-- Create activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);

-- RLS policies
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read activity logs
CREATE POLICY "Allow authenticated users to read activity logs" ON admin_activity_log
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow system to insert activity logs
CREATE POLICY "Allow system to insert activity logs" ON admin_activity_log
    FOR INSERT WITH CHECK (true);

-- Function to log activities
CREATE OR REPLACE FUNCTION log_admin_activity(
    activity_type VARCHAR(50),
    description TEXT,
    user_id UUID DEFAULT NULL,
    store_id UUID DEFAULT NULL,
    metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_activity_id UUID;
BEGIN
    INSERT INTO admin_activity_log (
        activity_type,
        description,
        user_id,
        store_id,
        metadata
    ) VALUES (
        activity_type,
        description,
        user_id,
        store_id,
        metadata
    ) RETURNING id INTO new_activity_id;

    RETURN new_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activities
CREATE OR REPLACE FUNCTION get_recent_admin_activities(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    activity_type VARCHAR(50),
    description TEXT,
    user_id UUID,
    store_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    user_email TEXT,
    store_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aal.id,
        aal.activity_type,
        aal.description,
        aal.user_id,
        aal.store_id,
        aal.metadata,
        aal.created_at,
        u.email as user_email,
        s.store_name
    FROM admin_activity_log aal
    LEFT JOIN auth.users u ON aal.user_id = u.id
    LEFT JOIN stores s ON aal.store_id = s.id
    ORDER BY aal.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample activities for demonstration
INSERT INTO admin_activity_log (activity_type, description, metadata) VALUES
('user_registration', 'New user registered', '{"email": "demo@example.com"}'),
('store_creation', 'New store created', '{"store_name": "Demo Store"}'),
('agent_promotion', 'User promoted to agent', '{"user_email": "agent@example.com"}'),
('help_article_published', 'Help article published', '{"title": "Getting Started Guide"}'),
('market_created', 'New market created', '{"market_name": "Central Market", "location": "Lagos"}'),
('store_sale', 'Store made a sale', '{"amount": 50000, "store_name": "Electronics Store"}'),
('user_login', 'User logged in', '{"user_email": "user@example.com"}'),
('product_added', 'New product added to store', '{"product_name": "iPhone 15", "store_name": "Tech Store"}'),
('savings_plan_created', 'Savings plan created', '{"amount": 100000, "store_name": "Fashion Store"}'),
('finance_record_added', 'Financial record added', '{"type": "income", "amount": 75000, "store_name": "Food Store"}')
ON CONFLICT DO NOTHING;

-- Create triggers to automatically log activities

-- Trigger for user registration
CREATE OR REPLACE FUNCTION log_user_registration()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_admin_activity(
        'user_registration',
        'New user registered: ' || NEW.email,
        NEW.id,
        NULL,
        jsonb_build_object('email', NEW.email, 'created_at', NEW.created_at)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_user_registration
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_registration();

-- Trigger for store creation
CREATE OR REPLACE FUNCTION log_store_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_admin_activity(
        'store_creation',
        'New store created: ' || NEW.store_name,
        NEW.owner_id,
        NEW.id,
        jsonb_build_object('store_name', NEW.store_name, 'owner_id', NEW.owner_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_store_creation
    AFTER INSERT ON stores
    FOR EACH ROW
    EXECUTE FUNCTION log_store_creation();

-- Trigger for sales
CREATE OR REPLACE FUNCTION log_store_sale()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_admin_activity(
        'store_sale',
        'Store made a sale: ₦' || NEW.total_amount,
        NULL,
        NEW.store_id,
        jsonb_build_object('amount', NEW.total_amount, 'sale_id', NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_store_sale
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION log_store_sale();

-- Trigger for product addition
CREATE OR REPLACE FUNCTION log_product_addition()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_admin_activity(
        'product_added',
        'New product added: ' || NEW.product_name,
        NULL,
        NEW.store_id,
        jsonb_build_object('product_name', NEW.product_name, 'price', NEW.price)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_product_addition
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION log_product_addition();

-- Trigger for savings plan creation
CREATE OR REPLACE FUNCTION log_savings_plan_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_admin_activity(
        'savings_plan_created',
        'Savings plan created: ₦' || NEW.target_amount,
        NULL,
        NEW.store_id,
        jsonb_build_object('target_amount', NEW.target_amount, 'plan_name', NEW.plan_name)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_savings_plan_creation
    AFTER INSERT ON savings
    FOR EACH ROW
    EXECUTE FUNCTION log_savings_plan_creation();

-- Trigger for finance records
CREATE OR REPLACE FUNCTION log_finance_record()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_admin_activity(
        'finance_record_added',
        'Financial record added: ₦' || NEW.amount || ' (' || NEW.type || ')',
        NULL,
        NEW.store_id,
        jsonb_build_object('amount', NEW.amount, 'type', NEW.type, 'reason', NEW.reason)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_finance_record
    AFTER INSERT ON finance
    FOR EACH ROW
    EXECUTE FUNCTION log_finance_record();
