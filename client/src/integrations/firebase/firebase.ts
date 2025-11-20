import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

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

    const token = await getToken(messaging, { vapidKey });

    if (token) {
      // ✅ Log FCM token for testing
      console.log("🔔 FCM Registration Token:");
      console.log(token);
      console.log("\n📋 Copy the token above to test Firebase notifications!");
      console.log("👉 Go to Firebase Console → Messaging → Send test message");

      const { data, error } = await supabase
        .from("devices_token")
        .select("*")
        .eq("user_id", userId)
        .eq("token", token);

      if (error) {
        console.error("Error checking token:", error);
        return null;
      }

      if (data && data.length > 0) {
        console.log("✅ Token already registered in database");
        return token;
      } else {
        const { error: insertError } = await supabase
          .from("devices_token")
          .insert({ token: token, user_id: userId });

        if (insertError) {
          console.error("Error saving token:", insertError);
          return null;
        }

        console.log("✅ Token saved to database");
        toast.success("Push notifications enabled!");
        return token;
      }
    } else {
      console.warn("⚠️ No FCM token received. Check Firebase configuration.");
    }
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
