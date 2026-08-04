/**
 * Granular Corporate System Capability Actions.
 * Explicitly maps to internal microservice and infrastructure domains.
 */
export const Permission = {
  // Identity and Compliance Scopes
  USERS_VIEW: 'users:view',
  USERS_WRITE: 'users:write',
  AUDIT_VIEW: 'audit:view',

  // Application Workload Scopes
  WORKLOAD_VIEW: 'workload:view',
  WORKLOAD_WRITE: 'workload:write',

  // Infrastructure and Cluster Scopes
  CLUSTER_VIEW: 'cluster:view',
  CLUSTER_WRITE: 'cluster:write'
} as const;

export type SystemPermission = typeof Permission[keyof typeof Permission];

export type SystemRoleType = 'ADMIN' | 'PLATFORM_ENGINEER' | 'DEVELOPER' | 'AUDITOR';

/**
 * Centralized Enterprise RBAC Matrix Mapping Registry.
 * Enforces explicit role-to-capability hierarchies.
 */
export const RBAC_MATRIX: Record<SystemRoleType, SystemPermission[]> = {
  AUDITOR: [
    Permission.AUDIT_VIEW,
    Permission.WORKLOAD_VIEW,
    Permission.CLUSTER_VIEW
  ],
  DEVELOPER: [
    Permission.WORKLOAD_VIEW,
    Permission.WORKLOAD_WRITE,
    Permission.CLUSTER_VIEW
  ],
  PLATFORM_ENGINEER: [
    Permission.WORKLOAD_VIEW,
    Permission.WORKLOAD_WRITE,
    Permission.CLUSTER_VIEW,
    Permission.CLUSTER_WRITE,
    Permission.AUDIT_VIEW
  ],
  ADMIN: [
    Permission.USERS_VIEW,
    Permission.USERS_WRITE,
    Permission.AUDIT_VIEW,
    Permission.WORKLOAD_VIEW,
    Permission.WORKLOAD_WRITE,
    Permission.CLUSTER_VIEW,
    Permission.CLUSTER_WRITE
  ]
};
