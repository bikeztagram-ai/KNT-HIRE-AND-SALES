# KNT Hire & Sales — Autonomous Builder Memory

## North star
Build a production-grade shared web/PWA system for KNT Hire & Sales Ltd to manage customers, sites, forklifts, jobs, evidence, service/LOLER, parts, suppliers and commercial workflows.

## Product hierarchy
Customer -> Site -> Forklift -> Job -> Work + Parts + Photos + Hours -> Signature -> Completion -> Quote/Invoice/Payment.
Suppliers -> Parts -> Supplier Orders -> Job.

## Engineer-first principles
- Android-first, fast, one-hand friendly.
- Minimise engineer typing and duplicate entry.
- Original paper/photo evidence remains attached and is never silently replaced by AI extraction.
- Shared cloud data: both engineers see the same operational records.
- Forklifts are permanent records; movement between sites must preserve history.
- Invoices are prepared for human review; never auto-send to customers.
- Real persistence beats mock UI.
- Every feature must have useful loading, empty and error states.

## Current implementation
- React/Vite frontend.
- Supabase Auth/database/storage foundation.
- Feature work is currently on `feature/knt-v1-foundation`.
- `main` remains the release branch.
- CI build workflow exists and must stay protected.

## Autonomous worker boundaries
- Work only from the durable KNT queue/objective.
- Never modify `.github/workflows/**` or `builder/runner/**` during product execution.
- Never merge or deploy production automatically.
- Never invent unrelated product work.
- Run build and relevant verification after substantive changes.
- Repair failures before moving forward when possible.
- Preserve checkpoints and durable progress.
