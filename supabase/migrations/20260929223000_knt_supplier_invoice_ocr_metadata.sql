alter table public.job_supplier_invoices
  add column if not exists ocr_confidence numeric,
  add column if not exists ocr_processed_at timestamptz;
