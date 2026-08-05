# File Path: docs/operations/troubleshooting-runbook.md

# Enterprise Production API Operational Troubleshooting Runbook

## 1. Automated Health and Probes Validation Matrix

To verify the active operational endpoint matrix manually from any local terminal shell window without loading a browser layer, use these standardized `curl` verification traces:

### A. Health Monitoring Check (`/health`)
*   **Command**:
    ```bash
    curl -i http://localhost:3000/health
    ```
*   **Expected Healthy Status Output**: `HTTP/1.1 200 OK` with JSON payload matching `{"status":"UP",...}`.
*   **Cache Controls**: Must contain strict headers: `Cache-Control: no-store, no-cache, must-revalidate`.

### B. Kubernetes Readiness Check (`/ready`)
*   **Command**:
    ```bash
    curl -i http://localhost:3000/ready
    ```
*   **Expected Healthy Status Output**: `HTTP/1.1 200 OK`.
*   **Expected Degradation Output**: `HTTP/1.1 503 Service Unavailable` if database pooling handshakes fail.

### C. Kubernetes Liveness Check (`/live`)
*   **Command**:
    ```bash
    curl -i http://localhost:3000/live
    ```
*   **Expected Healthy Status Output**: `HTTP/1.1 200 OK`. Execute this to guarantee the process thread loop is free.

### D. Prometheus Metrics Stream (`/metrics`)
*   **Command**:
    ```bash
    curl -s http://localhost:3000/metrics | grep process_heap
    ```
*   **Expected Healthy Status Output**: Standard unmasked Prometheus OpenMetrics text lines specifying allocated values.

---

## 2. Real-World Incident Remediation Scenarios

### Incident Scenario A: The `/ready` Endpoint Returns `503 Service Unavailable`

#### 🔎 Diagnostic Analysis
This failure indicates that the application process is running, but the database connection pool manager (`PrismaClientEngine`) can no longer complete its network handshake with your PostgreSQL instance.

#### 🛠️ Remediation Action Protocol
1.  **Check PostgreSQL Availability**: Verify if your database server is actively running and listening on its designated port:
    ```bash
    pg_isready -h localhost -p 5432
    ```
2.  **Audit Pool Saturation**: Check your application logs for connection pool starvation messages (`InteractiveTransactionTimeout`). If found, increase your pool allocation configurations under the database environment properties file.

---

### Incident Scenario B: The Application Process Hangs during Testing or Server Halts

#### 🔎 Diagnostic Analysis
This behavior occurs when an automation test framework or a custom verification script executes code passes successfully but fails to release the persistent global socket connections initialized by the database singleton.

#### 🛠️ Remediation Action Protocol
Ensure that your manual testing scripts catch termination events cleanly and include explicit termination commands at the end of their execution loops:
```typescript
runSuite().then(() => { process.exit(0); });
```
This forces the Node.js runtime environment to close all remaining active event loops and open network sockets instantly.
