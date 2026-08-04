import { RbacService } from './rbac.service.ts';
import type { SystemPermission, SystemRoleType } from './rbac.constants.ts';

// Explicit static type override for the console object
declare const console: { error: (msg: string) => void };

/**
 * Enterprise Authorization Guard Engine.
 * Formulates declarative, parametric lifecycle interception hooks to secure endpoints.
 */
export class RbacGuards {

  /**
   * Enforces strict verification against a specific, individual system capability.
   *
   * @param requiredPermission The granular corporate permission key to challenge.
   * @returns A parameterized Fastify preHandler function block.
   */
  public static hasPermission(requiredPermission: SystemPermission): any {
    return async (request: any, reply: any): Promise<void> => {
      // 1. Defend against structural misconfigurations (Fail-Closed Paradigm)
      if (!request.user || !request.user.role) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Missing operational security profile.' });
        return;
      }

      const userRole: SystemRoleType = request.user.role;

      // 2. Query the underlying RBAC matrix to cross-reference capabilities
      const isAuthorized = RbacService.hasPermission(userRole, requiredPermission);

      if (!isAuthorized) {
        reply.code(403).send({
          error: 'Forbidden',
          message: 'Access Denied: Insufficient privilege profile authorization tiers.'
        });
        return;
      }
    };
  }

  /**
   * Parameterized gate validating that a user matches at least one role out of an allowed subset array.
   *
   * @param allowedRoles Array of acceptable enterprise SystemRoleType variables.
   * @returns A parameterized Fastify preHandler function block.
   */
  public static hasAnyRole(allowedRoles: SystemRoleType[]): any {
    return async (request: any, reply: any): Promise<void> => {
      if (!request.user || !request.user.role) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Missing operational security profile.' });
        return;
      }

      const userRole: SystemRoleType = request.user.role;
      const isRoleAllowed = allowedRoles.includes(userRole);

      if (!isRoleAllowed) {
        reply.code(403).send({
          error: 'Forbidden',
          message: 'Access Denied: Target action restricted to specific organizational groups.'
        });
        return;
      }
    };
  }
}
