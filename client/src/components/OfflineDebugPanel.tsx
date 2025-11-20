import { useState, useEffect } from 'react';
import { actionQueueRepository } from '@/offline/queue/ActionQueueRepository';
import { syncOfflineData } from '@/services/offlineSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, WifiOff, Wifi, Trash2 } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { toast } from 'sonner';

export function OfflineDebugPanel() {
  const { isOnline } = useOfflineStatus();
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [forceOffline, setForceOffline] = useState(false);

  const loadQueue = async () => {
    try {
      const items = await actionQueueRepository.getPending();
      setQueueItems(items);
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncOfflineData();
      toast.success(`Synced ${result.success} items successfully`);
      if (result.failed > 0) {
        toast.error(`${result.failed} items failed to sync`);
      }
      await loadQueue();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearQueue = async () => {
    try {
      await actionQueueRepository.clear();
      toast.success('Queue cleared');
      await loadQueue();
    } catch (error) {
      toast.error('Failed to clear queue');
    }
  };

  const simulateOffline = () => {
    setForceOffline(!forceOffline);
    if (!forceOffline) {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
      toast.info('Simulating offline mode');
    } else {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
      toast.info('Back to normal mode');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Offline Debug Panel
        </CardTitle>
        <CardDescription>
          Monitor and test offline functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600" />
            )}
            <span className="font-medium">
              Status: {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <Badge variant={queueItems.length > 0 ? 'destructive' : 'secondary'}>
            {queueItems.length} pending
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={!isOnline || isSyncing || queueItems.length === 0}
            size="sm"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          <Button
            onClick={handleClearQueue}
            disabled={queueItems.length === 0}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Queue
          </Button>

          <Button
            onClick={simulateOffline}
            variant="outline"
            size="sm"
          >
            {forceOffline ? 'Disable' : 'Simulate'} Offline
          </Button>
        </div>

        {queueItems.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium">Queued Actions:</p>
            {queueItems.map((item, index) => (
              <div
                key={item.id}
                className="p-2 border rounded-md text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{item.type}</Badge>
                  <span className="text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Retry: {item.retryCount}/{item.maxRetries}
                </div>
                {item.error && (
                  <div className="text-red-600 text-xs">{item.error}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>🔧 Debug Info:</p>
          <p>• Service Worker: {navigator.serviceWorker ? '✓' : '✗'}</p>
          <p>• Background Sync: {'sync' in ServiceWorkerRegistration.prototype ? '✓' : '✗'}</p>
          <p>• IndexedDB: {window.indexedDB ? '✓' : '✗'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
