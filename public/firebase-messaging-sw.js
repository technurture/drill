importScripts("https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js");


firebase.initializeApp({
  apiKey: "AIzaSyDbSNIk_nEY6KAA42xn3SZnILTYA1EZKC0",
  authDomain: "mystore-6f6e0.firebaseapp.com",
  projectId: "mystore-6f6e0",
  storageBucket: "mystore-6f6e0.appspot.com",
  messagingSenderId: "196333582095",
  appId: "1:196333582095:web:a1b483a222ede2fa11707a",
  measurementId: "G-P631HQM6GK",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://res.cloudinary.com/docwl6cln/image/upload/v1738170078/favicon-256x256_oq3kb3.png",
    badge: "https://res.cloudinary.com/docwl6cln/image/upload/v1738170078/favicon-256x256_oq3kb3.png",
    image: payload.notification.image,
    data: { url: payload.data?.url || "/" },
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});


self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
