import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";
import { supabase } from "../supabase";
import { toast } from "sonner";
import { fcmTokenService } from "@/services/fcmTokenService";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app;
let messaging;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase configuration not complete. Push notifications disabled.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, messaging };

/**
 * Get FCM token without requesting permission (for already-granted permission)
 * This is Safari-compatible as it doesn't trigger the permission prompt
 * Now uses FCM token service for better token management
 */
export const getNotificationToken = async (userId: string) => {
  try {
    if (!messaging) {
      console.warn("Firebase messaging not initialized");
      return null;
    }

    // Only proceed if permission is already granted
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted yet");
      return null;
    }

    // Clear any invalid tokens first
    await fcmTokenService.clearInvalidTokens();

    // Get token using the service (handles validation and refresh)
    const token = await fcmTokenService.getToken();

    if (token) {
      // ✅ Log FCM token for testing
      console.log("🔔 FCM Registration Token:");
      console.log(token);
      console.log("\n📋 Copy the token above to test Firebase notifications!");
      console.log("👉 Go to Firebase Console → Messaging → Send test message");

      // Check if user already has ANY token registered
      const { data: existingTokens, error } = await supabase
        .from("devices_token")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error checking token:", error);
        return null;
      }

      // Check if the current token is already registered
      const tokenExists = existingTokens?.some(t => t.token === token);

      if (tokenExists) {
        console.log("✅ Token already registered in database");
        return token;
      } else {
        // Add new token WITHOUT deleting old ones
        // This allows users to receive notifications on multiple devices/browsers
        console.log("📱 Registering new device token...");

        const { error: insertError } = await supabase
          .from("devices_token")
          .insert({ token: token, user_id: userId });

        if (insertError) {
          console.error("Error saving token:", insertError);
          return null;
        }

        console.log("✅ Token saved to database");
        console.log(`📊 User now has ${(existingTokens?.length || 0) + 1} registered device(s)`);
        toast.success("Push notifications enabled on this device!");
        return token;
      }
    } else {
      console.warn("⚠️ No FCM token received. Check Firebase configuration.");
    }
  } catch (error) {
    console.error("Error getting notification token:", error);
    return null;
  }
};

/**
 * Request notification permission (requires user gesture in Safari)
 * Use this from button clicks or user interactions
 */
export const requestNotificationPermission = async (userId: string) => {
  try {
    if (!messaging) {
      console.warn("Firebase messaging not initialized");
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("VAPID key not configured");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notification permission denied");
      return null;
    }

    // After permission granted, get the token
    return await getNotificationToken(userId);
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    toast.error("Failed to enable notifications");
    return null;
  }
};

export const onNotificationReceived = (callback?: (payload: any) => void) => {
  if (!messaging) {
    console.warn("Firebase messaging not initialized");
    return;
  }

  onMessage(messaging, (payload) => {
    console.log("Notification received:", payload);

    const { notification } = payload;
    if (notification) {
      toast.success(`${notification.title}: ${notification.body}`, {
        duration: 5000,
        position: "top-right",
      });
    }

    if (callback) {
      callback(payload);
    }
  });
};

/**
 * Setup service worker message listener for notification clicks
 */
export const setupNotificationClickHandler = (navigate: (path: string) => void) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const { link, data } = event.data;
        console.log('Notification clicked, navigating to:', link);

        // Navigate to the link
        navigate(link);

        // Notify service worker that we've navigated
        navigator.serviceWorker.controller?.postMessage({
          type: 'NOTIFICATION_NAVIGATE',
          link,
        });
      }
    });
  }
};
