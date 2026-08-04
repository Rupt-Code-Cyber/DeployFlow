# DeployFlow Contributing Guidelines

We maintain a strict, production-grade git management workflow. Follow these engineering steps exactly to propose platform or documentation enhancements.

## Branching Architecture
All development work must be performed out of isolated feature branches structured using strict prefixes:
- `feature/<ticket-id>-description` — Infrastructure additions or functional updates.
- `fix/<ticket-id>-description` — Reliability patches or code fixes.
- `docs/<ticket-id>-description` — Pure documentation modifications.

## Commit Standards (Conventional Commits)
Commit logs dictate automated version generations. Commits must precisely follow the Conventional Commits specification:
- `feat(kubernetes): add default horizontal pod autoscaler specs`
- `fix(fastify): close memory leak inside request timeout interceptor`
- `docs(architecture): compile architectural decision record for kms storage`

## Pull Request Guidelines
1. Branch out from the upstream `main` branch.
2. Complete all tasks within your branch scope.
3. Ensure no local secrets or non-production test flags leak into your track.
4. Submit a descriptive Pull Request referencing any relevant issue trackers.
