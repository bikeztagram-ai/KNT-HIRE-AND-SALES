-- Parts and service-kit data specific to each permanent forklift.
create table if not exists public.forklift_parts (
  id uuid primary key default gen_random_uuid(),
  forklift_id uuid not null references public.forklifts(id) on delete cascade,
  part_type text not null default 'other'
    check (part_type in ('service_filter','battery','hydraulic','air','fuel','oil','tyre','attachment','other')),
  manufacturer text,
  part_number text,
  description text not null,
  quantity numeric not null default 1 check (quantity > 0),
  is_service_kit boolean not null default false,
  fitted_date date,
  notes text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forklift_parts_forklift_id_idx
  on public.forklift_parts(forklift_id);
create index if not exists forklift_parts_service_kit_idx
  on public.forklift_parts(forklift_id, is_service_kit, active);

alter table public.forklift_parts enable row level security;
drop policy if exists "authenticated shared forklift parts" on public.forklift_parts;
create policy "authenticated shared forklift parts"
  on public.forklift_parts
  for all to authenticated
  using (true)
  with check (true);
grant select, insert, update, delete on table public.forklift_parts to authenticated;

drop trigger if exists forklift_parts_updated_at on public.forklift_parts;
create trigger forklift_parts_updated_at
before update on public.forklift_parts
for each row execute function public.set_updated_at();

-- System-generated maintenance tasks need a stable source key so two users
-- opening the To-Do page cannot create duplicate reminders.
alter table public.knt_work_queue
  add column if not exists forklift_id uuid references public.forklifts(id) on delete cascade,
  add column if not exists due_date date,
  add column if not exists task_type text,
  add column if not exists maintenance_key text,
  add column if not exists system_generated boolean not null default false;

create unique index if not exists knt_work_queue_maintenance_key_unique
  on public.knt_work_queue(maintenance_key)
  where maintenance_key is not null;

create index if not exists knt_work_queue_forklift_due_idx
  on public.knt_work_queue(forklift_id, due_date)
  where system_generated = true;
