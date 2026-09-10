import { supabase } from './supabase';

function requireCloud() {
  if (!supabase) throw new Error('Cloud database is not configured.');
}

export async function listCustomers() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('customers').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function listSites(customerId) {
  if (!supabase) return [];
  let query = supabase.from('sites').select('*').order('name');
  if (customerId) query = query.eq('customer_id', customerId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listForklifts() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('forklifts').select('*, customers(name), sites(name)').order('plant_number');
  if (error) throw error;
  return data ?? [];
}

export async function listJobs() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('jobs').select('*, customers(name), sites(name), forklifts(plant_number, make, model, serial_number)').order('job_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getJob(jobId) {
  requireCloud();
  const { data, error } = await supabase.from('jobs').select('*, customers(name), sites(name), forklifts(plant_number, make, model, serial_number)').eq('id', jobId).single();
  if (error) throw error;
  return data;
}

export async function createJob(input) {
  requireCloud();
  const { data, error } = await supabase.from('jobs').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateJob(jobId, input) {
  requireCloud();
  const { data, error } = await supabase.from('jobs').update(input).eq('id', jobId).select().single();
  if (error) throw error;
  return data;
}

export async function addJobPhoto(jobId, photo, tag = 'evidence', caption = '') {
  requireCloud();
  const path = await uploadJobFile(jobId, photo);
  const { data, error } = await supabase.from('job_photos').insert({ job_id: jobId, storage_path: path, tag, caption }).select().single();
  if (error) throw error;
  return data;
}

export async function listJobPhotos(jobId) {
  requireCloud();
  const { data, error } = await supabase.from('job_photos').select('*').eq('job_id', jobId).order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function uploadJobFile(jobId, file) {
  requireCloud();
  const safeName = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${jobId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('knt-job-evidence').upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

export async function attachJobSource(jobId, file) {
  const path = await uploadJobFile(jobId, file);
  return updateJob(jobId, { source_document_path: path, source_document_type: file.type || 'image' });
}

export async function attachSignature(jobId, file) {
  const path = await uploadJobFile(jobId, file);
  return updateJob(jobId, { customer_signature_path: path });
}
