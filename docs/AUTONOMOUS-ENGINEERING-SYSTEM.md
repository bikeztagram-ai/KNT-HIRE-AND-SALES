# KNT Autonomous Engineering System

KNT is built through a controlled architect/builder workflow.

- The human architect approves activation, reprioritisation, cancellation and release.
- The queue is the source of truth for permitted work.
- Coding work happens on isolated branches, never directly on `main`.
- Every batch must leave a checkpoint and evidence report.
- Verification includes static checks, focused tests, build checks and behavioural acceptance where applicable.
- A green build is not sufficient proof of user-visible completion.
- Merge, deployment and production release remain human-approved actions.
- Builder infrastructure and protected controls must not be weakened by product work.

## Current activation

KNT-001 establishes this control plane. KNT-002 is the next intended batch, but must be explicitly activated after its architecture and acceptance criteria are defined.
