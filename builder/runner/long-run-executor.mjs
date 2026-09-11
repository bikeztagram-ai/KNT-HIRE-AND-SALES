#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {appendAudit,verifyAuditLog} from '../quality/audit-log.mjs';
const root=process.cwd(),minutes=Math.max(15,Math.min(360,Number.parseInt(process.env.BUILDER_MAX_MINUTES||'30',10))),started=Date.now();let cycle=0,verified=0,failures=0;
const left=()=>Math.max(0,minutes-(Date.now()-started)/60000);const statePath=path.join(root,'builder','working','long-run-state.json');
function write(status){fs.mkdirSync(path.dirname(statePath),{recursive:true});fs.writeFileSync(statePath,JSON.stringify({version:1,status,minutes,cycle,verified,failures,elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),remainingMinutes:Number(left().toFixed(2)),updatedAt:new Date().toISOString()},null,2)+'\n')}
if(!verifyAuditLog().valid)process.exit(3);appendAudit('knt-long-run-started',{minutes,model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'});write('running');
while(left()>1){cycle++;const slice=Math.min(15,Math.max(1,Math.floor(left())));const env={...process.env,BUILDER_MAX_MINUTES:String(slice),AUTOBOT_FEATURE_MAX_ATTEMPTS:process.env.AUTOBOT_FEATURE_MAX_ATTEMPTS||'2',AUTOBOT_FEATURE_MAX_EDITS:process.env.AUTOBOT_FEATURE_MAX_EDITS||'2'};const r=spawnSync(process.execPath,['builder/runner/feature-brain.mjs'],{cwd:root,stdio:'inherit',env});if(r.status===0){verified++;failures=0}else failures++;appendAudit('knt-cycle-finished',{cycle,status:r.status,verified,failures,remainingMinutes:Number(left().toFixed(2))});write(failures>=3?'blocked':'running');if(failures>=3)break;if(left()>1)spawnSync('sleep',['2'])}
const status=failures>=3?'blocked':'finished';appendAudit('knt-long-run-finished',{cycle,verified,failures,elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2))});write(status);if(!verifyAuditLog().valid)process.exit(3);process.exit(status==='blocked'?2:0);
