#!/usr/bin/env node
/** KNT Hire & Sales AutoBot — proven Aider repository-map engine, KNT-specific brain. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {loadAiderState,saveAiderState} from './aider-state-store.mjs';
const root=process.cwd(),protocol=process.env.AUTOBOT_FEATURE_PROTOCOL||'aider-repo-map-v4',productMarker='KNT-HIRE-AND-SALES';
const maxPasses=Math.max(1,Math.min(3,Number(process.env.AUTOBOT_FEATURE_PASSES||2)));
const rawModel=process.env.AUTOBOT_AIDER_MODEL||process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b';
const model=rawModel.includes('/')?rawModel:`ollama_chat/${rawModel}`;
const requestedMinutes=Math.max(1,Number.parseInt(process.env.BUILDER_MAX_MINUTES||'15',10));
const configured=Number.parseInt(process.env.AUTOBOT_FEATURE_DEADLINE_EPOCH_MS||'',10);
const deadline=Number.isFinite(configured)&&configured>Date.now()?configured:Date.now()+requestedMinutes*60000;
const normalDeadline=Number.parseInt(process.env.AUTOBOT_FEATURE_NORMAL_DEADLINE_EPOCH_MS||String(deadline),10);
const perCallMaxMs=Math.max(30000,Number.parseInt(process.env.AUTOBOT_AIDER_CALL_TIMEOUT_MS||String(6*60*60*1000),10));
const statePath=path.join(root,'builder/working/aider-feature-brain-state.json');
const directivePath=path.join(root,'builder/brain/knt-autobot-product-directive.md');
let directive='';try{directive=fs.readFileSync(directivePath,'utf8').trim();}catch{}
const run=(cmd,args,options={})=>spawnSync(cmd,args,{cwd:root,encoding:'utf8',stdio:'inherit',...options});
function loadObjectives(){const file=path.join(root,'builder/brain/feature-objectives.json');try{return JSON.parse(fs.readFileSync(file,'utf8')).objectives||[]}catch(error){try{if(execFileSync('git',['status','--short','--',file],{cwd:root,encoding:'utf8'}).trim()){execFileSync('git',['restore','--','builder/brain/feature-objectives.json'],{cwd:root,stdio:'inherit'});return JSON.parse(fs.readFileSync(file,'utf8')).objectives||[]}}catch{}throw new Error(`KNT objectives invalid: ${error.message}`)}}
const objectives=loadObjectives(),explicitObjectiveId=String(process.env.AUTOBOT_SPECIALIST_OBJECTIVE_ID||'').trim(),loaded=loadAiderState(statePath,{protocol,completed:[],failed:[],runs:0,inProgress:null}),state=loaded.state;
const remainingMs=()=>Math.max(0,deadline-Date.now()),normalRemainingMs=()=>Math.max(0,normalDeadline-Date.now());
function objective(){const done=new Set(state.completed||[]),resume=state.inProgress?.id;if(resume){const r=objectives.find(o=>o?.id===resume&&!done.has(o.id)&&o?.enabled!==false);if(r)return r}return objectives.find(o=>o?.enabled!==false&&!done.has(o.id)&&(!o.dependsOn||o.dependsOn.every(d=>done.has(d))))||null}
function scopedFiles(o){return Array.isArray(o?.files)?o.files.filter(Boolean):[]}
function promptFor(o,pass){const files=scopedFiles(o),prior=state.inProgress?.id===o.id?Number(state.inProgress.completedPasses||0):0;return[
'You are the senior autonomous implementation engineer for KNT Hire & Sales, a forklift hire, sales and service business.',
'This repository is KNT-HIRE-AND-SALES. Never use Bikeztagram product code, names, objectives, data, prompts or business context.',
`Objective: ${o.title||o.id}`,`Pass ${pass} of ${maxPasses}.`,
pass>1?'ADVERSARIAL REVIEW PASS: inspect the existing implementation critically for regressions, dead/unwired logic, arbitrary limits, weak edge cases and changes that pass checks but fail the real product requirement. Fix justified weaknesses; do not churn.':'PRIMARY IMPLEMENTATION PASS: understand the current decision path, then make one coherent production-quality improvement.',
prior>0?`Resume after ${prior} verified pass(es); preserve them and continue unfinished work.`:'This objective is new.',
`Acceptance criteria: ${JSON.stringify(o.acceptance||[])}`,`Objective-scoped KNT files (EXACT paths): ${files.join(', ')}`,`Constraints: ${JSON.stringify(o.constraints||[])}`,
directive?`KNT PRODUCT DIRECTIVE:\n${directive}`:'KNT product directive unavailable; follow the objective and existing KNT contracts.',
'Inspect supplied KNT files and relevant callers/contracts before editing.',
'ONLY the supplied objective files may be modified. Do not modify builder code, workflows, secrets, package/dependency manifests, generated output or unrelated paths.',
'Never rename, substitute, guess or invent a KNT filename. Exact supplied paths are authoritative.',
'Preserve Supabase/Auth, shared cloud data, original evidence, compliance dates, supplier source paperwork, human invoice review, auditability and existing safety contracts.',
'Do not invent OCR, certificates, supplier records, customers, payments or other business data.',
'Run the narrowest relevant verification. Actually edit the supplied files; do not merely describe changes.',
'Do not merge, deploy or create a pull request.'
].join('\n')}
function tracked(){try{return execFileSync('git',['status','--short','--untracked-files=all'],{cwd:root,encoding:'utf8'}).split(/\r?\n/).filter(Boolean).map(x=>x.slice(3).trim()).filter(Boolean).filter(p=>!/^\.aider\.(chat\.history\.md|input\.history)$/.test(p)&&p!=='.aider.tags.cache.v4'&&!p.startsWith('.aider.tags.cache.v4/')&&!/^builder\/working\/aider-pass-snapshot-.*\.patch$/.test(p))}catch{return[]}}
function snapshot(files){const f=path.join(root,'builder/working',`aider-pass-snapshot-${process.pid}.patch`);fs.mkdirSync(path.dirname(f),{recursive:true});try{fs.writeFileSync(f,execFileSync('git',['diff','--binary','--',...files],{cwd:root,encoding:'utf8'}))}catch{}return f}
function cleanupAiderArtifacts(){for(const f of ['.aider.chat.history.md','.aider.input.history','.aider.tags.cache.v4']){try{execFileSync('git',['clean','-fd','--',f],{cwd:root,stdio:'ignore'})}catch{}}}
function restore(o,s){cleanupAiderArtifacts();for(const f of scopedFiles(o)){try{execFileSync('git',['restore','--worktree','--',f],{cwd:root,stdio:'inherit'})}catch{}try{execFileSync('git',['clean','-fd','--',f],{cwd:root,stdio:'inherit'})}catch{}}try{if(fs.existsSync(s)&&fs.statSync(s).size)execFileSync('git',['apply','--whitespace=nowarn',s],{cwd:root,stdio:'inherit'})}catch(e){console.error(`[aider] rollback restore failed: ${e.message}`)}try{fs.unlinkSync(s)}catch{}}
function scopeGate(before,o){const allowed=new Set(scopedFiles(o)),bad=tracked().filter(p=>!before.has(p)&&!allowed.has(p));if(bad.length){for(const f of bad){try{execFileSync('git',['restore','--',f],{cwd:root,stdio:'inherit'})}catch{}try{execFileSync('git',['clean','-fd','--',f],{cwd:root,stdio:'inherit'})}catch{}}throw new Error(`Aider modified files outside KNT objective scope: ${bad.join(', ')}`)}}
function verify(){execFileSync('git',['diff','--check'],{cwd:root,stdio:'inherit'});const left=remainingMs();if(left<35000)throw new Error('insufficient budget for KNT build verification');const r=run('npm',['run','build'],{timeout:Math.min(120000,left-5000)});if(r.error||r.status!==0)throw new Error(`KNT build failed: ${r.status??'error'}`)}
const o=explicitObjectiveId ? objectives.find(item=>item?.id===explicitObjectiveId&&item?.enabled!==false) : objective();if(!o){const status=explicitObjectiveId?'unknown-specialist-objective':'no-eligible-objective';console.log(JSON.stringify({ok:true,protocol,status,product:productMarker,objective:explicitObjectiveId||null}));process.exit(explicitObjectiveId?1:0)}
const files=scopedFiles(o);if(!files.length||!files.every(f=>f.startsWith('src/'))){console.error(`[aider] refusing KNT objective ${o.id}: exact src/ scope required`);process.exit(1)}
const cwd=path.join(root,'src'),aiderFiles=files.map(f=>f.slice(4)),prior=state.inProgress?.id===o.id?Number(state.inProgress.completedPasses||0):0;let success=false;
for(let pass=Math.min(maxPasses,prior+1);pass<=maxPasses;pass++){if(remainingMs()<35000||(normalRemainingMs()<35000&&pass>prior+1))break;state.runs=(state.runs||0)+1;const before=new Set(tracked()),snap=snapshot(files),timeout=Math.min(perCallMaxMs,Math.max(30000,remainingMs()-5000)),apiTimeout=Math.max(30,Math.floor(timeout/1000));const args=[`--model=${model}`,`--timeout=${apiTimeout}`,'--yes-always','--no-auto-commits','--no-dirty-commits','--no-gitignore','--no-show-model-warnings','--map-tokens=768','--subtree-only','--message',promptFor(o,pass),...aiderFiles];const r=spawnSync('aider',args,{cwd,encoding:'utf8',stdio:'inherit',timeout});if(r.error||r.status!==0){restore(o,snap);state.failed=[...(state.failed||[]),{id:o.id,pass,code:r.error?.code||r.status||'process-error'}];saveAiderState(statePath,state);continue}try{scopeGate(before,o);cleanupAiderArtifacts();verify();state.inProgress={id:o.id,completedPasses:pass,lastVerifiedAt:new Date().toISOString(),remainingPasses:Math.max(0,maxPasses-pass)};saveAiderState(statePath,state);try{fs.unlinkSync(snap)}catch{}success=pass>=maxPasses;if(success)break}catch(e){console.error(`[aider] KNT pass ${pass} failed verification: ${e.message}`);restore(o,snap);state.failed=[...(state.failed||[]),{id:o.id,pass,code:'verification',error:e.message}];saveAiderState(statePath,state);if(remainingMs()<35000)break}}
if(success){state.completed=[...(state.completed||[]),o.id];state.lastSuccess={id:o.id,at:new Date().toISOString()};state.inProgress=null}else if(state.inProgress?.id===o.id)state.inProgress={...state.inProgress,remainingPasses:Math.max(0,maxPasses-Number(state.inProgress.completedPasses||0)),checkpointedAt:new Date().toISOString()};state.protocol=protocol;state.lastRunAt=new Date().toISOString();saveAiderState(statePath,state);console.log(JSON.stringify({ok:success,protocol,product:productMarker,objective:o.id,passes:maxPasses,model,exactFiles:files,resumable:!success&&state.inProgress?.id===o.id,adversarialReviewEnabled:maxPasses>1,productDirectiveLoaded:Boolean(directive)}));process.exit(success?0:1);
