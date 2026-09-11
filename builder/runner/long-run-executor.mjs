#!/usr/bin/env node
/** KNT sustained AutoBot: proven repository-aware Qwen feature loop with durable checkpoints. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { appendAudit, verifyAuditLog } from '../quality/audit-log.mjs';

const root=process.cwd();
const requestedMinutes=Math.max(15,Math.min(360,Number.parseInt(process.env.BUILDER_MAX_MINUTES||'30',10)));
const grace=Math.max(0,Math.min(5,Number.parseInt(process.env.AUTOBOT_FINISH_GRACE_MINUTES||'5',10)));
const featureSliceMinutes=Math.max(5,Math.min(20,Number.parseInt(process.env.AUTOBOT_FEATURE_SLICE_MINUTES||'15',10)));
const maxCycles=Math.max(1,Math.min(24,Number.parseInt(process.env.AUTOBOT_MAX_FEATURE_CYCLES||'24',10)));
const maxNoProgress=Math.max(1,Math.min(3,Number.parseInt(process.env.AUTOBOT_MAX_NO_PROGRESS_ITERATIONS||'2',10)));
const started=Date.now(),normalDeadline=started+requestedMinutes*60000,hardDeadline=normalDeadline+grace*60000;
const statePath=path.join(root,'builder','working','long-run-state.json');
const remaining=()=>Math.max(0,hardDeadline-Date.now());
const normalRemaining=()=>Math.max(0,normalDeadline-Date.now());
const git=(args,opts={})=>execFileSync('git',args,{cwd:root,encoding:'utf8',...opts});
const productSnapshot=()=>{try{return git(['diff','--name-only','--','src','supabase','package.json']).trim()}catch{return''}};
function writeState(status,cycles,successes,failures,noProgress){
  fs.mkdirSync(path.dirname(statePath),{recursive:true});
  fs.writeFileSync(statePath,JSON.stringify({schemaVersion:8,status,engine:'structured-search-replace-v3',model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',requestedMinutes,finishGraceMinutes:grace,featureSliceMinutes,maxCycles,maxNoProgress,cycles,successes,failures,consecutiveNoProgress:noProgress,checkpointBranch:process.env.BUILDER_WORKING_BRANCH||null,startedAt:new Date(started).toISOString(),normalDeadline:new Date(normalDeadline).toISOString(),hardDeadline:new Date(hardDeadline).toISOString(),elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),remainingMinutes:Number((remaining()/60000).toFixed(2)),updatedAt:new Date().toISOString()},null,2)+'\n');
}
function runFeature(slice){
  const env={...process.env,BUILDER_MAX_MINUTES:String(Math.max(1,slice)),LOCAL_AI_MODEL:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',AUTOBOT_FEATURE_PASSES:'1',AUTOBOT_FEATURE_MAX_ATTEMPTS:process.env.AUTOBOT_FEATURE_MAX_ATTEMPTS||'2',AUTOBOT_FEATURE_MAX_EDITS:process.env.AUTOBOT_FEATURE_MAX_EDITS||'2',AUTOBOT_FEATURE_DEADLINE_EPOCH_MS:String(hardDeadline),AUTOBOT_FEATURE_NORMAL_DEADLINE_EPOCH_MS:String(normalDeadline)};
  return spawnSync(process.execPath,['builder/runner/feature-brain.mjs'],{cwd:root,stdio:'inherit',env,timeout:Math.max(60000,remaining()-5000)});
}
function checkpoint(cycle){
  const changes=productSnapshot().split(/\r?\n/).filter(Boolean);
  if(!changes.length)throw new Error('verified KNT feature reported success but no product diff exists');
  const allowed=changes.every(p=>p.startsWith('src/')||p==='package.json'||p.startsWith('supabase/'));
  if(!allowed)throw new Error(`KNT checkpoint contains non-product path: ${changes.find(p=>!(p.startsWith('src/')||p==='package.json'||p.startsWith('supabase/')))||'unknown'}`);
  git(['add','--',...changes],{stdio:'inherit'});
  git(['commit','-m',`feat: KNT AutoBot verified feature checkpoint ${cycle}`],{stdio:'inherit'});
  appendAudit('knt-feature-checkpoint-committed',{cycle,changes,commit:git(['rev-parse','HEAD']).trim()});
}
if(!verifyAuditLog().valid)process.exit(3);
let cycles=0,successes=0,failures=0,noProgress=0;
writeState('running',0,0,0,0);
appendAudit('knt-long-run-started',{requestedMinutes,grace,featureSliceMinutes,maxCycles,maxNoProgress,engine:'structured-search-replace-v3',model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',checkpointBranch:process.env.BUILDER_WORKING_BRANCH||null});
while(normalRemaining()>35000&&remaining()>60000&&cycles<maxCycles){
  cycles++;
  const before=productSnapshot();
  const slice=Math.min(featureSliceMinutes,Math.max(1,Math.floor(normalRemaining()/60000)));
  appendAudit('knt-feature-cycle-started',{cycle:cycles,slice,model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'});
  console.log(`[autobot] KNT feature cycle ${cycles}/${maxCycles}: ${slice}m slice; model=${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}`);
  const result=runFeature(slice);
  const after=productSnapshot();
  const changed=after!==before;
  if(changed){
    try{checkpoint(cycles);successes++;noProgress=0;appendAudit('knt-feature-cycle-verified',{cycle:cycles,successes});}
    catch(error){failures++;noProgress++;appendAudit('knt-feature-checkpoint-failed',{cycle:cycles,error:error.message});console.error(`[autobot] KNT checkpoint failed: ${error.message}`);process.exit(2)}
  }else{
    failures++;noProgress++;appendAudit('knt-feature-cycle-no-progress',{cycle:cycles,status:result.status??1,noProgress,maxNoProgress});
  }
  writeState('running',cycles,successes,failures,noProgress);
  if(noProgress>=maxNoProgress){console.log(`[autobot] KNT safe stop: ${noProgress} consecutive no-progress cycles.`);break;}
  if(remaining()>60000)spawnSync('sleep',['2'],{timeout:5000});
}
const finished={cycles,successes,failures,consecutiveNoProgress:noProgress,elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),remainingMinutes:Number((remaining()/60000).toFixed(2)),engine:'structured-search-replace-v3',model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',checkpointBranch:process.env.BUILDER_WORKING_BRANCH||null};
writeState('finished',cycles,successes,failures,noProgress);
appendAudit('knt-long-run-finished',finished);
if(!verifyAuditLog().valid)process.exit(3);
console.log(`[autobot] KNT sustained run finished: cycles=${cycles}, verified product checkpoints=${successes}, no-progress=${failures}, elapsed=${finished.elapsedMinutes}m`);
if(successes===0)process.exit(1);
process.exit(0);
