import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        console.log('[SW] New service worker waiting');
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }
    };

    // Check for updates on load
    navigator.serviceWorker.ready.then(registration => {
      handleUpdate(registration);

      // Check for updates every hour
      setInterval(() => {
        console.log('[SW] Checking for updates...');
        registration.update();
      }, 60 * 60 * 1000);
    });

    // Listen for new service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading...');
      window.location.reload();
    });

  }, []);

  useEffect(() => {
    if (updateAvailable && waitingWorker) {
      const handleUpdateClick = () => {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
      };

      toast.info("Update Available - A new version is ready!", {
        description: "Tap to update now",
        duration: 0,
        action: {
          label: "Update",
          onClick: handleUpdateClick,
        },
      });
    }
  }, [updateAvailable, waitingWorker]);

  const updateNow = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  return {
    updateAvailable,
    updateNow,
  };
}
