import { JwtService } from '../../security/jwt/jwt.service.ts';
import type { VerifiedTokenClaims } from '../../security/jwt/jwt.service.ts';
import { UserRepository } from '../../repositories/user.repository.ts';

// Explicit static type override for the console object
declare const console: { error: (msg: string) => void };

/**
 * Enterprise Zero-Trust Authentication Middleware Interceptor.
 * Validates stateless access token perimeters and enforces real-time account status checks.
 */
export class AuthenticationMiddleware {
  private static userRepo = new UserRepository();

  /**
   * Fastify preHandler hook interface that intercepts and secures application routes.
   */
  public static async authenticateRequest(request: any, reply: any): Promise<void> {
    try {
      // 1. Extract raw token out of inbound headers or cookie transport arrays
      let token = '';
      const authHeader = request.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (request.cookies?.df_token) {
        token = request.cookies.df_token;
      }

      if (!token || token.trim() === '') {
        reply.code(401).send({ error: 'Unauthorized', message: 'Authentication credential token missing.' });
        return;
      }

      // 2. Execute cryptographic signature validation and expiration tracking checks
      const claims: VerifiedTokenClaims | null = JwtService.verifyAccessToken(token);
      if (!claims) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Authentication signature invalid or expired.' });
        return;
      }

      // 3. Perform a data-tier lookup to evaluate the account's active operational state
      const user = await this.userRepo.findById(claims.sub);
      if (!user) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Associated identity record could not be resolved.' });
        return;
      }

      if (!user.isActive) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access denied: Target user account is currently deactivated.' });
        return;
      }

      // 4. Inject the type-safe validated user context directly into the request scope
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

    } catch (error) {
      console.error('[AuthenticationMiddleware Fault] Critical request interception crash caught:');
      console.error(error as string);
      reply.code(500).send({ error: 'Internal Server Error', message: 'Security validation pipeline malfunction.' });
    }
  }
}
