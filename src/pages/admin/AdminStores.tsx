import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Store, 
  Search, 
  Filter, 
  Eye,
  Calendar,
  User,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  MapPin,
  PiggyBank,
  Download
} from 'lucide-react';
import { useStoreStatistics, useAdminStoresWithFilters } from '@/integrations/supabase/hooks/admin';
import { useLocations, useMarketsByLocation } from '@/integrations/supabase/hooks/locations';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { downloadCSV, formatDateForCSV, formatCurrencyForCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

const AdminStores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [isStoreDetailsOpen, setIsStoreDetailsOpen] = useState(false);

  // Fetch inventory data for selected store
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['store-inventory', selectedStore?.store_id],
    queryFn: async () => {
      if (!selectedStore?.store_id) return { purchaseValue: 0, unitValue: 0 };
      
      const { data: products, error } = await supabase
        .from('products')
        .select('quantity, purchased_price, unit_price')
        .eq('store_id', selectedStore.store_id);
      
      if (error) {
        console.error('Error fetching inventory data:', error);
        return { purchaseValue: 0, unitValue: 0 };
      }
      
      const purchaseValue = products?.reduce((sum, product) => {
        const purchasePrice = product.purchased_price || 0;
        return sum + (purchasePrice * product.quantity);
      }, 0) || 0;
      
      const unitValue = products?.reduce((sum, product) => {
        const unitPrice = product.unit_price || 0;
        return sum + (unitPrice * product.quantity);
      }, 0) || 0;
      
      return { purchaseValue, unitValue };
    },
    enabled: !!selectedStore?.store_id,
  });

  // Fetch data
  const { data: locations } = useLocations();
  const { data: markets } = useMarketsByLocation(locationFilter !== 'all' ? locationFilter : '');
  
  // Enhanced store fetching with complete data using separate queries
  const { data: stores, isLoading } = useQuery({
    queryKey: ['admin-stores-complete'],
    queryFn: async () => {
      try {
        // Get all stores with all fields
        const { data: storesData, error: storesError } = await supabase
          .from('stores')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (storesError) {
          console.error('Error fetching stores:', storesError);
          return [];
        }
        
        console.log('Stores data:', storesData); // Debug log
        
        // Debug: Check first store structure
        if (storesData && storesData.length > 0) {
          console.log('First store structure:', Object.keys(storesData[0]));
          console.log('First store data:', storesData[0]);
        }
        
        // Get all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, name, is_agent');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
        }
        
        // Get all locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('id, name');
        
        if (locationsError) {
          console.error('Error fetching locations:', locationsError);
        }
        
        // Get all markets
        const { data: marketsData, error: marketsError } = await supabase
          .from('markets')
          .select('id, name');
        
        if (marketsError) {
          console.error('Error fetching markets:', marketsError);
        }
        
        // Get sales data for each store - schema: sales.total_price
        let salesData: Array<{ store_id: string; total_price: number }> = [];
        try {
          const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('store_id,total_price');
          
          if (salesError) {
            console.error('Error fetching sales:', salesError);
          } else {
            salesData = (sales || []) as Array<{ store_id: string; total_price: number }>;
            console.log('Sales data fetched:', salesData.length, 'records');
          }
        } catch (error) {
          console.log('Sales table might not exist:', error);
        }
        
        // Get products data for each store - schema: products.unit_price, products.purchased_price, products.quantity
        let productsData: Array<{ store_id: string; unit_price?: number; purchased_price?: number; quantity?: number }> = [];
        try {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('store_id,unit_price,purchased_price,quantity');
          
          if (productsError) {
            console.error('Error fetching products:', productsError);
          } else {
            productsData = (products || []) as Array<{ store_id: string; unit_price?: number; purchased_price?: number; quantity?: number }>;
            console.log('Products data fetched:', productsData.length, 'records');
          }
        } catch (error) {
          console.log('Products table might not exist:', error);
        }
        
        // Get income records per store from financial_records (authoritative revenue)
        let incomeRecords: Array<{ store_id: string; amount: string }> = [];
        try {
          const { data: incomes, error: incomesError } = await supabase
            .from('financial_records')
            .select('store_id,amount,type')
            .eq('type', 'income');
          
          if (incomesError) {
            console.error('Error fetching financial incomes:', incomesError);
          } else {
            incomeRecords = (incomes || []) as Array<{ store_id: string; amount: string }>;
            console.log('Income records fetched:', incomeRecords.length, 'records');
          }
        } catch (error) {
          console.log('financial_records table might not exist or inaccessible:', error);
        }
        
        // Get expense records per store from financial_records (authoritative expenses)
        let expenseRecords: Array<{ store_id: string; amount: string }> = [];
        try {
          const { data: expenses, error: expensesError } = await supabase
            .from('financial_records')
            .select('store_id,amount,type')
            .eq('type', 'expense');
          
          if (expensesError) {
            console.error('Error fetching financial expenses:', expensesError);
          } else {
            expenseRecords = (expenses || []) as Array<{ store_id: string; amount: string }>;
            console.log('Expense records fetched:', expenseRecords.length, 'records');
          }
        } catch (error) {
          console.log('financial_records table might not exist or inaccessible:', error);
        }
        
        // Get savings data for each store - optional table, from savings_contributions
        let savingsData: Array<{ store_id: string; amount: string }> = [];
        try {
          const { data: contributions, error: contributionsError } = await supabase
            .from('savings_contributions')
            .select('store_id,amount');
          
          if (contributionsError) {
            console.error('Error fetching savings contributions:', contributionsError);
          } else {
            savingsData = (contributions || []) as Array<{ store_id: string; amount: string }>;
            console.log('Savings contributions fetched:', savingsData.length, 'records');
          }
        } catch (error) {
          console.log('savings_contributions table might not exist (optional):', error);
        }

        // Get savings withdrawals data for each store
        let withdrawalsData: Array<{ store_id: string; amount_withdrawn: string; withdrawal_date: string }> = [];
        try {
          const { data: withdrawals, error: withdrawalsError } = await supabase
            .from('savings_withdrawals')
            .select('savings_plan_id,amount_withdrawn,withdrawal_date');
          
          if (withdrawalsError) {
            console.error('Error fetching savings withdrawals:', withdrawalsError);
          } else {
            // Get savings plans to map to stores
            const { data: savingsPlans, error: plansError } = await supabase
              .from('savings_plans')
              .select('id,store_id');
            
            if (!plansError && savingsPlans) {
              const planToStoreMap = new Map(savingsPlans.map(plan => [plan.id, plan.store_id]));
              withdrawalsData = (withdrawals || []).map(withdrawal => ({
                store_id: planToStoreMap.get(withdrawal.savings_plan_id) || '',
                amount_withdrawn: withdrawal.amount_withdrawn,
                withdrawal_date: withdrawal.withdrawal_date
              })).filter(w => w.store_id) as Array<{ store_id: string; amount_withdrawn: string; withdrawal_date: string }>;
            }
            console.log('Savings withdrawals fetched:', withdrawalsData.length, 'records');
          }
        } catch (error) {
          console.log('savings_withdrawals table might not exist (optional):', error);
        }
        
        // Combine the data
        return storesData?.map(store => {
          const owner = usersData?.find(u => u.id === store.owner_id);
          const location = locationsData?.find(l => l.id === store.location_id);
          const market = marketsData?.find(m => m.id === store.market_id);
          
          // Calculate financial data
          const storeSales = salesData.filter(sale => sale.store_id === store.id);
          const storeProducts = productsData.filter(product => product.store_id === store.id);
          const storeSavings = savingsData.filter(saving => saving.store_id === store.id);
          const storeIncomes = incomeRecords.filter(rec => rec.store_id === store.id);
          const storeWithdrawals = withdrawalsData.filter(withdrawal => withdrawal.store_id === store.id);
          
          // Totals based on existing schema
          const totalIncome = storeIncomes.reduce((sum, rec) => sum + (parseFloat(rec.amount as unknown as string) || 0), 0);
          // Get actual expenses from financial_records table
          const storeExpenses = expenseRecords.filter(rec => rec.store_id === store.id);
          const totalExpenditure = storeExpenses.reduce((sum, rec) => sum + (parseFloat(rec.amount as unknown as string) || 0), 0);
          const totalProfit = totalIncome - totalExpenditure;
          const totalSavings = storeSavings.reduce((sum, saving) => sum + (parseFloat(saving.amount as unknown as string) || 0), 0);
          const totalWithdrawals = storeWithdrawals.reduce((sum, withdrawal) => sum + (parseFloat(withdrawal.amount_withdrawn as unknown as string) || 0), 0);
          
          console.log(`Store ${store.id}:`, {
            name: store.store_name,
            sales: storeSales.length,
            products: storeProducts.length,
            income: totalIncome,
            expenditure: totalExpenditure,
            profit: totalProfit,
            savings: totalSavings,
            withdrawals: totalWithdrawals
          });
          
          return {
            store_id: store.id,
            store_name: store.store_name,
            description: store.store_footnote,
            created_at: store.created_at,
            updated_at: store.created_at, // Using created_at as updated_at since it's not in the structure
            location_id: store.location_id,
            market_id: store.market_id,
            location_name: location?.name,
            market_name: market?.name,
            owner_id: store.owner_id,
            owner_email: owner?.email,
            owner_name: owner?.name,
            owner_is_agent: owner?.is_agent || false,
            total_income: totalIncome,
            total_expenditure: totalExpenditure,
            total_profit: totalProfit,
            total_savings: totalSavings,
            total_withdrawals: totalWithdrawals,
            sales_count: storeSales.length,
            products_count: storeProducts.length
          };
        }) || [];
      } catch (error) {
        console.error('Error in store fetching:', error);
        return [];
      }
    }
  });

  // Use stores from view if available, otherwise use fallback
  const finalStores = stores || [];
  const finalLoading = isLoading;

  // Show loading state
  if (finalLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Management</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage all stores with financial data
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading stores...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredStores = finalStores?.filter(store => {
    const matchesSearch = (store.store_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (store.owner_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (store.owner_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || store.location_id === locationFilter;
    const matchesMarket = marketFilter === 'all' || store.market_id === marketFilter;
    
    return matchesSearch && matchesLocation && matchesMarket;
  }) || [];

  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'name':
        return (a.store_name || '').localeCompare(b.store_name || '');
      case 'revenue':
        return (b.total_income || 0) - (a.total_income || 0);
      case 'profit':
        return (b.total_profit || 0) - (a.total_profit || 0);
      case 'sales':
        return (b.sales_count || 0) - (a.sales_count || 0);
      case 'products':
        return (b.products_count || 0) - (a.products_count || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil((sortedStores.length || 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedStores = sortedStores.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const storeStats = {
    total: finalStores?.length || 0,
    active: finalStores?.filter(s => s.sales_count > 0).length || 0,
    totalRevenue: finalStores?.reduce((sum, store) => sum + (store.total_income || 0), 0) || 0,
    totalProfit: finalStores?.reduce((sum, store) => sum + (store.total_profit || 0), 0) || 0,
    totalSavings: finalStores?.reduce((sum, store) => sum + (store.total_savings || 0), 0) || 0,
    totalSales: finalStores?.reduce((sum, store) => sum + store.sales_count, 0) || 0,
    totalProducts: finalStores?.reduce((sum, store) => sum + store.products_count, 0) || 0
  };

  const handleExportStores = () => {
    const exportData = sortedStores.map(store => ({
      'Store ID': store.store_id,
      'Store Name': store.store_name || '',
      'Description': store.description || '',
      'Location': store.location_name || '',
      'Market': store.market_name || '',
      'Owner Email': store.owner_email || '',
      'Owner Name': store.owner_name || '',
      'Is Agent': store.owner_is_agent ? 'Yes' : 'No',
      'Created Date': formatDateForCSV(store.created_at),
      'Total Income': formatCurrencyForCSV(store.total_income),
      'Total Expenditure': formatCurrencyForCSV(store.total_expenditure),
      'Total Profit': formatCurrencyForCSV(store.total_profit),
      'Total Savings': formatCurrencyForCSV(store.total_savings),
      'Total Withdrawals': formatCurrencyForCSV(store.total_withdrawals),
      'Sales Count': store.sales_count || 0,
      'Products Count': store.products_count || 0
    }));

    downloadCSV(exportData, `stores-export-${new Date().toISOString().split('T')[0]}`);
    toast.success('Stores data exported successfully!');
  };

  const openStoreDetails = (store: any) => {
    setSelectedStore(store);
    setIsStoreDetailsOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setMarketFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage all stores with financial data
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExportStores}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={sortedStores.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {finalStores?.length || 0} stores
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{storeStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Across all stores
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{storeStats.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Net profit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{storeStats.totalSavings.toLocaleString()}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Completed savings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <Store className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats.active}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              With sales activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search stores by name, owner email, or owner name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets?.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Store Name</SelectItem>
                <SelectItem value="revenue">Highest Revenue</SelectItem>
                <SelectItem value="profit">Highest Profit</SelectItem>
                <SelectItem value="sales">Most Sales</SelectItem>
                <SelectItem value="products">Most Products</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={clearFilters} className="w-32">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Stores</CardTitle>
        </CardHeader>
        <CardContent>
          {finalLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading stores...</p>
              </div>
            </div>
          ) : sortedStores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No stores found</p>
            </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Market</TableHead>
                    <TableHead>Revenue</TableHead>
                  <TableHead>Profit</TableHead>
                                      <TableHead>Savings</TableHead>
                    <TableHead>Withdrawals</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedStores.map((store) => (
                  <TableRow key={store.store_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {(store.store_name?.charAt(0) || 'S').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                            {store.store_name || 'Unnamed Store'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {(store.store_id || '').slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                          <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                              {store.owner_name || 'No name'}
                            </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {store.owner_email || 'No email'}
                        </p>
                        <Badge 
                          variant={store.owner_is_agent ? "default" : "secondary"}
                          className={store.owner_is_agent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {store.owner_is_agent ? 'Agent' : 'User'}
                        </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {store.location_name || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {store.market_name || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-green-600">
                        ₦{(store.total_income || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${(store.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₦{(store.total_profit || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-purple-600">
                        ₦{(store.total_savings || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-red-600">
                        ₦{(store.total_withdrawals || 0).toLocaleString()}
                      </span>
                    </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{store.sales_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{store.products_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                          {store.created_at 
                            ? format(new Date(store.created_at), 'MMM dd, yyyy')
                            : 'Not available'
                          }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStoreDetails(store)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {sortedStores.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages} • Showing {(pagedStores.length)} of {sortedStores.length} stores
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      )}

      {/* Store Details Modal */}
      <Dialog open={isStoreDetailsOpen} onOpenChange={setIsStoreDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Store Details</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Store Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.store_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Owner</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.owner_name || 'No name'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Owner Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.owner_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Owner Type</label>
                  <Badge variant={selectedStore.owner_is_agent ? "default" : "secondary"}>
                    {selectedStore.owner_is_agent ? 'Agent' : 'User'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.location_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Market</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.market_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedStore.created_at 
                      ? format(new Date(selectedStore.created_at), 'MMM dd, yyyy HH:mm')
                      : 'Not available'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedStore.updated_at 
                      ? format(new Date(selectedStore.updated_at), 'MMM dd, yyyy HH:mm')
                      : 'Not available'
                    }
                  </p>
                </div>
              </div>
              
              {selectedStore.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white">{selectedStore.description}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Financial Summary</h4>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₦{(selectedStore.total_income || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Income</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">₦{(selectedStore.total_expenditure || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenditure</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className={`text-2xl font-bold ${(selectedStore.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₦{(selectedStore.total_profit || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Profit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">₦{(selectedStore.total_savings || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Savings</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">₦{(selectedStore.total_withdrawals || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Withdrawals</div>
                  </div>
                </div>
              </div>

              {/* Inventory Value Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Inventory Value</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="w-5 h-5 text-emerald-600 mr-2" />
                      <span className="text-sm font-medium text-emerald-600">Total Store Inventory Value</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {inventoryLoading ? (
                        <div className="animate-pulse">Loading...</div>
                      ) : (
                        `₦${(inventoryData?.purchaseValue || 0).toLocaleString()}`
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Based on purchase price</div>
                  </div>
                  <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="w-5 h-5 text-teal-600 mr-2" />
                      <span className="text-sm font-medium text-teal-600">Total Store Inventory Value</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-600">
                      {inventoryLoading ? (
                        <div className="animate-pulse">Loading...</div>
                      ) : (
                        `₦${(inventoryData?.unitValue || 0).toLocaleString()}`
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Based on selling price</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Activity Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedStore.sales_count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Sales</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedStore.products_count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{selectedStore.store_id.slice(0, 8)}...</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Store ID</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStores; 