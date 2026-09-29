alter table public.forklifts add column if not exists machine_type text not null default 'forklift';
alter table public.forklifts drop constraint if exists forklifts_machine_type_check;
alter table public.forklifts add constraint forklifts_machine_type_check check (machine_type in ('forklift','sideloaders','other'));
