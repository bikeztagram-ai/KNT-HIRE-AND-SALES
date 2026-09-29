create table if not exists public.job_supplier_invoices (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  storage_path text not null,
  file_name text,
  supplier_name text,
  invoice_number text,
  invoice_date date,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists job_supplier_invoices_job_idx on public.job_supplier_invoices(job_id, created_at desc);

create table if not exists public.job_supplier_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.job_supplier_invoices(id) on delete cascade,
  job_part_id uuid references public.job_parts(id) on delete set null,
  part_number text,
  description text not null,
  quantity numeric not null default 1 check (quantity > 0),
  unit_cost numeric check (unit_cost is null or unit_cost >= 0),
  created_at timestamptz not null default now()
);

create index if not exists job_supplier_invoice_lines_invoice_idx on public.job_supplier_invoice_lines(invoice_id);
create index if not exists job_supplier_invoice_lines_part_idx on public.job_supplier_invoice_lines(job_part_id);

alter table public.job_supplier_invoices enable row level security;
alter table public.job_supplier_invoice_lines enable row level security;

drop policy if exists "authenticated users can read supplier invoices" on public.job_supplier_invoices;
drop policy if exists "authenticated users can insert supplier invoices" on public.job_supplier_invoices;
drop policy if exists "authenticated users can update supplier invoices" on public.job_supplier_invoices;
drop policy if exists "authenticated users can delete supplier invoices" on public.job_supplier_invoices;
create policy "authenticated users can read supplier invoices" on public.job_supplier_invoices for select to authenticated using (true);
create policy "authenticated users can insert supplier invoices" on public.job_supplier_invoices for insert to authenticated with check (true);
create policy "authenticated users can update supplier invoices" on public.job_supplier_invoices for update to authenticated using (true) with check (true);
create policy "authenticated users can delete supplier invoices" on public.job_supplier_invoices for delete to authenticated using (true);

drop policy if exists "authenticated users can read supplier invoice lines" on public.job_supplier_invoice_lines;
drop policy if exists "authenticated users can insert supplier invoice lines" on public.job_supplier_invoice_lines;
drop policy if exists "authenticated users can update supplier invoice lines" on public.job_supplier_invoice_lines;
drop policy if exists "authenticated users can delete supplier invoice lines" on public.job_supplier_invoice_lines;
create policy "authenticated users can read supplier invoice lines" on public.job_supplier_invoice_lines for select to authenticated using (true);
create policy "authenticated users can insert supplier invoice lines" on public.job_supplier_invoice_lines for insert to authenticated with check (true);
create policy "authenticated users can update supplier invoice lines" on public.job_supplier_invoice_lines for update to authenticated using (true) with check (true);
create policy "authenticated users can delete supplier invoice lines" on public.job_supplier_invoice_lines for delete to authenticated using (true);

grant select, insert, update, delete on public.job_supplier_invoices to authenticated;
grant select, insert, update, delete on public.job_supplier_invoice_lines to authenticated;

insert into storage.buckets (id, name, public) values ('knt-job-evidence', 'knt-job-evidence', false) on conflict (id) do nothing;
