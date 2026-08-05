// File Path: src/modules/system/system.dto.ts

/**
 * Output contract representing the high-level application health indicator.
 */
export interface SystemHealthResponseDto {
  status: 'UP' | 'DOWN';
  timestamp: string;
  environment: string;
}

/**
 * Output contract representing the deep infrastructure dependencies state configuration.
 */
export interface SystemReadinessResponseDto {
  status: 'UP' | 'DOWN';
  timestamp: string;
  checks: {
    database: 'UP' | 'DOWN';
  };
}

/**
 * Output contract representing the process loop liveness verification structure.
 */
export interface SystemLivenessResponseDto {
  status: 'UP';
  timestamp: string;
}

/**
 * Output contract representing standard runtime release version tracking details.
 */
export interface SystemVersionResponseDto {
  version: string;
  apiRevision: string;
  environment: string;
  timestamp: string;
}

/**
 * Output contract representing low-level technical binary build properties.
 */
export interface SystemBuildResponseDto {
  buildNumber: string;
  buildDate: string;
  gitCommit: string;
  nodeVersion: string;
  platform: string;
  architecture: string;
}

/**
 * Output contract capturing raw numerical tracking metrics inside memory spaces.
 */
export interface SystemMetricsSnapshotDto {
  uptimeSeconds: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}
