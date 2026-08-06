// File Path: src/modules/system/system.service.ts

import { getPrismaClient } from '../../lib/prisma/client.js';
// Phase 7 Cache Integration: Load the infrastructure health monitor
import { CacheService } from '../../cache/cache.service.ts';

// Explicit inline type block declaration to satisfy sandboxed TypeScript linters
declare const process: {
  env: {
    NODE_ENV?: string;
    API_REVISION?: string;
    BUILD_NUMBER?: string;
    BUILD_DATE?: string;
    GIT_COMMIT_SHA?: string;
  };
  version: string;
  platform: string;
  arch: string;
  uptime: () => number;
  memoryUsage: () => { rss: number; heapTotal: number; heapUsed: number; external: number };
};

export class SystemService {
  private prisma = getPrismaClient();
  private cache = new CacheService();
  private appVersion = '1.0.0';

  /**
   * Generates a rapid high-level snapshot of the active application process state.
   */
  public getHealthSnapshot() {
    return {
      status: 'UP' as const,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    };
  }

  /**
   * Evaluates if the event loop is clear without querying downstream infrastructure.
   */
  public getLivenessSnapshot() {
    return {
      status: 'UP' as const,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Resolves the primary semantic tracking version attributes.
   */
  public getVersionSnapshot() {
    return {
      version: this.appVersion,
      apiRevision: process.env.API_REVISION || 'v1',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generates a low-level snapshot of runtime and compile environment markers.
   */
  public getBuildSnapshot() {
    return {
      buildNumber: process.env.BUILD_NUMBER || 'LOCAL_DEV_BUILD',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      gitCommit: process.env.GIT_COMMIT_SHA || 'UNKNOWN_COMMIT_REF',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch
    };
  }

  /**
   * Captures the active process utilization metrics parameters.
   */
  public getMetricsSnapshot() {
    return {
      uptimeSeconds: Math.floor(process.uptime()),
      memory: process.memoryUsage()
    };
  }

  /**
   * Compiles and converts active memory and tracking state attributes into Prometheus formatting.
   */
  public getPrometheusMetricsText(): string {
    const metrics = this.getMetricsSnapshot();
    const timestamp = Date.now();

    return [
      '# HELP app_uptime_seconds Total runtime duration tracking of the active process.',
      '# TYPE app_uptime_seconds counter',
      `app_uptime_seconds ${metrics.uptimeSeconds} ${timestamp}`,
      '',
      '# HELP process_resident_memory_bytes Resident set size memory footprint consumption.',
      '# TYPE process_resident_memory_bytes gauge',
      `process_resident_memory_bytes ${metrics.memory.rss} ${timestamp}`,
      '',
      '# HELP process_heap_total_bytes Total allocated V8 heap block boundaries.',
      '# TYPE process_heap_total_bytes gauge',
      `process_heap_total_bytes ${metrics.memory.heapTotal} ${timestamp}`,
      '',
      '# HELP process_heap_used_bytes Active memory slots consumed inside V8 heap tracks.',
      '# TYPE process_heap_used_bytes gauge',
      `process_heap_used_bytes ${metrics.memory.heapUsed} ${timestamp}`,
      '',
      '# HELP process_external_memory_bytes Memory blocks used by native C++ bindings outside V8 blocks.',
      '# TYPE process_external_memory_bytes gauge',
      `process_external_memory_bytes ${metrics.memory.external} ${timestamp}`,
      ''
    ].join('\n');
  }

  /**
   * Performs deep evaluation scans against vital system infrastructure targets.
   * Hardened to monitor both relational persistence and active caching fabrics concurrently.
   */
  public async getReadinessSnapshot(): Promise<{ status: 'UP' | 'DOWN'; timestamp: string; checks: { database: 'UP' | 'DOWN'; cache: 'UP' | 'DOWN' } }> {
    let databaseStatus: 'UP' | 'DOWN' = 'DOWN';
    let cacheStatus: 'UP' | 'DOWN' = 'DOWN';

    // 1. Run the relational PostgreSQL handshake probe loop
    try {
      if (this.prisma.user && typeof this.prisma.user.findFirst === 'function') {
        await this.prisma.user.findFirst({ where: { id: '00000000-0000-0000-0000-000000000000' } });
      } else if (typeof (this.prisma as any).$connect === 'function') {
        await (this.prisma as any).$connect();
      } else {
        await (this.prisma as any).query('SELECT 1');
      }
      databaseStatus = 'UP';
    } catch (dbError) {
      databaseStatus = 'DOWN';
    }

    // 2. Run the distributed Redis cluster RAM socket check
    try {
      cacheStatus = await this.cache.verifyCacheHealth();
    } catch (cacheError) {
      cacheStatus = 'DOWN';
    }

    // Both dependent systems must report clean operational variables to pass the readiness probe
    const overallStatus = databaseStatus === 'UP' && cacheStatus === 'UP' ? 'UP' : 'DOWN';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseStatus,
        cache: cacheStatus
      }
    };
  }
}
