# DeployFlow Enterprise Pipeline Validation Simulation Manual

This operational playbook contains step-by-step instructions for simulating, validating, and auditing the GitHub Actions CI/CD workflows locally.

## 1. Simulating a Continuous Integration (CI) Failure

To verify that Quality Gate 1 (TypeScript Compilation & Type Check) is working correctly and will block unstable code changes from merging, execute the following check steps:

1. Create a temporary broken file containing invalid TypeScript definitions:
   echo "const errorTest: string = 12345;" > src/test-error.ts

2. Trigger your local validation wrapper script to run the compilation check:
   ./docker/scripts/pre-push-check.sh

3. Expected Outcome: The TypeScript compiler will catch the type mismatch error immediately, throw a non-zero exit status, and halt the build process.

4. Clean up the temporary test file after verifying the failure:
   rm src/test-error.ts

## 2. Testing the Image Validation Gate locally

To test the security validation checks from our continuous delivery pipeline (cd.yml) on your machine, run these commands:

1. Compile the production container image layout:
   docker build --network=host -f docker/production/Dockerfile -t deployflow:test-validate .

2. Run the process owner validation check to confirm that the image executes under a secure, non-root user context:
   docker run --rm deployflow:test-validate id -u

3. Expected Outcome: The terminal must output 10001, proving that your image configurations comply with enterprise security standards and are ready to deploy to strict production Kubernetes clusters.
