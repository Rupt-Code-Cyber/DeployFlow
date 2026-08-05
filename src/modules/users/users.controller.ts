// File Path: src/modules/users/users.controller.ts

import { UsersService } from './users.service.ts';
import { UsersMapper } from './users.mapper.ts';
import type { CreateUserDto, UpdateUserDto, UserFilterQueryDto, UserPaginationQueryDto } from './users.dto.ts';

// Explicit static type override for the console object
declare const console: { error: (msg: string) => void };

/**
 * Enterprise Ingress Controller Governing User Management Web Resource Interfaces.
 * Enforces strict request context parsing and standardized REST serialization responses.
 */
export class UsersController {
  private usersService = new UsersService();

  /**
   * Captures parameters from inbound POST streams and invokes the business domain core.
   */
  public async handleCreate(request: any, reply: any): Promise<void> {
    try {
      // 1. Defend against missing request context parameters (Zero-Trust Security Gate)
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Operational context validation failed.' });
        return;
      }

      // 2. Explicitly bind inbound parameters to a strict, isolated DTO contract layout
      const payload: CreateUserDto = {
        email: request.body?.email,
        password: request.body?.password,
        role: request.body?.role
      };

      // 3. Forward the sanitized input parameters down to the orchestration service layer
      const rawCreatedUser = await this.usersService.createUser(payload, request.user);

      // 4. Pass the database record through an outbound data sanitation mapper membrane
      const sanitizedOutput = UsersMapper.toResponseDto(rawCreatedUser);

      // 5. Dispatch a standardized enterprise response model envelope
      reply.code(201).send({
        status: 'SUCCESS',
        data: sanitizedOutput
      });
    } catch (error: any) {
      console.error('[UsersController Error] Captured execution breakdown during creation handling:');
      const errorMessage = error.message || '';

      if (errorMessage.includes('ERROR_VALIDATION')) {
        reply.code(400).send({ error: 'Bad Request', message: errorMessage.replace('ERROR_VALIDATION: ', '') });
        return;
      }
      if (errorMessage.includes('ERROR_CONFLICT') || errorMessage.includes('RESOURCE_COLLISION')) {
        reply.code(409).send({ error: 'Conflict', message: 'The requested email address identity is already allocated.' });
        return;
      }
      if (errorMessage.includes('ERROR_UNAUTHORIZED') || errorMessage.includes('UNAUTHORIZED_ACTION')) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Insufficient authorization permissions.' });
        return;
      }

