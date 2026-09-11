# KNT AutoBot — Operator Setup

The KNT AutoBot uses the proven Bikeztagram-style local Qwen architecture: repository intelligence -> small structured search/replace edit -> verification -> durable progress -> next objective.

## What it does

`KNT objectives -> local Ollama/Qwen -> one small product change -> syntax/diff/build verification -> checkpoint -> next objective`

A workflow run can be configured from 15 minutes up to 6 hours. It keeps working through eligible objectives without asking for a manual "Continue" between tasks.

## Builder credentials

No OpenAI API key, Gemini key or Vercel token is required by the KNT builder brain. The coding model runs locally on the GitHub Actions runner through Ollama.

`GITHUB_TOKEN` is supplied automatically by GitHub Actions and is used only to push the verified checkpoint branch.

## Running it

GitHub Actions -> KNT Autonomous Builder -> Run workflow.

Recommended proof run:

- duration: `15m` or `30m`
- local model: `qwen2.5-coder:7b`

After the proof is genuinely producing verified product changes, use `1h` to `6h` for larger autonomous sessions.

## Safety

The builder never writes directly to `main`, never merges, never deploys production, and never modifies workflow/builder infrastructure during product execution.

Every model change is constrained to the current objective's product files and must pass syntax checks, `git diff --check`, and `npm run build`. A run that produces no verified product change is treated as a failure rather than a successful checkpoint.

Product work is pushed to an `autonomous-builder-knt/<run-id>` branch for review. GitHub currently prevents Actions from creating pull requests in this repository, so the workflow deliberately does not report a fake PR as created.

## KNT-specific rules

- Build real business functionality, not placeholder screens.
- Preserve original paper and photo evidence.
- Never present invented OCR/AI extraction as fact.
- Keep supplier parts traceable to jobs.
- Never automatically send customer invoices.
- Preserve shared cloud data and audit history.
- Prefer complete vertical workflows over cosmetic changes.
