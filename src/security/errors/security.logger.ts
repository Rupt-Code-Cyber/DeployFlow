// File Path: src/security/errors/security.logger.ts

import { LoggerFactory } from '../../logger/logger.factory.ts';

declare const console: { error: (msg: string) => void };

/**
 * Standardized High-Assurance Security Event Classifications.
 * Maps directly to enterprise SIEM monitoring matrices and alerting triggers.
 */
export const SecurityEventCode = {
  AUTH_FAILURE: 'SEC_AUTH_CREDENTIALS_INVALID',
  TOKEN_INVALID: 'SEC_AUTH_SIGNATURE_CORRUPTED',
  RBAC_DENIAL: 'SEC_AUTH_PRIVILEGE_VIOLATION',
  SUSPICIOUS_INPUT: 'SEC_DATA_INJECTION_SUSPECTED',
  MUTATION_ATTEMPT: 'SEC_DATA_PROTECTED_MODIFICATION'
} as const;

export type SecurityEventCodeType = typeof SecurityEventCode[keyof typeof SecurityEventCode];

/**
 * High-Assurance Utility Enforcing Zero-Trust Hardened Security Logs.
 * Automatically injects structural metadata and executes strict key redactions.
 */
export class SecurityLogger {
  /**
   * Logs a sanitized security event.
   * Strips sensitive variables to prevent credential leakage into monitoring systems.
   */
  public static async logSecurityEvent(
    eventCode: SecurityEventCodeType,
    message: string,
    requestContext: any,
    extraMetadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const logger = await LoggerFactory.createLogger();

      // Extract secure trace identifiers from the upstream request envelope safely
      const requestId = requestContext?.requestId || 'SEC_GLOBAL_INGRESS';
      const correlationId = requestContext?.correlationId || 'SEC_GLOBAL_CHAIN';
      const operatorId = requestContext?.user?.id || requestContext?.id || 'ANONYMOUS_ACTOR';
      const operatorRole = requestContext?.user?.role || requestContext?.role || 'UNAUTHENTICATED';

      // Deep clone and clean the metadata object to block log injection or credential leaks
      const sanitizedMeta = this.deepScrubObject(extraMetadata);

      const securityContext: Record<string, any> = {
        securityEvent: true,
        eventCode,
        requestId,
        correlationId,
        operator: {
          id: operatorId,
          role: operatorRole
        },
        metadata: sanitizedMeta,
        timestamp: new Date().toISOString()
      };

      // Escalate severity levels based on event classification types
      if (eventCode === SecurityEventCode.RBAC_DENIAL || eventCode === SecurityEventCode.SUSPICIOUS_INPUT) {
        logger.warn(`[SECURITY ALERT] [${eventCode}] ${message}`, securityContext);
      } else {
        logger.info(`[SECURITY TRACE] [${eventCode}] ${message}`, securityContext);
      }

    } catch (err) {
      console.error('[SecurityLogger Error] Critical failure generating telemetry alert trace line.');
    }
  }

  /**
   * Recursively parses tracking objects to sanitize values and strip credential keys.
   */
  private static deepScrubObject(input: any): any {
    if (input === null || typeof input !== 'object') {
      // If the parameter is a string, scrub newline injections to block log manipulation
      if (typeof input === 'string') {
        return input.replace(/[\n\r]/g, ' [NEWLINE_STRIPPED] ');
      }
      return input;
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.deepScrubObject(item));
    }

    const cleaned: Record<string, any> = {};
    const prohibitedKeys = ['password', 'passwordhash', 'token', 'jwt', 'authorization', 'secret', 'cookie', 'credential'];

    for (const key of Object.keys(input)) {
      const lowerKey = key.toLowerCase();
      if (prohibitedKeys.some(prohibited => lowerKey.includes(prohibited))) {
        cleaned[key] = '[SCRUBBED_SECURITY_COMPLIANCE_REDACTION]';
      } else {
        cleaned[key] = this.deepScrubObject(input[key]);
      }
    }

    return cleaned;
  }
}
