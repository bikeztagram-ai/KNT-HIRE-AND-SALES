import { supabase } from './supabase';

function requireCloud() {
  if (!supabase) throw new Error('Cloud database is not configured.');
}

export async function uploadPrivateFile(bucket, folder, file) {
  requireCloud();
  const safeName = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export async function createSignedUrl(bucket, path, expiresIn = 3600) {
  requireCloud();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
