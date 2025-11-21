import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/integrations/supabase/hooks/users';

interface NotificationPreferences {
    id?: string;
    user_id: string;
    enabled: boolean;
    sales: boolean;
    inventory: boolean;
    loans: boolean;
    messages: boolean;
    daily_summary: boolean;
}

export const useNotificationPreferences = () => {
    const { user: authUser } = useAuth();
    const { data: user } = useCurrentUser(authUser?.id || '');
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPreferences = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/notifications/preferences/${user.id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch preferences');
            }

            const data = await response.json();
            setPreferences(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            console.error('Error fetching notification preferences:', err);
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
        if (!user?.id) {
            return false;
        }

        try {
            const response = await fetch(`/api/notifications/preferences/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error('Failed to update preferences');
            }

            const data = await response.json();
            setPreferences(data);
            setError(null);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            console.error('Error updating notification preferences:', err);
            return false;
        }
    };

    const sendTestNotification = async () => {
        if (!user?.id) {
            return false;
        }

        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to send test notification');
            }

            return true;
        } catch (err) {
            console.error('Error sending test notification:', err);
            return false;
        }
    };

    useEffect(() => {
        fetchPreferences();
    }, [user?.id]);

    return {
        preferences,
        loading,
        error,
        updatePreferences,
        sendTestNotification,
        refetch: fetchPreferences,
    };
};
