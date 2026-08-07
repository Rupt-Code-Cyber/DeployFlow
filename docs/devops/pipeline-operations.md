# DeployFlow Enterprise CI/CD Pipeline Operations Manual

This document details the operational mechanics, configuration maps, and platform security boundaries governing the automated integration and delivery pipelines of the DeployFlow platform.

## 1. Continuous Integration (CI) Workflow Specifications
*   **Workflow Scope**: Triggered automatically on all incoming Pull Requests or push events hitting active feature branches.
*   **Core Tasks**: Provisions clean ephemeral runners, installs locked down dependency trees, runs TypeScript syntax compilation checks, and spins up native Docker service containers (PostgreSQL and Redis) to run full integration and API test suites with code coverage metrics.
*   **Quality Gates Enforced**: The workflow forces a non-zero exit status if formatting mismatches occur, type errors clear, or tests fail, blocking code from merging into your trunk branch.

## 2. Continuous Delivery (CD) Release Workflow Specifications
*   **Workflow Scope**: Triggers automatically upon successful merge events landing on the protected main branch.
*   **Core Tasks**: Compiles the production multi-stage OCI container image layout on disk, loads the image into a local validation sandbox, runs automated security audits checking for non-root process identities, calculates Semantic Version updates (vMAJOR.MINOR.PATCH) from conventional git commit histories, and publishes multi-tagged immutable container images straight to the GitHub Container Registry (GHCR).

## 3. Core Action Version Pinning Mapping Matrix
To satisfy strict supply chain security standards, our automated workflows reject floating semantic labels and map third-party components to cryptographically verified Git Commit SHAs:
*   `actions/checkout` -> Pin to SHA `692973e3d937129bcbf40652eb9f2f61becf3332`
*   `actions/setup-node` -> Pin to SHA `1e60f620b9541d16bece96c54097223b7ee0055c`
*   `docker/setup-buildx-action` -> Pin to SHA `988b5a0280414fbc2124b1ca140a5c37d0686ebd`
*   `docker/build-push-action` -> Pin to SHA `5cd11c3a4ace9051d55c9ae25a7442347240c01b`
*   `docker/login-action` -> Pin to SHA `0d12469e4bf6b3f26795b2160536f7244a564da1`
*   `docker/metadata-action` -> Pin to SHA `8e1d4474248f9a1be3bc3e1250f61286c26cc64d`
*   `cycjimmy/semantic-release-action` -> Pin to SHA `cb425ad62e74288b201d16781200155b40d463d8`

## 4. Technical Interview & Architectural Alignment
*   **Question**: Why do you use short-lived native platform tokens instead of static passwords inside enterprise deployment pipelines?
*   **Answer**: Static passwords and personal access keys carry long-term theft risks and are hard to rotate. Utilizing the short-lived native `secrets.GITHUB_TOKEN` ensures that your automated tasks authenticate securely using a token generated dynamically for that single workflow run. This token expires automatically as soon as the job finishes, mitigating the risk of credential leakage.
