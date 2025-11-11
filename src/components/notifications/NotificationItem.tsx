import { formatDistanceToNow, format } from "date-fns";
import {
  Bell,
  CheckCircle2,
  FileText,
  CreditCard,
  AlertTriangle,
  User2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useGetUnread,
  type Notification,
} from "@/integrations/supabase/hooks/notifications";
import { useEffect } from "react";

interface NotificationItemProps {
  notification: Notification;
  userId: string;
  storeId: string;
  onMarkAsRead: (id: number) => void;
}

const NotificationItem = ({
  notification,
  userId,
  storeId,
  onMarkAsRead,
}: NotificationItemProps) => {
  if (!notification) {
    return null; // Return nothing if notification is undefined
  }
  const { data: unreads } = useGetUnread(userId, storeId, false);
  useEffect(() => {
    if (unreads) {
      for (const item of unreads) {
        onMarkAsRead(item?.id);
      }
    }
  }, [unreads]);
  const getIcon = () => {
    switch (notification.type) {
      case "sale":
        return <CreditCard className="h-4 w-4" />;
      case "note":
        return <FileText className="h-4 w-4" />;
      case "subscription":
        return <Bell className="h-4 w-4" />;
      case "low_stock_threshold":
        return <AlertTriangle className="h-4 w-4" />;
      case "expiring_date":
        return <AlertTriangle className="h-4 w-4" />;
      case "sales_rep_auth":
        return <User2 className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  return (
    <Card
      className={cn(
        "flex items-start gap-4 p-4 transition-colors",
        !notification.read && "bg-muted/50",
      )}
    >
      <div className="mt-1 text-muted-foreground">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm", !notification.read && "font-medium")}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => onMarkAsRead(notification.id)}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="sr-only">Mark as read</span>
        </Button>
      )}
    </Card>
  );
};

export default NotificationItem;
