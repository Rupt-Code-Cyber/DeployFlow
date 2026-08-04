// Explicit static inline types to satisfy the compiler without an internet network connection
declare const process: { env: { [key: string]: string | undefined }; exit: (code: number) => never };
declare const console: { log: (message: string) => void; error: (message: string) => void };

export interface DatabaseConfiguration {
  databaseUrl: string;
  connectionLimit: number;
}

/**
 * Validates and extracts database environment variables.
 * Enforces a strict fail-fast paradigm at application boot time.
 */
export function loadDatabaseConfiguration(): DatabaseConfiguration {
  const url = process.env.DATABASE_URL;

  if (!url || url.trim() === "") {
    console.error("==============================================================================");
    console.error("FATAL INITIALIZATION ERROR: CRITICAL CONFIGURATION MISSING");
    console.error("==============================================================================");
    console.error("Reason: The 'DATABASE_URL' environment variable is not defined or is empty.");
    console.error("Action: Ensure a valid PostgreSQL connection string is injected at runtime.");
    console.error("==============================================================================");
    process.exit(1);
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    console.error("==============================================================================");
    console.error("FATAL INITIALIZATION ERROR: INVALID DATABASE CONNECTION PROTOCOL");
    console.error("==============================================================================");
    console.error("Reason: 'DATABASE_URL' does not match the required postgresql:// scheme.");
    console.error("==============================================================================");
    process.exit(1);
  }

  // Parse out connection limit threshold parameter safely if present
  let limit = 10;
  const match = url.match(/connection_limit=(\d+)/);
  if (match && match[1]) {
    limit = parseInt(match[1], 10);
  }

  return {
    databaseUrl: url,
    connectionLimit: limit
  };
}

// Export a single, frozen global configuration instance
export const dbConfig = Object.freeze(loadDatabaseConfiguration());
