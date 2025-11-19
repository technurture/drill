importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp({
  "apiKey": "",
  "authDomain": "",
  "projectId": "",
  "storageBucket": "",
  "messagingSenderId": "",
  "appId": "",
  "measurementId": ""
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || "/Shebanlace_favicon.png",
    badge: "/Shebanlace_favicon.png",
    image: payload.notification?.image,
    data: { 
      url: payload.data?.url || payload.fcmOptions?.link || "/",
      ...payload.data
    },
    tag: payload.data?.tag || 'default',
    requireInteraction: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
