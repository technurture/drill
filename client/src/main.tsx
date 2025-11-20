import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/i18n";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw-custom.js', {
        type: 'module',
        scope: '/',
      });
      console.log('✅ Service Worker registered successfully:', registration.scope);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Service Worker update found');
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ New Service Worker installed - refresh to activate');
            }
          });
        }
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
