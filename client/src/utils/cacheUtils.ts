
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class LocalCache {
  private static instance: LocalCache;
  private readonly CACHE_PREFIX = 'storeer_cache_';
  private readonly DEFAULT_EXPIRY = 1000 * 60 * 30; // 30 minutes

  static getInstance(): LocalCache {
    if (!LocalCache.instance) {
      LocalCache.instance = new LocalCache();
    }
    return LocalCache.instance;
  }

  set(key: string, data: any, expiryMs?: number): void {
    try {
      const item: CacheItem = {
        data,
        timestamp: Date.now(),
        expiry: expiryMs || this.DEFAULT_EXPIRY,
      };
      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  get(key: string): any | null {
    try {
      const cached = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const item: CacheItem = JSON.parse(cached);
      const now = Date.now();

      // Check if cache has expired
      if (now - item.timestamp > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // Cache user's essential data for offline access
  cacheUserData(userId: string, data: {
    stores?: any[];
    products?: any[];
    sales?: any[];
    user?: any;
  }): void {
    if (data.stores) this.set(`stores_${userId}`, data.stores);
    if (data.products) this.set(`products_${userId}`, data.products);
    if (data.sales) this.set(`sales_${userId}`, data.sales, 1000 * 60 * 60); // 1 hour for sales
    if (data.user) this.set(`user_${userId}`, data.user);
  }

  getCachedUserData(userId: string): {
    stores: any[] | null;
    products: any[] | null;
    sales: any[] | null;
    user: any | null;
  } {
    return {
      stores: this.get(`stores_${userId}`),
      products: this.get(`products_${userId}`),
      sales: this.get(`sales_${userId}`),
      user: this.get(`user_${userId}`),
    };
  }
}

export const cache = LocalCache.getInstance();
