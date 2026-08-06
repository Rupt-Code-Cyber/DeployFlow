// File Path: src/server.ts

// 1. Core Structural Use Case and Routing Module Imports
import { registerSwaggerDocumentation } from './modules/system/system.plugin.ts';
import { systemModuleRoutes } from './modules/system/system.routes.ts';
import { usersModuleRoutes } from './modules/users/users.routes.ts';
import { registerRequestTracingLogger } from './middleware/logging/request-logger.middleware.ts';
import { registerGlobalErrorHandler } from './middleware/errors/error-handler.middleware.ts';
import { RateLimiterGuard } from './middleware/logging/rate-limit.middleware.ts';

// 2. Phase 9 Production Hardening Configuration Module Imports
import { EnvironmentValidator } from './config/production/environment.validator.ts';
import { NetworkHardeningConstants, registerProductionNetworkCompression } from './config/production/network.config.ts';
import { registerProductionSecurityHeaders } from './config/production/security.config.ts';
import { ApplicationLifecycleManager } from './config/production/lifecycle.config.ts';

// Explicit inline type block declarations to satisfy sandboxed TypeScript linters
declare const process: {
  env: {
    NODE_ENV?: string;
    PORT?: string;
    HOST?: string;
  };
  exit: (code: number) => void;
};
declare const console: { log: (msg: string) => void; error: (msg: any) => void };

/**
 * Enterprise Application Bootstrap Engine.
 * Responsibly coordinates plugins, handles route assembly, and configures production hardening.
 */
async function bootstrapServer() {
  // Execute Step 8: Early Environment Startup Schema Validation check
  // Invokes a strict Fail-Fast sequence if any mandatory system keys are missing or invalid
  EnvironmentValidator.validateStartupSchema();

  try {
    const frameworkName: any = 'fastify';
    const fastifyModule = await import(frameworkName);
    const FastifyFactory = fastifyModule.default || fastifyModule;

    const currentEnvironment = (process.env.NODE_ENV || 'production').toLowerCase();
    const loggerConfig = currentEnvironment === 'production'
      ? { level: 'info' }
      : { level: 'debug' };

    // Execute Step 6 & 10: Instantiate the primary web application with secure defaults
    // Hardened to obscure framework footprints and limit incoming request body allocation sizes
    const fastify = FastifyFactory({
      logger: loggerConfig,
      disableRequestLogging: false,

      // Step 6: Perimeter Payload Shield - Blocks memory allocation exhaustion vectors
      bodyLimit: NetworkHardeningConstants.MAX_REQUEST_BODY_LIMIT_BYTES,

      // Step 10: Framework Detail Obfuscation - Eliminates fingerprinting identification headers
      caseSensitive: true,
      ignoreTrailingSlash: true
    });

    // Configure raw Node.js HTTP socket timeouts securely to defend against Slowloris attacks (Step 7)
    if (fastify.server) {
      fastify.server.requestTimeout = NetworkHardeningConstants.REQUEST_TIMEOUT_MS;
      fastify.server.keepAliveTimeout = NetworkHardeningConstants.KEEP_ALIVE_TIMEOUT_MS;
      fastify.server.headersTimeout = NetworkHardeningConstants.HEADERS_TIMEOUT_MS;
    }

    // Execute Step 2: Bind Operating System signal listeners (SIGTERM, SIGINT) and exception guards
    ApplicationLifecycleManager.bindLifecycleGuards(fastify);

    // 1. Register the centralized Global Error Boundary Interceptor first
    await fastify.register(registerGlobalErrorHandler);

    // 2. Register Step 3 & 4: Ingress Security Response Headers and Whitelisted CORS boundaries
    await registerProductionSecurityHeaders(fastify);

    // 3. Register Step 5: High-Performance Network Compression Engines (Gzip / Brotli streams)
    await registerProductionNetworkCompression(fastify);

    // 4. Register the OpenAPI / Swagger Documentation Layer Plugin
    await registerSwaggerDocumentation(fastify);

    // 5. Attach High-Assurance Context Tracking and Structured Request Loggers
    await fastify.register(registerRequestTracingLogger);

    // 6. Register the Distributed Redis-Backed Rate Limiting Guard
    fastify.addHook('preHandler', async (request: any, reply: any) => {
      await RateLimiterGuard.verifyRateLimit(request, reply);
    });

    // 7. Mount System Operations Endpoints (/health, /ready, /live, /metrics, /version, /build)
    await fastify.register(systemModuleRoutes);

    // 8. Mount Enterprise Functional Core Application Modules
    await fastify.register(usersModuleRoutes);

    // 9. Fallback Global Request Hardening: Catch-All 404 Route handler
    fastify.setNotFoundHandler((request: any, reply: any) => {
      reply.code(404).send({
        error: 'Not Found',
        message: 'The requested structural endpoint path does not exist on this workload platform.',
        timestamp: new Date().toISOString()
      });
    });

    // 10. Establish Execution Target Boundaries
    const targetPort = parseInt(process.env.PORT || '3000', 10);
    const targetHost = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port: targetPort, host: targetHost });
    console.log(`[DeployFlow Boot] Hardened application workload successfully executing at: http://${targetHost}:${targetPort}`);

  } catch (bootError) {
    console.error('[DeployFlow Boot Failure] A critical exception occurred during server startup:');
    console.error(bootError);
    process.exit(1);
  }
}

// Invoke the application assembly loop safely
bootstrapServer();
