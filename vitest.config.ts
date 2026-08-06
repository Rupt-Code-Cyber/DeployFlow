// File Path: vitest.config.ts

// Explicit top-level ambient type blocks to satisfy sandboxed TypeScript environment linters
declare const process: {
  env: {
    CI?: string;
  };
};

/**
 * Enterprise Vitest Engine Configuration Layer.
 * Hardens execution sandboxes, maps path aliases, and configures CI/CD hooks.
 * Optimized for high-throughput concurrency, parallel execution, and flaky test prevention.
 */
const config: any = {
  test: {
    // Enforce isolated multi-threaded processing pools for fast execution velocities
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxWorkers: 2, // Hardcoded CPU worker ceiling avoids ambient 'os' lookups
        isolate: true // Guarantees complete memory environment isolation per worker thread
      }
    },
    // Standardize test file detection footprints across our organized test directory tree
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
    // Automatically execute our established environment boundary hooks prior to running specifications
    setupFiles: ['./test/setup/global.setup.ts'],
    // Enforce strict global execution timeout gates (5000ms) to prevent pipeline hangs
    testTimeout: 5000,
    hookTimeout: 5000,
    // Disable in-process global variables to protect test state isolation parameters
    globals: false,

    // Enterprise Concurrency & Stability Optimizations Matrix
    retry: typeof process !== 'undefined' && process.env.CI ? 2 : 0, // Automatically mitigates transient runner blips in CI/CD pipelines
    sequence: {
      shuffle: true, // Randomizes execution sequencing to catch hidden file-coupling side-effects
      concurrent: true // Forces independent test blocks within files to execute concurrently
    },

    // Enterprise Cross-Platform Automated Report Output Configurations
    reporters: ['default', 'html', 'junit'],
    outputFile: {
      junit: './test-results.xml',
      html: './html-report/index.html'
    },

    // Configure default code coverage parameters for downstream quality gates
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: ['test/**', 'node_modules/**', 'prisma/**', 'src/server.ts']
    }
  },
  resolve: {
    alias: {
      // Synchronize path mappings exactly with tsconfig.json configurations
      '@': './src',
      '@cache': './src/cache',
      '@logger': './src/logger',
      '@modules': './src/modules',
      '@security': './src/security'
    }
  }
};

export default config;
