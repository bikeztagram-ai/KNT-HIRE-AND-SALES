#!/usr/bin/env node
/** KNT file contract: exact objective paths are the source of truth for the local Qwen engineer. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
const objectives=JSON.parse(read('builder/brain/feature-objectives.json')).objectives||[];
const tracked=new Set(execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));
const paths=new Set();

for(const objective of objectives){
  if(!objective?.id){failures.push('objective without id');continue;}
  if(!Array.isArray(objective.files)||!objective.files.length){failures.push(`${objective.id}: missing exact files[]`);continue;}
  for(const file of objective.files){
    paths.add(file);
    if(!tracked.has(file))failures.push(`${objective.id}: exact file is not tracked: ${file}`);
    if(!file.startsWith('src/'))failures.push(`${objective.id}: product objective file must be under src/: ${file}`);
    if(file.includes('..')||file.includes('\\'))failures.push(`${objective.id}: unsafe objective path: ${file}`);
  }
}

const runner=read('builder/runner/feature-brain.mjs');
const checks=[
  ['loads KNT objectives',runner.includes("builder/brain/feature-objectives.json")],
  ['uses objective file list',runner.includes('obj.files')&&runner.includes('allowed=new Set(obj.files')],
  ['uses KNT repository intelligence',runner.includes("builder/working/repository-map.json")&&runner.includes('refreshRepoMap')],
  ['uses exact filename authority',runner.includes('repository path and filename supplied for each file are authoritative')],
  ['strict file scope',runner.includes('Modify ONLY the exact KNT product files')&&runner.includes('out-of-scope KNT edit')],
  ['exact search anchors',runner.includes('must occur exactly once')],
  ['durable retry state',runner.includes('state.failed')&&runner.includes('resetFailedEdits')],
  ['structured model output',runner.includes('format:editSchema')],
  ['local Qwen only',runner.includes('local KNT Qwen is not ready; refusing paid fallback')],
  ['no unrelated builder edit request',!runner.includes('Modify builder infrastructure')||runner.includes('Do not modify builder infrastructure')]
];
for(const [name,ok] of checks)if(!ok)failures.push(name);
if(failures.length){console.error('KNT file contract FAIL:\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1);}
console.log(`KNT file contract PASS: ${objectives.length} objectives, ${paths.size} exact scoped product paths, repository-aware Qwen engineer ready.`);
