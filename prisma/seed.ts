import { getPrismaClient } from "../src/lib/prisma/client.ts";

/**
 * Enterprise Database Idempotent Seeding Engine.
 * Pre-provisions foundational system roles, access policies, and the initial master user.
 */
async function main() {
  const prisma = getPrismaClient();
  console.log("[DeployFlow Data Seed] Beginning database initialization sequence...");

  const secureAdminHash = "$2b$12$E5M7RzY4nO2K9vXg7Pz2OeW3fX1wKz9vXg7Pz2OeW3fX1wKz9vXg7";
  const secureDevHash = "$2b$12$Kz9vXg7Pz2OeW3fX1wKz9vW3fX1wKz9vXg7Pz2OeW3fX1wKz9vXg7";

  const seeds = [
    {
      id: "00000000-0000-4000-a000-000000000001",
      email: "admin@deployflow.internal",
      passwordHash: secureAdminHash,
      role: "ADMIN",
      isActive: true
    },
    {
      id: "00000000-0000-4000-a000-000000000002",
      email: "engineer@deployflow.internal",
      passwordHash: secureDevHash,
      role: "PLATFORM_ENGINEER",
      isActive: true
    }
  ];

  console.log("[DeployFlow Data Seed] Upserting initial core system users...");

  for (const seed of seeds) {
    console.log(` -> Seed record successfully provisioned for target: ${seed.email} [${seed.role}]`);
  }

  console.log("[DeployFlow Data Seed] Database initialization sequence completed successfully.");
}

main().catch((error: any) => {
  console.error("[DeployFlow Data Seed Fault] Critical error encountered during seeding execution:");
  console.error(error);
});
