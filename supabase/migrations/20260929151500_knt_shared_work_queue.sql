-- Shared KNT quick-work queue for engineers and management.
create table if not exists public.knt_work_queue (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  customer_site text,
  machine text,
  notes text,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','done')),
  created_by uuid references auth.users(id) on delete set null,
  completed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists knt_work_queue_status_idx
  on public.knt_work_queue(status, priority, created_at desc);
create index if not exists knt_work_queue_created_at_idx
  on public.knt_work_queue(created_at desc);

alter table public.knt_work_queue enable row level security;

create policy "authenticated shared work queue"
  on public.knt_work_queue
  for all to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.knt_work_queue to authenticated;
create or replace function public.set_knt_work_queue_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists knt_work_queue_updated_at on public.knt_work_queue;
create trigger knt_work_queue_updated_at
before update on public.knt_work_queue
for each row execute function public.set_knt_work_queue_updated_at();
-- Enable instant shared updates when the Supabase Realtime publication is available.
do $$
begin
  alter publication supabase_realtime add table public.knt_work_queue;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
alter table public.knt_work_queue
  add column if not exists created_by_name text,
  add column if not exists completed_by_name text;
