import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SheBalanceDB extends DBSchema {
  'offline-queue': {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
      synced: boolean;
    };
    indexes: { 'by-synced': boolean; 'by-timestamp': number };
  };
  'cached-data': {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      expiresAt?: number;
    };
  };
}

const DB_NAME = 'shebalance-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SheBalanceDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SheBalanceDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SheBalanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('offline-queue')) {
        const queueStore = db.createObjectStore('offline-queue', { keyPath: 'id' });
        queueStore.createIndex('by-synced', 'synced');
        queueStore.createIndex('by-timestamp', 'timestamp');
      }

      if (!db.objectStoreNames.contains('cached-data')) {
        db.createObjectStore('cached-data', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

export async function addToOfflineQueue(
  action: 'create' | 'update' | 'delete',
  table: string,
  data: any
): Promise<void> {
  const db = await getDB();
  const id = `${table}-${action}-${Date.now()}-${Math.random()}`;
  
  await db.add('offline-queue', {
    id,
    action,
    table,
    data,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function getOfflineQueue() {
  const db = await getDB();
  return db.getAllFromIndex('offline-queue', 'by-synced', false);
}

export async function markQueueItemSynced(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('offline-queue', id);
  if (item) {
    item.synced = true;
    await db.put('offline-queue', item);
  }
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offline-queue', id);
}

export async function cacheData(key: string, data: any, ttl?: number): Promise<void> {
  const db = await getDB();
  await db.put('cached-data', {
    key,
    data,
    timestamp: Date.now(),
    expiresAt: ttl ? Date.now() + ttl : undefined,
  });
}

export async function getCachedData<T = any>(key: string): Promise<T | null> {
  const db = await getDB();
  const cached = await db.get('cached-data', key);
  
  if (!cached) {
    return null;
  }

  if (cached.expiresAt && cached.expiresAt < Date.now()) {
    await db.delete('cached-data', key);
    return null;
  }

  return cached.data as T;
}

export async function clearCache(): Promise<void> {
  const db = await getDB();
  await db.clear('cached-data');
}

export async function clearOfflineQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('offline-queue');
}
