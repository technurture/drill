import { supabase } from "@/integrations/supabase";
import toast from "react-hot-toast";

interface NotificationData {
  user_id: string;
  store_id: string;
  message: string;
  type:
    | "sale"
    | "note"
    | "subscription"
    | "low_stock_threshold"
    | "expiring_date"
    | "sales_rep_auth"
    | "product_update"
    | "product_create"
    | "product_delete"
    | "loan_create"
    | "loan_update"
    | "savings_create"
    | "savings_update"
    | "finance_record";
  link?: string;
}

export const sendNotification = async (
  notificationData: NotificationData
): Promise<boolean> => {
  try {
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .insert([{ ...notificationData, read: false }])
      .select()
      .single();

    if (notifError) {
      console.error("Error creating notification:", notifError);
      return false;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    
    try {
      const response = await fetch(`${backendUrl}/api/notifications/send-to-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: notificationData.user_id,
          title: getNotificationTitle(notificationData.type),
          body: notificationData.message,
          data: {
            link: notificationData.link || "/notifications",
            type: notificationData.type,
            notification_id: notification.id.toString(),
          },
        }),
      });

      if (!response.ok) {
        console.warn("Push notification failed, but in-app notification created");
      } else {
        console.log("✅ Push notification sent successfully");
      }
    } catch (pushError) {
      console.warn("Push notification service unavailable:", pushError);
    }

    return true;
  } catch (error) {
    console.error("Error in sendNotification:", error);
    return false;
  }
};

export const sendNotificationToStore = async (
  storeId: string,
  message: string,
  type: NotificationData["type"],
  link?: string
): Promise<boolean> => {
  try {
    const { data: storeUsers, error: storeError } = await supabase
      .from("store_users")
      .select("user_id")
      .eq("store_id", storeId);

    if (storeError || !storeUsers || storeUsers.length === 0) {
      console.log("No users found for store:", storeId);
      return false;
    }

    const notificationPromises = storeUsers.map((storeUser) =>
      sendNotification({
        user_id: storeUser.user_id,
        store_id: storeId,
        message,
        type,
        link,
      })
    );

    await Promise.all(notificationPromises);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    
    try {
      await fetch(`${backendUrl}/api/notifications/send-to-store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          title: getNotificationTitle(type),
          body: message,
          data: {
            link: link || "/notifications",
            type,
          },
        }),
      });
    } catch (pushError) {
      console.warn("Store push notification failed:", pushError);
    }

    return true;
  } catch (error) {
    console.error("Error in sendNotificationToStore:", error);
    return false;
  }
};

const getNotificationTitle = (type: NotificationData["type"]): string => {
  const titles: Record<NotificationData["type"], string> = {
    sale: "🛒 New Sale",
    note: "📝 New Note",
    subscription: "💎 Subscription Update",
    low_stock_threshold: "⚠️ Low Stock Alert",
    expiring_date: "⏰ Expiration Alert",
    sales_rep_auth: "👤 Sales Rep Authorization",
    product_update: "📦 Product Updated",
    product_create: "✨ New Product Added",
    product_delete: "🗑️ Product Deleted",
    loan_create: "💰 New Loan",
    loan_update: "💰 Loan Updated",
    savings_create: "🏦 New Savings",
    savings_update: "🏦 Savings Updated",
    finance_record: "💵 Finance Record",
  };

  return titles[type] || "🔔 New Notification";
};

export const showInAppNotification = (message: string, type: "success" | "error" | "info" = "info") => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
};
