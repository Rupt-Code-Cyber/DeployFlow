// File Path: src/middleware/logging/request-logger.middleware.ts

import { LoggerFactory } from '../../logger/logger.factory.ts';

// Explicit ambient type overrides to satisfy sandboxed compilation constraints
declare const console: { error: (msg: string) => void };
declare const performance: { now: () => number };

/**
 * High-entropy tracking token factory.
 * Generates unique identification strings safely inside isolated compiler pools.
 */
function generateTrackingToken(): string {
  const randomBlock = Math.random().toString(36).substring(2, 15);
  const timestampBlock = Date.now().toString(36);
  return `${randomBlock}-${timestampBlock}`;
}

/**
 * Registers global telemetry hooks into the Fastify processing framework.
 * Automatically injects Request IDs, maps Correlation chains, and logs execution times.
 */
export async function registerRequestTracingLogger(fastify: any): Promise<void> {
  const logger = await LoggerFactory.createLogger();

  // Ingress Hook: Inject unique tracking tokens and build execution contexts
  fastify.addHook('onRequest', async (request: any, reply: any) => {
    // Capture high-precision start metrics using standard Performance APIs
    request.raw.startTimeMarker = performance.now();

    // Extract or generate tracking identifiers cleanly
    const incomingCorrelationId = request.headers['x-correlation-id'] || request.headers['correlation-id'];
    const correlationId = Array.isArray(incomingCorrelationId) ? incomingCorrelationId[0] : incomingCorrelationId || generateTrackingToken();
    const requestId = generateTrackingToken();

    // Append response trace headers to assist client tracking
    reply.header('X-Request-Id', requestId);
    reply.header('X-Correlation-ID', correlationId);

    // Bind metadata onto the request object model
    request.requestId = requestId;
    request.correlationId = correlationId;

    request.raw.contextStore = {
      requestId,
      correlationId,
      userId: request.user?.id,
      userRole: request.user?.role
    };
  });

  // Egress Hook: Log response metrics and calculate execution times
  fastify.addHook('onResponse', async (request: any, reply: any) => {
    try {
      const startTime = request.raw.startTimeMarker;
      let durationMs = 0;

      if (startTime !== undefined) {
        // Compute delta duration using standard performance specs
        durationMs = parseFloat((performance.now() - startTime).toFixed(2));
      }

      const logContext: Record<string, any> = {
        requestId: request.requestId,
        correlationId: request.correlationId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs: durationMs,
        clientIp: request.ip,
        userAgent: request.headers['user-agent'] || 'UNKNOWN_AGENT'
      };

      // Mask sensitive route structures from analytics lookups
      if (request.url.includes('/auth') || request.url.includes('/login')) {
        logContext.payload = '[REDACTED_AUTHENTICATION_STREAM]';
      }

      // Route statuses to appropriate severity levels
      if (reply.statusCode >= 500) {
        logger.error(`HTTP outbound transaction error tracking: ${request.method} ${request.url}`, logContext);
      } else if (reply.statusCode >= 400) {
        logger.warn(`HTTP outbound request warning notification: ${request.method} ${request.url}`, logContext);
      } else {
        logger.info(`HTTP outbound invocation trace transaction: ${request.method} ${request.url}`, logContext);
      }
    } catch (err) {
      console.error('[RequestLogger Error] Failed to write network log entry metrics.');
    }
  });
}
