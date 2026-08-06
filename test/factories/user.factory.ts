// File Path: test/fixtures/user.fixture.ts

/**
 * Enterprise Static Quality Assurance User Fixtures.
 * Establishes predictable baseline states for lookups and access mapping checks.
 */
export const UserModelFixtures = {
  // Authoritative reference standard representing a system administrator profile
  STATIC_ADMIN_USER: {
    id: '00000000-0000-4000-a000-000000000001',
    email: 'administrator@deployflow.internal',
    role: 'ADMIN' as const,
    isActive: true,
    createdAt: '2026-08-06T12:00:00.000Z'
  },

  // Authoritative reference standard representing a platform engineer profile
  STATIC_ENGINEER_USER: {
    id: '00000000-0000-4000-a000-000000000002',
    email: 'platform-engineer@deployflow.internal',
    role: 'PLATFORM_ENGINEER' as const,
    isActive: true,
    createdAt: '2026-08-06T12:05:00.000Z'
  },

  // Reference configuration representing a suspended developer state
  STATIC_SUSPENDED_USER: {
    id: '00000000-0000-4000-a000-000000000003',
    email: 'suspended-dev@deployflow.internal',
    role: 'DEVELOPER' as const,
    isActive: false,
    createdAt: '2026-08-06T12:10:00.000Z'
  }
};
