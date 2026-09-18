#!/usr/bin/env node
/** KNT file contract: exact product paths plus the proven Aider engine are authoritative. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
const objectives=JSON.parse(read('builder/brain/feature-objectives.json')).objectives||[];
const tracked=new Set(execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));

for(const o of objectives){
  if(!o?.id){failures.push('objective without id');continue;}
  if(!Array.isArray(o.files)||!o.files.length){failures.push(`${o.id}: missing exact files[]`);continue;}
  for(const f of o.files){
    if(!tracked.has(f))failures.push(`${o.id}: untracked exact file ${f}`);
    if(!f.startsWith('src/'))failures.push(`${o.id}: objective file outside src/ ${f}`);
    if(f.includes('..')||f.includes('\\'))failures.push(`${o.id}: unsafe path ${f}`);
  }
}

const runner=read('builder/runner/aider-feature-brain.mjs');
const checks=[
 ['KNT objectives',runner.includes('feature-objectives.json')],
 ['exact objective files',runner.includes('scopedFiles(obj)')&&runner.includes('aiderFiles')],
 ['dependency-aware selection',runner.includes('o.dependsOn')],
 ['KNT-only prompt',runner.includes('KNT-HIRE-AND-SALES')&&runner.includes('ONLY files you may modify')],
 ['exact path authority',runner.includes('exact repository paths')],
 ['repository-map subtree',runner.includes('--subtree-only')&&runner.includes('--map-tokens=512')],
 ['durable state recovery',runner.includes('loadAiderState')&&runner.includes('saveAiderState')],
 ['bounded passes/deadline',runner.includes('AUTOBOT_FEATURE_PASSES')&&runner.includes('AUTOBOT_FEATURE_DEADLINE_EPOCH_MS')],
 ['pass rollback',runner.includes('restorePassSnapshot')&&runner.includes('aider-pass-snapshot')],
 ['scope enforcement',runner.includes('unauthorized KNT modified paths')],
 ['diff verification',runner.includes("['diff','--check']")],
 ['build verification',runner.includes("['run','build']")],
 ['no automatic commits',runner.includes('--no-auto-commits')&&runner.includes('--no-dirty-commits')],
 ['business safety',runner.includes('evidence')&&runner.includes('human-invoice-review')],
 ['local model',runner.includes('LOCAL_AI_MODEL')&&runner.includes('ollama_chat')]
];
for(const [name,ok] of checks)if(!ok)failures.push(name);
if(failures.length){console.error('KNT file contract FAIL:\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1);}
console.log(`KNT file contract PASS: ${objectives.length} objectives; ${objectives.reduce((n,o)=>n+(o.files?.length||0),0)} exact scoped paths; proven Aider engine ready.`);
