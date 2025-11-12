import { getOfflineQueue, markQueueItemSynced, removeQueueItem } from '@/utils/indexedDB';
import { supabase } from '@/integrations/supabase';

export async function syncOfflineData(): Promise<{ success: number; failed: number }> {
  const queue = await getOfflineQueue();
  let success = 0;
  let failed = 0;

  console.log(`Starting offline sync - ${queue.length} items in queue`);

  for (const item of queue) {
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
        console.error(`Failed to sync item ${item.id}:`, result.error);
        failed++;
      } else {
        await removeQueueItem(item.id);
        success++;
        console.log(`Synced ${action} on ${table}`);
      }
    } catch (error) {
      console.error(`Exception while syncing item ${item.id}:`, error);
      failed++;
    }
  }

  console.log(`Offline sync complete - Success: ${success}, Failed: ${failed}`);
  return { success, failed };
}

let syncListenerRegistered = false;

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
    await syncOfflineData().catch(err => console.error('Auto sync failed:', err));
  });
}
