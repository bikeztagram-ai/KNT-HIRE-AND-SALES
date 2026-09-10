import { supabase } from './supabase';

export async function listCustomers() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('customers').select('*').order('name');
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

export async function createJob(input) {
  if (!supabase) throw new Error('Cloud database is not configured.');
  const { data, error } = await supabase.from('jobs').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function addJobPhoto(jobId, photo) {
  if (!supabase) throw new Error('Cloud database is not configured.');
  const path = `${jobId}/${crypto.randomUUID()}-${photo.name}`;
  const { error: uploadError } = await supabase.storage.from('knt-job-evidence').upload(path, photo, { upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.from('job_photos').insert({ job_id: jobId, storage_path: path, tag: 'evidence' }).select().single();
  if (error) throw error;
  return data;
}
