import { useEffect } from 'react';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

/**
 * Component to handle service worker updates
 * Place this in your main App component
 */
export function UpdateNotification() {
    // Initialize the service worker update hook (handles toast notifications internally)
    useServiceWorkerUpdate();

    useEffect(() => {
        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SW_UPDATED') {
                    console.log('[App] Service worker updated, reloading page...');

                    // For Safari and other browsers that don't auto-reload
                    // Wait a bit to ensure the new SW is fully active
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            });

            // Periodically check for updates (every 30 minutes)
            const checkInterval = setInterval(() => {
                navigator.serviceWorker.controller?.postMessage({
                    type: 'CHECK_UPDATE'
                });
            }, 30 * 60 * 1000);

            return () => clearInterval(checkInterval);
        }
    }, []);

    // The actual toast notification is handled by useServiceWorkerUpdate hook
    return null;
}
