import { useState, useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connection restored - notifying React Query and syncing offline data...');
      setIsOnline(true);
      onlineManager.setOnline(true);
      if (wasOffline) {
        console.log('✅ Back online after being offline');
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      console.log('📴 Connection lost - notifying React Query and switching to offline mode...');
      setIsOnline(false);
      onlineManager.setOnline(false);
      setWasOffline(true);
    };

    // Set initial state in React Query's online manager
    onlineManager.setOnline(navigator.onLine);
    console.log(`🔌 Initial online status: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'}`);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
