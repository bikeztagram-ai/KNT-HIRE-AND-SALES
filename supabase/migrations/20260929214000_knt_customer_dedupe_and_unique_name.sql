-- Safely consolidate exact customer-name duplicates and prevent future duplicates.
-- Canonical customer: the duplicate with the most linked operational records,
-- breaking ties by oldest creation time.

do $$
declare
  dup record;
  canonical uuid;
  old_site record;
  canonical_site uuid;
begin
  for dup in
    select lower(trim(name)) as normalized_name
    from public.customers
    where trim(name) <> ''
    group by lower(trim(name))
    having count(*) > 1
  loop
    select c.id
      into canonical
      from public.customers c
      where lower(trim(c.name)) = dup.normalized_name
      order by (
        (select count(*) from public.sites s where s.customer_id = c.id) +
        (select count(*) from public.forklifts f where f.customer_id = c.id) +
        (select count(*) from public.jobs j where j.customer_id = c.id) +
        (select count(*) from public.quotes q where q.customer_id = c.id) +
        (select count(*) from public.invoices i where i.customer_id = c.id)
      ) desc, c.created_at asc, c.id
      limit 1;

    -- First move/merge sites. A site name is unique within a customer
    -- for the purposes of this consolidation.
    for old_site in
      select s.id, s.name
      from public.sites s
      where s.customer_id in (
        select c.id from public.customers c
        where lower(trim(c.name)) = dup.normalized_name
          and c.id <> canonical
      )
    loop
      select s.id
        into canonical_site
        from public.sites s
        where s.customer_id = canonical
          and lower(trim(s.name)) = lower(trim(old_site.name))
        order by s.created_at asc, s.id
        limit 1;

      if canonical_site is null then
        update public.sites
          set customer_id = canonical
          where id = old_site.id;
      else
        update public.forklifts set site_id = canonical_site where site_id = old_site.id;
        update public.jobs set site_id = canonical_site where site_id = old_site.id;
        update public.quotes set site_id = canonical_site where site_id = old_site.id;
        delete from public.sites where id = old_site.id;
      end if;
    end loop;

    -- Move all customer-owned records to the canonical customer.
    update public.forklifts f
      set customer_id = canonical
      where f.customer_id in (
        select c.id from public.customers c
        where lower(trim(c.name)) = dup.normalized_name
          and c.id <> canonical
      );

    update public.jobs j
      set customer_id = canonical
      where j.customer_id in (
        select c.id from public.customers c
        where lower(trim(c.name)) = dup.normalized_name
          and c.id <> canonical
      );

    update public.quotes q
      set customer_id = canonical
      where q.customer_id in (
        select c.id from public.customers c
        where lower(trim(c.name)) = dup.normalized_name
          and c.id <> canonical
      );

    update public.invoices i
      set customer_id = canonical
      where i.customer_id in (
        select c.id from public.customers c
        where lower(trim(c.name)) = dup.normalized_name
          and c.id <> canonical
      );

    delete from public.customers c
      where lower(trim(c.name)) = dup.normalized_name
        and c.id <> canonical;
  end loop;
end $$;

create unique index if not exists customers_name_normalized_unique
  on public.customers (lower(trim(name)))
  where trim(name) <> '';
