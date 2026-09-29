-- Ensure the browser-facing authenticated role has explicit table privileges.
-- RLS policies still control row access; these grants are required before policies can apply.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles','customers','sites','forklifts','jobs','job_photos','job_parts',
    'service_events','forklift_documents','suppliers','parts','supplier_orders',
    'supplier_order_lines','pricing_settings','quotes','quote_lines','invoices',
    'invoice_lines','payments','reminders','job_status_history'
  ] loop
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end $$;

grant usage, select on all sequences in schema public to authenticated;
