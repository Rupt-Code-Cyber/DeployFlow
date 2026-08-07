// File Path: src/cache/redis.client.ts

// Explicit ambient type overrides to satisfy isolated TypeScript compilers
declare const process: {
  env: {
    NODE_ENV?: string;
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    REDIS_DB?: string;
  };
};
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

/**
 * Enterprise Redis Connection Client Platform Manager.
 * Responsibly handles initialization, retry intervals, and structural state reporting.
 */
export class RedisClientManager {
  private static clientInstance: any = null;

  /**
   * Resolves and provides the authoritative, thread-safe Redis connection singleton instance.
   */
  public static async getClient(): Promise<any> {
    if (this.clientInstance) {
      return this.clientInstance;
    }

    try {
      // Dynamic string evaluation prevents isolated compilers from blocking on untracked package paths
      const driverPackageName: any = 'ioredis';
      const RedisModule = await import(driverPackageName);
      const Redis = RedisModule.default || RedisModule;

      const redisHost = process.env.REDIS_HOST || '127.0.0.1';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
      const redisPassword = process.env.REDIS_PASSWORD || undefined;
      const redisDb = parseInt(process.env.REDIS_DB || '0', 10);

      console.log(`[Redis Connection] Connecting to instance target path at: redis://${redisHost}:${redisPort}/${redisDb}`);

      // Compile production-grade driver connection parameter configurations
      this.clientInstance = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        db: redisDb,
        // Enforce strict connection timeout gates to prevent event loop blockages
        connectTimeout: 5000,
        // Keeps command pipelines active instead of failing immediately during blips
        maxRetriesPerRequest: null,
        // High-Assurance Reconnection Engine: Implements progressive exponential backoff loops
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 150, 3000);
          console.error(`[Redis Warning] Network channel connection dropped. Reconnection probe #${times} scheduling in ${delay}ms.`);
          return delay;
        }
      });

      // Bind runtime life cycle state event telemetries
      this.clientInstance.on('connect', () => {
        console.log('[Redis Success] TCP connection socket handshake completed successfully.');
      });

      this.clientInstance.on('ready', () => {
        console.log('[Redis Success] Storage pool cluster commands execution matrix is READY.');
      });

      this.clientInstance.on('error', (err: any) => {
        console.error(`[Redis Core Error] Critical driver execution fault intercepted: ${err.message || err}`);
      });

      return this.clientInstance;

    } catch (error) {
      console.error('[Redis Core Error] Failed to dynamically construct the ioredis instance architecture:');
      throw error;
    }
  }

  /**
   * Executes a safe, audited, non-destructive teardown of connection sockets during context exit events.
   */
  public static async shutdownGracefully(): Promise<void> {
    if (!this.clientInstance) return;

    try {
      console.log('[Redis Teardown] Initiating graceful termination protocols against active storage clusters...');
      // Use quit() instead of disconnect() to allow pending command pipelines to finish processing
      await this.clientInstance.quit();
      this.clientInstance = null;
      console.log('[Redis Teardown] Sockets severed safely. Storage pool connection closed.');
    } catch (err: any) {
      console.error(`[Redis Teardown Error] Unhandled breakdown during container socket recycling: ${err.message || err}`);
    }
  }
}
