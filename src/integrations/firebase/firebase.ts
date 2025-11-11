import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { supabase } from "../supabase";

const firebaseConfig = {
  apiKey: "AIzaSyDbSNIk_nEY6KAA42xn3SZnILTYA1EZKC0",
  authDomain: "mystore-6f6e0.firebaseapp.com",
  projectId: "mystore-6f6e0",
  storageBucket: "mystore-6f6e0.firebasestorage.app",
  messagingSenderId: "196333582095",
  appId: "1:196333582095:web:a1b483a222ede2fa11707a",
  measurementId: "G-P631HQM6GK",
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const requestNotificationPermission = async (userId: string) => {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BIOug7egzV_kU5p01gM9yjW6l4LdBki7yIAASKhSPcuRVQ15yqAHlcVbquqCznVFirxielFCx-wAaxDt0bpDpHA",
    });
    if (token) {
      const { data, error } = await supabase
        .from("devices_token")
        .select("*")
        .eq("user_id", userId)
        .eq("token", token);
      if (data.length > 0) {
        return token;
      } else {
        await supabase
          .from("devices_token")
          .insert({ token: token, user_id: userId });
        return token;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const onNotificationReceived = () => {
  onMessage(messaging, (payload) => {
    console.log("Notification received:", payload);
  });
};
