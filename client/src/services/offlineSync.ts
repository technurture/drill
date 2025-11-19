import { actionQueueRepository } from '@/offline/queue/ActionQueueRepository';
import { QueryClient } from '@tanstack/react-query';
import type { ActionEnvelope } from '@/offline/types';
import { supabaseBackendAdapter } from '@/offline/adapters/SupabaseBackendAdapter';
import { toast } from 'sonner';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

let queryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function syncOfflineData(): Promise<{ success: number; failed: number }> {
  const queue = await actionQueueRepository.getPending();
  let success = 0;
  let failed = 0;

  if (queue.length === 0) {
    console.log('🔄 Starting offline sync - 0 items in queue');
    return { success, failed };
  }

  console.log(`🔄 Starting offline sync - ${queue.length} items in queue`);
  
  const summary = queue.reduce((acc, item) => {
    const key = item.type;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('📊 Queue summary:', summary);

  toast.loading(`Syncing ${queue.length} offline ${queue.length === 1 ? 'change' : 'changes'}...`, {
    description: 'Your offline data is being synced to the server',
    duration: 3000,
    id: 'offline-sync',
  });

  for (const item of queue) {
    let attempts = 0;
    let synced = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !synced) {
      try {
        await supabaseBackendAdapter.syncAction(item);
        
        await actionQueueRepository.delete(item.id);
        success++;
        synced = true;
        console.log(`✓ Synced ${item.type}`);
      } catch (error) {
        console.error(`Failed to sync item ${item.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, error);
        attempts++;
        if (attempts < MAX_RETRY_ATTEMPTS) {
          await delay(RETRY_DELAY_MS * attempts);
        }
      }
    }

    if (!synced) {
      failed++;
      await actionQueueRepository.updateStatus(item.id, 'failed', 'Max retry attempts exceeded');
      console.error(`✗ Failed to sync item ${item.id} after ${MAX_RETRY_ATTEMPTS} attempts`);
    }
  }

  console.log(`Offline sync complete - Success: ${success}, Failed: ${failed}`);
  
  toast.dismiss('offline-sync');
  
  if (success > 0) {
    toast.success(`Successfully synced ${success} ${success === 1 ? 'change' : 'changes'}!`, {
      description: failed > 0 ? `${failed} ${failed === 1 ? 'change' : 'changes'} failed to sync` : 'All your offline data is now synced to the server',
      duration: 5000,
    });

    if (queryClient) {
      console.log('🔄 Invalidating React Query cache after successful sync...');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['financial_records'] });
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['savings_plans'] });
      queryClient.invalidateQueries({ queryKey: ['savings-plans'] });
      queryClient.invalidateQueries({ queryKey: ['savings-plan'] });
      queryClient.invalidateQueries({ queryKey: ['savings_contributions'] });
      queryClient.invalidateQueries({ queryKey: ['savings-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['savings-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['savings-summary'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan'] });
      queryClient.invalidateQueries({ queryKey: ['loan_repayments'] });
      queryClient.invalidateQueries({ queryKey: ['loan-repayments'] });
      queryClient.invalidateQueries({ queryKey: ['loan-repayments-by-store'] });
      queryClient.invalidateQueries({ queryKey: ['loans-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      console.log('✅ React Query cache invalidated - UI will refresh with synced data');
    }
  } else if (failed > 0) {
    toast.error(`Failed to sync ${failed} ${failed === 1 ? 'change' : 'changes'}`, {
      description: 'Please check your internet connection and try again',
      duration: 5000,
    });
  }
  
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
        console.log('[App] Background sync completed:', event.data.payload);
      }
      
      if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
        console.log('[App] Service worker requested sync - triggering offline sync...');
        syncOfflineData().catch(err => console.error('Service worker sync failed:', err));
      }
    });
  }
}
