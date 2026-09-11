import { supabase } from './supabase';

function requireCloud() { if (!supabase) throw new Error('Cloud database is not configured.'); }
async function query(table, builder) { requireCloud(); const { data, error } = await builder(supabase.from(table)); if (error) throw error; return data ?? []; }

export async function listCustomers() { return query('customers', q => q.select('*').order('name')); }
export async function createCustomer(input) { requireCloud(); const { data, error } = await supabase.from('customers').insert(input).select().single(); if (error) throw error; return data; }
export async function updateCustomer(id, input) { requireCloud(); const { data, error } = await supabase.from('customers').update(input).eq('id', id).select().single(); if (error) throw error; return data; }
export async function listSites(customerId) { return query('sites', q => { let x=q.select('*').order('name'); return customerId ? x.eq('customer_id', customerId) : x; }); }
export async function createSite(input) { requireCloud(); const { data, error } = await supabase.from('sites').insert(input).select().single(); if (error) throw error; return data; }
export async function updateSite(id, input) { requireCloud(); const { data, error } = await supabase.from('sites').update(input).eq('id', id).select().single(); if (error) throw error; return data; }
export async function listForklifts() { return query('forklifts', q => q.select('*, customers(name), sites(name)').order('plant_number')); }
export async function getForklift(id) { requireCloud(); const { data, error } = await supabase.from('forklifts').select('*, customers(name), sites(name)').eq('id', id).single(); if (error) throw error; return data; }
export async function createForklift(input) { requireCloud(); const { data, error } = await supabase.from('forklifts').insert(input).select().single(); if (error) throw error; return data; }
export async function updateForklift(id, input) { requireCloud(); const { data, error } = await supabase.from('forklifts').update(input).eq('id', id).select().single(); if (error) throw error; return data; }
export async function listJobs() { return query('jobs', q => q.select('*, customers(name), sites(name), forklifts(plant_number, make, model, serial_number)').order('job_date', { ascending: false })); }
export async function getJob(jobId) { requireCloud(); const { data, error } = await supabase.from('jobs').select('*, customers(name), sites(name), forklifts(plant_number, make, model, serial_number)').eq('id', jobId).single(); if (error) throw error; return data; }
export async function createJob(input) { requireCloud(); const { data, error } = await supabase.from('jobs').insert(input).select().single(); if (error) throw error; return data; }
export async function updateJob(jobId, input) { requireCloud(); const { data, error } = await supabase.from('jobs').update(input).eq('id', jobId).select().single(); if (error) throw error; return data; }
export async function addJobPhoto(jobId, photo, tag = 'evidence', caption = '') { requireCloud(); const path = await uploadJobFile(jobId, photo); const { data, error } = await supabase.from('job_photos').insert({ job_id: jobId, storage_path: path, tag, caption }).select().single(); if (error) throw error; return data; }
export async function listJobPhotos(jobId) { return query('job_photos', q => q.select('*').eq('job_id', jobId).order('created_at')); }
export async function listJobParts(jobId) { return query('job_parts', q => q.select('*, parts(*)').eq('job_id', jobId).order('created_at')); }
export async function listServiceEvents(forkliftId) { return query('service_events', q => q.select('*').eq('forklift_id', forkliftId).order('event_date', { ascending: false })); }
export async function listForkliftDocuments(forkliftId) { return query('forklift_documents', q => q.select('*').eq('forklift_id', forkliftId).order('created_at', { ascending: false })); }
export async function listJobStatusHistory(jobId) { return query('job_status_history', q => q.select('*').eq('job_id', jobId).order('changed_at', { ascending: false })); }
export async function addJobStatusHistory(jobId, oldStatus, newStatus, note = '') { requireCloud(); const { data: { user } = {} } = await supabase.auth.getUser(); const { data, error } = await supabase.from('job_status_history').insert({ job_id: jobId, old_status: oldStatus || null, new_status: newStatus, changed_by: user?.id || null, note: note || null }).select().single(); if (error) throw error; return data; }
export async function saveJobStatus(jobId, oldStatus, newStatus, note = '') { const job = await updateJob(jobId, { status: newStatus }); if (oldStatus !== newStatus) await addJobStatusHistory(jobId, oldStatus, newStatus, note); return job; }
export async function uploadJobFile(jobId, file) { requireCloud(); const safeName = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_'); const path = `${jobId}/${crypto.randomUUID()}-${safeName}`; const { error } = await supabase.storage.from('knt-job-evidence').upload(path, file, { upsert: false, contentType: file.type || undefined }); if (error) throw error; return path; }
export async function attachJobSource(jobId, file) { const path = await uploadJobFile(jobId, file); return updateJob(jobId, { source_document_path: path, source_document_type: file.type || 'image' }); }
export async function attachSignature(jobId, file) { const path = await uploadJobFile(jobId, file); return updateJob(jobId, { customer_signature_path: path }); }
export async function getPrivateFileUrl(path, expiresIn = 3600) { requireCloud(); if (!path) return ''; const { data, error } = await supabase.storage.from('knt-job-evidence').createSignedUrl(path, expiresIn); if (error) throw error; return data?.signedUrl || ''; }
