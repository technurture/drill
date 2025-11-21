import { useEffect } from "react";
import { supabase } from "@/integrations/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export const useNotificationSubscription = (userId: string, storeId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !storeId) {
      console.log("🔔 Notification subscription skipped: missing user or store ID");
      return;
    }

    console.log("🔔 Setting up notification subscription for user:", userId, "store:", storeId);

    const channel = supabase
      .channel(`notifications:${userId}:${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🔔 New notification received:", payload);

          const notification = payload.new as any;

          if (notification.store_id === storeId) {
            // Show toast notification with custom styling
            toast(notification.message, {
              description: getNotificationDescription(notification.type),
              icon: <Bell className="h-5 w-5 text-blue-500" />,
              duration: 5000,
              position: "top-right",
              action: notification.link ? {
                label: "View",
                onClick: () => {
                  window.location.href = notification.link;
                }
              } : undefined,
            });

            queryClient.invalidateQueries({ queryKey: ["notifications", userId, storeId] });
            queryClient.invalidateQueries({ queryKey: ["unreadNotifications", userId, storeId] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔔 Cleaning up notification subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, storeId, queryClient]);
};

const getNotificationDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    sale: "A new sale has been recorded",
    note: "You have a new note",
    subscription: "Your subscription has been updated",
    low_stock_threshold: "Product stock is running low",
    expiring_date: "Product is about to expire",
    sales_rep_auth: "Sales rep authorization required",
    product_update: "A product has been updated",
    product_create: "A new product has been added",
    product_delete: "A product has been deleted",
    inventory_update: "Inventory has been updated",
    inventory_create: "New inventory item added",
    inventory_delete: "Inventory item deleted",
    restock: "Product restocked successfully",
    loan_create: "A new loan has been created",
    loan_update: "A loan has been updated",
    loan_repayment: "Loan repayment recorded",
    loan_delete: "A loan has been deleted",
    savings_create: "A new savings plan has been created",
    savings_update: "A savings plan has been updated",
    savings_contribution: "Contribution added to savings",
    savings_withdraw: "Withdrawal from savings",
    savings_delete: "A savings plan has been deleted",
    finance_record: "A new finance record has been added",
    language_change: "Language preference updated",
  };

  return descriptions[type] || "You have a new notification";
};
