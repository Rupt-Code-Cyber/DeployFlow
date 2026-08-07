// File Path: src/security/errors/auth.errors.ts

/**
 * Foundational Abstract Domain Exception Class.
 * Forms the root of all specialized operational error structures in the system.
 */
export abstract class AppBaseException extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;
  public readonly timestamp: string;

  constructor(message: string, public readonly details: Record<string, any> = {}) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 400 Bad Request: Triggered when input payloads fail structural parsing boundaries.
 */
export class ValidationException extends AppBaseException {
  public readonly statusCode = 400;
  public readonly errorCode = 'ERROR_VALIDATION_FAILURE';
}

/**
 * 401 Unauthorized: Triggered when cryptographic signatures or session tokens are missing/expired.
 */
export class AuthenticationException extends AppBaseException {
  public readonly statusCode = 401;
  public readonly errorCode = 'ERROR_AUTHENTICATION_REQUIRED';
}

/**
 * 403 Forbidden: Triggered when verified identities violate RBAC permission tiers.
 */
export class AuthorizationException extends AppBaseException {
  public readonly statusCode = 403;
  public readonly errorCode = 'ERROR_UNAUTHORIZED_ACTION';
}

/**
 * 404 Not Found: Triggered when identifier scanning fails to locate a database row.
 */
export class NotFoundException extends AppBaseException {
  public readonly statusCode = 404;
  public readonly errorCode = 'ERROR_RESOURCE_NOT_FOUND';
}

/**
 * 409 Conflict: Triggered when index scans detect unique key allocation collisions.
 */
export class ConflictException extends AppBaseException {
  public readonly statusCode = 409;
  public readonly errorCode = 'ERROR_RESOURCE_COLLISION';
}

/**
 * 500 Internal Server Error: Triggered when downstream persistence engines fail.
 */
export class InfrastructureException extends AppBaseException {
  public readonly statusCode = 500;
  public readonly errorCode = 'ERROR_INTERNAL_INFRASTRUCTURE_FAILURE';
}
