import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Dynamic import for dotenv to handle environments where it might not be installed
try {
  const dotenv = await import('dotenv');
  dotenv.default.config();
} catch (e) {
  // Silent failure if dotenv is missing - env vars should be set in the environment
  console.log('dotenv not found, assuming environment variables are set.');
}



const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
  vapidKey: process.env.VITE_FIREBASE_VAPID_KEY || '',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

const serviceWorkerContent = `importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

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
`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../client/public/firebase-messaging-sw.js');
fs.writeFileSync(outputPath, serviceWorkerContent);

console.log('✅ firebase-messaging-sw.js generated successfully!');
