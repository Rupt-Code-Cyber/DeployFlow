import type { CreateUserDto, UpdateUserDto, UserFilterQueryDto, UserPaginationQueryDto } from './users.dto.ts';

// Explicit static type override for the console object
declare const console: { error: (msg: string) => void };

/**
 * Enterprise Ingress Validation and Input Sanitization Engine.
 * Enforces rigid OWASP API Security and structural typing boundaries at the data edge.
 */
export class UsersValidator {
  // Production RegExp Blueprint conforming to standard corporate email formats
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly VALID_ROLES = ['ADMIN', 'PLATFORM_ENGINEER', 'DEVELOPER', 'AUDITOR'];

  /**
   * Evaluates input payload parameters matching registration and signup actions.
   */
  public static validateCreatePayload(data: CreateUserDto): { isValid: boolean; error?: string } {
    if (!data) return { isValid: false, error: 'Inbound payload body configuration is missing.' };

    // 1. Verify mandatory email string constraints
    if (!data.email || typeof data.email !== 'string' || !this.EMAIL_REGEX.test(data.email)) {
      return { isValid: false, error: 'Malformed API field parameter: Valid email address string required.' };
    }

    // 2. Enforce strict minimum length password requirements
    if (!data.password || typeof data.password !== 'string' || data.password.length < 12) {
      return { isValid: false, error: 'Credential complexity parameters rejected: Minimum length is 12 characters.' };
    }

    // 3. Validate role parameter array allocations against standard whitelist parameters
    if (data.role && !this.VALID_ROLES.includes(data.role)) {
      return { isValid: false, error: 'Access modification parameter rejected: Target role classification invalid.' };
    }

    return { isValid: true };
  }

  /**
   * Validates partial account updates. Evaluates fields dynamically only if provided.
   */
  public static validateUpdatePayload(data: UpdateUserDto): { isValid: boolean; error?: string } {
    if (!data) return { isValid: false, error: 'Inbound modification payload body configuration is missing.' };

    if (data.email !== undefined && (!data.email || typeof data.email !== 'string' || !this.EMAIL_REGEX.test(data.email))) {
      return { isValid: false, error: 'Malformed field parameters: Target email update string invalid.' };
    }

    if (data.role !== undefined && !this.VALID_ROLES.includes(data.role)) {
      return { isValid: false, error: 'Access modification parameter rejected: Target role classification invalid.' };
    }

    if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
      return { isValid: false, error: 'Malformed field parameters: Account status parameter must evaluate to boolean.' };
    }

    return { isValid: true };
  }

  /**
   * Sanitizes and structure-checks query parameters governing list tracking requests.
   */
  public static validateListQueries(filters: UserFilterQueryDto, pagination: UserPaginationQueryDto): { isValid: boolean; error?: string } {
    // 1. Validate list pagination page index structures
    if (pagination.page !== undefined) {
      const pageNum = Number(pagination.page);
      if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum < 1) {
        return { isValid: false, error: 'Invalid query parameters: Page attribute index must evaluate to integer >= 1.' };
      }
    }

    // 2. Validate maximum page size allocations
    if (pagination.limit !== undefined) {
      const limitNum = Number(pagination.limit);
      if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
        return { isValid: false, error: 'Invalid query parameters: Limit allocation ceiling capped at 100 entries.' };
      }
    }

    // 3. Validate sorting configuration strings
    if (pagination.sortOrder !== undefined && pagination.sortOrder !== 'asc' && pagination.sortOrder !== 'desc') {
      return { isValid: false, error: 'Invalid query parameters: Sort ordering must evaluate to asc or desc arrays exclusively.' };
    }

    // 4. Validate filter lookups against allowed system roles
    if (filters.role !== undefined && !this.VALID_ROLES.includes(filters.role)) {
      return { isValid: false, error: 'Invalid query parameters: Role filtering requires a valid classification.' };
    }

    return { isValid: true };
  }
}
