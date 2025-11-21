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

// Internal helper to avoid double toasts and handle DB/Backend logic
const sendNotificationInternal = async (
  notificationData: NotificationData
): Promise<boolean> => {
  try {
    // Destructure link out to avoid inserting it into the DB (column doesn't exist)
    const { link, ...dbData } = notificationData;

    // Map the extended type to a valid DB type to avoid constraint errors
    const dbType = mapToDbType(notificationData.type);

    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .insert([{ ...dbData, type: dbType, read: false }])
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
            link: link || "/notifications",
            type: notificationData.type, // Keep original specific type for the app/push
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
    console.error("Error in sendNotificationInternal:", error);
    return false;
  }
};

// Exported for direct single-user notifications (if any)
export const sendNotification = async (
  notificationData: NotificationData
): Promise<boolean> => {
  // Show toast for direct calls
  const title = getNotificationTitle(notificationData.type);
  showInAppNotification(title, notificationData.message, "info", notificationData.link);
  return sendNotificationInternal(notificationData);
};

export const sendNotificationToStore = async (
  storeId: string,
  message: string,
  type: NotificationData["type"],
  link?: string
): Promise<boolean> => {
  try {
    // Show immediate toast to the user performing the action
    const title = getNotificationTitle(type);
    showInAppNotification(title, message, "info", link);

    let userIds: string[] = [];

    // First try to get store_users (sales reps)
    // Note: We query store_sales_reps to get emails, then find users by email
    const { data: salesReps, error: repsError } = await supabase
      .from("store_sales_reps")
      .select("email")
      .eq("store_id", storeId);

    if (!repsError && salesReps && salesReps.length > 0) {
      const emails = salesReps.map((r) => r.email);

      // Get user_ids for these emails
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id")
        .in("email", emails); // Assuming 'email' column exists in users table (it usually does in auth, but here it's public.users)
      // Checking database.types.ts: User has 'email'.

      if (!usersError && users) {
        userIds = users.map((u) => u.id);
      }
    }

    // If no store_users found, fallback to store owner
    if (userIds.length === 0) {
      const { data: store, error: ownerError } = await supabase
        .from("stores")
        .select("owner_id")
        .eq("id", storeId)
        .single();

      if (!ownerError && store?.owner_id) {
        userIds.push(store.owner_id);
      } else {
        console.warn("No users or owner found for store:", storeId);
        return false;
      }
    }

    // Send notifications to all users using internal helper (no extra toasts)
    const notificationPromises = userIds.map((userId) =>
      sendNotificationInternal({
        user_id: userId,
        store_id: storeId,
        message,
        type,
        link,
      })
    );

    const results = await Promise.allSettled(notificationPromises);
    const successCount = results.filter((r) => r.status === "fulfilled").length;

    if (successCount === 0) {
      console.error("All notification attempts failed for store:", storeId);
      return false;
    }

    // Try to send push notification
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
      // Push notifications are optional, don't fail the whole operation
      console.log("Push notification unavailable (non-critical)");
    }

    return true;
  } catch (error) {
    console.error("Error in sendNotificationToStore:", error);
    return false;
  }
};

const mapToDbType = (type: NotificationData["type"]): string => {
  // Allowed DB types: "sale" | "note" | "subscription" | "low_stock_threshold" | "expiring_date" | "sales_rep_auth"
  switch (type) {
    case "sale":
      return "sale";
    case "subscription":
      return "subscription";
    case "low_stock_threshold":
      return "low_stock_threshold";
    case "expiring_date":
      return "expiring_date";
    case "sales_rep_auth":
      return "sales_rep_auth";
    case "note":
    default:
      // Map all other new types to "note" as a fallback
      return "note";
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

export const showInAppNotification = (
  title: string,
  message: string,
  type: "success" | "error" | "info" = "info",
  link?: string
) => {
  const options = {
    duration: 4000,
    description: message,
    action: link ? {
      label: "View",
      onClick: () => window.location.href = link
    } : undefined,
  };

  switch (type) {
    case "success":
      toast.success(title, options);
      break;
    case "error":
      toast.error(title, options);
      break;
    default:
      toast(title, options);
  }
};
