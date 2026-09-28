# KNT deployment contract

## Required runtime configuration

The KNT app requires these Vite build-time variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

They must be configured in the deployment environment before building the app.

## Routes

- `/` — public KNT website
- `/app` — authenticated KNT operations app

`vercel.json` rewrites both route families to the SPA entry point.

## Verification gate

Before deployment:

1. `npm run build`
2. Run `node scripts/source-smoke.mjs` when available.
3. Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present in the deployment environment.
4. Open both `/` and `/app`.
5. Verify authentication before testing operational data.

Do not treat a successful frontend build as proof that Supabase or production authentication is configured.
