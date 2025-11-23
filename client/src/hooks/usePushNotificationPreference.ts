import { useAuth } from "@/contexts/AuthContext";
import { useUser, useUpdatePushNotificationPreference } from "@/integrations/supabase/hooks/users";

export const usePushNotificationPreference = () => {
  const { user } = useAuth();
  const { data: userData, isLoading } = useUser(user?.id);
  const updatePreference = useUpdatePushNotificationPreference();

  const isEnabled = userData?.push_notifications_enabled ?? true;

  const setPreference = async (enabled: boolean) => {
    if (!user?.id) return;

    await updatePreference.mutateAsync({
      id: user.id,
      push_notifications_enabled: enabled,
    });
  };

  return {
    isEnabled,
    setPreference,
    isLoading,
    isUpdating: updatePreference.isPending,
  };
};
