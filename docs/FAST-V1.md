# KNT Fast V1 execution plan

The fastest useful release is an end-to-end engineer workflow, not completion of every business module.

## Release gate

A V1 candidate must support authenticated shared cloud access and this complete loop:

`Customer → Site → Forklift → Job → Scan/Voice/Type → Review → Evidence → Signature → Complete → History`

## Parallel work lanes

- **Data:** Supabase schema, storage, queries, validation and RLS.
- **Engineer UI:** mobile jobsheet, fleet, customer/site lookup, job detail and drafts.
- **Capture:** paper upload/source preservation, voice transcript and extraction boundary.
- **Quality:** automated build/checks, error states, recovery and acceptance checks.
- **Release:** PWA manifest/installability and Vercel deployment configuration.

Independent lanes should proceed without waiting for unrelated UI polish.

## Deferred until the end-to-end loop is usable

Quotes, invoice generation, payment reporting, supplier OCR automation and advanced analytics are important but must not delay the first real engineer workflow.

## Non-negotiable rules

- Never lose the original paper source.
- AI extraction is editable and uncertain values require confirmation.
- Shared records belong to the business, not one engineer's device.
- Evidence is stored with the job/forklift record.
- Customer-facing invoice sending is always explicit human action.
- Do not commit credentials.
- Do not merge or deploy solely because a build passes.
