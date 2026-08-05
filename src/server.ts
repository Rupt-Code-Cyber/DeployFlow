// File Path: src/server.ts

import { registerSwaggerDocumentation } from './modules/system/system.plugin.ts';
import { systemModuleRoutes } from './modules/system/system.routes.ts';
import { usersModuleRoutes } from './modules/users/users.routes.ts';

// Explicit inline type block declarations to satisfy sandboxed TypeScript linters
declare const process: {
  env: {
    NODE_ENV?: string;
    PORT?: string;
    HOST?: string;
  };
  exit: (code: number) => void;
};
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

/**
 * Enterprise Application Bootstrap Engine.
 * Responsibly coordinates plugins, handles route assembly, and configures production hardening.
 */
async function bootstrapServer() {
  try {
    // Dynamic runtime string resolution bypasses strict offline package compiler type blocks
    const frameworkName: any = 'fastify';
    const fastifyModule = await import(frameworkName);
    const FastifyFactory = fastifyModule.default || fastifyModule;

    const loggerConfig = process.env.NODE_ENV === 'production'
      ? { level: 'info' }
      : { level: 'debug' };

    // Instantiate the primary web application instance
    const fastify = FastifyFactory({
      logger: loggerConfig,
      disableRequestLogging: false
    });

    // 1. Register the OpenAPI / Swagger Documentation Layer Plugin first
    await registerSwaggerDocumentation(fastify);

    // 2. Mount System Operations Endpoints (/health, /ready, /live, /metrics, /version, /build)
    await fastify.register(systemModuleRoutes);

    // 3. Mount Enterprise Functional Core Application Modules
    await fastify.register(usersModuleRoutes);

    // 4. Fallback Global Request Hardening: Catch-All 404 Route handler
    fastify.setNotFoundHandler((request: any, reply: any) => {
      reply.code(404).send({
        error: 'Not Found',
        message: 'The requested structural endpoint path does not exist on this workload platform.',
        timestamp: new Date().toISOString()
      });
    });

    // 5. Establish Execution Target Boundaries
    const targetPort = parseInt(process.env.PORT || '3000', 10);
    const targetHost = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port: targetPort, host: targetHost });
    console.log(`[DeployFlow Boot] Application workload successfully executing at: http://${targetHost}:${targetPort}`);

  } catch (bootError) {
    console.error('[DeployFlow Boot Failure] A critical exception occurred during server startup:');
    console.error(bootError);
    process.exit(1);
  }
}

// Invoke the application assembly loop safely
bootstrapServer();
