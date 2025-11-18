import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Database, 
  Users, 
  Store, 
  HelpCircle,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/supabase';

interface SystemStats {
  totalUsers: number;
  totalStores: number;
  totalAgents: number;
  systemUptime: string;
  lastBackup: string;
  databaseSize: string;
}

interface AdminSettings {
  maintenanceMode: boolean;
  userRegistration: boolean;
  emailNotifications: boolean;
  autoBackup: boolean;
  debugMode: boolean;
}

const AdminSettings = () => {
  const { t } = useTranslation('admin');
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStores: 0,
    totalAgents: 0,
    systemUptime: '0 days',
    lastBackup: 'Never',
    databaseSize: '0 MB'
  });
  
  const [settings, setSettings] = useState<AdminSettings>({
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    autoBackup: true,
    debugMode: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSystemStats();
    fetchSettings();
  }, []);

  const fetchSystemStats = async () => {
    try {
      // Fetch real data from Supabase
      const [usersResult, storesResult, agentsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('stores').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_agent', true)
      ]);

      setSystemStats({
        totalUsers: usersResult.count || 0,
        totalStores: storesResult.count || 0,
        totalAgents: agentsResult.count || 0,
        systemUptime: '7 days', // Mock data
        lastBackup: new Date().toLocaleDateString(),
        databaseSize: '2.4 MB' // Mock data
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      // In a real app, you'd fetch settings from a settings table
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof AdminSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real app, you'd save to a settings table
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      {/* System Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('settings.title')}</h2>
              <p className="text-blue-100">
                {t('settings.subtitle')}
              </p>
            </div>
            <div className="hidden md:block">
              <Settings className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('settings.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('settings.registeredUsers')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('settings.totalStores')}</CardTitle>
            <Store className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalStores}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('settings.activeStores')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('settings.totalAgents')}</CardTitle>
            <HelpCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalAgents}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('settings.activeAgents')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Info */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {t('settings.databaseInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.databaseSize')}</span>
            <span className="font-medium">{systemStats.databaseSize}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.lastBackup')}</span>
            <span className="font-medium">{systemStats.lastBackup}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('settings.systemStatus')}</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {t('settings.operational')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings; 