// File Path: src/middleware/errors/error-handler.middleware.ts

import { LoggerFactory } from '../../logger/logger.factory.ts';
import { AppBaseException } from '../../security/errors/auth.errors.ts';

declare const console: { error: (msg: string) => void };

/**
 * Enterprise Global Error Boundary Handler.
 * Intercepts pipeline exceptions, scrubs technical stacks, and normalizes responses.
 */
export async function registerGlobalErrorHandler(fastify: any): Promise<void> {
  const logger = await LoggerFactory.createLogger();

  fastify.setErrorHandler((error: any, request: any, reply: any) => {
    const timestamp = new Date().toISOString();
    const requestId = request.requestId || 'SYSTEM_GLOBAL_INGRESS';
    const correlationId = request.correlationId || 'SYSTEM_GLOBAL_CHAIN';

    // Build a standardized logging context to link errors with trace logs
    const errorLogContext: Record<string, any> = {
      requestId,
      correlationId,
      path: request.url,
      method: request.method,
      errorName: error.name || 'UnknownError'
    };

    // 1. Scenario A: Handle custom strongly typed Domain Exceptions (Phase 6, Step 7)
    if (error instanceof AppBaseException) {
      logger.warn(`Domain exception intercepted: ${error.message}`, {
        ...errorLogContext,
        errorCode: error.errorCode,
        details: error.details
      });

      reply.code(error.statusCode).send({
        status: 'ERROR',
        errorCode: error.errorCode,
        message: error.message,
        timestamp
      });
      return;
    }

    // 2. Scenario B: Handle internal Prisma Repository Engine constraints (Phase 2 & 4)
    if (error.code && error.code.startsWith('P')) {
      errorLogContext.prismaCode = error.code;
      logger.error(`Database core persistence constraints breach caught: ${error.message}`, error, errorLogContext);

      // Map common Prisma codes to appropriate semantic REST status codes
      let mappedStatusCode = 500;
      let mappedErrorCode = 'ERROR_DATABASE_PERSISTENCE_FAULT';
      let clearTextWarning = 'An unhandled storage transaction boundary fault occurred.';

      if (error.code === 'P2002') { // Unique index identifier collision
        mappedStatusCode = 409;
        mappedErrorCode = 'ERROR_RESOURCE_COLLISION';
        clearTextWarning = 'The requested entity parameters collide with active database record constraints.';
      } else if (error.code === 'P2025') { // Record not found
        mappedStatusCode = 404;
        mappedErrorCode = 'ERROR_RESOURCE_NOT_FOUND';
        clearTextWarning = 'The targeted structural database target reference could not be resolved.';
      }

      reply.code(mappedStatusCode).send({
        status: 'ERROR',
        errorCode: mappedErrorCode,
        message: clearTextWarning,
        timestamp
      });
      return;
    }

    // 3. Scenario C: Parse system string-prefixed fallback errors (Phase 4 User Module backward compatibility)
    const rawMessage = error.message || '';
    if (rawMessage.startsWith('ERROR_') || rawMessage.startsWith('VALIDATION_FAILURE')) {
      let mappedStatusCode = 400;
      let cleanMessage = rawMessage;

      if (rawMessage.includes('ERROR_UNAUTHORIZED') || rawMessage.includes('UNAUTHORIZED_ACTION')) {
        mappedStatusCode = 403;
      } else if (rawMessage.includes('ERROR_NOT_FOUND') || rawMessage.includes('RESOURCE_NOT_FOUND')) {
        mappedStatusCode = 404;
      } else if (rawMessage.includes('ERROR_CONFLICT') || rawMessage.includes('RESOURCE_COLLISION')) {
        mappedStatusCode = 409;
      }

      logger.warn(`Legacy string-prefixed execution exception intercepted: ${rawMessage}`, errorLogContext);

      reply.code(mappedStatusCode).send({
        status: 'ERROR',
        errorCode: 'ERROR_APPLICATION_LOGIC_BREAKDOWN',
        message: cleanMessage,
        timestamp
      });
      return;
    }

    // 4. Scenario D: Fallback safe shield for completely unknown system crashes
    // Logs the raw error stack internally while completely hiding the debug details from clients
    logger.error(`Unhandled system pipeline exception caught: ${error.message}`, error, errorLogContext);

    reply.code(500).send({
      status: 'ERROR',
      errorCode: 'ERROR_INTERNAL_SERVER_CRASH',
      message: 'A critical unhandled execution breakdown occurred inside the platform infrastructure.',
      timestamp
    });
  });
}
