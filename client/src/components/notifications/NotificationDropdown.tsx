import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useNotifications,
  useUpdateNotification,
  type Notification,
} from "@/integrations/supabase/hooks/notifications";
import NotificationItem from "./NotificationItem";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  userId: string;
  storeId: string;
  unreadCount: number;
}

const NotificationDropdown = ({
  userId,
  storeId,
  unreadCount,
}: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications(userId, storeId);
  const updateNotification = useUpdateNotification();

  const handleMarkAsRead = async (id: number) => {
    try {
      await updateNotification.mutateAsync({ id, read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-notification-dropdown]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const recentNotifications = notifications?.slice(0, 5) || [];

  return (
    <div className="relative" data-notification-dropdown>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 hover:bg-red-500 text-white text-xs border-2 border-white dark:border-gray-900"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
        <Bell className="h-5 w-5" />
      </Button>

      {isOpen && (
        <Card
          className={cn(
            "absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] z-50",
            "border shadow-lg bg-white dark:bg-gray-900"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="p-2 space-y-2">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    userId={userId}
                    storeId={storeId}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </ScrollArea>

          {recentNotifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleViewAll}
                >
                  View all notifications
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationDropdown;
