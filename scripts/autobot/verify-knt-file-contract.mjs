#!/usr/bin/env node
/** KNT-specific file contract: exact objective paths are the source of truth for Aider. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const failures=[];
const objectives=JSON.parse(read('builder/brain/feature-objectives.json')).objectives||[];
const tracked=new Set(execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));
const forbidden=/bikeztagram|gta\s*vi|bikeztagram-ai-build/i;
const paths=new Set();

for(const objective of objectives){
  if(!objective?.id){failures.push('objective without id');continue;}
  if(!Array.isArray(objective.files)||!objective.files.length){failures.push(`${objective.id}: missing exact files[]`);continue;}
  for(const file of objective.files){
    paths.add(file);
    if(!tracked.has(file))failures.push(`${objective.id}: file is not tracked/existing: ${file}`);
    if(forbidden.test(file))failures.push(`${objective.id}: forbidden non-KNT filename/path: ${file}`);
  }
}

const runner=read('builder/runner/aider-feature-brain.mjs');
const checks=[
  ['loads KNT objectives',runner.includes("builder/brain/feature-objectives.json")],
  ['uses exact objective file list',runner.includes('scopedFiles(obj)')&&runner.includes('const aiderFiles=')],
  ['passes exact files to Aider',runner.includes('...aiderFiles')],
  ['uses repo-aware subtree mode',runner.includes('--subtree-only')&&runner.includes('--map-tokens=512')],
  ['KNT prompt identity',runner.includes('KNT Hire & Sales autonomous feature engineer')],
  ['exact filename authority',runner.includes('Never rename, substitute, guess or invent a KNT filename')],
  ['strict file scope',runner.includes('ONLY files you may modify')],
  ['exact search anchors',runner.includes('must occur exactly once')],
  ['no Bikeztagram identity',!forbidden.test(runner)]
];
for(const [name,ok] of checks)if(!ok)failures.push(name);
if(failures.length){console.error('KNT file contract FAIL:\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1);}
console.log(`KNT file contract PASS: ${objectives.length} objectives, ${paths.size} exact scoped product paths; no Bikeztagram paths/references in the KNT Aider feature engineer.`);
