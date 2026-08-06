# File Path: docs/testing/testing-troubleshooting.md

# Enterprise Testing & Quality Assurance Troubleshooting Runbook

## 1. Automated Test Pipeline Health Verification Matrix

If your local automated tests stall or report unexpected errors across multi-threaded workers, run these diagnostic commands to reset your testing environment:

### A. Reset and Clear Vitest Local Cache
*   **Problem**: Persistent cache structures distort test file parameters or fail to reflect recent path alias changes.
*   **Remediation Command**:
    ```bash
    npx vitest clearCache
    ```

### B. Recycle Zombie Thread Processes (POSIX Systems)
*   **Problem**: Hanging or unclosed background workers lock database sockets, causing new test runs to stall.
*   **Remediation Command**:
    ```bash
    pkill -f vitest || killall node
    ```

### C. Execute Test Suite with Forced Single-Thread Isolation
*   **Problem**: Multi-threaded concurrency strains resource-constrained environments (like a baseline cloud runner), leading to worker crashes.
*   **Remediation Command**:
    ```bash
    npm run test -- --poolOptions.threads.singleThread=true
    ```

---

## 2. Common Integration Test Failure Scenarios

### Incident Scenario A: Unique Index Constraint Collisions (`P2002`)

#### 🔎 Diagnostic Analysis
This failure occurs when a test attempt to write an identity record with a unique value (like an email address) that was left behind by a previous test case, indicating a failure in the transaction rollback mechanism.

#### 🛠️ Remediation Action Protocol
1.  **Verify Setup Hooks**: Ensure that your integration test file correctly imports and references the global boundary hooks defined in `test/setup/global.setup.ts`.
2.  **Enforce Dynamic Factories**: Avoid hardcoded data loops by utilizing `UserTestFactory.buildFakeUserPayload()` to generate high-entropy, unique identifiers automatically for every test instance.

---

### Incident Scenario B: Dynamic Module Resolution Drops (Silent Exits)

#### 🔎 Diagnostic Analysis
The test runner exits instantly with code `0` or `1` without printing any log data to the console window. This behavior indicates an unhandled runtime error inside a dynamic loading block (`await import(...)`).

#### 🛠️ Remediation Action Protocol
Convert the dynamic import sequence into an explicit, top-level static statement, or wrap the async block inside an informative catch loop to dump the raw exception stack trace directly to the terminal:
```typescript
try {
  const targetModule = await import('../../src/server.ts');
} catch (error) {
  console.error('[CRITICAL SEED ERROR]', error);
}
```
