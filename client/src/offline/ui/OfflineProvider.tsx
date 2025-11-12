import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { NetworkStatus, SyncStatus } from '../types';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineSyncManager } from '../sync/OfflineSyncManager';
import { supabaseBackendAdapter } from '../adapters/SupabaseBackendAdapter';

interface OfflineContextValue {
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  syncManager: OfflineSyncManager;
}

export const OfflineContext = createContext<OfflineContextValue | null>(null);

const syncManager = new OfflineSyncManager(supabaseBackendAdapter);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const networkStatus = useNetworkStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingActions: 0,
    errors: []
  });

  useEffect(() => {
    const unsubscribe = syncManager.onSyncStatusChange(setSyncStatus);

    if (networkStatus.isOnline) {
      syncManager.startAutoSync(30000);
    }

    window.addEventListener('online', () => {
      syncManager.syncPendingActions();
    });

    return () => {
      unsubscribe();
      syncManager.stopAutoSync();
    };
  }, [networkStatus.isOnline]);

  return (
    <OfflineContext.Provider value={{ networkStatus, syncStatus, syncManager }}>
      {children}
    </OfflineContext.Provider>
  );
}
