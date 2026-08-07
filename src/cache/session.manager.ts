// File Path: src/cache/session.manager.ts

import { CacheService } from './cache.service.ts';
import { CacheKeys } from './cache.keys.ts';

declare const console: { log: (msg: string) => void; error: (msg: string) => void };

export interface IUserSessionMetadata {
  userId: string;
  email: string;
  role: string;
  tokenHash: string;
  clientIp: string;
  userAgent: string;
  lastActivityAt: string;
}

/**
 * Enterprise Distributed Session Storage Manager.
 * Responsibly manages stateless identity profile tracking variables across cluster blocks.
 */
export class DistributedSessionManager {
  private static cache = new CacheService();

  // Standard session configuration duration parameter: 7 Days (604800 Seconds)
  private static readonly SESSION_TTL_SECONDS = 604800;

  /**
   * Registers and commits a structured state tracking session directly into the Redis RAM plane.
   */
  public static async establishSession(session: IUserSessionMetadata): Promise<boolean> {
    try {
      const storageKey = CacheKeys.getUserSessionKey(session.email);

      console.log(`[Session Store] Establishing distributed token state lifecycle trace for: ${session.email}`);

      // Save session parameters with a mandatory TTL expiration window boundary
      return await this.cache.set(storageKey, session, this.SESSION_TTL_SECONDS);
    } catch (error: any) {
      console.error(`[Session Manager Error] Failed to persist distributed data payload: ${error.message || error}`);
      return false;
    }
  }

  /**
   * Resolves and verifies an active identity session record while cross-checking client footprints.
   */
  public static async validateSession(email: string, clientUserAgent: string): Promise<IUserSessionMetadata | null> {
    try {
      const storageKey = CacheKeys.getUserSessionKey(email);
      const session = await this.cache.get<IUserSessionMetadata>(storageKey);

      if (!session) {
        return null;
      }

      // Security Verification Gate: Detect and block session-hijacking token clones
      if (session.userAgent !== clientUserAgent) {
        console.error(`[SECURITY ALERT] Session footprint variation detected for ${email}. Revoking session channel.`);
        await this.revokeSession(email);
        return null;
      }

      // Proactively refresh the session's sliding expiration window during active usage
      await this.cache.expire(storageKey, this.SESSION_TTL_SECONDS);

      return session;
    } catch (error: any) {
      console.error(`[Session Manager Error] Validation process encountered an execution fault: ${error.message || error}`);
      return null;
    }
  }

  /**
   * Evicts a target identity session completely from memory blocks, executing an instant logout.
   */
  public static async revokeSession(email: string): Promise<boolean> {
    try {
      const storageKey = CacheKeys.getUserSessionKey(email);
      console.log(`[Session Store] Explicitly evicting distributed token trace for: ${email}`);
      return await this.cache.delete(storageKey);
    } catch (error: any) {
      console.error(`[Session Manager Error] Revocation sequence failed to execute: ${error.message || error}`);
      return false;
    }
  }
}
