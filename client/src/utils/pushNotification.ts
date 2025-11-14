export const sendPushNotification = async (
  fcmToken,
  message,
  title,
  actionLink,
) => {
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
};
