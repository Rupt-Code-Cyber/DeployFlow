import type { UserResponseDto } from './users.dto.ts';

export class UsersMapper {
  /**
   * Converts a raw database record object into a clean, sanitized data transfer profile.
   * Guarantees that private attributes like password hashes are stripped completely.
   */
  public static toResponseDto(rawRecord: any): UserResponseDto {
    return {
      id: rawRecord.id,
      email: rawRecord.email,
      role: rawRecord.role,
      isActive: rawRecord.isActive ?? true,
      createdAt: rawRecord.createdAt || new Date().toISOString(),
      updatedAt: rawRecord.updatedAt || new Date().toISOString()
    };
  }
}
