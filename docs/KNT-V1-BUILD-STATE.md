# KNT V1 build state

## Current direction
KNT is being built as a real shared business system for two engineers, with an Android-friendly web/PWA front end and Supabase cloud persistence.

## Implemented on this branch
- Mobile-first card-style application shell.
- Home, Jobs, Fleet, More and Help navigation.
- Three jobsheet entry modes: scan paper, voice and type.
- Supabase client/data layer foundation.
- Initial private job-evidence storage.
- Expanded production schema for customers, sites, forklifts, jobs, evidence, service/LOLER, suppliers/orders/parts, pricing, quotes, invoices, payments, reminders and audit history.
- PWA manifest and install metadata/icons.
- GitHub Actions build verification on pushes and pull requests.

## Critical product rules
- A forklift is a permanent asset record; moving site must not destroy history.
- The original handwritten jobsheet/photo remains attached to the job.
- AI extraction is editable and uncertain fields must be confirmed.
- Job evidence belongs to the job and is tagged, not left only in a phone gallery.
- Invoice generation does not automatically email customers; human review remains required.
- Shared cloud records are the target; no fake credentials or fake successful saves.

## Next vertical slice
Make the engineer workflow genuinely persistent: authentication, customer/site/forklift lookup, create/save job, upload source paper, evidence photos, signature capture, completion and job history. Then connect service/LOLER and supplier workflows before the commercial quote/invoice layer.

## Release rule
CI green is necessary but not sufficient. Do not merge or deploy merely because a build passes; inspect the product behaviour and data/security model first.
