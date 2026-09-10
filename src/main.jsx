import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, CheckCircle2, ClipboardList, Clock3, FileText, HelpCircle, Home, Mic, MoreHorizontal, Plus, Search, Truck, Wrench, X } from 'lucide-react';
import './styles.css';

const jobs = [
  { id: '8371', customer: 'ABC Manufacturing', site: 'Hull Factory', plant: '1042', machine: 'Toyota 8FG25', fault: 'Emergency stop fault', status: 'Completed', engineer: 'Mike' },
  { id: '8368', customer: 'XYZ Logistics', site: 'Beverley Warehouse', plant: '1048', machine: 'Linde H25D', fault: 'Routine service', status: 'Awaiting parts', engineer: 'Dave' },
  { id: '8362', customer: 'Northside Distribution', site: 'Hull Depot', plant: '1051', machine: 'Toyota 8FG30', fault: 'Hydraulic leak', status: 'In progress', engineer: 'Mike' },
];

const fleet = [
  { plant: '1042', machine: 'Toyota 8FG25', customer: 'ABC Manufacturing', site: 'Hull Factory', hours: '8,421', due: 'Service 10 Dec' },
  { plant: '1048', machine: 'Linde H25D', customer: 'ABC Manufacturing', site: 'Beverley Warehouse', hours: '6,210', due: 'Service 2 Oct' },
];

function Help({ title, children }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="icon-btn" aria-label="Page help" onClick={() => setOpen(true)}><HelpCircle size={21} /></button>
    {open && <div className="modal-backdrop" onClick={() => setOpen(false)}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-head"><strong>{title}</strong><button className="icon-btn" onClick={() => setOpen(false)}><X size={20} /></button></div>
      <div className="modal-copy">{children}</div>
      <button className="primary wide" onClick={() => setOpen(false)}>Got it</button>
    </div></div>}
  </>;
}

function App() {
  const [page, setPage] = useState('home');
  const [composer, setComposer] = useState(false);
  const [search, setSearch] = useState('');

  const navigate = p => { setComposer(false); setPage(p); };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">KNT</div><div><div className="brand-name">Hire & Sales</div><div className="brand-sub">Keeping Your Business Moving</div></div></div>
      <Help title="Using KNT Hire & Sales">Use the help button on any page to see what that page does. You can create jobs by scanning a paper sheet, speaking the job, or typing it. Nothing is submitted to a customer automatically.</Help>
    </header>

    <main className="content">
      {page === 'home' && <HomePage navigate={navigate} />}
      {page === 'jobs' && <JobsPage search={search} setSearch={setSearch} navigate={navigate} />}
      {page === 'fleet' && <FleetPage navigate={navigate} />}
      {page === 'more' && <MorePage navigate={navigate} />}
      {page === 'help' && <HelpPage />}
    </main>

    {composer && <div className="quick-menu">
      <button onClick={() => navigate('jobs')}><ClipboardList size={20}/><span>Type job</span></button>
      <button onClick={() => navigate('jobs')}><Mic size={20}/><span>Voice job</span></button>
      <button onClick={() => navigate('jobs')}><Camera size={20}/><span>Scan paper</span></button>
    </div>}

    <nav className="bottom-nav">
      <NavItem active={page === 'home'} icon={<Home size={20}/>} label="Home" onClick={() => navigate('home')} />
      <NavItem active={page === 'jobs'} icon={<ClipboardList size={20}/>} label="Jobs" onClick={() => navigate('jobs')} />
      <button className="fab" aria-label="New job" onClick={() => setComposer(v => !v)}><Plus size={28}/></button>
      <NavItem active={page === 'fleet'} icon={<Truck size={20}/>} label="Fleet" onClick={() => navigate('fleet')} />
      <NavItem active={page === 'more'} icon={<MoreHorizontal size={20}/>} label="More" onClick={() => navigate('more')} />
    </nav>
  </div>;
}

function NavItem({ active, icon, label, onClick }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span></button>; }

function HomePage({ navigate }) {
  return <>
    <section className="welcome"><div><p className="eyebrow">KNT WORKSPACE</p><h1>Good morning</h1><p className="muted">Everything you need for today's work.</p></div><div className="avatar">M</div></section>
    <section className="stats-grid">
      <Stat label="Overdue" value="2" tone="danger" icon={<Clock3 size={18}/>}/>
      <Stat label="Due today" value="3" tone="warning" icon={<Wrench size={18}/>}/>
      <Stat label="Open jobs" value="5" tone="info" icon={<ClipboardList size={18}/>}/>
      <Stat label="Fleet" value="42" tone="success" icon={<Truck size={18}/>}/>
    </section>
    <section className="section"><div className="section-head"><h2>Quick actions</h2><span className="hint">Fastest ways to add work</span></div><div className="action-grid">
      <Action icon={<Camera/>} title="Scan jobsheet" text="Photograph handwritten paper" onClick={() => navigate('jobs')} />
      <Action icon={<Mic/>} title="Voice job" text="Speak and let KNT structure it" onClick={() => navigate('jobs')} />
      <Action icon={<ClipboardList/>} title="New job" text="Enter it manually" onClick={() => navigate('jobs')} />
    </div></section>
    <section className="section"><div className="section-head"><h2>Recent jobs</h2><button className="text-btn" onClick={() => navigate('jobs')}>View all</button></div>{jobs.slice(0,2).map(job => <JobCard key={job.id} job={job}/>)}</section>
  </>;
}

