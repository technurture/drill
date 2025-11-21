import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { requestNotificationPermission } from '@/integrations/firebase/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/integrations/supabase/hooks/users';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { data: user } = useCurrentUser(authUser?.id || '');
    const {
        preferences,
        loading,
        error,
        updatePreferences,
        sendTestNotification,
    } = useNotificationPreferences();

    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [testingNotification, setTestingNotification] = useState(false);

    const handleRequestPermission = async () => {
        if (!user?.id) {
            toast.error('You must be logged in');
            return;
        }

        try {
            const token = await requestNotificationPermission(user.id);

            if (token) {
                setPermissionStatus('granted');
                toast.success('Notifications enabled!');
            } else {
                toast.error('Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            toast.error('Failed to enable notifications');
        }
    };

    const handleToggle = async (key: string, value: boolean) => {
        const success = await updatePreferences({ [key]: value });

        if (success) {
            toast.success('Preferences updated');
        } else {
            toast.error('Failed to update preferences');
        }
    };

    const handleTestNotification = async () => {
        setTestingNotification(true);

        const success = await sendTestNotification();

        if (success) {
            toast.success('Test notification sent!');
        } else {
            toast.error('Failed to send test notification');
        }

        setTestingNotification(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-gray-500">Loading preferences...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-red-500">Error loading preferences: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mr-4"
                >
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-2xl font-bold">Notification Settings</h1>
            </div>

            {/* Permission Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-2 flex items-center">
                            <Bell size={20} className="mr-2 text-blue-500" />
                            Browser Permissions
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {permissionStatus === 'granted'
                                ? 'Notifications are enabled for this browser'
                                : 'Enable notifications to receive alerts'}
                        </p>

                        {permissionStatus !== 'granted' && (
                            <Button onClick={handleRequestPermission}>
                                Enable Notifications
                            </Button>
                        )}

                        {permissionStatus === 'granted' && (
                            <Button
                                variant="outline"
                                onClick={handleTestNotification}
                                disabled={testingNotification}
                            >
                                {testingNotification ? 'Sending...' : 'Send Test Notification'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            {preferences && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>

                    <div className="space-y-4">
                        {/* Master Toggle */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 className="font-medium">All Notifications</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enable or disable all notifications
                                </p>
                            </div>
                            <Switch
                                checked={preferences.enabled}
                                onCheckedChange={(value) => handleToggle('enabled', value)}
                            />
                        </div>

                        {/* Individual Toggles */}
                        <div className={`space-y-4 ${!preferences.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Sales */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">💰 Sales</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        New sales and transactions
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.sales}
                                    onCheckedChange={(value) => handleToggle('sales', value)}
                                />
                            </div>

                            {/* Inventory */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">⚠️ Inventory</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Low stock alerts
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.inventory}
                                    onCheckedChange={(value) => handleToggle('inventory', value)}
                                />
                            </div>

                            {/* Loans */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">📅 Loans</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Payment reminders and updates
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.loans}
                                    onCheckedChange={(value) => handleToggle('loans', value)}
                                />
                            </div>

                            {/* Messages */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">💬 Messages</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        New messages and updates
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.messages}
                                    onCheckedChange={(value) => handleToggle('messages', value)}
                                />
                            </div>

                            {/* Daily Summary */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">📊 Daily Summary</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Daily business summary
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.daily_summary}
                                    onCheckedChange={(value) => handleToggle('daily_summary', value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
