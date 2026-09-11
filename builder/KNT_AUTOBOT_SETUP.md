# KNT AutoBot — Operator Setup

The KNT AutoBot is a reusable autonomous engineering worker adapted from the proven Bikeztagram task-driven architecture.

## What it does

`durable queue -> KNT objective -> Codex worker -> implementation -> verification -> repair -> isolated branch -> report`

A manual workflow run can be configured for up to 120 minutes and 8 passes. The worker can continue from one coherent objective to the next compatible ready objective during the same run.

## Required GitHub Actions secrets

Only these external credentials are required by the workflow:

- `OPENAI_API_KEY` — API credential used by the configured Codex execution worker.
- `VERCEL_TOKEN` — token allowing the builder to create its Vercel Sandbox execution environment.

`GITHUB_TOKEN` is supplied automatically by GitHub Actions.

The Vercel team/project IDs are deliberately stored as non-secret configuration in the workflow so the setup does not require unnecessary secrets.

## Running it

GitHub Actions -> KNT Autonomous Builder -> Run workflow.

Recommended first proof run:

- minutes: `30`
- passes: `2`
- objective: blank
- resume_branch: blank

After a successful proof run, use `120` minutes and `8` passes for normal autonomous builds.

## Safety

The worker never writes directly to `main`, never merges, never deploys production, and restores changes under `.github/workflows/` and `builder/runner/` if an execution agent attempts to touch them.

Product work is published to an `autonomous-builder/knt-*` branch for review. A later run can be pointed at an existing branch when continuation is needed.

## KNT-specific rules

- Build real business functionality, not placeholder screens.
- Preserve original paper evidence.
- Never present invented OCR as fact.
- Keep supplier parts traceable to jobs.
- Never automatically send customer invoices.
- Preserve shared cloud data and audit history.
- Treat build success as necessary but not sufficient: acceptance behaviour must be verified.
