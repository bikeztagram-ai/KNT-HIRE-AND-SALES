#!/usr/bin/env node
/** KNT sustained controller: one small verified Qwen feature at a time, with durable progress and no-progress stops. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {appendAudit,verifyAuditLog} from '../quality/audit-log.mjs';
const root=process.cwd();
const requestedMinutes=Math.max(15,Math.min(360,Number.parseInt(process.env.BUILDER_MAX_MINUTES||'30',10)));
const grace=Math.max(0,Math.min(5,Number.parseInt(process.env.AUTOBOT_FINISH_GRACE_MINUTES||'5',10)));
const sliceMinutes=Math.max(3,Math.min(10,Number.parseInt(process.env.AUTOBOT_FEATURE_SLICE_MINUTES||'8',10)));
const maxCycles=Math.max(1,Math.min(24,Number.parseInt(process.env.AUTOBOT_MAX_FEATURE_CYCLES||'24',10)));
const started=Date.now(),normalDeadline=started+requestedMinutes*60000,hardDeadline=normalDeadline+grace*60000;
const statePath=path.join(root,'builder','working','long-run-state.json');
const remaining=()=>Math.max(0,hardDeadline-Date.now());
const normalRemaining=()=>Math.max(0,normalDeadline-Date.now());
const run=(cmd,args,opts={})=>spawnSync(cmd,args,{cwd:root,stdio:'inherit',env:{...process.env,...(opts.env||{})},timeout:opts.timeout});
const changedProduct=()=>{try{return execFileSync('git',['diff','--name-only','--','src','supabase','package.json'],{cwd:root,encoding:'utf8'}).split(/\r?\n/).filter(Boolean)}catch{return[]}};
function write(status,cycles,successes,failures,noProgress){fs.mkdirSync(path.dirname(statePath),{recursive:true});fs.writeFileSync(statePath,JSON.stringify({schemaVersion:5,status,engine:'qwen-structured-search-replace-v3',model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',requestedMinutes,finishGraceMinutes:grace,featureSliceMinutes:sliceMinutes,maxCycles,cycles,successes,failures,noProgress,startedAt:new Date(started).toISOString(),normalDeadline:new Date(normalDeadline).toISOString(),hardDeadline:new Date(hardDeadline).toISOString(),elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),remainingMinutes:Number((remaining()/60000).toFixed(2)),updatedAt:new Date().toISOString()},null,2)+'\n')}
if(!verifyAuditLog().valid)process.exit(3);
let cycles=0,successes=0,failures=0,noProgress=0;write('running',0,0,0,0);appendAudit('knt-long-run-started',{requestedMinutes,grace,sliceMinutes,maxCycles,engine:'qwen-structured-search-replace-v3'});
while(remaining()>60000&&normalRemaining()>30000&&cycles<maxCycles){
  cycles++;
  const before=new Set(changedProduct());
  const slice=Math.min(sliceMinutes,Math.max(1,Math.floor(normalRemaining()/60000)));
  console.log(`[autobot] KNT Qwen cycle ${cycles}/${maxCycles}: ${slice}m slice; model=${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}`);
  const env={...process.env,BUILDER_MAX_MINUTES:String(slice),LOCAL_AI_MODEL:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',OLLAMA_HOST:process.env.OLLAMA_HOST||'http://127.0.0.1:11434',AUTOBOT_FEATURE_MAX_ATTEMPTS:'2',AUTOBOT_FEATURE_MAX_EDITS:'2',AUTOBOT_FEATURE_DEADLINE_EPOCH_MS:String(hardDeadline)};
  const r=run(process.execPath,['builder/runner/feature-brain.mjs'],{env,timeout:Math.max(60000,remaining()-5000)});
  const after=changedProduct();
  const made=after.filter(p=>!before.has(p));
  if(r.status===0&&made.length){successes++;failures=0;noProgress=0;appendAudit('knt-cycle-verified',{cycle:cycles,changed:made,successes})}
  else{failures++;noProgress++;appendAudit('knt-cycle-no-progress',{cycle:cycles,status:r.status,changed:made,failures,noProgress});}
  write(noProgress>=2?'no-progress-stop':'running',cycles,successes,failures,noProgress);
  if(noProgress>=2){console.log('[autobot] two consecutive cycles produced no verified product progress; stopping safely.');break;}
  if(normalRemaining()>60000&&remaining()>60000)run('sleep',['2'],{timeout:5000});
}
const status=noProgress>=2?'blocked':'finished';
write(status,cycles,successes,failures,noProgress);appendAudit('knt-long-run-finished',{cycles,successes,failures,noProgress,elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),status});
if(!verifyAuditLog().valid)process.exit(3);
console.log(`[autobot] KNT sustained Qwen run finished: cycles=${cycles}, verified features=${successes}, failures=${failures}, elapsed=${((Date.now()-started)/60000).toFixed(1)}m`);
process.exit(status==='blocked'?2:0);
