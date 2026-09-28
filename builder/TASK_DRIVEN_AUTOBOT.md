# KNT Hire & Sales — Autonomous Qwen AutoBot

The KNT AutoBot uses the proven Bikeztagram local-model pattern, adapted to KNT's forklift service-management requirements.

## Operating model

`KNT objectives -> repository intelligence -> local Ollama/Qwen -> small structured edit -> syntax/diff/build verification -> durable state -> next objective`

The worker receives an explicit objective and acceptance contract. It works through eligible objectives during the same run without requiring manual "Continue" prompts.

## Large-build behaviour

The sustained controller uses a shared time budget and short feature slices. Each slice attempts one small coherent product increment, verifies it, records success/failure evidence, and then moves on. Two consecutive no-progress cycles stop the run rather than producing a misleading green result.

## KNT-specific rules

- Preserve original paper and photo evidence alongside extracted data.
- Never fabricate OCR, AI extraction, certificates, supplier data or business records.
- Keep forklifts as permanent records with preserved job/service/LOLER history.
- Shared business records must be cloud-backed.
- Invoices stop at human review; never auto-send to customers.
- Prefer complete vertical workflows over cosmetic UI changes.

## Release boundaries

- Never write directly to `main`.
- Work on the isolated `feature/knt-v1-foundation` baseline and publish verified product changes to an `autonomous-builder-knt/<run-id>` branch.
- Do not modify `.github/workflows/**` or `builder/runner/**` during product execution.
- Do not merge or deploy production automatically.
- Verification is mandatory before publishing a batch.
- A run with no verified product change is a failure, not a successful checkpoint.
- Local Qwen is the only coding-model path; provider/quota failures never trigger a paid fallback.
