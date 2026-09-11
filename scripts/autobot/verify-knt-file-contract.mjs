#!/usr/bin/env node
/** KNT file contract: objective paths and the local Qwen feature protocol are the source of truth. */
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
  ['uses objective file list',runner.includes('new Set(o.files||[])')&&runner.includes('allowed.has(e.file)')],
  ['uses KNT repository intelligence',runner.includes("builder/working/repository-map.json")&&runner.includes('function refresh()')],
  ['exact filename/path authority',runner.includes('objective files')&&runner.includes('o.files||[]')],
  ['strict file scope',runner.includes('Modify ONLY objective files')&&runner.includes('out-of-scope edit')],
  ['exact search anchors',runner.includes('SEARCH must be copied literally')&&runner.includes('count!==1')],
  ['durable retry state',runner.includes('state.failed')&&runner.includes('function reset()')],
  ['structured model output',runner.includes('const schema=')&&runner.includes('format:schema')],
  ['local Qwen only',runner.includes("LOCAL_AI_READY!=='1'")&&runner.includes('refusing paid fallback')],
  ['builder infrastructure protected',runner.includes('Never touch workflows, builder code, package manifests')]
];
for(const [name,ok] of checks)if(!ok)failures.push(name);
if(failures.length){console.error('KNT file contract FAIL:\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1);}
console.log(`KNT file contract PASS: ${objectives.length} objectives, ${paths.size} exact scoped product paths, repository-aware Qwen engineer ready.`);
