import { useEffect } from "react";
import { supabase } from "@/integrations/supabase";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "animate-enter" : "animate-leave"
                  } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                  onClick={() => toast.dismiss(t.id)}
                >
                  <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-10 w-10 text-blue-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          New Notification
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t.id);
                      }}
                      className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ),
              {
                duration: 5000,
                position: "top-right",
              }
            );

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
