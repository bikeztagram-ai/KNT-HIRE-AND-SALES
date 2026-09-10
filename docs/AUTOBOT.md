# KNT Autonomous Builder

KNT uses a controlled autonomous-development workflow.

## Roles
- **Architect:** defines requirements, architecture, priorities, acceptance criteria, and release decisions.
- **Builder/Coding worker:** implements only activated roadmap work, runs verification, records evidence, and preserves checkpoints.
- **GitHub:** source of truth for project state.
- **Human release gate:** merge, production deployment, and release approval remain explicit decisions.

## Operating rules
1. `config/autonomous-builder-queue.json` is the source of truth for what may be executed.
2. Future work is not started merely because it appears on the roadmap.
3. Every active batch has a checkpoint and report.
4. Verification must cover implementation, tests/build, relevant behaviour, and protected-path review.
5. A green build does not by itself mean the feature is accepted.
6. Never commit secrets or weaken release controls to make a check pass.
7. Resume from the latest checkpoint after interruption rather than restarting blindly.
8. Do not merge or deploy autonomously.
