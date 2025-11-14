/// <reference types="vite/client" />
/// <reference lib="webworker" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_PROJECT_URL: string
  readonly VITE_SUPABASE_API_KEY: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_VAPID_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
}

declare var ExtendableEvent: {
  prototype: ExtendableEvent;
  new(type: string, eventInitDict?: ExtendableEventInit): ExtendableEvent;
};

interface ExtendableEvent extends Event {
  waitUntil(f: Promise<any>): void;
}

interface ExtendableEventInit extends EventInit {}

interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

interface ServiceWorkerGlobalScopeEventMap {
  sync: SyncEvent;
}
