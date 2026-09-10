import React, { useRef, useState } from 'react';
import { ArrowLeft, Camera, Check, FileImage, Mic, PenLine, Sparkles, Upload, X } from 'lucide-react';

export default function NewJobPage({ onBack }) {
  const [mode, setMode] = useState(null);
  const [imageName, setImageName] = useState('');
  const [recording, setRecording] = useState(false);
  const inputRef = useRef(null);

  const chooseScan = () => { setMode('scan'); inputRef.current?.click(); };
  const onFile = e => { const file = e.target.files?.[0]; if (file) { setImageName(file.name); setMode('review'); } };

  return <div className="new-job-page">
    <div className="page-title"><div className="title-with-back"><button className="icon-btn" onClick={onBack}><ArrowLeft size={21}/></button><div><h1>New jobsheet</h1><p className="muted">Choose the quickest way to record the job.</p></div></div><HelpBadge /></div>

    {!mode && <div className="capture-grid">
      <button className="capture-card featured" onClick={chooseScan}><div className="capture-icon"><Camera/></div><strong>Scan paper jobsheet</strong><span>Photograph your handwritten KNT sheet. The app will read the fields and keep the original photo.</span><b>Take photo / choose image →</b></button>
      <button className="capture-card" onClick={() => setMode('voice')}><div className="capture-icon"><Mic/></div><strong>Voice jobsheet</strong><span>Speak naturally about the customer, truck, fault, work, parts, labour and travel.</span><b>Start voice entry →</b></button>
      <button className="capture-card" onClick={() => setMode('type')}><div className="capture-icon"><PenLine/></div><strong>Type jobsheet</strong><span>Use a normal digital form when typing is quickest or you need exact control.</span><b>Open form →</b></button>
    </div>}

    {mode === 'scan' && <div className="capture-state"><div className="large-icon"><Camera/></div><h2>Scan your paper sheet</h2><p>Take a clear photo showing the whole jobsheet. Good lighting and a flat page help handwriting recognition.</p><button className="primary wide" onClick={() => inputRef.current?.click()}><Camera size={18}/> Choose photo</button><input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile}/><button className="secondary wide" onClick={() => setMode(null)}>Cancel</button></div>}

    {mode === 'review' && <div className="review-card"><div className="review-head"><div><span className="eyebrow">SOURCE DOCUMENT</span><h2>{imageName}</h2></div><button className="icon-btn" onClick={() => setMode(null)}><X/></button></div><div className="ai-banner"><Sparkles size={18}/><div><strong>Ready for AI extraction</strong><p>The production pipeline will read the handwritten fields, identify the customer and forklift, and flag anything uncertain for you to confirm.</p></div></div><div className="extracted"><Field label="Job number" value="Will be detected"/><Field label="Customer" value="Will be detected"/><Field label="Plant / forklift" value="Will be matched to fleet"/><Field label="Work carried out" value="Will be transcribed"/></div><div className="button-row"><button className="secondary" onClick={() => setMode('scan')}>Retake</button><button className="primary"><Check size={18}/> Review extracted job</button></div></div>}

    {mode === 'voice' && <div className="capture-state"><div className={`large-icon mic ${recording ? 'recording' : ''}`}><Mic/></div><h2>{recording ? 'Listening…' : 'Talk through the job'}</h2><p>Say it normally. You don't need to read out every field in order.</p><button className="primary wide" onClick={() => setRecording(v => !v)}>{recording ? 'Stop recording' : 'Start recording'}</button><div className="example">“Job 8423. ABC Manufacturing, plant 1042. Emergency stop fault. Replaced the switch and tested it. Two and a half hours labour.”</div><button className="secondary wide" onClick={() => setMode(null)}>Cancel</button></div>}

    {mode === 'type' && <div className="form-card"><div className="form-head"><div><h2>Digital jobsheet</h2><p className="muted">You can edit every field before saving.</p></div><HelpBadge/></div><label>Customer<input placeholder="Search customer…"/></label><label>Forklift / plant<input placeholder="Search plant number or serial…"/></label><label>Problem / fault<textarea placeholder="What did the customer report?"/></label><label>Work carried out<textarea placeholder="What did you find and do?"/></label><div className="two-col"><label>Hours<input inputMode="decimal" placeholder="0"/></label><label>Travel<input inputMode="decimal" placeholder="0 miles"/></label></div><button className="primary wide"><Check size={18}/> Save draft</button><button className="secondary wide" onClick={() => setMode(null)}>Cancel</button></div>}

    <p className="privacy-note"><FileImage size={15}/> Original paper photos will remain attached to the job record. AI text is an editable copy, not a replacement for the source document.</p>
  </div>;
}

function Field({label,value}) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function HelpBadge() { return <span className="mini-help"><Sparkles size={14}/> Help available</span>; }
