// File Path: src/logger/logger.interface.ts

/**
 * Enforces a framework-agnostic boundary contract for all application logs.
 * Guarantees business logic remains uncoupled from third-party logger modifications.
 */
export interface IAppLogger {
  trace(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, trace?: any, context?: Record<string, any>): void;
  fatal(message: string, trace?: any, context?: Record<string, any>): void;
}
