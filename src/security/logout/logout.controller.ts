import { RefreshTokenRepository } from '../../repositories/refresh-token.repository.ts';
import { AuditLogRepository } from '../../repositories/audit-log.repository.ts';
import { RefreshTokenService } from '../tokens/refresh.service.ts';
import { CookieTransportUtility } from '../transport/cookie.config.ts';

// Explicit static type override for the console object
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

export class LogoutController {
  private tokenRepo = new RefreshTokenRepository();
  private auditRepo = new AuditLogRepository();

  /**
   * Evaluates incoming session tokens, invalidates database records, and triggers cookie destruction.
   */
  public async handleLogout(request: any, reply: any): Promise<void> {
    // 1. Parse raw token out of inbound headers or secure cookies
    const rawToken = request.cookies?.df_sid || request.body?.refreshToken;

    try {
      if (rawToken) {
        // 2. Compute the cryptographic hash to target the specific ledger record
        const incomingHash = RefreshTokenService.hashToken(rawToken);
        const tokenRecord = await this.tokenRepo.findByHash(incomingHash);

        if (tokenRecord) {
          // 3. Mark the active token explicitly revoked inside your database tables
          await this.tokenRepo.revoke(incomingHash);

          // 4. Commit an immutable security audit tracking log entry
          await this.auditRepo.create({
            userId: tokenRecord.userId,
            action: 'USER_LOGOUT_SUCCESS',
            resource: 'AUTHENTICATION_GATE',
            metadata: { tokenHash: incomingHash }
          });

          console.log(`[DeployFlow IAM Engine] Successfully revoked session record for user: ${tokenRecord.userId}`);
        }
      }

      // 5. Build an immediate cookie clear configuration payload to wipe client storage
      const clearCookie = CookieTransportUtility.buildClearCookie();
      reply.header('Set-Cookie', `${clearCookie.name}=${clearCookie.value}; HttpOnly; Secure; SameSite=Strict; Path=${clearCookie.path}; MaxAge=0`);

      reply.code(200).send({
        status: "SUCCESS",
        message: "Session successfully terminated."
      });
    } catch (error) {
      console.error('[LogoutController Fault] Critical session destruction crash caught:');
      reply.code(500).send({ error: "Internal Server Error", message: "Logout execution pipeline crash." });
    }
  }
}
