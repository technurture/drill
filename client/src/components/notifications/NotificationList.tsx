import {
  useNotifications,
  useUpdateNotification,
} from "@/integrations/supabase/hooks/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useContext } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import NotificationItem from "./NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

interface NotificationListProps {
  filter?: "all" | "read" | "unread";
}

const NotificationList = ({ filter = "all" }: NotificationListProps) => {
  const { user } = useAuth();
  const theStore = useContext(StoreContext);
  const { isOnline } = useOfflineStatus();
  const {
    data: notifications,
    isLoading,
    error,
  } = useNotifications(user?.id || "", theStore?.id || "");
  const updateNotification = useUpdateNotification();
  
  const handleMarkAsRead = async (id: number) => {
    // Skip notification updates when offline (non-critical operation)
    if (!isOnline) {
      console.log("Skipping notification update while offline");
      return;
    }
    
    try {
      await updateNotification.mutateAsync({ id, read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Filter notifications based on filter prop
  const filteredNotifications = notifications?.filter(notification => {
    if (filter === "read") return notification.read;
    if (filter === "unread") return !notification.read;
    return true; // "all" shows everything
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[60px] w-full rounded-lg" />
        <Skeleton className="h-[60px] w-full rounded-lg" />
        <Skeleton className="h-[60px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading notifications
      </div>
    );
  }

  if (!filteredNotifications?.length) {
    const message = filter === "read" 
      ? "No read notifications" 
      : filter === "unread" 
      ? "No unread notifications" 
      : "No notifications yet";
      
    return (
      <div className="p-4 text-center text-muted-foreground">
        {message}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full py-6 w-full">
      {filteredNotifications && (
        <div className="space-y-2 p-1">
          {filteredNotifications.map(
            (notification) =>
              notification && (
                <NotificationItem
                  key={notification.id}
                  userId={user?.id}
                  storeId={theStore?.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ),
          )}
        </div>
      )}
    </ScrollArea>
  );
};

export default NotificationList;
