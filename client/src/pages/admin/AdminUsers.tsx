import React, { useState, useEffect } from 'react';
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Trash2, 
  Eye,
  Calendar,
  Store,
  ShoppingCart,
  Package,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { downloadCSV, formatDateForCSV } from '@/utils/exportUtils';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  name?: string;
  is_agent?: boolean;
  registered_by?: string;
  gender?: string;
  age_range?: string;
}

const AdminUsers = () => {
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users from users table (this contains all user data)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Transform the data to match our interface
      const transformedUsers = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.updated_at, // Use updated_at as proxy for last activity
        name: user.name,
        is_agent: user.is_agent || false,
        registered_by: user.registered_by,
        gender: user.gender,
        age_range: user.age_range
      })) || [];

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      'User ID': user.id,
      'Email': user.email || '',
      'Name': user.name || '',
      'Is Agent': user.is_agent ? 'Yes' : 'No',
      'Gender': user.gender || '',
      'Age Range': user.age_range || '',
      'Registered By': user.registered_by || '',
      'Created Date': formatDateForCSV(user.created_at),
      'Last Activity': formatDateForCSV(user.last_sign_in_at)
    }));

    downloadCSV(exportData, `users-export-${new Date().toISOString().split('T')[0]}`);
    toast.success('Users data exported successfully!');
  };

  const handleToggleAgentStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_agent: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} agent status`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling agent status:', error);
      toast.error('Failed to update agent status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Delete from users table (additional user data)
        const { error: userError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (userError) throw userError;

        // Note: Deleting from auth.users requires admin privileges
        // For now, we'll only delete the additional user data
        // The auth user will remain but won't have access to the app features

        toast.success('User data deleted successfully');
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setGenderFilter('all');
    setAgeRangeFilter('all');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'agents' && user.is_agent) ||
                         (statusFilter === 'users' && !user.is_agent);
    const matchesGender = genderFilter === 'all' || user.gender === genderFilter;
    const matchesAgeRange = ageRangeFilter === 'all' || user.age_range === ageRangeFilter;
    
    return matchesSearch && matchesStatus && matchesGender && matchesAgeRange;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('users.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('users.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('users.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExportUsers}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={filteredUsers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('users.exportCsv')}
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredUsers.length} {t('users.user').toLowerCase()}s
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('users.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('users.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allUsers')}</SelectItem>
                <SelectItem value="users">{t('users.regularUsers')}</SelectItem>
                <SelectItem value="agents">{t('users.agents')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('users.filterByGender')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allGenders')}</SelectItem>
                <SelectItem value="male">{t('users.male')}</SelectItem>
                <SelectItem value="female">{t('users.female')}</SelectItem>
                <SelectItem value="other">{t('users.other')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ageRangeFilter} onValueChange={setAgeRangeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('users.filterByAge')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allAges')}</SelectItem>
                <SelectItem value="18-35">{t('users.age1835')}</SelectItem>
                <SelectItem value="35-40">{t('users.age3540')}</SelectItem>
                <SelectItem value="40 above">{t('users.age40Above')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={clearFilters} className="w-32">{t('users.clearFilters')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>{t('users.user')}s</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('users.noUsersFound')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.user')}</TableHead>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>{t('users.gender')}</TableHead>
                  <TableHead>{t('users.ageRange')}</TableHead>
                  <TableHead>{t('users.status')}</TableHead>
                  <TableHead>{t('users.joined')}</TableHead>
                  <TableHead>{t('users.lastSignIn')}</TableHead>
                  <TableHead>{t('users.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name || t('users.noName')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.gender || t('users.notSpecified')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.age_range || t('users.notSpecified')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.is_agent ? "default" : "secondary"}
                        className={user.is_agent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {user.is_agent ? t('users.agent') : t('users.regularUser')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {user.last_sign_in_at 
                          ? format(new Date(user.last_sign_in_at), 'MMM dd, yyyy HH:mm')
                          : t('users.never')
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUserDetails(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.is_agent ? "destructive" : "default"}
                          onClick={() => handleToggleAgentStatus(user.id, user.is_agent || false)}
                        >
                          {user.is_agent ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('users.userDetails')}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.name')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.name || t('users.noName')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.email')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.gender')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.gender || t('users.notSpecified')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.ageRange')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.age_range || t('users.notSpecified')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.status')}</label>
                  <Badge 
                    variant={selectedUser.is_agent ? "default" : "secondary"}
                    className={selectedUser.is_agent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {selectedUser.is_agent ? t('users.agent') : t('users.regularUser')}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.joined')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {format(new Date(selectedUser.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.lastSignIn')}</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedUser.last_sign_in_at 
                      ? format(new Date(selectedUser.last_sign_in_at), 'MMM dd, yyyy HH:mm')
                      : t('users.never')
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('users.userId')}</label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">{selectedUser.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers; 