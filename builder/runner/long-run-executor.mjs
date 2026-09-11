#!/usr/bin/env node
/** KNT sustained AutoBot controller using the proven Bikeztagram Aider + local Qwen engine. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const requestedMinutes=Math.max(15,Math.min(360,Number.parseInt(process.env.BUILDER_MAX_MINUTES||'30',10)));
const finishGrace=Math.max(0,Math.min(5,Number.parseInt(process.env.AUTOBOT_FINISH_GRACE_MINUTES||'5',10)));
const featureSlice=Math.max(5,Math.min(30,Number.parseInt(process.env.AUTOBOT_FEATURE_SLICE_MINUTES||'15',10)));
const maxCycles=Math.max(1,Math.min(24,Number.parseInt(process.env.AUTOBOT_MAX_FEATURE_CYCLES||'24',10)));
const passes=Math.max(1,Math.min(2,Number.parseInt(process.env.AUTOBOT_FEATURE_PASSES_PER_SLICE||'2',10)));
const started=Date.now(),normalDeadline=started+requestedMinutes*60000,hardDeadline=normalDeadline+finishGrace*60000;
const statePath=path.join(root,'builder','working','long-run-state.json');
const run=(cmd,args,opts={})=>spawnSync(cmd,args,{cwd:root,stdio:'inherit',env:{...process.env,...(opts.env||{})},timeout:opts.timeout});
function remaining(){return Math.max(0,hardDeadline-Date.now());}
function normalRemaining(){return Math.max(0,normalDeadline-Date.now());}
function write(status,cycles,successes,failures){fs.mkdirSync(path.dirname(statePath),{recursive:true});fs.writeFileSync(statePath,JSON.stringify({schemaVersion:4,status,engine:'aider',protocol:'aider-repo-map-v3',model:process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b',requestedMinutes,finishGraceMinutes:finishGrace,featureSliceMinutes:featureSlice,passes,cycles,successes,failures,startedAt:new Date(started).toISOString(),normalDeadline:new Date(normalDeadline).toISOString(),hardDeadline:new Date(hardDeadline).toISOString(),elapsedMinutes:Number(((Date.now()-started)/60000).toFixed(2)),remainingMinutes:Number((remaining()/60000).toFixed(2)),updatedAt:new Date().toISOString()},null,2)+'\n');}
let cycles=0,successes=0,failures=0;write('running',0,0,0);
while(remaining()>60000&&normalRemaining()>30000&&cycles<maxCycles){cycles++;const slice=Math.min(featureSlice,Math.max(1,Math.floor(normalRemaining()/60000)));console.log(`[autobot] KNT Aider/Qwen cycle ${cycles}/${maxCycles}: ${slice}m slice; model=${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}; passes=${passes}`);const env={...process.env,BUILDER_MAX_MINUTES:String(slice),AUTOBOT_FEATURE_PASSES:String(passes),AUTOBOT_AIDER_MODEL:process.env.AUTOBOT_AIDER_MODEL||`ollama_chat/${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}`,AUTOBOT_FEATURE_DEADLINE_EPOCH_MS:String(hardDeadline),AUTOBOT_FEATURE_NORMAL_DEADLINE_EPOCH_MS:String(normalDeadline),AUTOBOT_AIDER_CALL_TIMEOUT_MS:String(Math.max(60000,Math.min(20*60000,remaining()-5000)))};const r=run(process.execPath,['builder/runner/aider-feature-brain.mjs'],{env,timeout:Math.max(60000,remaining()-5000)});if(r.status===0){successes++;failures=0;}else{failures++;}write(failures>=3?'recoverable-failure':'running',cycles,successes,failures);if(failures>=3){console.log('[autobot] three consecutive Aider failures; stopping safely for human inspection.');break;}if(normalRemaining()>60000&&remaining()>60000)run('sleep',['2'],{timeout:5000});}
const status=failures>=3?'blocked':'finished';write(status,cycles,successes,failures);console.log(`[autobot] KNT sustained Aider/Qwen run finished: cycles=${cycles}, successful feature passes=${successes}, failures=${failures}, elapsed=${((Date.now()-started)/60000).toFixed(1)}m, model=${process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b'}`);process.exit(failures>=3?2:0);
