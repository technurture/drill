export type ActionStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type ActionType = 
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_SALE'
  | 'UPDATE_SALE'
  | 'DELETE_SALE'
  | 'CREATE_STORE'
  | 'UPDATE_STORE'
  | 'ADD_FINANCIAL_RECORD'
  | 'DELETE_FINANCIAL_RECORD';

export interface ActionEnvelope<T = unknown> {
  id: string;
  type: ActionType;
  payload: T;
  timestamp: number;
  status: ActionStatus;
  retryCount: number;
  maxRetries: number;
  error?: string;
  userId?: string;
  storeId?: string;
}

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  pendingActions: number;
  lastSyncTime?: number;
  errors: string[];
}

export interface CachedData<T = unknown> {
  id: string;
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface BackendSyncAdapter {
  syncAction<T>(action: ActionEnvelope<T>): Promise<void>;
  reconcile(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export interface OfflineRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}
