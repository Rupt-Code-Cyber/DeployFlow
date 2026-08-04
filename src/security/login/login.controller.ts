import { LoginService } from './login.service.ts';

export class LoginController {
  private loginService = new LoginService();

  public async handleLogin(request: any, reply: any): Promise<void> {
    const { email, password } = request.body;

    if (!email || !password) {
      reply.code(400).send({ error: "Bad Request", message: "Required schema input attributes missing." });
      return;
    }

    const result = await this.loginService.authenticate({ email, plaintextPassword: password });

    if (!result.success) {
      reply.code(401).send({ status: "UNAUTHORIZED", message: result.message });
      return;
    }

    // Pass access token in body, return refresh token for cookie transport setup in next step
    reply.code(200).send({
      status: "SUCCESS",
      message: result.message,
      accessToken: result.accessToken,
      // Temporarily exposing raw token until cookie transport is wired in Step 7
      refreshToken: result.rawRefreshToken
    });
  }
}
