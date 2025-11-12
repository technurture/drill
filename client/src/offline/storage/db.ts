import Dexie, { type EntityTable } from 'dexie';
import type { ActionEnvelope, CachedData } from '../types';

class OfflineDatabase extends Dexie {
  actionQueue!: EntityTable<ActionEnvelope, 'id'>;
  cache!: EntityTable<CachedData, 'id'>;

  constructor() {
    super('SheBalanceOfflineDB');
    
    this.version(1).stores({
      actionQueue: 'id, type, status, timestamp, userId, storeId',
      cache: 'id, key, timestamp, expiresAt'
    });
  }

  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    await this.cache
      .where('expiresAt')
      .below(now)
      .delete();
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    await this.clearExpiredCache();
    const cached = await this.cache.where('key').equals(key).first();
    
    if (!cached) return null;
    if (cached.expiresAt && cached.expiresAt < Date.now()) {
      await this.cache.delete(cached.id);
      return null;
    }
    
    return cached.data as T;
  }

  async setCachedData<T>(
    key: string, 
    data: T, 
    ttl?: number
  ): Promise<void> {
    const id = `cache_${key}_${Date.now()}`;
    const timestamp = Date.now();
    const expiresAt = ttl ? timestamp + ttl : undefined;

    await this.cache.where('key').equals(key).delete();

    await this.cache.add({
      id,
      key,
      data,
      timestamp,
      expiresAt
    });
  }
}

export const offlineDB = new OfflineDatabase();
