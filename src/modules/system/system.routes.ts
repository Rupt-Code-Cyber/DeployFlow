// File Path: src/modules/system/system.routes.ts

import { SystemController } from './system.controller.ts';

/**
 * Registers production system operations endpoints directly to the root namespace.
 */
export async function systemModuleRoutes(fastify: any, options: any): Promise<void> {
  const controller = new SystemController();

  fastify.get('/health', async (request: any, reply: any) => {
    await controller.handleHealthCheck(request, reply);
  });

  fastify.get('/ready', async (request: any, reply: any) => {
    await controller.handleReadinessCheck(request, reply);
  });

  fastify.get('/live', async (request: any, reply: any) => {
    await controller.handleLivenessCheck(request, reply);
  });

  fastify.get('/version', async (request: any, reply: any) => {
    await controller.handleVersionQuery(request, reply);
  });

  fastify.get('/build', async (request: any, reply: any) => {
    await controller.handleBuildQuery(request, reply);
  });

  fastify.get('/metrics', async (request: any, reply: any) => {
    await controller.handleMetricsQuery(request, reply);
  });
}