function JobsPage({ search, setSearch }) {
  const filtered = jobs.filter(j => `${j.id} ${j.customer} ${j.plant} ${j.machine} ${j.fault}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageTitle title="Jobs" subtitle="Create, find and complete jobsheets"><Help title="Jobs">Search by job number, customer, plant number or machine. The production version will let you scan paper, dictate a job, attach photos and signature, and keep the original source document with the job.</Help></PageTitle>
    <div className="search"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, customers, plant..." /></div>
    <div className="filter-row"><button className="chip active">All</button><button className="chip">In progress</button><button className="chip">Awaiting parts</button><button className="chip">Completed</button></div>
    <div className="job-list">{filtered.map(job => <JobCard key={job.id} job={job}/>)}</div>
  </>;
}

function FleetPage() { return <>
  <PageTitle title="Fleet" subtitle="Every forklift, its location and history"><Help title="Fleet">Forklifts are permanent records. A truck can move between sites without losing its service, repair, photos or LOLER history.</Help></PageTitle>
  <div className="search"><Search size={19}/><input placeholder="Search plant, serial, make or customer..." /></div>
  {fleet.map(f => <div className="fleet-card" key={f.plant}><div className="machine-icon"><Truck size={25}/></div><div className="grow"><div className="card-title">Plant {f.plant} · {f.machine}</div><div className="muted">{f.customer} · {f.site}</div><div className="meta"><span>{f.hours} hrs</span><span>{f.due}</span></div></div><span className="chevron">›</span></div>)}
</>; }

function MorePage({ navigate }) { return <>
  <PageTitle title="More" subtitle="KNT tools and settings"><Help title="More">Use this area for customers, suppliers, parts, calendar, invoices, documents and settings as those modules are added.</Help></PageTitle>
  {['Customers & sites','Parts & suppliers','Service & LOLER','Quotes & invoices','Documents','Help & how to use'].map((item,i)=><button className="menu-row" key={item} onClick={() => item === 'Help & how to use' && navigate('help')}><span>{[<Truck/>,<Wrench/>,<Clock3/>,<FileText/>,<FileText/>,<HelpCircle/>][i]}</span><strong>{item}</strong><span className="chevron">›</span></button>)}
</>; }

function HelpPage() { return <>
  <PageTitle title="How to use KNT" subtitle="A simple guide for engineers"><Help title="Help">This guide will grow as the app grows. The aim is to make every screen understandable without training.</Help></PageTitle>
  <div className="help-card"><strong>📸 Scan a paper jobsheet</strong><p>Photograph the handwritten sheet. KNT will read the fields, show you what it understood, and keep the original image attached.</p></div>
  <div className="help-card"><strong>🎙️ Speak a jobsheet</strong><p>Talk normally about the job. KNT will turn your words into customer, machine, fault, work, parts, labour and travel fields for you to check.</p></div>
  <div className="help-card"><strong>⌨️ Type a jobsheet</strong><p>Use the normal digital form whenever that is quicker or you need precise control.</p></div>
  <div className="help-card"><strong>⚠️ Always check AI extraction</strong><p>Handwriting and speech can be misunderstood. KNT should flag uncertain information instead of silently changing your records.</p></div>
  <div className="help-card"><strong>🔒 Your records</strong><p>Customer data, fleet history, photos, documents and signatures belong to the job or asset record — not just your phone gallery.</p></div>
</>; }

function PageTitle({ title, subtitle, children }) { return <div className="page-title"><div><h1>{title}</h1><p className="muted">{subtitle}</p></div>{children}</div>; }
function Stat({label,value,tone,icon}) { return <div className={`stat ${tone}`}><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>; }
function Action({icon,title,text,onClick}) { return <button className="action-card" onClick={onClick}><div className="action-icon">{icon}</div><div><strong>{title}</strong><span>{text}</span></div><span className="chevron">›</span></button>; }
function JobCard({job}) { return <div className="job-card"><div className="job-top"><span className="job-id">JOB {job.id}</span><span className={`status ${job.status.toLowerCase().replace(' ','-')}`}>{job.status}</span></div><div className="card-title">{job.fault}</div><div className="muted">{job.customer} · {job.site}</div><div className="meta"><span>Plant {job.plant}</span><span>{job.machine}</span><span>{job.engineer}</span></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
