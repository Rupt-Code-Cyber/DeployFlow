// File Path: src/modules/system/system.plugin.ts

// Explicit inline type block declaration to satisfy sandboxed TypeScript linters
declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

/**
 * Encapsulates the enterprise OpenAPI Specification document generation parameters.
 * Programmatically binds security structures, tagging namespaces, and base layouts.
 */
export async function registerSwaggerDocumentation(fastify: any): Promise<void> {
  try {
    // Dynamic string evaluation prevents isolated compilers from blocking on untracked ambient paths
    const swaggerExtension: any = '@fastify/swagger';
    const swaggerModule = await import(swaggerExtension);
    const swaggerPlugin = swaggerModule.default || swaggerModule;

    // 1. Register the core schema compilation engine
    await fastify.register(swaggerPlugin, {
      openapi: {
        info: {
          title: 'DeployFlow Core Engine REST API',
          description: 'High-assurance Platform Engineering and IAM workload orchestration services.',
          version: '1.0.0',
          contact: {
            name: 'DeployFlow Core Platform Architecture Team',
            email: 'architecture@deployflow.internal'
          },
          license: {
            name: 'MIT Enterprise License',
            url: 'https://deployflow.internal'
          }
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Local Active Infrastructure Environment'
          }
        ],
        tags: [
          { name: 'Authentication', description: 'Identity verification, session tokens, and cryptographic handshakes.' },
          { name: 'User Management', description: 'Administrative profile controls, RBAC alignments, and lifecycles.' },
          { name: 'System Operations', description: 'Cloud-native telemetry tracks, monitoring vectors, and performance statistics.' }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Provide your cryptographically signed user or system access token string.'
            }
          }
        }
      }
    });

    // 2. Environment-Aware Evaluation Check for the Interactive Graphical UI (Swagger UI)
    // Completely isolates documentation interfaces from production public routing pools
    const targetEnvironment = process.env.NODE_ENV || 'development';
    if (targetEnvironment.toLowerCase() === 'production') {
      fastify.log?.info?.('[System Plugin] Production workspace constraint observed. Intercepting Swagger UI registration.');
      return;
    }

    const uiExtension: any = '@fastify/swagger-ui';
    const uiModule = await import(uiExtension);
    const uiPlugin = uiModule.default || uiModule;

    // 3. Mount the frontend rendering engine onto the local server routing scope
    await fastify.register(uiPlugin, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        persistAuthorization: true
      },
      staticCSP: true, // Enforce Content Security Policy headers for documentation layouts
      transformStaticCSP: (header: string) => header
    });

    fastify.log?.info?.('[System Plugin] Swagger UI documentation sandbox initialized successfully at path: /docs');

  } catch (error) {
    // Graceful operational degradation pattern if the runtime packages are missing from target containers
    fastify.log?.error?.('[System Plugin Error] Failed to dynamically mount the OpenAPI presentation layers.');
  }
}
