// File Path: src/cache/cache.keys.ts

// Explicit ambient type override to satisfy isolated environment compilers
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

/**
 * Enterprise Caching Key Registry and Generation Engine.
 * Enforces rigid string isolation parameters to block key collision vectors.
 */
export class CacheKeys {
  // Centralized system namespace prefix separating environment data shapes securely
  private static readonly SYSTEM_PREFIX = (process.env.NODE_ENV || 'production').toLowerCase() === 'production'
    ? 'df_prod'
    : 'df_dev';

  private static readonly DOMAINS = {
    USERS: 'users',
    AUTH: 'auth',
    SYSTEM: 'system'
  } as const;

  private static readonly REVISIONS = {
    PROFILE: 'profile',
    SESSION: 'session',
    RATE_LIMIT: 'rate_limit'
  } as const;

  /**
   * Generates a rigid cache storage coordinate address for a user identity profile record.
   * Target Output Pattern: "df_prod:users:[UUID_String]:profile"
   */
  public static getUserProfileKey(userId: string): string {
    const sanitizedId = userId.trim().toLowerCase();
    return `${this.SYSTEM_PREFIX}:${this.DOMAINS.USERS}:${sanitizedId}:${this.REVISIONS.PROFILE}`;
  }

  /**
   * Generates a rigid cache storage coordinate address for a long-lived user session.
   * Target Output Pattern: "df_prod:auth:[User_Email_Or_Id]:session"
   */
  public static getUserSessionKey(identifier: string): string {
    const sanitizedId = identifier.trim().toLowerCase();
    return `${this.SYSTEM_PREFIX}:${this.DOMAINS.AUTH}:${sanitizedId}:${this.REVISIONS.SESSION}`;
  }

  /**
   * Generates a highly insulated coordinate path for atomic distributed rate limit metrics.
   * Target Output Pattern: "df_prod:system:[Client_IP_Address]:rate_limit"
   */
  public static getRateLimitKey(clientIp: string): string {
    // Strip empty whitespace and format characters safely to prevent key line injections
    const sanitizedIp = clientIp.replace(/[^a-zA-Z0-9.:]/g, '_');
    return `${this.SYSTEM_PREFIX}:${this.DOMAINS.SYSTEM}:${sanitizedIp}:${this.REVISIONS.RATE_LIMIT}`;
  }
}
