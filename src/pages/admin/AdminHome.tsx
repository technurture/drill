import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  Store, 
  HelpCircle, 
  TrendingUp, 
  Activity,
  BarChart3,
  Eye,
  Plus,
  FileText,
  DollarSign,
  ShoppingCart,
  Package,
  PiggyBank,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/supabase';
import { formatDistanceToNow } from 'date-fns';

interface AdminStats {
  total_users: number;
  total_agents: number;
  total_stores: number;
  total_help_articles: number;
  draft_help_articles: number;
  total_help_views: number;
  total_inventory_value_purchase: number;
  total_inventory_value_unit: number;
}

interface RecentActivity {
  id: string;
  type: 'user_login' | 'user_registration' | 'store_creation' | 'agent_promotion' | 'sale_made';
  user_email: string;
  user_name: string;
  description: string;
  timestamp: string;
  store_name?: string;
}

const AdminHome = () => {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_agents: 0,
    total_stores: 0,
    total_help_articles: 0,
    draft_help_articles: 0,
    total_help_views: 0,
    total_inventory_value_purchase: 0,
    total_inventory_value_unit: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users count from users table (this includes all registered users)
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch agents count from users table
      const { count: agentsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_agent', true);

      // Fetch stores count
      const { count: storesCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true });

      // Fetch total inventory values from products table
      let totalInventoryValuePurchase = 0;
      let totalInventoryValueUnit = 0;
      try {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('quantity, purchased_price, unit_price');
        
        if (!productsError && products) {
          totalInventoryValuePurchase = products.reduce((sum, product) => {
            const purchasePrice = product.purchased_price || 0;
            return sum + (purchasePrice * product.quantity);
          }, 0);
          
          totalInventoryValueUnit = products.reduce((sum, product) => {
            const unitPrice = product.unit_price || 0;
            return sum + (unitPrice * product.quantity);
          }, 0);
        }
      } catch (error) {
        console.log('products table might not exist:', error);
      }

      // Fetch recent user activities (last 10 users with recent activity)
      const { data: recentUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, created_at, updated_at, is_agent')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!usersError && recentUsers) {
        const activities: RecentActivity[] = recentUsers.map((user, index) => ({
          id: user.id,
          type: user.is_agent ? 'agent_promotion' : 'user_registration',
          user_email: user.email || '',
          user_name: user.name || 'No name',
          description: user.is_agent 
            ? `Agent '${user.name || user.email}' logged in`
            : `User '${user.name || user.email}' logged in`,
          timestamp: user.updated_at || user.created_at,
          store_name: undefined
        }));
        setRecentActivities(activities);
      }

      // Fetch help articles count (if table exists)
      let helpArticlesCount = 0;
      let draftArticlesCount = 0;
      let helpViewsCount = 0;

      try {
        const { count: publishedCount } = await supabase
          .from('help_articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
        helpArticlesCount = publishedCount || 0;

        const { count: draftCount } = await supabase
          .from('help_articles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft');
        draftArticlesCount = draftCount || 0;

        const { count: viewsCount } = await supabase
          .from('help_article_views')
          .select('*', { count: 'exact', head: true });
        helpViewsCount = viewsCount || 0;
      } catch (error) {
        console.log('Help tables not found yet:', error);
      }

      setStats({
        total_users: usersCount || 0,
        total_agents: agentsCount || 0,
        total_stores: storesCount || 0,
        total_help_articles: helpArticlesCount,
        draft_help_articles: draftArticlesCount,
        total_help_views: helpViewsCount,
        total_inventory_value_purchase: totalInventoryValuePurchase,
        total_inventory_value_unit: totalInventoryValueUnit
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-blue-100">
                Manage users, stores, and help content from one central location
              </p>
            </div>
            <div className="hidden md:block">
              <Activity className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_agents}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Active agents
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores</CardTitle>
            <Store className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_stores}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Active stores
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value (All Stores)</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Purchase Price:</span>
                <span className="text-lg font-semibold text-green-600">₦{stats.total_inventory_value_purchase.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Unit Price:</span>
                <span className="text-lg font-semibold text-blue-600">₦{stats.total_inventory_value_unit.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activities
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Live</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchStats}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'user_registration' ? 'bg-blue-500' :
                      activity.type === 'agent_promotion' ? 'bg-purple-500' :
                      activity.type === 'store_creation' ? 'bg-green-500' :
                      activity.type === 'sale_made' ? 'bg-orange-500' : 'bg-gray-500'
                    } text-white`}>
                      {activity.type === 'user_registration' ? <Users className="w-4 h-4" /> :
                       activity.type === 'agent_promotion' ? <UserCheck className="w-4 h-4" /> :
                       activity.type === 'store_creation' ? <Store className="w-4 h-4" /> :
                       activity.type === 'sale_made' ? <ShoppingCart className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                <span className="font-medium">{stats.total_users}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Agents</span>
                <span className="font-medium">{stats.total_agents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Stores</span>
                <span className="font-medium">{stats.total_stores}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">System Status</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome; 