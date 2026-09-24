-- Private storage buckets for evidence and business documents.
insert into storage.buckets (id, name, public) values ('knt-job-evidence', 'knt-job-evidence', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('knt-documents', 'knt-documents', false) on conflict (id) do nothing;

create policy "authenticated users can read KNT storage" on storage.objects for select to authenticated using (bucket_id in ('knt-job-evidence','knt-documents'));
create policy "authenticated users can upload KNT storage" on storage.objects for insert to authenticated with check (bucket_id in ('knt-job-evidence','knt-documents'));
create policy "authenticated users can update KNT storage" on storage.objects for update to authenticated using (bucket_id in ('knt-job-evidence','knt-documents')) with check (bucket_id in ('knt-job-evidence','knt-documents'));
create policy "authenticated users can delete KNT storage" on storage.objects for delete to authenticated using (bucket_id in ('knt-job-evidence','knt-documents'));
