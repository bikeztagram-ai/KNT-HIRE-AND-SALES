# KNT build status

## Current direction
KNT is being built as a shared cloud business system for forklift service, repair, fleet and compliance work. The engineer workflow remains the fastest path through the product.

## Completed foundation
- React/Vite mobile-first application shell
- Supabase client boundary
- Shared relational schema covering customers, sites, forklifts, jobs, evidence, service, LOLER, suppliers, parts, quotes, invoices, payments and reminders
- authenticated shared-workspace RLS baseline
- private evidence/document storage foundation
- PWA manifest and install metadata
- CI build verification
- reusable storage/data/auth helpers
- touch-friendly signature capture component

## Next vertical slice
1. Real Supabase session gate in the app shell
2. Customer/site/forklift selectors backed by cloud data
3. Persist Type Job as draft/completed record
4. Preserve photographed paper jobsheet as source document
5. Multi-photo evidence with tags
6. Signature persistence
7. Job detail/history and status transitions
8. Service/LOLER due dashboard

## Product rules
- Never silently replace the original handwritten source with AI extraction.
- AI-derived values are editable and uncertain values require confirmation.
- Evidence remains attached to its job.
- Two KNT engineers share operational records.
- Customer invoices are human-reviewed before they are sent.
- No credentials or secrets are committed to the repository.
- Build success is necessary but never sufficient for release.
