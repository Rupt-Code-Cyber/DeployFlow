// File Path: src/cache/cache.interface.ts

/**
 * Enforces a framework-agnostic blueprint contract for all cache operations.
 */
export class ICacheService {
  public async get<T>(key: string): Promise<T | null> { return null; }
  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> { return false; }
  public async delete(key: string): Promise<boolean> { return false; }
  public async exists(key: string): Promise<boolean> { return false; }
  public async expire(key: string, seconds: number): Promise<boolean> { return false; }
  public async increment(key: string): Promise<number> { return 0; }
  public async decrement(key: string): Promise<number> { return 0; }
}
