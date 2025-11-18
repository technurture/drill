import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Store, 
  HelpCircle, 
  Settings, 
  Home,
  Shield,
  LogOut,
  BarChart3,
  TrendingUp,
  Activity,
  Plus,
  MapPin
} from 'lucide-react';
import AdminHome from './admin/AdminHome';
import AdminUsers from './admin/AdminUsers';
import AdminAgents from './admin/AdminAgents';
import AdminStores from './admin/AdminStores';
import AdminLocations from './admin/AdminLocations';
import AdminHelp from './admin/AdminHelp';
import AdminSettings from './admin/AdminSettings';
import AdminLoans from './admin/AdminLoans';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('home');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
  };

  const navItems = [
    { id: 'home', label: t('dashboard.home'), icon: Home, component: AdminHome },
    { id: 'users', label: t('dashboard.users'), icon: Users, component: AdminUsers },
    { id: 'agents', label: t('dashboard.agents'), icon: UserCheck, component: AdminAgents },
    { id: 'stores', label: t('dashboard.stores'), icon: Store, component: AdminStores },
    { id: 'loans', label: t('dashboard.loans'), icon: BarChart3, component: AdminLoans },
    { id: 'locations', label: t('dashboard.locations'), icon: MapPin, component: AdminLocations },
    { id: 'help', label: t('dashboard.createHelp'), icon: HelpCircle, component: AdminHelp },
    { id: 'settings', label: t('dashboard.settings'), icon: Settings, component: AdminSettings },
  ];

  const ActiveComponent = navItems.find(item => item.id === activeTab)?.component || AdminHome;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col fixed top-0 left-0 h-screen z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1"
            >
              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${isCollapsed ? "px-2" : "px-4"}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">{t('dashboard.logout')}</span>}
          </Button>
        </div>
      </div>

      {/* Main Content - Offset by sidebar width */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {navItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('dashboard.subtitle')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {t('dashboard.superAdmin')}
              </Badge>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                admin@tacommunity.org
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 