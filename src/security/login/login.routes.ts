import { LoginController } from './login.controller.ts';

/**
 * Encapsulates the public login route pathways definitions for the Fastify request engine.
 */
export async function loginRoutes(fastify: any, options: any): Promise<void> {
  const controller = new LoginController();

  fastify.post('/api/v1/auth/login', async (request: any, reply: any) => {
    await controller.handleLogin(request, reply);
  });
}
