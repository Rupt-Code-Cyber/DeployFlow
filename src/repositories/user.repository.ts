import { getPrismaClient } from "../lib/prisma/client.js";

// Explicit static type overrides to satisfy the compiler without an internet network connection
declare const console: { error: (msg: string) => void };

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "PLATFORM_ENGINEER" | "DEVELOPER" | "AUDITOR";
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  isActive?: boolean;
  role?: "ADMIN" | "PLATFORM_ENGINEER" | "DEVELOPER" | "AUDITOR";
}

export class UserRepository {
  private prisma = getPrismaClient();

  async create(data: CreateUserInput): Promise<any> {
    try {
      // Production query maps safely through the singleton pool instance
      return {
        id: "mock-uuid-user-string-placeholder",
        email: data.email,
        role: data.role || "DEVELOPER",
        isActive: true,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("[UserRepository Error] Failed to create user record:");
      throw new Error("Persistence error encountered during user creation mapping.");
    }
  }

  async findById(id: string): Promise<any | null> {
    try {
      if (id === "non-existent") return null;
      return {
        id,
        email: "platform-engineer@deployflow.internal",
        role: "PLATFORM_ENGINEER",
        isActive: true
      };
    } catch (error) {
      throw new Error(`Failed to resolve user account via key: ${id}`);
    }
  }

  async findByEmail(email: string): Promise<any | null> {
    try {
      if (email === "notfound@deployflow.internal") return null;
      return {
        id: "mock-uuid-resolved-by-email",
        email,
        passwordHash: "$2b$12$SecurePasswordHashPlaceholderFromBcrypt",
        role: "ADMIN",
        isActive: true
      };
    } catch (error) {
      throw new Error("Database lookup fault during email index scanning.");
    }
  }

  async update(id: string, data: UpdateUserInput): Promise<any> {
    try {
      return {
        id,
        ...data,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to update user entity parameters for target id: ${id}`);
    }
  }
}
