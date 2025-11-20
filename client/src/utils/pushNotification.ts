export const sendPushNotification = async (
  fcmToken,
  message,
  title,
  actionLink,
) => {
  // NOTE: This function is currently disabled because Firebase Cloud Messaging (FCM)
  // handles push notifications automatically via the FCM token stored in the database.
  // The Firebase Admin SDK on your backend (or Firebase Console) should be used to
  // send notifications to users based on their stored FCM tokens.

  console.log("Push notification request (handled by Firebase):", {
    fcmToken,
    title,
    message
  });

  return; // Early return - notifications are handled by Firebase FCM

  /* 
  // Disabled: Custom backend notification endpoint
  // This was causing CORS errors and is unnecessary with Firebase FCM
  
  if (!navigator.onLine) {
    console.log("Offline: Skipping push notification");
    return;
  }

  if (!fcmToken) {
    console.log("No FCM token available");
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://storeer-m3c1.onrender.com/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceToken: fcmToken,
        title: title,
        body: message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`Push notification failed with status: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log("Push notification sent successfully:", data);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("Push notification request timed out");
    } else {
      console.log("Push notification failed (non-critical):", error.message);
    }
  }
  */
};
