// ==============================================================================
// DeployFlow Core Engine - User Management Domain Data Transfer Objects
// Enforces strict public contract boundaries and mass-assignment protection
// ==============================================================================

/**
 * Inbound payload contract handling public user account creation requests.
 */
export interface CreateUserDto {
  email: string;
  password?: string;
  role?: 'ADMIN' | 'PLATFORM_ENGINEER' | 'DEVELOPER' | 'AUDITOR';
}

/**
 * Inbound payload contract handling administrative account parameter modifications.
 * All attributes are marked explicitly optional to safely support partial (PATCH) updates.
 */
export interface UpdateUserDto {
  email?: string;
  isActive?: boolean;
  role?: 'ADMIN' | 'PLATFORM_ENGINEER' | 'DEVELOPER' | 'AUDITOR';
}

/**
 * Structured query parameter boundaries for list filtering actions.
 */
export interface UserFilterQueryDto {
  role?: 'ADMIN' | 'PLATFORM_ENGINEER' | 'DEVELOPER' | 'AUDITOR';
  isActive?: boolean;
  search?: string; // Processes wildcard partial strings across email indexes
}

/**
 * Standardized pagination constraints matching enterprise high-volume lookups.
 */
export interface UserPaginationQueryDto {
  page?: number;   // Targeted page index sequence (1-based baseline)
  limit?: number;  // Requested allocation count per payload view window
  sortBy?: string; // Targeted sort column name parameter (e.g., 'created_at')
  sortOrder?: 'asc' | 'desc';
}

/**
 * Outbound sanitized response contract mapping a single identity entry profile.
 * Guarantees that private records (like password hashes) never pass network perimeters.
 */
export interface UserResponseDto {
  id: string;
  email: string;
  role: 'ADMIN' | 'PLATFORM_ENGINEER' | 'DEVELOPER' | 'AUDITOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Structural metadata tracker governing client-side stream navigation.
 */
export interface PaginationMetadata {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Master collection response envelope enclosing paginated user data payloads.
 */
export interface PaginatedUserResponseDto {
  status: 'SUCCESS';
  data: UserResponseDto[];
  meta: PaginationMetadata;
}
