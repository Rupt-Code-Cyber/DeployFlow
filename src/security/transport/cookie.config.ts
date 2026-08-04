// Explicit static type configurations to satisfy the compiler without an internet network connection
declare const process: { env: { [key: string]: string | undefined } };

export interface CookieTransportOptions {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  path: string;
  maxAge: number;
}

/**
 * Enterprise Cookie Transport & Perimeter Security Controller.
 * Establishes absolute mitigations against browser XSS and CSRF exploit vectors.
 */
export class CookieTransportUtility {
  private static readonly REFRESH_TOKEN_COOKIE_NAME = 'df_sid';
  private static readonly SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60; // 604800 seconds

  /**
   * Compiles an enterprise-grade secure cookie payload configuration.
   * Leverages environment-aware rules to switch parameters safely between local and production tiers.
   *
   * @param rawToken High-entropy raw refresh token value.
   * @returns Complete structural transport configuration block.
   */
  public static buildRefreshCookie(rawToken: string): CookieTransportOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      name: this.REFRESH_TOKEN_COOKIE_NAME,
      value: rawToken,
      httpOnly: true,
      // Production forces strict HTTPS TLS transport channels exclusively
      secure: isProduction,
      sameSite: 'Strict',
      path: '/api/v1/auth', // Limits scope strictly to relevant lifecycle endpoints
      maxAge: this.SEVEN_DAYS_SECONDS
    };
  }

  /**
   * Generates an immediate cookie clear configuration payload to wipe client sessions.
   *
   * @returns Expired cookie initialization template.
   */
  public static buildClearCookie(): CookieTransportOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      name: this.REFRESH_TOKEN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      path: '/api/v1/auth',
      maxAge: 0 // Instantly signals the browser client engine to drop the record
    };
  }
}
