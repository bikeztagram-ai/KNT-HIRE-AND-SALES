-- Permanent reference photos attached to individual forklift records.
create table if not exists public.forklift_photos (
  id uuid primary key default gen_random_uuid(),
  forklift_id uuid not null references public.forklifts(id) on delete cascade,
  storage_path text not null,
  category text not null default 'general',
  caption text,
  taken_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists forklift_photos_forklift_id_idx
  on public.forklift_photos(forklift_id, created_at desc);

alter table public.forklift_photos enable row level security;

drop policy if exists "authenticated forklift photos" on public.forklift_photos;
create policy "authenticated forklift photos"
  on public.forklift_photos
  for all to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on table public.forklift_photos to authenticated;

insert into storage.buckets (id, name, public)
values ('knt-forklift-photos', 'knt-forklift-photos', false)
on conflict (id) do nothing;

drop policy if exists "authenticated users can read KNT forklift photos" on storage.objects;
create policy "authenticated users can read KNT forklift photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'knt-forklift-photos');

drop policy if exists "authenticated users can upload KNT forklift photos" on storage.objects;
create policy "authenticated users can upload KNT forklift photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'knt-forklift-photos');

drop policy if exists "authenticated users can update KNT forklift photos" on storage.objects;
create policy "authenticated users can update KNT forklift photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'knt-forklift-photos')
  with check (bucket_id = 'knt-forklift-photos');

drop policy if exists "authenticated users can delete KNT forklift photos" on storage.objects;
create policy "authenticated users can delete KNT forklift photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'knt-forklift-photos');
