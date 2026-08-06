// File Path: test/mocks/redis.mock.ts

/**
 * High-Assurance In-Memory Redis Driver Mock Subsystem.
 * Simulates standard asynchronous command structures natively using localized storage maps.
 * Ensures complete isolation from physical host network sockets during automated test runs.
 */
export class MockRedisClient {
  private storageMap = new Map<string, string>();

  /**
   * Simulates the Redis GET command.
   */
  public async get(key: string): Promise<string | null> {
    return this.storageMap.get(key) || null;
  }

  /**
   * Simulates the Redis SET command with optional parameter configuration blocks.
   */
  public async set(key: string, value: string, modifier?: string, duration?: number): Promise<'OK'> {
    this.storageMap.set(key, value);
    return 'OK';
  }

  /**
   * Simulates the Redis DEL command to evict keys instantly.
   */
  public async del(key: string): Promise<number> {
    const presenceCheck = this.storageMap.has(key) ? 1 : 0;
    this.storageMap.delete(key);
    return presenceCheck;
  }

  /**
   * Simulates the Redis EXISTS command to check key presence.
   */
  public async exists(key: string): Promise<number> {
    return this.storageMap.has(key) ? 1 : 0;
  }

  /**
   * Simulates the Redis EXPIRE time-to-live allocation adjustment.
   */
  public async expire(key: string, seconds: number): Promise<number> {
    return this.storageMap.has(key) ? 1 : 0;
  }

  /**
   * Simulates the Redis INCR atomic incrementor command.
   */
  public async incr(key: string): Promise<number> {
    const rawVal = this.storageMap.get(key);
    let numericVal = rawVal ? parseInt(rawVal, 10) : 0;
    numericVal++;
    this.storageMap.set(key, numericVal.toString());
    return numericVal;
  }

  /**
   * Simulates the Redis DECR atomic decrementor command.
   */
  public async decr(key: string): Promise<number> {
    const rawVal = this.storageMap.get(key);
    let numericVal = rawVal ? parseInt(rawVal, 10) : 0;
    numericVal--;
    this.storageMap.set(key, numericVal.toString());
    return numericVal;
  }

  /**
   * Resets the mock data matrix to enforce complete test case isolation.
   */
  public clearStorage(): void {
    this.storageMap.clear();
  }
}
