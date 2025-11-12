import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const { tSubheading } = useLanguage();

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white transition-all duration-300',
        !isOnline
          ? 'bg-orange-600'
          : 'bg-green-600'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">
            {tSubheading('offline.indicator.offline') || "You're offline - Changes will sync when connection is restored"}
          </span>
        </>
      ) : wasOffline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="font-medium">
            {tSubheading('offline.indicator.online') || "Back online - Syncing data..."}
          </span>
        </>
      ) : null}
    </div>
  );
}
