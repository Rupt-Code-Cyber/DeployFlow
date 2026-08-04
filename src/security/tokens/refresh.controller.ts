import { RefreshTokenRepository } from '../../repositories/refresh-token.repository.ts';
import { UserRepository } from '../../repositories/user.repository.ts';
import { AuditLogRepository } from '../../repositories/audit-log.repository.ts';
import { JwtService } from '../jwt/jwt.service.ts';
import { RefreshTokenService } from './refresh.service.ts';
import { CookieTransportUtility } from '../transport/cookie.config.ts';

// Explicit static type override for the console object
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

export class RefreshTokenController {
  private tokenRepo = new RefreshTokenRepository();
  private userRepo = new UserRepository();
  private auditRepo = new AuditLogRepository();

  /**
   * Evaluates inbound session tokens and executes single-use rotation sequences.
   * Incorporates automated replay-attack tracking and wide-blast radius revocation cascades.
   */
  public async handleRefresh(request: any, reply: any): Promise<void> {
    // 1. Parse raw token out of inbound headers or secure cookies (df_sid)
    let rawToken = request.cookies?.df_sid || request.body?.refreshToken;

    if (!rawToken) {
      reply.code(400).send({ error: "Bad Request", message: "Required session token reference missing." });
      return;
    }

    try {
      // 2. Compute the one-way secure digest hash to locate the ledger entry
      const incomingHash = RefreshTokenService.hashToken(rawToken);
      const tokenRecord = await this.tokenRepo.findByHash(incomingHash);

      // Anomaly Case A: Token reference does not exist or has been marked explicitly revoked
      if (!tokenRecord || tokenRecord.isRevoked) {
        if (tokenRecord) {
          // Replay Attack Detected: An old token was resubmitted. Purge all user tokens immediately.
          await this.auditRepo.create({
            userId: tokenRecord.userId,
            action: 'SECURITY_REPLAY_ATTACK_DETECTED',
            resource: 'IDENTITY_SESSION',
            metadata: { tokenHash: incomingHash, note: "Purging session family cascade due to duplicate reuse." }
          });
          await this.tokenRepo.revoke(incomingHash); // Wipe entire session family trail
        }

        const clearCookie = CookieTransportUtility.buildClearCookie();
        reply.header('Set-Cookie', `${clearCookie.name}=${clearCookie.value}; HttpOnly; Secure; SameSite=Strict; Path=${clearCookie.path}; MaxAge=0`);
        reply.code(401).send({ status: "UNAUTHORIZED", message: "Session authorization expired or revoked." });
        return;
      }

      // Anomaly Case B: Token timeline has crossed expiration thresholds
      if (RefreshTokenService.isExpired(tokenRecord.expiresAt)) {
        await this.tokenRepo.revoke(incomingHash);
        const clearCookie = CookieTransportUtility.buildClearCookie();
        reply.header('Set-Cookie', `${clearCookie.name}=${clearCookie.value}; HttpOnly; Secure; SameSite=Strict; Path=${clearCookie.path}; MaxAge=0`);
        reply.code(401).send({ status: "UNAUTHORIZED", message: "Session framework has expired." });
        return;
      }

      // 3. Resolve parent identity profile mapping parameters
      const user = await this.userRepo.findById(tokenRecord.userId);
      if (!user || !user.isActive) {
        reply.code(401).send({ status: "UNAUTHORIZED", message: "Associated account is inactive." });
        return;
      }

      // 4. Single-Use Invalidation: Instantly revoke the spent incoming token
      await this.tokenRepo.revoke(incomingHash);

      // 5. Generate a brand-new token pair rotation package
      const nextAccessToken = JwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role
      });
      const nextTokenPackage = RefreshTokenService.createRefreshToken();

      // 6. Persist the new token hash into your database tracking tables
      await this.tokenRepo.create({
        userId: user.id,
        tokenHash: nextTokenPackage.hash,
        expiresAt: nextTokenPackage.expiresAt
      });

      // 7. Commit successful rotation tracking information to system logs
      await this.auditRepo.create({
        userId: user.id,
        action: 'TOKEN_ROTATION_SUCCESS',
        resource: 'AUTHENTICATION_GATE',
        metadata: { email: user.email }
      });

      // 8. Inject the new rotated token back into a secure browser cookie
      const secureCookie = CookieTransportUtility.buildRefreshCookie(nextTokenPackage.token);
      reply.header('Set-Cookie', `${secureCookie.name}=${secureCookie.value}; HttpOnly; SameSite=Strict; Path=${secureCookie.path}; MaxAge=${secureCookie.maxAge}`);

      reply.code(200).send({
        status: "SUCCESS",
        accessToken: nextAccessToken,
        refreshToken: nextTokenPackage.token // Provided for non-browser hybrid application integrations
      });
    } catch (error) {
      console.error('[RefreshTokenController Fault] Dynamic rotation workflow error caught:');
      reply.code(500).send({ error: "Internal Server Error", message: "Token execution pipeline crash." });
    }
  }
}
