// File Path: src/cache/cache.metrics.ts

declare const console: { log: (msg: string) => void };

/**
 * High-Assurance Telemetry Accumulator tracking internal cache efficiency.
 * Generates structural outputs formatted explicitly for Prometheus scraping engines.
 */
export class CacheMetricsCollector {
  private static cacheHits = 0;
  private static cacheMisses = 0;
  private static totalLatencyMs = 0;
  private static operationCount = 0;

  /**
   * Records a successful in-memory look up execution pass.
   */
  public static recordHit(): void {
    this.cacheHits++;
  }

  /**
   * Records a cache miss that forced a database fallback call.
   */
  public static recordMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Tracks the execution latency duration of an active cache operation.
   */
  public static recordLatency(durationMs: number): void {
    this.totalLatencyMs += durationMs;
    this.operationCount++;
  }

  /**
   * Compiles the accumulated performance metrics into the standard Prometheus exposition format.
   */
  public static generatePrometheusExpositionText(): string {
    const timestamp = Date.now();
    const hits = this.cacheHits;
    const misses = this.cacheMisses;
    const totalRequests = hits + misses;
    const hitRatio = totalRequests > 0 ? parseFloat((hits / totalRequests).toFixed(4)) : 1.0;
    const avgLatencyMs = this.operationCount > 0 ? parseFloat((this.totalLatencyMs / this.operationCount).toFixed(2)) : 0.0;

    return [
      '# HELP app_cache_hits_total Cumulative counter of successful in-memory lookup cache hits.',
      '# TYPE app_cache_hits_total counter',
      `app_cache_hits_total ${hits} ${timestamp}`,
      '',
      '# HELP app_cache_misses_total Cumulative counter of cache misses forcing database fallbacks.',
      '# TYPE app_cache_misses_total counter',
      `app_cache_misses_total ${misses} ${timestamp}`,
      '',
      '# HELP app_cache_hit_ratio Percentage proportion of lookup operations satisfied from RAM.',
      '# TYPE app_cache_hit_ratio gauge',
      `app_cache_hit_ratio ${hitRatio} ${timestamp}`,
      '',
      '# HELP app_cache_operation_latency_average_ms Mean processing duration of cache requests.',
      '# TYPE app_cache_operation_latency_average_ms gauge',
      `app_cache_operation_latency_average_ms ${avgLatencyMs} ${timestamp}`,
      ''
    ].join('\n');
  }
}
