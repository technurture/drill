import { supabase } from "@/integrations/supabase";
import { toast } from "sonner";

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
    | "inventory_update"
    | "inventory_create"
    | "inventory_delete"
    | "restock"
    | "loan_create"
    | "loan_update"
    | "loan_repayment"
    | "loan_delete"
    | "savings_create"
    | "savings_update"
    | "savings_contribution"
    | "savings_withdraw"
    | "savings_delete"
    | "finance_record"
    | "language_change";
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
    inventory_update: "📋 Inventory Updated",
    inventory_create: "📋 Inventory Created",
    inventory_delete: "📋 Inventory Deleted",
    restock: "📦 Product Restocked",
    loan_create: "💰 New Loan",
    loan_update: "💰 Loan Updated",
    loan_repayment: "💰 Loan Repayment",
    loan_delete: "💰 Loan Deleted",
    savings_create: "🏦 New Savings Plan",
    savings_update: "🏦 Savings Updated",
    savings_contribution: "🏦 Savings Contribution",
    savings_withdraw: "🏦 Savings Withdrawal",
    savings_delete: "🏦 Savings Deleted",
    finance_record: "💵 Finance Record",
    language_change: "🌐 Language Changed",
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
