import { supabase } from './supabase';
function requireCloud(){if(!supabase)throw new Error('Cloud database is not configured.');}
async function rows(table, builder){requireCloud();const {data,error}=await builder(supabase.from(table));if(error)throw error;return data??[];}
async function one(table,input){requireCloud();const {data,error}=await supabase.from(table).insert(input).select().single();if(error)throw error;return data;}
async function update(table,id,input){requireCloud();const {data,error}=await supabase.from(table).update(input).eq('id',id).select().single();if(error)throw error;return data;}
export const listCustomers=()=>rows('customers',q=>q.select('*').order('name'));
export const createCustomer=input=>one('customers',input);
export const updateCustomer=(id,input)=>update('customers',id,input);
export const listSites=customerId=>rows('sites',q=>{let x=q.select('*').order('name');return customerId?x.eq('customer_id',customerId):x;});
export const createSite=input=>one('sites',input);
export const updateSite=(id,input)=>update('sites',id,input);
export const listForklifts=()=>rows('forklifts',q=>q.select('*, customers(name), sites(name)').order('plant_number'));
export const getForklift=id=>rows('forklifts',q=>q.select('*, customers(name), sites(name)').eq('id',id).single()).then(x=>x[0]);
export const createForklift=input=>one('forklifts',input);
export const updateForklift=(id,input)=>update('forklifts',id,input);
export const listJobs=()=>rows('jobs',q=>q.select('*, customers(name), sites(name), forklifts(plant_number,make,model,serial_number)').order('job_date',{ascending:false}));
export const getJob=id=>rows('jobs',q=>q.select('*, customers(name), sites(name), forklifts(plant_number,make,model,serial_number)').eq('id',id).single()).then(x=>x[0]);
export const createJob=input=>one('jobs',input);
export const updateJob=(id,input)=>update('jobs',id,input);
export const addJobPhoto=async(jobId,file,tag='evidence',caption='')=>{const path=await uploadJobFile(jobId,file);return one('job_photos',{job_id:jobId,storage_path:path,tag,caption});};
export const listJobPhotos=jobId=>rows('job_photos',q=>q.select('*').eq('job_id',jobId).order('created_at'));
export const listJobParts=jobId=>rows('job_parts',q=>q.select('*, parts(*)').eq('job_id',jobId).order('created_at'));
export const listServiceEvents=forkliftId=>rows('service_events',q=>q.select('*').eq('forklift_id',forkliftId).order('event_date',{ascending:false}));
export const listForkliftDocuments=forkliftId=>rows('forklift_documents',q=>q.select('*').eq('forklift_id',forkliftId).order('created_at',{ascending:false}));
export const listSuppliers=()=>rows('suppliers',q=>q.select('*').order('name'));
export const listParts=()=>rows('parts',q=>q.select('*').eq('active',true).order('description'));
export const listSupplierOrders=()=>rows('supplier_orders',q=>q.select('*, suppliers(name)').order('order_date',{ascending:false}));
export const listSupplierOrderLines=orderId=>rows('supplier_order_lines',q=>q.select('*').eq('supplier_order_id',orderId).order('created_at'));
export const createSupplierOrder=input=>one('supplier_orders',input);
export const createSupplierOrderLine=input=>one('supplier_order_lines',input);
export const linkSupplierLineToJob=(id,job_id)=>update('supplier_order_lines',id,{job_id});
export const listJobStatusHistory=jobId=>rows('job_status_history',q=>q.select('*').eq('job_id',jobId).order('changed_at',{ascending:false}));
export async function addJobStatusHistory(jobId,oldStatus,newStatus,note=''){requireCloud();const {data:{user}={}}=await supabase.auth.getUser();return one('job_status_history',{job_id:jobId,old_status:oldStatus||null,new_status:newStatus,changed_by:user?.id||null,note:note||null});}
export async function saveJobStatus(jobId,oldStatus,newStatus,note=''){const job=await updateJob(jobId,{status:newStatus});if(oldStatus!==newStatus)await addJobStatusHistory(jobId,oldStatus,newStatus,note);return job;}
export async function uploadJobFile(jobId,file){requireCloud();const safe=String(file.name||'upload').replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${jobId}/${crypto.randomUUID()}-${safe}`;const {error}=await supabase.storage.from('knt-job-evidence').upload(path,file,{upsert:false,contentType:file.type||undefined});if(error)throw error;return path;}
export async function attachJobSource(jobId,file){const path=await uploadJobFile(jobId,file);return updateJob(jobId,{source_document_path:path,source_document_type:file.type||'image'});}
export async function attachSignature(jobId,file){const path=await uploadJobFile(jobId,file);return updateJob(jobId,{customer_signature_path:path});}
export async function getPrivateFileUrl(path,expiresIn=3600){requireCloud();if(!path)return '';const {data,error}=await supabase.storage.from('knt-job-evidence').createSignedUrl(path,expiresIn);if(error)throw error;return data?.signedUrl||'';}
