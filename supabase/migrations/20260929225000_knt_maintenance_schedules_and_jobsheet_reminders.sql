-- Maintenance schedule metadata and historical jobsheet due-date snapshot.
alter table public.forklifts
  add column if not exists service_interval_months integer not null default 12,
  add column if not exists loler_interval_months integer not null default 12;

alter table public.forklifts
  drop constraint if exists forklifts_service_interval_months_check,
  drop constraint if exists forklifts_loler_interval_months_check;

alter table public.forklifts
  add constraint forklifts_service_interval_months_check
    check (service_interval_months between 1 and 120),
  add constraint forklifts_loler_interval_months_check
    check (loler_interval_months between 1 and 120);

alter table public.jobs
  add column if not exists service_due_at_job date,
  add column if not exists loler_due_at_job date;

create index if not exists forklifts_next_service_date_idx
  on public.forklifts(next_service_date);

create index if not exists forklifts_next_loler_date_idx
  on public.forklifts(next_loler_date);
