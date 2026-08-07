#!/bin/sh
set -e

echo "======================================================================"
echo "[!] DeployFlow Pre-Push Pre-Flight Verification Gate Active"
echo "======================================================================"

# Step 1: Execute TypeScript compilation diagnostics locally
echo "[*] Quality Gate 1: Checking TypeScript syntax and compilation..."
npx tsc --noEmit

# Step 2: Validate Prisma schema integrity
echo "[*] Quality Gate 2: Verifying Prisma schema layout completeness..."
npx prisma validate

# Step 3: Run local testing suite validation loops if development services are active
echo "[*] Quality Gate 3: Evaluating test matrices..."
if [ -f docker/compose/docker-compose.dev.yml ]; then
  echo "[+] Dev container config found. Running local test suites..."
  # Run tests using the environment parameters from your local node stack
  NODE_ENV=test npm test -- --run || { echo "[ERROR] Test validation failed! Aborting push."; exit 1; }
else
  echo "[!] Dev containers not detected. Running standard npm test..."
  npm test -- --run || { echo "[ERROR] Test execution failed! Aborting push."; exit 1; }
fi

echo "======================================================================"
echo "[+] All local quality gates passed successfully! Proceeding with push."
echo "======================================================================"
