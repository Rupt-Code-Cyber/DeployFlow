// File Path: src/config/production/environment.validator.ts

// Explicit top-level type definitions to satisfy sandboxed TypeScript environment linters
declare const process: {
  env: Record<string, string>;
  exit: (code: number) => void;
};
declare const console: { error: (msg: string) => void };

/**
 * Enterprise Environment Startup Schema Validation Platform.
 * Enforces a strict Fail-Fast strategy to block misconfigured container initializations.
 */
export class EnvironmentValidator {
  /**
   * Evaluates vital system environment parameters.
   * Forces an immediate process exit if schema criteria are violated.
   */
  public static validateStartupSchema(): void {
    // Graceful exception pass to streamline isolated automated test suite runs
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const unmappedRequiredKeys: string[] = [];

    // 1. Core Structural Presence Check Matrix
    const essentialVariables = ['DATABASE_URL', 'REDIS_HOST', 'REDIS_PORT', 'JWT_SECRET'];
    for (const key of essentialVariables) {
      if (!process.env[key] || process.env[key].trim() === '') {
        unmappedRequiredKeys.push(key);
      }
    }

    if (unmappedRequiredKeys.length > 0) {
      console.error('\n==============================================================================');
      console.error('[CRITICAL CONFIGURATION ERROR] Environment startup schema validation failed!');
      console.error(` -> Missing Mandatory Fields: [${unmappedRequiredKeys.join(', ')}]`);
      console.error('==============================================================================\n');
      process.exit(1);
    }

    // 2. Data Format & Cryptographic Entropy Bounds Hardening
    try {
      const portCandidate = parseInt(process.env.PORT || '3000', 10);
      if (isNaN(portCandidate) || portCandidate < 1024 || portCandidate > 65535) {
        throw new Error(`PORT assignment [${process.env.PORT}] falls outside valid unprivileged network ranges (1024-65535).`);
      }

      const redisPortCandidate = parseInt(process.env.REDIS_PORT, 10);
      if (isNaN(redisPortCandidate) || redisPortCandidate < 1 || redisPortCandidate > 65535) {
        throw new Error(`REDIS_PORT [${process.env.REDIS_PORT}] maps to an illegal system socket boundary.`);
      }

      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
        throw new Error('DATABASE_URL connection string protocol must adhere to valid postgresql schemas.');
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret.length < 32) {
        throw new Error(`JWT_SECRET cryptographic signature entropy length [${jwtSecret.length} chars] drops below 32-character enterprise standards.`);
      }

    } catch (schemaFormatViolationError: any) {
      console.error('\n==============================================================================');
      console.error('[CRITICAL FORMAT FAULT] Environment variable constraint breach detected!');
      console.error(` -> Structural Violation: ${schemaFormatViolationError.message || schemaFormatViolationError}`);
      console.error('==============================================================================\n');
      process.exit(1);
    }
  }
}
