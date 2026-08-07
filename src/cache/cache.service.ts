// File Path: src/cache/cache.service.ts

import { RedisClientManager } from './redis.client.ts';
import { CacheMetricsCollector } from './cache.metrics.ts';

// Explicit ambient type overrides to satisfy isolated environment compilers
declare const console: { log: (msg: string) => void; error: (msg: string) => void };
declare const performance: { now: () => number };

/**
 * Enterprise Caching Service Layer orchestrating high-performance in-memory lookups.
 * Fully instrumented with real-time latency and health diagnostic tracking.
 */
export class CacheService {
  /**
   * Resolves an item from the cache, applying automatic deserialization and latency metrics.
   */
  public async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    try {
      const client = await RedisClientManager.getClient();
      if (!client) {
        CacheMetricsCollector.recordMiss();
        return null;
      }

      const rawData = await client.get(key);

      // Record latency duration metrics dynamically
      CacheMetricsCollector.recordLatency(performance.now() - startTime);

      if (!rawData) {
        CacheMetricsCollector.recordMiss();
        return null;
      }

      CacheMetricsCollector.recordHit();
      return JSON.parse(rawData) as T;
    } catch (error: any) {
      console.error(`[Cache Service Error] Failed to resolve key "${key}": ${error.message || error}`);
      CacheMetricsCollector.recordMiss();
      return null;
    }
  }

  /**
   * Commits an item into the cache with an explicit, unalterable Time-To-Live expiration.
   */
  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const startTime = performance.now();
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return false;

      const serializedData = JSON.stringify(value);

      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, serializedData, 'EX', ttlSeconds);
      } else {
        await client.set(key, serializedData);
      }

      CacheMetricsCollector.recordLatency(performance.now() - startTime);
      return true;
    } catch (error: any) {
      console.error(`[Cache Service Error] Failed to persist key "${key}": ${error.message || error}`);
      return false;
    }
  }

  /**
   * Evicts a target tracking identifier instantly from memory blocks.
   */
  public async delete(key: string): Promise<boolean> {
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return false;

      const result = await client.del(key);
      return result > 0;
    } catch (error: any) {
      console.error(`[Cache Service Error] Failed to evict key "${key}": ${error.message || error}`);
      return false;
    }
  }

  /**
   * Verifies the presence of a target tracking key without pulling its full string value.
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return false;

      const result = await client.exists(key);
      return result === 1;
    } catch (error: any) {
      console.error(`[Cache Service Error] Existence validation trace failed for "${key}": ${error.message || error}`);
      return false;
    }
  }

  /**
   * Adjusts the live time allocations of an active tracking key.
   */
  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return false;

      const result = await client.expire(key, seconds);
      return result === 1;
    } catch (error: any) {
      console.error(`[Cache Service Error] Expiration modification failed for "${key}": ${error.message || error}`);
      return false;
    }
  }

  /**
   * Increments an atomic counter identifier securely in RAM spaces.
   */
  public async increment(key: string): Promise<number> {
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return 0;

      return await client.incr(key);
    } catch (error: any) {
      console.error(`[Cache Service Error] Atomic counter increment failure for "${key}": ${error.message || error}`);
      return 0;
    }
  }

  /**
   * Decrements an atomic counter identifier securely in RAM spaces.
   */
  public async decrement(key: string): Promise<number> {
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return 0;

      return await client.decr(key);
    } catch (error: any) {
      console.error(`[Cache Service Error] Atomic counter decrement failure for "${key}": ${error.message || error}`);
      return 0;
    }
  }

  /**
   * Executing an active read/write diagnostic check to verify cache pool connectivity.
   * Connects straight to our system operations readiness probes matrix.
   */
  public async verifyCacheHealth(): Promise<'UP' | 'DOWN'> {
    try {
      const client = await RedisClientManager.getClient();
      if (!client) return 'DOWN';

      const healthCheckPingToken = `ping_token_${Date.now()}`;

      // Perform an atomic write-read round-trip handshake check
      await client.set('df_health_ping', healthCheckPingToken, 'EX', 10);
      const readBackVerificationResult = await client.get('df_health_ping');

      return readBackVerificationResult === healthCheckPingToken ? 'UP' : 'DOWN';
    } catch (error) {
      console.error('[Cache Health Error] Redis pool connectivity check failed:');
      return 'DOWN';
    }
  }
}
