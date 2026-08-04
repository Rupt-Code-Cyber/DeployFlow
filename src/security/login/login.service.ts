import { UserRepository } from '../../repositories/user.repository.ts';
import { RefreshTokenRepository } from '../../repositories/refresh-token.repository.ts';
import { AuditLogRepository } from '../../repositories/audit-log.repository.ts';
import { PasswordUtility } from '../crypto/password.ts';
import { JwtService } from '../jwt/jwt.service.ts';
import { RefreshTokenService } from '../tokens/refresh.service.ts';

// Explicit static type override for the console object
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

export interface LoginInputPayload {
  email: string;
  plaintextPassword: string;
}

export interface LoginResponseData {
  success: boolean;
  message: string;
  accessToken?: string;
  rawRefreshToken?: string;
}

/**
 * Enterprise Authentication Service orchestrating secure session creation.
 * Enforces timing-attack protections and immutable SRE operational audit trails.
 */
export class LoginService {
  private userRepo = new UserRepository();
  private tokenRepo = new RefreshTokenRepository();
  private auditRepo = new AuditLogRepository();

  public async authenticate(payload: LoginInputPayload): Promise<LoginResponseData> {
    try {
      // 1. Scan identity indexes for user matching criteria
      const user = await this.userRepo.findByEmail(payload.email);
      if (!user) {
        return { success: false, message: "Authentication failed: Invalid credentials provided." };
      }

      // 2. Verify account is currently globally active
      if (!user.isActive) {
        return { success: false, message: "Authentication failed: Target account is disabled." };
      }

      // 3. Enforce constant-time character validation check against stored hash
      const isPasswordValid = await PasswordUtility.verifyPassword(payload.plaintextPassword, user.passwordHash);
      if (!isPasswordValid) {
        // Record a security event tracking the failed access attempt
        await this.auditRepo.create({
          userId: user.id,
          action: 'USER_LOGIN_FAILURE_BAD_CREDENTIAL',
          resource: 'AUTHENTICATION_GATE',
          metadata: { email: payload.email }
        });
        return { success: false, message: "Authentication failed: Invalid credentials provided." };
      }

      // 4. Generate the short-lived stateless JWT access token package
      const accessToken = JwtService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role
      });

      // 5. Build high-entropy long-lived session refresh token parameters
      const tokenPackage = RefreshTokenService.createRefreshToken();

      // 6. Persist token tracking parameters safely within database tables
      await this.tokenRepo.create({
        userId: user.id,
        tokenHash: tokenPackage.hash,
        expiresAt: tokenPackage.expiresAt
      });

      // 7. Commit an immutable security audit tracking log entry
      await this.auditRepo.create({
        userId: user.id,
        action: 'USER_LOGIN_SUCCESS',
        resource: 'AUTHENTICATION_GATE',
        metadata: { email: user.email, role: user.role }
      });

      console.log(`[DeployFlow IAM Engine] Issued secure authentication tokens for user: ${user.email}`);

      return {
        success: true,
        message: "Authentication successful.",
        accessToken,
        rawRefreshToken: tokenPackage.token
      };
    } catch (error) {
      console.error('[LoginService Fault] Internal execution crash caught:');
      console.error(error as string);
      return { success: false, message: "A critical backend system fault was intercepted." };
    }
  }
}
