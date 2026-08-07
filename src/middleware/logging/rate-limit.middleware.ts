// File Path: src/middleware/logging/rate-limit.middleware.ts

import { CacheService } from '../../cache/cache.service.ts';
import { CacheKeys } from '../../cache/cache.keys.ts';

declare const console: { error: (msg: string) => void };

/**
 * Enterprise Distributed Rate Limiting Platform Guard.
 * Leverages atomic Redis increments to intercept traffic bursts under cluster environments.
 */
export class RateLimiterGuard {
  private static cache = new CacheService();

  // Enforce an explicit window threshold: 60 requests per 60-second execution window
  private static readonly MAX_LIMIT = 60;
  private static readonly WINDOW_SECONDS = 60;

  /**
   * Fastify Hook interceptor parsing client requests at the absolute entry edge.
   */
  public static async verifyRateLimit(request: any, reply: any): Promise<void> {
    try {
      const clientIp = request.ip || '127.0.0.1';

      // Exclude standard operational internal probe vectors from rate throttling loops
      if (request.url === '/health' || request.url === '/ready' || request.url === '/live') {
        return;
      }

      // Generate the isolated distributed memory coordinate
      const trackingKey = CacheKeys.getRateLimitKey(clientIp);

      // Execute atomic memory increment inside Redis RAM spaces
      const currentCount = await this.cache.increment(trackingKey);

      // If the counter initialized on this thread pass, apply the window expiration TTL
      if (currentCount === 1) {
        await this.cache.expire(trackingKey, this.WINDOW_SECONDS);
      }

      // Append standard HTTP headers to communicate usage metrics to the consumer
      reply.header('X-RateLimit-Limit', this.MAX_LIMIT);
      reply.header('X-RateLimit-Remaining', Math.max(0, this.MAX_LIMIT - currentCount));
      reply.header('X-RateLimit-Reset', this.WINDOW_SECONDS);

      // Threshold violation: block execution at the perimeter gate
      if (currentCount > this.MAX_LIMIT) {
        reply
          .code(429)
          .header('Retry-After', this.WINDOW_SECONDS)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({
            error: 'Too Many Requests',
            message: 'API transaction allocation limit exhausted. Please pause before retrying connection channels.',
            timestamp: new Date().toISOString()
          });
        return;
      }

    } catch (error: any) {
      console.error(`[RateLimit Error] Interceptor execution fault encountered: ${error.message || error}`);
      // Fallback: Gracefully pass traffic to keep service available if Redis cluster encounters severe downtime
    }
  }
}
