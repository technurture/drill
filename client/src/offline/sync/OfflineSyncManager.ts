import type { BackendSyncAdapter, SyncStatus } from '../types';
import { actionQueueRepository } from '../queue/ActionQueueRepository';

export class OfflineSyncManager {
  private adapter: BackendSyncAdapter;
  private isSyncing = false;
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private syncInterval: number | null = null;

  constructor(adapter: BackendSyncAdapter) {
    this.adapter = adapter;
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifySyncStatus(status: Partial<SyncStatus>): void {
    const fullStatus: SyncStatus = {
      isSyncing: this.isSyncing,
      pendingActions: 0,
      errors: [],
      ...status
    };
    
    this.syncListeners.forEach(listener => listener(fullStatus));
  }

  async startAutoSync(intervalMs: number = 30000): Promise<void> {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingActions();
      }
    }, intervalMs);

    if (navigator.onLine) {
      await this.syncPendingActions();
    }
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncPendingActions(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return;
    }

    try {
      this.isSyncing = true;
      const pendingActions = await actionQueueRepository.getPending();
      
      this.notifySyncStatus({
        isSyncing: true,
        pendingActions: pendingActions.length,
        errors: []
      });

      if (pendingActions.length === 0) {
        console.log('No pending actions to sync');
        return;
      }

      console.log(`Syncing ${pendingActions.length} pending actions...`);
      const errors: string[] = [];

      for (const action of pendingActions) {
        try {
          await actionQueueRepository.updateStatus(action.id, 'syncing');
          
          await this.adapter.syncAction(action);
          
          await actionQueueRepository.updateStatus(action.id, 'synced');
          console.log(`Synced action: ${action.id} (${action.type})`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Action ${action.id}: ${errorMessage}`);
          
          await actionQueueRepository.incrementRetry(action.id);
          
          if (action.retryCount >= action.maxRetries) {
            await actionQueueRepository.updateStatus(action.id, 'failed', errorMessage);
            console.error(`Action ${action.id} failed after ${action.maxRetries} retries`);
          } else {
            await actionQueueRepository.updateStatus(action.id, 'pending', errorMessage);
            console.log(`Will retry action ${action.id} (attempt ${action.retryCount + 1}/${action.maxRetries})`);
          }
        }
      }

      await actionQueueRepository.clearSynced();

      const remainingPending = await actionQueueRepository.getPendingCount();
      
      this.notifySyncStatus({
        isSyncing: false,
        pendingActions: remainingPending,
        lastSyncTime: Date.now(),
        errors
      });

      console.log('Sync completed');
      
    } catch (error) {
      console.error('Sync error:', error);
      this.notifySyncStatus({
        isSyncing: false,
        errors: [error instanceof Error ? error.message : 'Sync failed']
      });
    } finally {
      this.isSyncing = false;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const pendingCount = await actionQueueRepository.getPendingCount();
    
    return {
      isSyncing: this.isSyncing,
      pendingActions: pendingCount,
      errors: []
    };
  }

  async clearAllActions(): Promise<void> {
    await actionQueueRepository.clear();
  }

  async clearFailedActions(): Promise<void> {
    await actionQueueRepository.clearFailed();
  }
}
