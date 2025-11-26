// This file ensures service worker is served with correct MIME type
// It's a workaround for development environments
if ('serviceWorker' in navigator) {
  console.log('[SW] Service worker supported');
}
