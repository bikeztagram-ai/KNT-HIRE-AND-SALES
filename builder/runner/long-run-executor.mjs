#!/usr/bin/env node
/** KNT sustained AutoBot: proven Bikeztagram Aider/Qwen feature loop with resumable state. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { appendAudit, verifyAuditLog } from '../quality/audit-log.mjs';

const root=process.cwd();
const requestedMinutes=Math.max(15,Math.min(360,Number.parseInt(process.env.BUILDER_MAX_MINUTES||'30',10)));
const grace=Math.max(0,Math.min(5,Number.parseInt(process.env.AUTOBOT_FINISH_GRACE_MINUTES||'5',10)));
const sliceMinutes=Math.max(5,Math.min(20,Number.parseInt(process.env.AUTOBOT_FEATURE_SLICE_MINUTES||'15',10)));
const maxCycles=Math.max(1,Math.min(24,Number.parseInt(process.env.AUTOBOT_MAX_FEATURE_CYCLES||'24',10)));
const started=Date.now(),normalDeadline=started+requestedMinutes*60000,hardDeadline=normalDeadline+grace*60000;
const statePath=path.join(root,'builder','working','long-run-state.json');
const remaining=()=>Math.max(0,hardDeadline-Date.now());
const normalRemaining=()=>Math.max(0,normalDeadline-Date.now());
const write=(status,cycles,successes,failures)=>{fs.mkdirSync(path.dirname(statePath),{recursive:true});fs.writeFileSync(statePath,JSON.stringify({schemaVersion:6,status,engine:'aider-repo-map-v3',model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',requestedMinutes,finishGraceMinutes:grace,featureSliceMinutes:sliceMinutes,maxCycles,cycles,successes,failures,startedAt:new Date(started).toISOString(),normalDeadline:new Date(normalDeadline).toISOString(),hardDeadline:new Date(hardDeadline).toISOString(),elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),remainingMinutes:Number((remaining()/60000).toFixed(2)),updatedAt:new Date().toISOString()},null,2)+'\n')};
const runFeature=()=>{const timeout=Math.max(60000,Math.min(900000,remaining()-5000));const env={...process.env,AUTOBOT_FEATURE_ENGINE:'aider',AUTOBOT_FEATURE_PROTOCOL:'aider-repo-map-v3',AUTOBOT_FEATURE_DEADLINE_EPOCH_MS:String(hardDeadline),AUTOBOT_FEATURE_NORMAL_DEADLINE_EPOCH_MS:String(normalDeadline),AUTOBOT_AIDER_MODEL:process.env.AUTOBOT_AIDER_MODEL||`ollama_chat/${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}`,AUTOBOT_FEATURE_PASSES:'1',AUTOBOT_AIDER_CALL_TIMEOUT_MS:String(Math.max(30000,Math.min(900000,timeout-5000)))};return spawnSync(process.execPath,['builder/runner/aider-feature-brain.mjs'],{cwd:root,stdio:'inherit',env,timeout});};

if(!verifyAuditLog().valid)process.exit(3);
let cycles=0,successes=0,failures=0;
write('running',0,0,0);
appendAudit('knt-long-run-started',{requestedMinutes,grace,sliceMinutes,maxCycles,engine:'aider',protocol:'aider-repo-map-v3'});
while(normalRemaining()>35000&&remaining()>60000&&cycles<maxCycles){
  cycles++;
  const before=fs.existsSync(path.join(root,'builder/working/aider-feature-brain-state.json'))?fs.readFileSync(path.join(root,'builder/working/aider-feature-brain-state.json',''),'utf8'):'';
  const slice=Math.min(sliceMinutes,Math.max(1,Math.floor(normalRemaining()/60000)));
  console.log(`[autobot] KNT proven Aider/Qwen cycle ${cycles}/${maxCycles}: ${slice}m slice; model=${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}`);
  appendAudit('knt-cycle-started',{cycle:cycles,slice,model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'});
  const r=runFeature();
  const after=fs.existsSync(path.join(root,'builder/working/aider-feature-brain-state.json'))?fs.readFileSync(path.join(root,'builder/working/aider-feature-brain-state.json',''),'utf8'):'';
  const changed=after!==before;
  if(r.status===0&&changed){successes++;failures=0;appendAudit('knt-cycle-verified',{cycle:cycles,successes});}
  else{failures++;appendAudit('knt-cycle-finished',{cycle:cycles,status:r.status,changed,failures});}
  write('running',cycles,successes,failures);
  if(remaining()>60000)spawnSync('sleep',['2'],{timeout:5000});
}
const status='finished';
write(status,cycles,successes,failures);
appendAudit('knt-long-run-finished',{cycles,successes,failures,elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),status,engine:'aider',protocol:'aider-repo-map-v3'});
if(!verifyAuditLog().valid)process.exit(3);
console.log(`[autobot] KNT proven Aider/Qwen run finished: cycles=${cycles}, successful passes=${successes}, failures=${failures}, elapsed=${((Date.now()-started)/60000).toFixed(1)}m`);
process.exit(0);
