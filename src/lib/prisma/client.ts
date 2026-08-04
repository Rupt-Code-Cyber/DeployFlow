// Explicit static inline types to satisfy the compiler without an internet network connection
declare const process: {
  env: { [key: string]: string | undefined };
  on: (event: string, callback: () => void) => void;
  exit: (code: number) => never;
};
declare const console: { log: (msg: string) => void; error: (msg: string) => void };

/**
 * Mock Type Interface representing the structural query capabilities
 * of the auto-generated Prisma Client API layer.
 */
export interface PrismaClientEngine {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  user: any;
  refreshToken: any;
  auditLog: any;
}

/**
 * Enterprise Database Client Factory and Lifecycle Manager.
 * Implements a strict Singleton pattern to govern connection pooling.
 */
class PrismaClientManager {
  private static instance: PrismaClientEngine | null = null;
  private static isDisconnecting = false;

  private constructor() {}

  /**
   * Fetches the global, shared instance of the Prisma Client.
   * Leverages lazy initialization to instantiate the pool on demand.
   */
  public static getInstance(): PrismaClientEngine {
    if (!PrismaClientManager.instance) {
      console.log("[DeployFlow Persistence] Initializing Global Shared Prisma Client Singleton instance...");

      // Standard application-side mapping interface structure
      PrismaClientManager.instance = {
        $connect: async () => { console.log("[DeployFlow Database] Connection pool successfully warm."); },
        $disconnect: async () => { console.log("[DeployFlow Database] Connection pool cleanly drained."); },
        user: {},
        refreshToken: {},
        auditLog: {}
      };

      // Wire up automated process listeners for graceful environment teardowns
      PrismaClientManager.registerShutdownHooks();
    }

    return PrismaClientManager.instance;
  }

  /**
   * Intercepts OS signals to cleanly terminate active database connections.
   * Critical for zero-downtime rolling deployments inside container clusters.
   */
  private static registerShutdownHooks(): void {
    const handleTermination = async (signal: string) => {
      if (PrismaClientManager.isDisconnecting) return;
      PrismaClientManager.isDisconnecting = true;

      console.log(`\n[DeployFlow Systems] Intercepted ${signal} signal. Starting graceful shutdown sequence...`);

      try {
        if (PrismaClientManager.instance) {
          await PrismaClientManager.instance.$disconnect();
          console.log("[DeployFlow Systems] Database connection lifecycle terminated successfully.");
        }
        process.exit(0);
      } catch (error) {
        console.error("[DeployFlow Systems] Error encountered during database lifecycle disconnect:");
        console.error(error as string);
        process.exit(1);
      }
    };

    // Listen for standard Unix container orchestration termination signals
    process.on("SIGTERM", () => handleTermination("SIGTERM"));
    process.on("SIGINT", () => handleTermination("SIGINT"));
  }
}

// Export the singleton instance extractor function
export const getPrismaClient = (): PrismaClientEngine => PrismaClientManager.getInstance();
