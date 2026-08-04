// Explicit static type override for the console object
declare const console: { error: (msg: string) => void };

export interface StandardErrorResponse {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  timestamp: string;
}

/**
 * Enterprise Authentication & Authorization Error Handler.
 * Enforces OWASP-compliant sanitization standards across public API boundaries.
 */
export class AuthErrors {

  /**
   * Dispatches a sanitized, uniform response tracking an authentication failure.
   * Neutralizes user enumeration attempts by matching input and output error strings.
   */
  public static sendInvalidCredentials(reply: any): void {
    const status = 401;
    const response: StandardErrorResponse = {
      statusCode: status,
      error: 'Unauthorized',
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Authentication failed: Invalid credentials provided.',
      timestamp: new Date().toISOString()
    };
    reply.code(status).send(response);
  }

  /**
   * Dispatches a response tracking an access token expiration window fault.
   */
  public static sendTokenExpired(reply: any): void {
    const status = 401;
    const response: StandardErrorResponse = {
      statusCode: status,
      error: 'Unauthorized',
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Access token tracking lifecycle has expired.',
      timestamp: new Date().toISOString()
    };
    reply.code(status).send(response);
  }

  /**
   * Dispatches a response tracking an invalid or malformed cryptographic token signature.
   */
  public static sendInvalidToken(reply: any): void {
    const status = 401;
    const response: StandardErrorResponse = {
      statusCode: status,
      error: 'Unauthorized',
      code: 'AUTH_TOKEN_INVALID',
      message: 'Cryptographic access token verification failed or signature is corrupted.',
      timestamp: new Date().toISOString()
    };
    reply.code(status).send(response);
  }

  /**
   * Dispatches an explicit barrier response tracking a disabled user account profile.
   */
  public static sendAccountDisabled(reply: any): void {
    const status = 403;
    const response: StandardErrorResponse = {
      statusCode: status,
      error: 'Forbidden',
      code: 'AUTH_ACCOUNT_DISABLED',
      message: 'Access denied: Target organizational identity has been suspended.',
      timestamp: new Date().toISOString()
    };
    reply.code(status).send(response);
  }

  /**
   * Dispatches a response tracking an execution path access rule block.
   */
  public static sendInsufficientPermissions(reply: any): void {
    const status = 403;
    const response: StandardErrorResponse = {
      statusCode: status,
      error: 'Forbidden',
      code: 'AUTH_INSUFFICIENT_PRIVILEGES',
      message: 'Access denied: Insufficient privilege profile authorization tiers.',
      timestamp: new Date().toISOString()
    };
    reply.code(status).send(response);
  }

  /**
   * Intercepts unhandled pipeline faults, logs the core trace securely to the internal console,
   * and returns a non-descriptive generic fallback payload to protect infrastructure variables.
   */
  public static handlePipelineException(error: any, reply: any): void {
    console.error('[Security Exception Crash] Intercepted unhandled execution pipeline crash:');
    console.error(error as string);

    const status = 500;
    const response: StandardErrorResponse = {
      statusCode: status,
      error: 'Internal Server Error',
      code: 'SYSTEM_PIPELINE_ERROR',
      message: 'An internal backend security mapping function malfunctioned.',
      timestamp: new Date().toISOString()
    };
    reply.code(status).send(response);
  }
}
