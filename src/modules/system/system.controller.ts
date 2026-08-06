// File Path: src/modules/system/system.controller.ts

import { SystemService } from './system.service.ts';
// Import the metrics collector to pull live hit/miss data
import { CacheMetricsCollector } from '../../cache/cache.metrics.ts';

export class SystemController {
  private systemService = new SystemService();

  /**
   * Intercepts infrastructure request streams and responds with core health status.
   */
  public async handleHealthCheck(request: any, reply: any): Promise<void> {
    try {
      const snapshot = this.systemService.getHealthSnapshot();

      reply
        .code(200)
        .header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        .header('Pragma', 'no-cache')
        .header('Expires', '0')
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(snapshot);
    } catch (error) {
      reply.code(503).send({ status: 'DOWN', timestamp: new Date().toISOString() });
    }
  }

  /**
   * Intercepts orchestrator checks to serve deep environment operational status values.
   */
  public async handleReadinessCheck(request: any, reply: any): Promise<void> {
    try {
      const readiness = await this.systemService.getReadinessSnapshot();
      const responseCode = readiness.status === 'UP' ? 200 : 503;

      reply
        .code(responseCode)
        .header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        .header('Pragma', 'no-cache')
        .header('Expires', '0')
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(readiness);
    } catch (error) {
      reply.code(503).send({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        checks: { database: 'DOWN', cache: 'DOWN' }
      });
    }
  }

  /**
   * Intercepts container orchestrator checks to guarantee the event loop is responsive.
   */
  public async handleLivenessCheck(request: any, reply: any): Promise<void> {
    try {
      const liveness = this.systemService.getLivenessSnapshot();

      reply
        .code(200)
        .header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        .header('Pragma', 'no-cache')
        .header('Expires', '0')
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(liveness);
    } catch (error) {
      reply.code(500).send({ status: 'DOWN', timestamp: new Date().toISOString() });
    }
  }

  /**
   * Handles release verification queries to return standard target metadata objects.
   */
  public async handleVersionQuery(request: any, reply: any): Promise<void> {
    try {
      const versionInfo = this.systemService.getVersionSnapshot();

      reply
        .code(200)
        .header('Cache-Control', 'public, max-age=60')
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(versionInfo);
    } catch (error) {
      reply.code(500).send({ error: 'Internal Server Error', message: 'Failed to extract system version payload.' });
    }
  }

  /**
   * Handles build metric queries to return technical binary metadata configurations.
   */
  public async handleBuildQuery(request: any, reply: any): Promise<void> {
    try {
      const buildInfo = this.systemService.getBuildSnapshot();

      reply
        .code(200)
        .header('Cache-Control', 'public, max-age=3600')
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(buildInfo);
    } catch (error) {
      reply.code(500).send({ error: 'Internal Server Error', message: 'Failed to extract compilation build properties.' });
    }
  }

  /**
   * Compiles and handles text streams for Prometheus telemetry scraping architectures.
   * Merges system process counters with memory cache performance metrics.
   */
  public async handleMetricsQuery(request: any, reply: any): Promise<void> {
    try {
      const systemMetrics = this.systemService.getPrometheusMetricsText();
      const cacheMetrics = CacheMetricsCollector.generatePrometheusExpositionText();

      // Combine both telemetry datasets into a single unmasked string pipeline
      const unifiedMetricsPayload = `${systemMetrics}\n${cacheMetrics}`;

      reply
        .code(200)
        .header('Cache-Control', 'no-store, no-cache, must-revalidate')
        .header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
        .send(unifiedMetricsPayload);
    } catch (error) {
      reply.code(500).header('Content-Type', 'text/plain').send('# ERROR: Failed to compile unified telemetry metrics.');
    }
  }
}
