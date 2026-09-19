import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Download, FileImage, History, Loader2, PenLine, Wrench } from 'lucide-react';
import { getJob, listJobPhotos, listJobStatusHistory, getPrivateFileUrl, saveJobStatus } from './lib/data';

const pretty = s => String(s || 'draft').replaceAll('_',' ');
export default function JobDetailPage({ jobId, onBack }) {
  const [job,setJob]=useState(null),[photos,setPhotos]=useState([]),[history,setHistory]=useState([]),[urls,setUrls]=useState({}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[saving,setSaving]=useState(false);
  const load=async()=>{setLoading(true);setError('');try{const[j,p,h]=await Promise.all([getJob(jobId),listJobPhotos(jobId),listJobStatusHistory(jobId)]);setJob(j);setPhotos(p);setHistory(h);const entries=await Promise.all(p.map(async x=>[x.id,await getPrivateFileUrl(x.storage_path)]));setUrls(Object.fromEntries(entries));}catch(e){setError(e.message||'Could not load job.')}finally{setLoading(false)}};
  useEffect(()=>{load()},[jobId]);
  if(loading)return <div className="loading-bar"><Loader2 className="spin" size={18}/> Loading job…</div>;
  if(error&&!job)return <div className="error-box">{error}<button className="text-btn" onClick={load}>Retry</button></div>;
  if(!job)return null;
  const status=pretty(job.status);
  const complete=async()=>{setSaving(true);setError('');try{await saveJobStatus(job.id,job.status,'completed','Job completed by engineer.');await load()}catch(e){setError(e.message||'Could not complete job.')}finally{setSaving(false)}};
  return <div className="detail-page">
    <div className="page-title"><div className="title-with-back"><button className="icon-btn" onClick={onBack}><ArrowLeft size={21}/></button><div><p className="eyebrow">JOB {job.job_number}</p><h1>{job.problem||'Jobsheet'}</h1><p className="muted">{job.customers?.name||'No customer'} · {job.sites?.name||'No site'}</p></div></div><span className={`status ${status.replaceAll(' ','-')}`}>{status}</span></div>
    {error&&<div className="error-box" role="alert">{error}</div>}
    <section className="detail-card"><h2>Job details</h2><div className="detail-grid"><div><span>Forklift</span><strong>Plant {job.forklifts?.plant_number||'—'} · {[job.forklifts?.make,job.forklifts?.model].filter(Boolean).join(' ')||'—'}</strong></div><div><span>Serial</span><strong>{job.forklifts?.serial_number||'—'}</strong></div><div><span>Engineer</span><strong>{job.engineer_name||'—'}</strong></div><div><span>Date</span><strong>{job.job_date||'—'}</strong></div><div><span>Labour hours</span><strong>{job.labour_hours??'—'}</strong></div><div><span>Travel</span><strong>{job.travel??'—'}</strong></div></div></section>
    <section className="detail-card"><h2>Problem / fault</h2><p className="long-copy">{job.problem||'No problem recorded.'}</p></section>
    <section className="detail-card"><h2>Work carried out</h2><p className="long-copy">{job.work_carried_out||'No work recorded yet.'}</p></section>
    {job.source_document_path&&<section className="detail-card"><h2><FileImage size={19}/> Original jobsheet</h2><p className="muted">The original source remains attached as evidence.</p><button className="secondary" onClick={async()=>{try{const u=await getPrivateFileUrl(job.source_document_path);window.open(u,'_blank','noopener,noreferrer')}catch(e){setError(e.message||'Could not open original.')}}}><Download size={17}/> Open original</button></section>}
    <section className="detail-card"><div className="section-head"><h2>Evidence photos</h2><span className="hint">{photos.length} attached</span></div>{photos.length?<div className="photo-grid">{photos.map(p=><a key={p.id} href={urls[p.id]} target="_blank" rel="noreferrer"><img src={urls[p.id]} alt={p.caption||p.tag||'Job evidence'}/><span>{p.tag||'evidence'}</span></a>)}</div>:<p className="muted">No evidence photos attached.</p>}</section>
    <section className="detail-card"><h2><PenLine size={19}/> Customer signature</h2>{job.customer_signature_path?<div className="signature-result"><img src={urls.signature||''} alt="Customer signature" onLoad={()=>{}}/><button className="secondary" onClick={async()=>{try{const u=await getPrivateFileUrl(job.customer_signature_path);setUrls(x=>({...x,signature:u}))}catch(e){setError(e.message||'Could not open signature.')}}}><Download size={17}/> Open signature</button></div>:<p className="muted">No customer signature attached yet.</p>}{job.customer_signature_path&&!urls.signature&&<button className="text-btn" onClick={async()=>{const u=await getPrivateFileUrl(job.customer_signature_path);setUrls(x=>({...x,signature:u}))}}>Load signature preview</button>}</section>
    <section className="detail-card"><h2><History size={19}/> Status history</h2>{history.length?<div className="timeline">{history.map(h=><div key={h.id}><Clock3 size={15}/><div><strong>{pretty(h.new_status)}</strong><span>{new Date(h.changed_at).toLocaleString('en-GB')}</span>{h.note&&<p>{h.note}</p>}</div></div>)}</div>:<p className="muted">No status changes recorded.</p>}</section>
    {!['completed','cancelled'].includes(String(job.status).toLowerCase())&&<button className="primary wide" disabled={saving} onClick={complete}>{saving?<Loader2 className="spin" size={18}/>:<CheckCircle2 size={18}/>} Complete jobsheet</button>}
    <div className="privacy-note"><Wrench size={15}/> Completion records a status-history event so changes remain auditable.</div>
  </div>;
}
