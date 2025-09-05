import { Logger } from './logger';

export interface KVCacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class KVOptimizer {
  private cache = new Map<string, KVCacheEntry>();
  private logger: Logger;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;
  private operationCount = 0;
  private dailyLimit = 1000; // Conservative limit
  
  constructor(private kv: KVNamespace, env?: any) {
    this.logger = new Logger(env, 'KV_OPTIMIZER');
  }

  // Cached get operation
  async get(key: string, useCache = true): Promise<string | null> {
    // Check cache first
    if (useCache && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (Date.now() - entry.timestamp < entry.ttl) {
        await this.logger.debug('kv_cache_hit', `Cache hit for key: ${key}`);
        return entry.data;
      } else {
        this.cache.delete(key);
      }
    }

    // Check operation limit
    if (this.operationCount >= this.dailyLimit) {
      await this.logger.warn('kv_limit_exceeded', `Daily KV limit exceeded (${this.dailyLimit})`);
      return null;
    }

    try {
      const data = await this.kv.get(key);
      this.operationCount++;
      
      // Cache the result
      if (useCache && data !== null) {
        this.setCacheEntry(key, data);
      }
      
      await this.logger.debug('kv_get_operation', `Get operation for key: ${key}`, {
        operationCount: this.operationCount,
        cacheSize: this.cache.size
      });
      
      return data;
    } catch (error) {
      await this.logger.error('kv_get_failed', `Failed to get key: ${key}`, error);
      return null;
    }
  }

  // Optimized put operation with batching
  async put(key: string, value: string, expirationTtl?: number): Promise<void> {
    // Check operation limit
    if (this.operationCount >= this.dailyLimit) {
      await this.logger.warn('kv_limit_exceeded', `Daily KV limit exceeded, skipping put for key: ${key}`);
      return;
    }

    try {
      await this.kv.put(key, value, expirationTtl ? { expirationTtl } : undefined);
      this.operationCount++;
      
      // Update cache
      this.setCacheEntry(key, value);
      
      await this.logger.debug('kv_put_operation', `Put operation for key: ${key}`, {
        operationCount: this.operationCount,
        valueSize: value.length
      });
    } catch (error) {
      await this.logger.error('kv_put_failed', `Failed to put key: ${key}`, error);
      throw error;
    }
  }

  // Batch operations to reduce API calls
  async batchGet(keys: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    const uncachedKeys: string[] = [];
    
    // Check cache first
    for (const key of keys) {
      if (this.cache.has(key)) {
        const entry = this.cache.get(key)!;
        if (Date.now() - entry.timestamp < entry.ttl) {
          results.set(key, entry.data);
        } else {
          this.cache.delete(key);
          uncachedKeys.push(key);
        }
      } else {
        uncachedKeys.push(key);
      }
    }

    // Fetch uncached keys in smaller batches
    const batchSize = 10;
    for (let i = 0; i < uncachedKeys.length; i += batchSize) {
      const batch = uncachedKeys.slice(i, i + batchSize);
      
      if (this.operationCount + batch.length > this.dailyLimit) {
        await this.logger.warn('kv_batch_limit_exceeded', 
          `Would exceed daily limit, stopping batch at ${this.operationCount}`);
        break;
      }

      // Process batch sequentially to avoid overwhelming KV
      for (const key of batch) {
        const value = await this.get(key, false); // Skip cache in recursive call
        results.set(key, value);
      }
    }

    return results;
  }

  // Optimized list operation
  async list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<any, string>> {
    if (this.operationCount >= this.dailyLimit) {
      await this.logger.warn('kv_limit_exceeded', 'Daily KV limit exceeded for list operation');
      return { keys: [], list_complete: true, cacheStatus: null };
    }

    try {
      const result = await this.kv.list(options);
      this.operationCount++;
      
      await this.logger.debug('kv_list_operation', 'List operation completed', {
        keyCount: result.keys.length,
        operationCount: this.operationCount
      });
      
      return result;
    } catch (error) {
      await this.logger.error('kv_list_failed', 'Failed to list keys', error);
      return { keys: [], list_complete: true, cacheStatus: null };
    }
  }

  // Cache management
  private setCacheEntry(key: string, data: any): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }

  // Get operation stats
  getStats(): {
    operationCount: number;
    cacheSize: number;
    cacheHitRate: number;
    dailyLimit: number;
    remainingOperations: number;
  } {
    return {
      operationCount: this.operationCount,
      cacheSize: this.cache.size,
      cacheHitRate: 0, // Would need to track hits/misses to calculate this
      dailyLimit: this.dailyLimit,
      remainingOperations: Math.max(0, this.dailyLimit - this.operationCount)
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Reset daily counter (call this in scheduled event)
  resetDailyCounter(): void {
    this.operationCount = 0;
    this.clearCache();
  }
}
