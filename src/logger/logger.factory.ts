// File Path: src/logger/logger.factory.ts

import { IAppLogger } from './logger.interface.ts';

// Explicit top-level ambient block type declarations to satisfy sandboxed TypeScript linters
declare const process: {
  env: {
    NODE_ENV?: string;
    LOG_LEVEL?: string;
  };
};
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

/**
 * High-Assurance Factory Engine producing custom environment-configured loggers.
 */
export class LoggerFactory {
  /**
   * Initializes and compiles a production-ready application logger platform instance.
   */
  public static async createLogger(): Promise<IAppLogger> {
    try {
      const pinoPkgName: any = 'pino';
      const pinoModule = await import(pinoPkgName);
      const pino = pinoModule.default || pinoModule;

      const currentEnv = (process.env.NODE_ENV || 'development').toLowerCase();
      const configuredLevel = process.env.LOG_LEVEL || (currentEnv === 'production' ? 'info' : 'debug');

      // Base configuration parameters ensuring compliance boundaries
      const pinoOptions: any = {
        level: configuredLevel,
        // Standardized timestamp calculation formatting
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        // Enterprise Redaction Layer: Prevents leaking secrets into storage pools
        redact: {
          paths: [
            'password',
            '*.password',
            'passwordHash',
            '*.passwordHash',
            'token',
            '*.token',
            'accessToken',
            '*.accessToken',
            'refreshToken',
            '*.refreshToken',
            'authorization',
            'headers.authorization'
          ],
          censor: '[REDACTED_SECURITY_DATA]'
        },
        // Standardize output variable formatting keys
        formatters: {
          level: (label: string) => {
            return { level: label.toUpperCase() };
          }
        }
      };

      // Non-production environment tuning: enable clear human-readable console blocks
      if (currentEnv !== 'production' && currentEnv !== 'test') {
        pinoOptions.transport = {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:HH:MM:ss.l'
          }
        };
      }

      const pinoInstance = pino(pinoOptions);

      // Map the third-party framework engine onto our interface protocol contract
      return {
        trace: (msg, ctx) => pinoInstance.trace(ctx || {}, msg),
        debug: (msg, ctx) => pinoInstance.debug(ctx || {}, msg),
        info: (msg, ctx) => pinoInstance.info(ctx || {}, msg),
        warn: (msg, ctx) => pinoInstance.warn(ctx || {}, msg),
        error: (msg, trace, ctx) => {
          const errObj = trace instanceof Error ? { err: { message: trace.message, stack: trace.stack } } : { err: trace };
          pinoInstance.error({ ...errObj, ...(ctx || {}) }, msg);
        },
        fatal: (msg, trace, ctx) => {
          const errObj = trace instanceof Error ? { err: { message: trace.message, stack: trace.stack } } : { err: trace };
          pinoInstance.fatal({ ...errObj, ...(ctx || {}) }, msg);
        }
      };

    } catch (err) {
      // Graceful fallback logger layout if the dynamic framework instantiation breaks
      console.error('[LoggerFactory Error] Failed to compile pino configuration. Instantiating safety fallback.');

      return {
        trace: (m, c) => console.log(`[TRACE] ${m} ${c ? JSON.stringify(c) : ''}`),
        debug: (m, c) => console.log(`[DEBUG] ${m} ${c ? JSON.stringify(c) : ''}`),
        info: (m, c) => console.log(`[INFO] ${m} ${c ? JSON.stringify(c) : ''}`),
        warn: (m, c) => console.log(`[WARN] ${m} ${c ? JSON.stringify(c) : ''}`),
        error: (m, t, c) => console.error(`[ERROR] ${m} ${t?.message || t} ${c ? JSON.stringify(c) : ''}`),
        fatal: (m, t, c) => console.error(`[FATAL] ${m} ${t?.message || t} ${c ? JSON.stringify(c) : ''}`)
      };
    }
  }
}
