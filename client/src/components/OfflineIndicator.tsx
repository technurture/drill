import { useState, useEffect, useRef } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { actionQueueRepository } from '@/offline/queue/ActionQueueRepository';
import { syncOfflineData } from '@/services/offlineSync';
import { Button } from '@/components/ui/button';

const RECOVERY_DISPLAY_DURATION = 5000; // 5 seconds guaranteed display time

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const { tSubheading } = useLanguage();
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [showOnlineRecovery, setShowOnlineRecovery] = useState(false);
  const isOnlineRef = useRef(isOnline);
  const recoveryTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    let isCurrentEffect = true;
    
    const updateQueueSize = async () => {
      try {
        const count = await actionQueueRepository.getPendingCount();
        if (isCurrentEffect && isOnlineRef.current === isOnline) {
          setQueueSize(count);
        }
      } catch (error) {
        console.error('Failed to get queue size:', error);
      }
    };

    updateQueueSize();
    
    const interval = setInterval(updateQueueSize, 5000);

    if (!isOnline) {
      setShowIndicator(true);
      setShowOnlineRecovery(false);
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
        recoveryTimerRef.current = null;
      }
    } else if (wasOffline) {
      setShowOnlineRecovery(true);
      setShowIndicator(true);
      
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
      }
      
      recoveryTimerRef.current = setTimeout(async () => {
        if (isOnlineRef.current && isCurrentEffect) {
          const count = await actionQueueRepository.getPendingCount();
          if (count === 0) {
            setShowOnlineRecovery(false);
            setShowIndicator(false);
          }
        }
      }, RECOVERY_DISPLAY_DURATION);
    }

    return () => {
      isCurrentEffect = false;
      clearInterval(interval);
    };
  }, [isOnline, wasOffline]);

  const handleManualSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      const result = await syncOfflineData();
      console.log(`✨ Manual sync complete: ${result.success} successful, ${result.failed} failed`);
      
      const count = await actionQueueRepository.getPendingCount();
      setQueueSize(count);
      
      if (count === 0) {
        setTimeout(() => {
          setShowIndicator(false);
          setShowOnlineRecovery(false);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recoveryTimerRef.current) {
        clearTimeout(recoveryTimerRef.current);
      }
    };
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300 max-w-md',
        !isOnline
          ? 'bg-orange-600'
          : 'bg-green-600'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium block">
              {tSubheading('offline.indicator.offline') || "You're offline"}
            </span>
            {queueSize > 0 && (
              <span className="text-sm opacity-90">
                {queueSize} {queueSize === 1 ? 'change' : 'changes'} pending sync
              </span>
            )}
          </div>
        </>
      ) : showOnlineRecovery ? (
        <>
          <Wifi className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium block">
              {tSubheading('offline.indicator.online') || "You're back online!"}
            </span>
            {queueSize > 0 && (
              <span className="text-sm opacity-90">
                {queueSize} {queueSize === 1 ? 'change' : 'changes'} ready to sync
              </span>
            )}
          </div>
          {queueSize > 0 && (
            <Button
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-white text-green-600 hover:bg-green-50 flex-shrink-0"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Now'
              )}
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
}
