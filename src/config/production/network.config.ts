// File Path: src/config/production/network.config.ts

declare const console: { error: (msg: string) => void };

/**
 * Enterprise Production Hardening Network Configuration Registry.
 * Holds immutable tuning variables protecting raw transport sockets.
 */
export const NetworkHardeningConstants = {
  // Enforce a strict request body size allocation ceiling: 1 Megabyte (1,048,576 Bytes)
  MAX_REQUEST_BODY_LIMIT_BYTES: 1048576,

  // Standard server execution gates preventing thread hanging conditions (CWE-400)
  // Request Timeout: Maximum duration allowed to process a single HTTP connection complete transfer
  REQUEST_TIMEOUT_MS: 30000,

  // Keep-Alive Timeout: Duration to keep an idle persistent TCP socket open before recycling it
  KEEP_ALIVE_TIMEOUT_MS: 5000,

  // Headers Timeout: Maximum time allocated to fully parse the inbound HTTP header string fields
  HEADERS_TIMEOUT_MS: 8000
};

/**
 * Enterprise Production Hardening Network Configuration Engine.
 * Responsibly manages payload compression, threshold limits, and network streaming optimizations.
 */
export async function registerProductionNetworkCompression(fastify: any): Promise<void> {
  try {
    const compressModuleName: any = '@fastify/compress';
    const compressModule = await import(compressModuleName);
    const compressPlugin = compressModule.default || compressModule;

    // Register compression with strict multi-layered operational parameters
    await fastify.register(compressPlugin, {
      global: true,
      // Minimal data size boundary: 1024 bytes (1KB). Bypasses compression for small strings to save CPU
      threshold: 1024,

      // Explicit MIME-type targeting: restrains processing to highly compressible text data formats
      customTypes: /x-protobuf|application\/javascript|application\/json|text\/css|text\/html|text\/plain/,

      // Enforce compression tuning boundaries for optimized performance/ratio balance
      zlib: {
        level: 6 // Balanced level preventing V8 CPU thread saturation during high throughput
      },
      brotli: {
        params: {
          1: 4 // Brotli quality level 4 balancing bandwidth savings with execution latency
        }
      }
    });

  } catch (error: any) {
    // Graceful operational degradation pattern if the dependency is missing
    console.error(`[Network Configuration Error] Failed to load payload compression engine: ${error.message || error}`);
  }
}
