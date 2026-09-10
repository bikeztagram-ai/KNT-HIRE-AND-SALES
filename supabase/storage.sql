-- Create the private evidence bucket used by KNT jobs.
insert into storage.buckets (id, name, public)
values ('knt-job-evidence', 'knt-job-evidence', false)
on conflict (id) do nothing;

create policy "authenticated users can upload KNT evidence"
on storage.objects for insert to authenticated
with check (bucket_id = 'knt-job-evidence');

create policy "authenticated users can read KNT evidence"
on storage.objects for select to authenticated
using (bucket_id = 'knt-job-evidence');

create policy "authenticated users can update KNT evidence"
on storage.objects for update to authenticated
using (bucket_id = 'knt-job-evidence')
with check (bucket_id = 'knt-job-evidence');

create policy "authenticated users can delete KNT evidence"
on storage.objects for delete to authenticated
using (bucket_id = 'knt-job-evidence');
