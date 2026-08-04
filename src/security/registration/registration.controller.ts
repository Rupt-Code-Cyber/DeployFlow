import { RegistrationService } from './registration.service.ts';

export class RegistrationController {
  private registrationService = new RegistrationService();

  /**
   * Extracts payload arrays and routes them safely down to the business logic processing engine.
   */
  public async handleRegister(request: any, reply: any): Promise<void> {
    const { email, password } = request.body;

    // Fast-fail validation boundaries check
    if (!email || !password) {
      reply.code(400).send({ error: "Bad Request", message: "Required schema input attributes missing." });
      return;
    }

    const result = await this.registrationService.registerUser({
      email,
      plaintextPassword: password
    });

    if (!result.success) {
      reply.code(422).send({ status: "FAIL", message: result.message });
      return;
    }

    reply.code(201).send({
      status: "SUCCESS",
      message: result.message
    });
  }
}
