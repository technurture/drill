import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  UserCheck, 
  Search, 
  Filter, 
  UserX, 
  Trash2, 
  Eye,
  Calendar,
  Store,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Download
} from 'lucide-react';
import { useAdminUsers } from '@/integrations/supabase/hooks/admin';
import { format } from 'date-fns';
import { downloadCSV, formatDateForCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

const AdminAgents = () => {
  const { t } = useTranslation('admin');
  const { data: users, isLoading } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Filter only agents
  const agents = users?.filter(user => user.is_agent) || [];

  const filteredAgents = agents.filter(agent => {
    return agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           agent.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const compareAgents = (a: any, b: any) => {
    if (b.store_count !== a.store_count) return b.store_count - a.store_count;
    if (b.sales_count !== a.sales_count) return b.sales_count - a.sales_count;
    return (b.products_count || 0) - (a.products_count || 0);
  };

  // Sort agents (for table view, keeps existing options)
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'stores':
        return b.store_count - a.store_count;
      case 'sales':
        return b.sales_count - a.sales_count;
      default:
        return 0;
    }
  });

  const rankedAgents = [...filteredAgents].sort(compareAgents);

  const agentStats = {
    total: agents.length,
    active: agents.filter(a => a.sales_count > 0).length,
    topPerformer: rankedAgents[0] || null,
    totalStores: agents.reduce((sum, agent) => sum + agent.store_count, 0),
    totalSales: agents.reduce((sum, agent) => sum + agent.sales_count, 0)
  };

  const handleExportAgents = () => {
    const exportData = sortedAgents.map(agent => ({
      'Agent ID': agent.id,
      'Email': agent.email || '',
      'Name': agent.name || '',
      'Gender': agent.gender || '',
      'Age Range': agent.age_range || '',
      'Registered By': agent.registered_by || '',
      'Created Date': formatDateForCSV(agent.created_at),
      'Last Activity': formatDateForCSV(agent.last_sign_in_at),
      'Stores Created': agent.store_count || 0,
      'Sales Count': agent.sales_count || 0,
      'Total Sales Value': agent.total_sales_value || 0
    }));

    downloadCSV(exportData, `agents-export-${new Date().toISOString().split('T')[0]}`);
    toast.success(t('agents.exportSuccess'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('agents.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('agents.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExportAgents}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={agents.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('agents.exportCsv')}
          </Button>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {agents.length} {t('agents.agent').toLowerCase()}s
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('agents.totalAgents')}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.total}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('agents.registeredAgents')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('agents.activeAgents')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.active}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('agents.withSalesActivity')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('agents.totalStores')}</CardTitle>
            <Store className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.totalStores}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('agents.managedByAgents')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('agents.totalSales')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.totalSales}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('agents.throughAgents')}
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
                  placeholder={t('agents.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('agents.mostRecent')}</SelectItem>
                <SelectItem value="name">{t('agents.nameAZ')}</SelectItem>
                <SelectItem value="stores">{t('agents.mostStores')}</SelectItem>
                <SelectItem value="sales">{t('agents.mostSales')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>{t('agents.agent')}s</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('agents.loading')}</p>
            </div>
          ) : sortedAgents.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('agents.noAgentsFound')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('agents.agent')}</TableHead>
                    <TableHead>{t('agents.stores')}</TableHead>
                    <TableHead>{t('agents.sales')}</TableHead>
                    <TableHead>{t('agents.products')}</TableHead>
                    <TableHead>{t('agents.joined')}</TableHead>
                    <TableHead>{t('agents.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {agent.name?.charAt(0) || agent.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {agent.name || t('agents.noName')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {agent.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Store className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{agent.store_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">{agent.sales_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span>{agent.products_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(agent.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={agent.sales_count > 0 ? "default" : "secondary"}
                          className={agent.sales_count > 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                        >
                          {agent.sales_count > 0 ? t('agents.active') : t('agents.inactive')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {agents.length > 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>{t('agents.topPerformingAgents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rankedAgents.slice(0, 3).map((agent, index) => (
                <div key={agent.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agent.name || t('agents.noName')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {agent.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('agents.stores')}:</span>
                      <span className="font-medium">{agent.store_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('agents.sales')}:</span>
                      <span className="font-medium">{agent.sales_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('agents.products')}:</span>
                      <span className="font-medium">{agent.products_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAgents; 