import { offlineDB } from '../storage/db';
import type { ActionEnvelope, ActionStatus, ActionType } from '../types';

export class ActionQueueRepository {
  async enqueue<T>(
    type: ActionType,
    payload: T,
    options?: {
      userId?: string;
      storeId?: string;
      maxRetries?: number;
    }
  ): Promise<ActionEnvelope<T>> {
    const action: ActionEnvelope<T> = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: options?.maxRetries ?? 3,
      userId: options?.userId,
      storeId: options?.storeId
    };

    await offlineDB.actionQueue.add(action as ActionEnvelope);
    return action;
  }

  async getAll(): Promise<ActionEnvelope[]> {
    return await offlineDB.actionQueue.toArray();
  }

  async getPending(): Promise<ActionEnvelope[]> {
    return await offlineDB.actionQueue
      .where('status')
      .equals('pending')
      .sortBy('timestamp');
  }

  async getByStatus(status: ActionStatus): Promise<ActionEnvelope[]> {
    return await offlineDB.actionQueue
      .where('status')
      .equals(status)
      .sortBy('timestamp');
  }

  async updateStatus(id: string, status: ActionStatus, error?: string): Promise<void> {
    await offlineDB.actionQueue.update(id, { status, error });
  }

  async incrementRetry(id: string): Promise<void> {
    const action = await offlineDB.actionQueue.get(id);
    if (action) {
      await offlineDB.actionQueue.update(id, {
        retryCount: action.retryCount + 1
      });
    }
  }

  async delete(id: string): Promise<void> {
    await offlineDB.actionQueue.delete(id);
  }

  async clearSynced(): Promise<void> {
    await offlineDB.actionQueue
      .where('status')
      .equals('synced')
      .delete();
  }

  async clearFailed(): Promise<void> {
    await offlineDB.actionQueue
      .where('status')
      .equals('failed')
      .delete();
  }

  async clear(): Promise<void> {
    await offlineDB.actionQueue.clear();
  }

  async getCount(): Promise<number> {
    return await offlineDB.actionQueue.count();
  }

  async getPendingCount(): Promise<number> {
    return await offlineDB.actionQueue
      .where('status')
      .equals('pending')
      .count();
  }
}

export const actionQueueRepository = new ActionQueueRepository();
