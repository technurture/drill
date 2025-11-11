-- Super Admin Dashboard Setup SQL
-- This script creates all necessary tables and functions for the admin dashboard

-- 1. Create admin_users table to track admin status
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- 'admin', 'super_admin'
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create help_categories table
CREATE TABLE IF NOT EXISTS help_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create help_articles table
CREATE TABLE IF NOT EXISTS help_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT NOT NULL, -- Rich text content
    category_id UUID REFERENCES help_categories(id) ON DELETE SET NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'english', -- english, yoruba, hausa, igbo, pidgin
    status VARCHAR(20) DEFAULT 'published', -- draft, published, archived
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    media_links JSONB DEFAULT '[]', -- Array of image/video URLs
    notes TEXT,
    important_sections JSONB DEFAULT '[]', -- Array of important section objects
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create help_article_views table for analytics
CREATE TABLE IF NOT EXISTS help_article_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES help_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'user', 'store', 'help_article', etc.
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_category_id ON help_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_language ON help_articles(language);
CREATE INDEX IF NOT EXISTS idx_help_articles_status ON help_articles(status);
CREATE INDEX IF NOT EXISTS idx_help_articles_created_by ON help_articles(created_by);
CREATE INDEX IF NOT EXISTS idx_help_article_views_article_id ON help_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

-- 7. Insert default help categories
INSERT INTO help_categories (name, description, icon, color) VALUES
('Getting Started', 'Basic setup and first steps', 'play-circle', '#10B981'),
('Account Management', 'Managing your account and settings', 'user', '#3B82F6'),
('Sales & Inventory', 'Sales and inventory management', 'shopping-cart', '#F59E0B'),
('Finance & Reports', 'Financial management and reporting', 'dollar-sign', '#8B5CF6'),
('Troubleshooting', 'Common issues and solutions', 'help-circle', '#EF4444'),
('Advanced Features', 'Advanced functionality and tips', 'zap', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- 8. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = user_uuid 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = user_uuid 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
    admin_uuid UUID,
    action_name VARCHAR(100),
    entity_type VARCHAR(50),
    entity_uuid UUID,
    details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_activity_log (admin_id, action, entity_type, entity_id, details, ip_address)
    VALUES (admin_uuid, action_name, entity_type, entity_uuid, details, inet_client_addr());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to increment help article views
CREATE OR REPLACE FUNCTION increment_help_views(article_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Insert view record
    INSERT INTO help_article_views (article_id, user_id, ip_address, user_agent)
    VALUES (article_uuid, user_uuid, inet_client_addr(), current_setting('request.headers')::json->>'user-agent');
    
    -- Update view count
    UPDATE help_articles 
    SET views_count = views_count + 1 
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS Policies

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON admin_users
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users" ON admin_users
    FOR ALL USING (is_super_admin(auth.uid()));

-- Help categories policies
CREATE POLICY "Everyone can view help categories" ON help_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage help categories" ON help_categories
    FOR ALL USING (is_admin(auth.uid()));

-- Help articles policies
CREATE POLICY "Everyone can view published help articles" ON help_articles
    FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage help articles" ON help_articles
    FOR ALL USING (is_admin(auth.uid()));

-- Help article views policies
CREATE POLICY "Admins can view help article views" ON help_article_views
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own views" ON help_article_views
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admin activity log policies
CREATE POLICY "Admins can view activity log" ON admin_activity_log
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert activity log" ON admin_activity_log
    FOR INSERT WITH CHECK (true);

-- 14. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_categories_updated_at
    BEFORE UPDATE ON help_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_help_articles_updated_at
    BEFORE UPDATE ON help_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Insert default super admin (you'll need to replace with actual user ID)
-- INSERT INTO admin_users (user_id, role) VALUES ('YOUR_SUPER_ADMIN_USER_ID', 'super_admin');

-- 16. Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM users WHERE is_agent = true) as total_agents,
    (SELECT COUNT(*) FROM stores) as total_stores,
    (SELECT COUNT(*) FROM help_articles WHERE status = 'published') as total_help_articles,
    (SELECT COUNT(*) FROM help_articles WHERE status = 'draft') as draft_help_articles,
    (SELECT COUNT(*) FROM help_article_views) as total_help_views;

-- 17. Create view for user management
CREATE OR REPLACE VIEW admin_user_management AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    ud.name,
    ud.is_agent,
    ud.registered_by,
    (SELECT COUNT(*) FROM stores WHERE owner_id = u.id) as store_count,
    (SELECT COUNT(*) FROM sales WHERE store_id IN (SELECT id FROM stores WHERE owner_id = u.id)) as sales_count,
    (SELECT COUNT(*) FROM products WHERE store_id IN (SELECT id FROM stores WHERE owner_id = u.id)) as products_count,
    CASE WHEN au.id IS NOT NULL THEN au.role ELSE 'user' END as admin_role
FROM auth.users u
LEFT JOIN users ud ON u.id = ud.id
LEFT JOIN admin_users au ON u.id = au.user_id
ORDER BY u.created_at DESC;

-- 18. Create view for store management
CREATE OR REPLACE VIEW admin_store_management AS
SELECT 
    s.id,
    s.name as store_name,
    s.description,
    s.created_at,
    s.updated_at,
    u.email as owner_email,
    ud.name as owner_name,
    ud.is_agent as owner_is_agent,
    (SELECT COUNT(*) FROM products WHERE store_id = s.id) as products_count,
    (SELECT COUNT(*) FROM sales WHERE store_id = s.id) as sales_count,
    (SELECT SUM(total_price) FROM sales WHERE store_id = s.id) as total_revenue
FROM stores s
JOIN auth.users u ON s.owner_id = u.id
LEFT JOIN users ud ON u.id = ud.id
ORDER BY s.created_at DESC; 