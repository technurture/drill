export const sendPushNotification = async (
  fcmToken,
  message,
  title,
  actionLink,
) => {
  fetch("https://storeer-m3c1.onrender.com/send-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceToken: fcmToken,
      title: title,
      body: message,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};
