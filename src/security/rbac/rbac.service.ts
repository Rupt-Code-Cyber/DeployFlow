import { RBAC_MATRIX } from './rbac.constants.ts';
import type { SystemPermission, SystemRoleType } from './rbac.constants.ts';

/**
 * Enterprise RBAC Evaluation and Capability Verification Engine.
 * Provides high-performance, deterministic permission audits across system request planes.
 */
export class RbacService {

  /**
   * Cross-references an active user role against the centralized matrix.
   * Evaluates permissions in strict O(1) lookup time vectors.
   *
   * @param role The validated SystemRoleType string extracted from the request token.
   * @param permission The required SystemPermission capability to test.
   * @returns Boolean indicating whether access is explicitly granted.
   */
  public static hasPermission(role: SystemRoleType, permission: SystemPermission): boolean {
    const assignedPermissions = RBAC_MATRIX[role];

    if (!assignedPermissions) {
      return false;
    }

    return assignedPermissions.includes(permission);
  }

  /**
   * Evaluates if a target user role possesses every single permission in a required set.
   * Useful for high-security compound multi-tier execution gates.
   */
  public static hasAllPermissions(role: SystemRoleType, permissions: SystemPermission[]): boolean {
    return permissions.every((perm) => this.hasPermission(role, perm));
  }
}
