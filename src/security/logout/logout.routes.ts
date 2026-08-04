import { LogoutController } from './logout.controller.ts';

/**
 * Encapsulates the public logout route pathways definitions for the Fastify engine.
 */
export async function logoutRoutes(fastify: any, options: any): Promise<void> {
  const controller = new LogoutController();

  fastify.post('/api/v1/auth/logout', async (request: any, reply: any) => {
    await controller.handleLogout(request, reply);
  });
}
