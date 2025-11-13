import { getOfflineQueue, markQueueItemSynced, removeQueueItem } from '@/utils/indexedDB';
import { supabase } from '@/integrations/supabase';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function syncOfflineData(): Promise<{ success: number; failed: number }> {
  const queue = await getOfflineQueue();
  let success = 0;
  let failed = 0;

  console.log(`Starting offline sync - ${queue.length} items in queue`);

  for (const item of queue) {
    let attempts = 0;
    let synced = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !synced) {
      try {
        const { action, table, data } = item;
        let result;

        switch (action) {
          case 'create':
            result = await supabase.from(table).insert(data);
            break;
          case 'update':
            result = await supabase.from(table).update(data).eq('id', data.id);
            break;
          case 'delete':
            result = await supabase.from(table).delete().eq('id', data.id);
            break;
        }

        if (result && result.error) {
          console.error(`Failed to sync item ${item.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, result.error);
          attempts++;
          if (attempts < MAX_RETRY_ATTEMPTS) {
            await delay(RETRY_DELAY_MS * attempts);
          }
        } else {
          await removeQueueItem(item.id);
          success++;
          synced = true;
          console.log(`✓ Synced ${action} on ${table}`);
        }
      } catch (error) {
        console.error(`Exception while syncing item ${item.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, error);
        attempts++;
        if (attempts < MAX_RETRY_ATTEMPTS) {
          await delay(RETRY_DELAY_MS * attempts);
        }
      }
    }

    if (!synced) {
      failed++;
      console.error(`✗ Failed to sync item ${item.id} after ${MAX_RETRY_ATTEMPTS} attempts`);
    }
  }

  console.log(`Offline sync complete - Success: ${success}, Failed: ${failed}`);
  return { success, failed };
}

let syncListenerRegistered = false;

export async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('offline-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.warn('Background sync registration failed:', error);
      console.log('Falling back to online event listener');
    }
  }
}

export function setupAutoSync() {
  if (syncListenerRegistered) {
    return;
  }

  syncListenerRegistered = true;

  if (navigator.onLine) {
    console.log('App started while online - triggering initial sync...');
    syncOfflineData().catch(err => console.error('Initial sync failed:', err));
  }

  window.addEventListener('online', async () => {
    console.log('Connection restored - starting auto sync...');
    
    try {
      await registerBackgroundSync();
    } catch (error) {
      console.warn('Failed to register background sync, syncing immediately:', error);
      await syncOfflineData().catch(err => console.error('Auto sync failed:', err));
    }
    
    await syncOfflineData().catch(err => console.error('Auto sync failed:', err));
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log('Background sync completed:', event.data.payload);
      }
    });
  }
}
