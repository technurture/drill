import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useContext } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import toast from "react-hot-toast";

export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const { user } = useAuth();
  const theStore = useContext(StoreContext);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const saveSubscription = async (subscription: PushSubscription) => {
    try {
      const { endpoint, keys } = JSON.parse(JSON.stringify(subscription));

      await supabase.from("push_notification_subscriptions").insert({
        user_id: user?.id,
        store_id: theStore?.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });

      toast.success("Push notifications enabled successfully");
    } catch (error) {
      console.error("Error saving push subscription:", error);
      toast.error("Failed to enable push notifications");
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Push notifications are not supported");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      // Subscribe to push notifications
      const subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
      };

      const pushSubscription =
        await registration.pushManager.subscribe(subscriptionOptions);
      setSubscription(pushSubscription);

      // Save the subscription to Supabase
      await saveSubscription(pushSubscription);
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast.error("Failed to subscribe to push notifications");
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();

        // Remove from Supabase
        await supabase
          .from("push_notification_subscriptions")
          .delete()
          .match({ user_id: user?.id, store_id: theStore?.id });

        setSubscription(null);
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast.error("Failed to disable push notifications");
    }
  };

  return {
    subscription,
    permission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
  };
};
