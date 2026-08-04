import { RefreshTokenController } from './refresh.controller.ts';

/**
 * Encapsulates the public token exchange and rotation route pathways for the Fastify engine.
 */
export async function refreshRoutes(fastify: any, options: any): Promise<void> {
  const controller = new RefreshTokenController();

  fastify.post('/api/v1/auth/refresh', async (request: any, reply: any) => {
    await controller.handleRefresh(request, reply);
  });
}
