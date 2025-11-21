importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp({
  "apiKey": "AIzaSyAnEqc23jGer2bxMn0nzFKatd1-dAWpfZI",
  "authDomain": "shebalance-515fb.firebaseapp.com",
  "projectId": "shebalance-515fb",
  "storageBucket": "shebalance-515fb.firebasestorage.app",
  "messagingSenderId": "814494556312",
  "appId": "1:814494556312:web:f92a2d67e5315e764f70ed",
  "vapidKey": "BD5Te8E-LTutgevf-8wvBwQf_qOkwWnjerU5JilsqcJ78YJODJQI7Ib5lNEil3ciRPE_73MMlWX1W9SMZ2tZMyo",
  "measurementId": "G-18KQJ78C6Q"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || 'New notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || "/Shebalance_icon.png",
    badge: "/Shebalance_icon.png",
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
