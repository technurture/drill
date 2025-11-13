import { openDB, IDBPDatabase } from 'idb';

interface SheBalanceDB {
  'offline-queue': {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
      synced: number;
    };
  };
}

const DB_NAME = 'shebalance-db';
const DB_VERSION = 2;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDB(): Promise<IDBPDatabase<SheBalanceDB>> {
  return await openDB<SheBalanceDB>(DB_NAME, DB_VERSION);
}

async function getOfflineQueue() {
  const db = await getDB();
  const tx = db.transaction('offline-queue', 'readonly');
  const store = tx.objectStore('offline-queue');
  const index = store.index('by-synced');
  return await index.getAll(0);
}

async function removeQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offline-queue', id);
}

async function syncItemToSupabase(item: any, supabaseUrl: string, supabaseKey: string): Promise<boolean> {
  const { action, table, data } = item;
  
  let url = `${supabaseUrl}/rest/v1/${table}`;
  let method = 'POST';
  let body = data;

  switch (action) {
    case 'create':
      method = 'POST';
      break;
    case 'update':
      method = 'PATCH';
      url += `?id=eq.${data.id}`;
      break;
    case 'delete':
      method = 'DELETE';
      url += `?id=eq.${data.id}`;
      body = null;
      break;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal'
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to sync ${action} on ${table}:`, errorText);
    return false;
  }

  return true;
}

export async function handleOfflineSync(): Promise<{ success: number; failed: number }> {
  const queue = await getOfflineQueue();
  let success = 0;
  let failed = 0;

  console.log(`[SW] Starting offline sync - ${queue.length} items in queue`);

  const supabaseUrl = self.location.origin.includes('localhost') || self.location.origin.includes('replit')
    ? 'https://zjvtbxtbjkntnwgmnobf.supabase.co'
    : 'https://zjvtbxtbjkntnwgmnobf.supabase.co';
  
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdnRieHRiamtudG53Z21ub2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzOTU5NDUsImV4cCI6MjA0Njk3MTk0NX0.TJ4j0H4bXqE59Qm-q8jXpRTj_lBQGf_4g1D5y2Hb9hg';

  for (const item of queue) {
    let attempts = 0;
    let synced = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !synced) {
      try {
        const result = await syncItemToSupabase(item, supabaseUrl, supabaseKey);
        
        if (result) {
          await removeQueueItem(item.id);
          success++;
          synced = true;
          console.log(`[SW] ✓ Synced ${item.action} on ${item.table}`);
        } else {
          attempts++;
          if (attempts < MAX_RETRY_ATTEMPTS) {
            await delay(RETRY_DELAY_MS * attempts);
          }
        }
      } catch (error) {
        console.error(`[SW] Exception while syncing item ${item.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, error);
        attempts++;
        if (attempts < MAX_RETRY_ATTEMPTS) {
          await delay(RETRY_DELAY_MS * attempts);
        }
      }
    }

    if (!synced) {
      failed++;
      console.error(`[SW] ✗ Failed to sync item ${item.id} after ${MAX_RETRY_ATTEMPTS} attempts`);
    }
  }

  console.log(`[SW] Offline sync complete - Success: ${success}, Failed: ${failed}`);
  return { success, failed };
}
