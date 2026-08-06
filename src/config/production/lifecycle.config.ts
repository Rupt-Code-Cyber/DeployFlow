// File Path: src/config/production/lifecycle.config.ts

import { RedisClientManager } from '../../cache/redis.client.ts';
import { getPrismaClient } from '../../lib/prisma/client.js';

// Explicit top-level type definitions to satisfy sandboxed TypeScript environment linters
declare const process: {
  on: (event: string, callback: (err?: any) => void) => void;
  exit: (code: number) => void;
};
declare const console: { log: (msg: string) => void; error: (msg: string) => void };
declare const setTimeout: (callback: () => void, ms: number) => any;

/**
 * Enterprise Application Lifecycle and Graceful Teardown Subsystem.
 * Responsibly monitors process boundaries, flushes storage connections, and handles signal draining.
 */
export class ApplicationLifecycleManager {
  private static isShuttingDown = false;

  /**
   * Registers global operating system signal listeners and runtime exception guards.
   */
  public static bindLifecycleGuards(fastifyInstance: any): void {
    // Intercept standard container termination signals
    process.on('SIGTERM', () => {
      this.handleShutdownSequence('SIGTERM (Kubernetes Pod Lifecycle Eviction)', fastifyInstance);
    });

    process.on('SIGINT', () => {
      this.handleShutdownSequence('SIGINT (Terminal Break Interruption Interrupt)', fastifyInstance);
    });

    // Intercept uncaught internal application exceptions
    process.on('uncaughtException', (error) => {
      console.error(`[CRITICAL EXCEPTION] Uncaught process boundary fault: ${error?.message || error}`);
      if (error?.stack) console.error(error.stack);
      this.handleShutdownSequence('UNCAUGHT_EXCEPTION', fastifyInstance, 1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error(`[CRITICAL REJECTION] Unhandled asynchronous promise rejection: ${reason}`);
      this.handleShutdownSequence('UNHANDLED_REJECTION', fastifyInstance, 1);
    });
  }

  /**
   * Executes a synchronized, non-destructive teardown across all operational tiers.
   */
  private static async handleShutdownSequence(
    triggerSource: string,
    fastify: any,
    exitCode = 0
  ): Promise<void> {
    // Prevent duplicate execution loops if multiple signals arrive concurrently
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(`\n[Teardown Init] Graceful shutdown sequence initialized via trigger: [${triggerSource}]`);

    // Safety Gate: Enforce a hard timeout ceiling (10s) to prevent zombie process deadlocks
    const fallbackForcedTimeout = setTimeout(() => {
      console.error('[Teardown Timeout] Inflight resource draining exceeded safety window. Forcing exit.');
      process.exit(1);
    }, 10000);

    try {
      // 1. Ingress Invalidation: Close the HTTP framework port boundary immediately
      if (fastify && typeof fastify.close === 'function') {
        console.log('[Teardown Step 1/3] Closing HTTP ingress ports. Draining active connections...');
        await fastify.close();
        console.log('[Teardown Step 1/3] HTTP ingress ports closed and connection pool drained.');
      }

      // 2. Cache Invalidation: Close active Redis socket pools gracefully
      console.log('[Teardown Step 2/3] Closing distributed cache socket channels...');
      await RedisClientManager.shutdownGracefully();

      // 3. Database Invalidation: Disconnect the relational Prisma persistence layer
      console.log('[Teardown Step 3/3] Closing relational database connection handles...');
      const prismaClient = getPrismaClient();
      if (prismaClient && typeof prismaClient.$disconnect === 'function') {
        await prismaClient.$disconnect();
        console.log('[Teardown Step 3/3] Relational database connection handles closed safely.');
      }

      console.log(`[Teardown Success] Application process context recycled cleanly. Terminating with code: ${exitCode}\n`);
      process.exit(exitCode);

    } catch (shutdownFault: any) {
      console.error(`[Teardown Error] Critical breakdown during resource container recycling: ${shutdownFault.message || shutdownFault}`);
      process.exit(1);
    }
  }
}
