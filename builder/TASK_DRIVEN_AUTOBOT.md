# KNT Hire & Sales — Task-Driven AutoBot

The KNT AutoBot is an autonomous engineering worker dedicated only to this repository. It reuses the proven Bikeztagram task-driven pattern but is adapted to KNT's business requirements.

## Operating model

`KNT roadmap/queue -> bounded builder run -> inspect -> implement -> verify -> repair -> checkpoint -> publish branch`

The worker receives an explicit objective and acceptance contract. It must not invent unrelated roadmap work.

## Large-build behaviour

A run is intentionally time-bounded and can process multiple coherent tasks. After each implementation unit it verifies the repository, repairs failures where possible, records a checkpoint, and continues until the run budget is exhausted or a genuine external blocker occurs.

## KNT-specific rules

- Preserve original paper evidence alongside extracted data.
- Never fabricate OCR, AI extraction or business data.
- Keep forklifts as permanent records with preserved job/service/LOLER history.
- Shared business records must be cloud-backed.
- Invoices stop at human review; never auto-send to customers.
- Prefer complete vertical workflows over cosmetic UI changes.

## Release boundaries

- Never write directly to `main`.
- Work on an isolated `autonomous-builder/*` branch.
- Do not modify `.github/workflows/**` or `builder/runner/**` during product execution.
- Do not merge or deploy production automatically.
- Verification is mandatory before publishing a batch.
- Provider/quota failures are blockers, not reasons to waste retry cycles.
