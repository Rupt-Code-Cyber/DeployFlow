// File Path: src/modules/users/users.routes.ts

import { UsersController } from './users.controller.ts';
import { AuthenticationMiddleware } from '../../middleware/auth/auth.middleware.ts';
import { RbacGuards } from '../../security/rbac/rbac.guards.ts';
import { Permission } from '../../security/rbac/rbac.constants.ts';

/**
 * Encapsulates the enterprise User Management REST route pathways for the Fastify request engine.
 * Chains authentication and permission verification handlers to create a hardened security tunnel.
 */
export async function usersModuleRoutes(fastify: any, options: any): Promise<void> {
  const controller = new UsersController();

  /**
   * Provision a new user profile inside the system.
   */
  fastify.post(
    '/api/v1/users',
    {
      preHandler: [
        AuthenticationMiddleware.authenticateRequest,
        RbacGuards.hasPermission(Permission.USERS_WRITE)
      ]
    },
    async (request: any, reply: any) => {
      await controller.handleCreate(request, reply);
    }
  );

  /**
   * Retrieve a paginated, filtered, and sorted collection list of user profiles.
   */
  fastify.get(
    '/api/v1/users',
    {
      preHandler: [
        AuthenticationMiddleware.authenticateRequest,
        RbacGuards.hasPermission(Permission.USERS_VIEW)
      ]
    },
    async (request: any, reply: any) => {
      await controller.handleList(request, reply);
    }
  );

  /**
   * Fetch an individual user profile record by its UUID string parameter.
   */
  fastify.get(
    '/api/v1/users/:id',
    {
      preHandler: [
        AuthenticationMiddleware.authenticateRequest,
        RbacGuards.hasPermission(Permission.USERS_VIEW)
      ]
    },
    async (request: any, reply: any) => {
      await controller.handleGetById(request, reply);
    }
  );

  /**
   * Partially update personal profile information or administrative user parameter blocks.
   */
  fastify.patch(
    '/api/v1/users/:id',
    {
      preHandler: [
        AuthenticationMiddleware.authenticateRequest,
        // The service layer handles internal self-service routing overrides securely
        RbacGuards.hasPermission(Permission.USERS_WRITE)
      ]
    },
    async (request: any, reply: any) => {
      await controller.handleUpdate(request, reply);
    }
  );

  /**
   * Execute an audited, secure identity soft-delete deactivation sequence.
   */
  fastify.delete(
    '/api/v1/users/:id',
    {
      preHandler: [
        AuthenticationMiddleware.authenticateRequest,
        RbacGuards.hasPermission(Permission.USERS_WRITE)
      ]
    },
    async (request: any, reply: any) => {
      await controller.handleDelete(request, reply);
    }
  );
}