      reply.code(500).send({ error: 'Internal Server Error', message: 'An unhandled pipeline crash was caught.' });
    }
  }

  /**
   * Resolves individual resources based on the incoming path tracking ID parameters.
   */
  public async handleGetById(request: any, reply: any): Promise<void> {
    try {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Operational context validation failed.' });
        return;
      }

      const id = request.params?.id;
      const userRecord = await this.usersService.getUserById(id, request.user);
      const sanitizedOutput = UsersMapper.toResponseDto(userRecord);

      reply.code(200).send({
        status: 'SUCCESS',
        data: sanitizedOutput
      });
    } catch (error: any) {
      console.error('[UsersController Error] Captured execution error during profile resolution:');
      const errorMessage = error.message || '';

      if (errorMessage.includes('ERROR_NOT_FOUND')) {
        reply.code(404).send({ error: 'Not Found', message: 'The targeted user identity profile record could not be found.' });
        return;
      }
      if (errorMessage.includes('ERROR_UNAUTHORIZED')) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Insufficient authorization permissions.' });
        return;
      }

      reply.code(500).send({ error: 'Internal Server Error', message: 'An unhandled database lookup failure occurred.' });
    }
  }

  /**
   * Captures patch parameters from input payload elements to execute modifications.
   */
  public async handleUpdate(request: any, reply: any): Promise<void> {
    try {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Operational context validation failed.' });
        return;
      }

      const id = request.params?.id;
      const payload: UpdateUserDto = {
        email: request.body?.email,
        role: request.body?.role,
        isActive: request.body?.isActive
      };

      const updatedUser = await this.usersService.updateUser(id, payload, request.user);
      const sanitizedOutput = UsersMapper.toResponseDto(updatedUser);

      reply.code(200).send({
        status: 'SUCCESS',
        data: sanitizedOutput
      });
    } catch (error: any) {
      console.error('[UsersController Error] Captured modification error during update execution:');
      const errorMessage = error.message || '';

      if (errorMessage.includes('ERROR_VALIDATION')) {
        reply.code(400).send({ error: 'Bad Request', message: errorMessage.replace('ERROR_VALIDATION: ', '') });
        return;
      }
      if (errorMessage.includes('ERROR_NOT_FOUND')) {
        reply.code(404).send({ error: 'Not Found', message: 'The target identity record could not be resolved.' });
        return;
      }
      if (errorMessage.includes('ERROR_FORBIDDEN')) {
        reply.code(403).send({ error: 'Forbidden', message: 'Privilege escalation modification parameter blocked.' });
        return;
      }
      if (errorMessage.includes('ERROR_UNAUTHORIZED')) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Insufficient authorization permissions.' });
        return;
      }

      reply.code(500).send({ error: 'Internal Server Error', message: 'An unhandled update operation failure occurred.' });
    }
  }

  /**
   * Captures deletion requests to invoke identity lifecycle deactivation logic.
   */
  public async handleDelete(request: any, reply: any): Promise<void> {
    try {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Operational context validation failed.' });
        return;
      }

      const id = request.params?.id;
      await this.usersService.deleteUser(id, request.user);

      reply.code(200).send({
        status: 'SUCCESS',
        message: 'The identity profile record has been successfully deactivated and archived.'
      });
    } catch (error: any) {
      console.error('[UsersController Error] Captured deletion error during deactivation execution:');
      const errorMessage = error.message || '';

      if (errorMessage.includes('ERROR_NOT_FOUND')) {
        reply.code(404).send({ error: 'Not Found', message: 'The targeted user identity profile record could not be found.' });
        return;
      }
      if (errorMessage.includes('ERROR_BAD_REQUEST')) {
        reply.code(400).send({ error: 'Bad Request', message: 'Administrative protection fault: self-deletion is restricted.' });
        return;
      }
      if (errorMessage.includes('ERROR_UNAUTHORIZED')) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Insufficient authorization permissions.' });
        return;
      }

      reply.code(500).send({ error: 'Internal Server Error', message: 'An unhandled deletion pipeline crash occurred.' });
    }
  }

  /**
   * Processes collection queries to deliver multi-conditional filtered, paginated user records.
   */
  public async handleList(request: any, reply: any): Promise<void> {
    try {
      if (!request.user) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Operational context validation failed.' });
        return;
      }

      // Extract explicit filter criteria parameters
      const filters: UserFilterQueryDto = {
        role: request.query?.role
      };

      // Extract explicit pagination calculation parameters
      const pagination: UserPaginationQueryDto = {
        page: request.query?.page ? parseInt(request.query.page, 10) : undefined,
        limit: request.query?.limit ? parseInt(request.query.limit, 10) : undefined,
        sortBy: request.query?.sortBy,
        sortOrder: request.query?.sortOrder
      };

      const paginatedResult = await this.usersService.getPaginatedUsers(filters, pagination, request.user);

      // Map every item cleanly inside the matching array collection
      const sanitizedRecords = paginatedResult.records.map((user: any) => UsersMapper.toResponseDto(user));

      reply.code(200).send({
        status: 'SUCCESS',
        data: sanitizedRecords,
        total: paginatedResult.total
      });
    } catch (error: any) {
      console.error('[UsersController Error] Captured parsing error during list processing:');
      const errorMessage = error.message || '';

      if (errorMessage.includes('ERROR_VALIDATION')) {
        reply.code(400).send({ error: 'Bad Request', message: errorMessage.replace('ERROR_VALIDATION: ', '') });
        return;
      }
      if (errorMessage.includes('ERROR_UNAUTHORIZED')) {
        reply.code(403).send({ error: 'Forbidden', message: 'Access Denied: Insufficient authorization permissions.' });
        return;
      }

      reply.code(500).send({ error: 'Internal Server Error', message: 'An unhandled scan collection failure occurred.' });
    }
  }
}
