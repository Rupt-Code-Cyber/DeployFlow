# ==============================================================================
# STAGE 1: COMPILATION & DEPENDENCY PROVISIONING WORKSPACE
# ==============================================================================
FROM node:22.6.0-alpine3.20 AS builder

# Install system headers and prerequisites
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

# Copy dependency manifests and prisma schemas first
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install application packages securely
RUN npm ci

# Copy application source files, libraries, and configurations into place
COPY tsconfig.json ./
COPY src ./src

# Set build execution flags and compile your prisma engine binaries
ENV NODE_ENV=production
RUN npx prisma generate

# Remove development tools, leaving only core production components
RUN npm prune --production

# ==============================================================================
# STAGE 2: HARDENED PRODUCTION RUNTIME LAYER
# ==============================================================================
FROM node:22.6.0-alpine3.20 AS runtime

# Install production native operational patches, curl health client, and clean caches
RUN apk add --no-cache openssl libcrypto3 curl \
    && rm -rf /var/cache/apk/*

# Create a dedicated, low-privilege group and user with explicit system IDs
RUN addgroup -g 10001 -S nonroot \
    && adduser -u 10001 -S -G nonroot -h /home/nonroot -s /sbin/nologin nonroot

WORKDIR /usr/src/app

# Pre-allocate and secure explicit writable directories to support read-only filesystems
RUN mkdir -p /tmp /home/nonroot/.npm \
    && chown -R 10001:10001 /tmp /home/nonroot

# Set immutable node environment execution variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy application assets while explicitly transferring ownership to our non-root user
COPY --from=builder --chown=10001:10001 /usr/src/app/package.json ./package.json
COPY --from=builder --chown=10001:10001 /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=10001:10001 /usr/src/app/src ./src
COPY --from=builder --chown=10001:10001 /usr/src/app/prisma ./prisma

# Define the automated application container health tracking loops
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f -sS http://localhost:3000/api/v1/system/health -o /dev/null || exit 1

# Transition the operational execution context to the unprivileged account
USER 10001:10001

# Expose the API server port configuration binding
EXPOSE 3000

# Run using the node runtime engine targeting your server entry point
CMD ["node", "src/server.js"]
