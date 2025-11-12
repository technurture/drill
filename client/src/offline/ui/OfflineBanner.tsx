import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

export function OfflineBanner() {
  const { networkStatus, syncStatus } = useOffline();

  if (networkStatus.isOnline && syncStatus.pendingActions === 0) {
    return null;
  }

  const showSyncStatus = networkStatus.isOnline && syncStatus.pendingActions > 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className={`
          mx-auto max-w-md px-4 py-2 m-2 rounded-lg shadow-lg
          flex items-center gap-2 text-sm font-medium
          pointer-events-auto transition-all duration-300
          ${
            networkStatus.isOnline
              ? 'bg-blue-500 text-white'
              : 'bg-yellow-500 text-gray-900'
          }
        `}
      >
        {networkStatus.isOnline ? (
          showSyncStatus ? (
            <>
              {syncStatus.isSyncing ? (
                <Cloud className="h-4 w-4 animate-pulse" />
              ) : (
                <CloudOff className="h-4 w-4" />
              )}
              <span>
                {syncStatus.isSyncing
                  ? 'Syncing changes...'
                  : `${syncStatus.pendingActions} ${
                      syncStatus.pendingActions === 1 ? 'change' : 'changes'
                    } pending sync`}
              </span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4" />
              <span>Back online</span>
            </>
          )
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline - changes will sync when reconnected</span>
          </>
        )}
      </div>
    </div>
  );
}
