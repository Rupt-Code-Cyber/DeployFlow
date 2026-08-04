-- ==============================================================================
-- DeployFlow Platform Architecture - Initial Relational Schema Ledger
-- Target Engine: PostgreSQL 15+ / ACID Transactional Baseline
-- ==============================================================================

-- 1. Establish Enforced Corporate System User Roles Enum Types
CREATE TYPE "SystemRole" AS ENUM ('ADMIN', 'PLATFORM_ENGINEER', 'DEVELOPER', 'AUDITOR');

-- 2. Build Primary Identity Persistence Layout Table
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "SystemRole" NOT NULL DEFAULT 'DEVELOPER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 3. Build Cryptographic Session Persistence Layout Table
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- 4. Build Immutable Platform Execution Ledger Table
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ==============================================================================
-- Structural Performance Indexing & Constraint Optimization
-- ==============================================================================

-- Enforce Strict Identity Column Uniqueness
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- Optimize Core Query Filter Pathways via B-Tree Index Subtrees
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_timestamp_idx" ON "audit_logs"("action", "timestamp");

-- Establish Secure Foreign Key Relational Cascades
ALTER TABLE "refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
