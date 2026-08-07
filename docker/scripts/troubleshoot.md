# DeployFlow Containerization Infrastructure Troubleshooting Guide

This runtime operational playbook contains resolution steps for common issues encountered when managing local multi-container development and production environments.

## 1. Port Collision Failures (`EADDRINUSE`)

### Symptoms
Starting a container stack throws an explicit port mapping allocation error:
`bind: address already in use` or `Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use`

### Resolutions
1. Identify what process on your host operating system is blocking the required application port:
   ```bash
   sudo ss -tulpn | grep :3000
   # or
   sudo lsof -i :3000
   ```
2. Terminate the blocking host application process:
   ```bash
   kill -9 <PID>
   ```

## 2. Prisma Engine Target Mismatches

### Symptoms
The application container crashes at boot time with a clear library target validation alert:
`Prisma Client could not locate its peculiar query engine for runtime "linux-musl-openssl-3.0.x"`

### Resolutions
1. Clean out your local node compilation tracking files and regenerate your client mapping code:
   ```bash
   rm -rf node_modules
   npm install
   docker build --no-cache --network=host -f docker/production/Dockerfile -t deployflow:prod .
   ```

## 3. Database Migration Out-of-Sync Errors

### Symptoms
The application throws connection failures or flags schema divergence when trying to process requests:
`PrismaClientKnownRequestError: The table public.User does not exist`

### Resolutions
1. Force an interactive database sync task using your environment control script wrapper:
   ```bash
   ./docker/scripts/workflow.sh dev:migrate
   ```
2. If schema corruption occurs during intensive testing cycles, run a clean infrastructure reset:
   ```bash
   docker compose -f docker/compose/docker-compose.dev.yml down -v
   ./docker/scripts/workflow.sh dev:start
   ./docker/scripts/workflow.sh dev:migrate
   ```
