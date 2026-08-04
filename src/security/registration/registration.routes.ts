import { RegistrationController } from './registration.controller.ts';

/**
 * Encapsulates the public registration endpoint definitions for the Fastify request engine.
 */
export async function registrationRoutes(fastify: any, options: any): Promise<void> {
  const controller = new RegistrationController();

  // Expose the public sign-up route pathway definition
  fastify.post('/api/v1/auth/register', async (request: any, reply: any) => {
    await controller.handleRegister(request, reply);
  });
}
