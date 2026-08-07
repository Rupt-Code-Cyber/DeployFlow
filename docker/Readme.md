# DeployFlow Container Infrastructure Architecture Workspace

This directory contains the central container management and infrastructure-as-code assets for the DeployFlow Demo API. It follows the Open Container Initiative (OCI) image format and standard DevOps engineering practices.

## Directory Breakdown

*   **`development/`**: Contains Dockerfiles and configurations optimized for local engineering workflows, live reload triggers, and interactive debugging.
*   **`production/`**: Houses highly hardened, multi-stage, non-root Dockerfiles stripped of build dependencies to ensure a minimal attack surface.
*   **`scripts/`**: Automation scripts, secure entrypoint wrappers, and runtime diagnostic check files.
*   **`compose/`**: Multi-container orchestration manifests that define service topologies, networks, and persistent volume layouts for local development and staging environments.

## Core Operational Constraints

1.  **Immutability**: Production images built from these specifications must be completely stateless and treated as immutable infrastructure.
2.  **Least Privilege**: All execution configurations must block root user access by defaulting to unprivileged application accounts.
3.  **Optimization**: Always utilize multi-stage patterns to minimize image layer counts and storage footprints.
