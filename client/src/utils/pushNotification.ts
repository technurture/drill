export const sendPushNotification = async (
  fcmToken: string,
  message: string,
  title: string,
  actionLink: string,
) => {
  if (!navigator.onLine) {
    console.log("📴 Offline: Skipping push notification");
    return;
  }

  if (!fcmToken) {
    console.log("⚠️ No FCM token provided");
    return;
  }

  console.log("📤 Sending push notification:", {
    title,
    message,
    recipient_token: `${fcmToken.substring(0, 20)}...`,
    actionLink,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Get the API URL from environment or use relative path
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const endpoint = `${apiUrl}/api/notifications/send`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokens: [fcmToken],
        title: title,
        body: message,
        data: {
          link: actionLink,
          url: actionLink,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Push notification failed with status ${response.status}:`, errorText);
      return;
    }

    const data = await response.json();
    console.log("✅ Push notification sent successfully:", data);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("⏱️ Push notification request timed out");
    } else {
      console.error("❌ Push notification failed:", error.message);
    }
  }
};

