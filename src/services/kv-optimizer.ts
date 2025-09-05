export class KVOptimizer {
  private kv: KVNamespace;
  private cacheTimeout: number = 300000; // 5 minutes default cache

  constructor(kv: KVNamespace, cacheTimeout?: number) {
    this.kv = kv;
    if (cacheTimeout) this.cacheTimeout = cacheTimeout;
  }

  /**
   * Optimized batch operations for KV
   */
  async batchGet(keys: string[]): Promise<Array<{ key: string; value: any | null }>> {
    const results = await Promise.all(
      keys.map(async (key) => {
        try {
          const value = await this.kv.get(key);
          return { key, value: value ? JSON.parse(value) : null };
        } catch (error) {
          return { key, value: null };
        }
      })
    );
    return results;
  }

  async batchPut(items: Array<{ key: string; value: any; expirationTtl?: number }>): Promise<void> {
    await Promise.all(
      items.map(async ({ key, value, expirationTtl }) => {
        try {
          const options = expirationTtl ? { expirationTtl } : undefined;
          await this.kv.put(key, JSON.stringify(value), options);
        } catch (error) {
          console.error(`Failed to put key ${key}:`, error);
        }
      })
    );
  }

  async batchDelete(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this.kv.delete(key);
        } catch (error) {
          console.error(`Failed to delete key ${key}:`, error);
        }
      })
    );
  }

  /**
   * Get with automatic caching
   */
  async getCached(key: string, expirationTtl?: number): Promise<any | null> {
    try {
      const value = await this.kv.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get cached key ${key}:`, error);
      return null;
    }
  }

  /**
   * Put with automatic expiration
   */
  async putWithExpiration(key: string, value: any, expirationTtl?: number): Promise<void> {
    try {
      const ttl = expirationTtl || this.cacheTimeout;
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
    } catch (error) {
      console.error(`Failed to put key ${key} with expiration:`, error);
    }
  }

  /**
   * Cleanup old keys by pattern
   */
  async cleanupOldKeys(prefix: string, olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      const cutoffTimestamp = cutoffDate.getTime();

      const list = await this.kv.list({ prefix });
      const keysToDelete: string[] = [];

      for (const key of list.keys) {
        // Extract timestamp from key if it follows pattern prefix:timestamp:*
        const parts = key.name.split(':');
        if (parts.length >= 2) {
          const timestamp = parseInt(parts[1]);
          if (!isNaN(timestamp) && timestamp < cutoffTimestamp) {
            keysToDelete.push(key.name);
          }
        }
      }

      if (keysToDelete.length > 0) {
        await this.batchDelete(keysToDelete);
      }

      return keysToDelete.length;
    } catch (error) {
      console.error(`Failed to cleanup old keys with prefix ${prefix}:`, error);
      return 0;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(prefix?: string): Promise<{
    keyCount: number;
    estimatedSize: number;
    oldestKey?: string;
    newestKey?: string;
  }> {
    try {
      const list = await this.kv.list({ prefix });
      let estimatedSize = 0;
      let oldestTimestamp = Date.now();
      let newestTimestamp = 0;
      let oldestKey = '';
      let newestKey = '';

      for (const key of list.keys) {
        // Estimate size based on key name length
        estimatedSize += key.name.length;
        
        // Try to extract timestamp from key
        const parts = key.name.split(':');
        if (parts.length >= 2) {
          const timestamp = parseInt(parts[1]);
          if (!isNaN(timestamp)) {
            if (timestamp < oldestTimestamp) {
              oldestTimestamp = timestamp;
              oldestKey = key.name;
            }
            if (timestamp > newestTimestamp) {
              newestTimestamp = timestamp;
              newestKey = key.name;
            }
          }
        }
      }

      return {
        keyCount: list.keys.length,
        estimatedSize,
        oldestKey: oldestKey || undefined,
        newestKey: newestKey || undefined
      };
    } catch (error) {
      console.error(`Failed to get storage stats:`, error);
      return {
        keyCount: 0,
        estimatedSize: 0
      };
    }
  }

  /**
   * Paginated list with better performance
   */
  async listPaginated(prefix: string, cursor?: string, limit: number = 1000): Promise<{
    keys: Array<{ name: string; value?: any }>;
    cursor?: string;
    truncated: boolean;
  }> {
    try {
      const listOptions: any = { prefix, limit };
      if (cursor) listOptions.cursor = cursor;

      const result = await this.kv.list(listOptions);
      
      return {
        keys: result.keys.map(key => ({ name: key.name })),
        cursor: (result as any).cursor,
        truncated: result.list_complete === false
      };
    } catch (error) {
      console.error(`Failed to list keys with prefix ${prefix}:`, error);
      return {
        keys: [],
        truncated: false
      };
    }
  }
}