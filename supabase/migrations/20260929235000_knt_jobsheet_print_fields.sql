alter table public.jobs
  add column if not exists customer_signature_name text,
  add column if not exists consumables text;
