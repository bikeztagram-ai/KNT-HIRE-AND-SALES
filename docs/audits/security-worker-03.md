# KNT security audit — worker 03

## Current findings

- All operational tables are protected by Supabase RLS.
- Authenticated users currently receive shared read/write access to operational records through the `authenticated shared access` policy.
- `profiles.role` supports `engineer` and `admin`, but the current operational policy does not use that role to restrict writes.
- Profile self-read/update policies exist, but there is no explicit admin-only policy layer for sensitive configuration or financial mutation.
- File records are stored in database tables and private job evidence uses signed URLs in the client data layer.

## Decision required before hardening

The product owner should decide whether all authenticated engineers may mutate all operational records, or whether admin-only controls are required for customers, fleet, pricing, quotes, invoices, payments and configuration.

## Recommended next testable slice

Introduce role-aware policies using a small SECURITY DEFINER helper, then verify engineer and admin access separately against a disposable Supabase test project before changing production policy.

No production RLS policy was changed by this audit worker.
