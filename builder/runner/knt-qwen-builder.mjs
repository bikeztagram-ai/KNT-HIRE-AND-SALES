#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const minutes=Math.max(15,Math.min(Number(process.env.BUILDER_MAX_MINUTES||30),120));
const passes=Math.max(1,Math.min(Number(process.env.BUILDER_MAX_PASSES||2),8));
const model=process.env.LOCAL_AI_MODEL||'qwen2.5-coder:7b';
const host=process.env.OLLAMA_HOST||'http://127.0.0.1:11434';
const base=process.env.BUILDER_BASE_BRANCH||'feature/knt-v1-foundation';
const branch=process.env.BUILDER_WORKING_BRANCH||`autonomous-builder/knt-${process.env.GITHUB_RUN_ID||Date.now()}`;
const started=Date.now();
const left=()=>Math.max(0,minutes-(Date.now()-started)/60000);
const run=(cmd,args,opts={})=>execFileSync(cmd,args,{cwd:root,encoding:'utf8',stdio:'pipe',...opts});
const read=p=>fs.existsSync(path.join(root,p))?fs.readFileSync(path.join(root,p),'utf8'):'';
const queue=JSON.parse(read('config/autonomous-builder-queue.json'));
const objectives=queue.items||[];
const fileMap={
 'KNT-002':['src/App.jsx','src/FleetPage.jsx','src/ForkliftDetailPage.jsx','src/NewJobPage.jsx','src/JobDetailPage.jsx','src/lib/data.js','src/styles.css'],
 'KNT-003':['src/ServicePage.jsx','src/ForkliftDetailPage.jsx','src/lib/data.js','src/styles.css'],
 'KNT-004':['src/PartsSuppliersPage.jsx','src/JobDetailPage.jsx','src/lib/data.js','src/styles.css'],
 'KNT-005':['src/InvoicePage.jsx','src/lib/data.js','src/App.jsx','src/styles.css'],
 'KNT-006':['src/NewJobPage.jsx','src/JobDetailPage.jsx','src/lib/data.js','src/styles.css'],
 'KNT-007':['src/AuthGate.jsx','src/lib/data.js','src/App.jsx','supabase/schema.sql'],
 'KNT-008':['src/ServicePage.jsx','src/ForkliftDetailPage.jsx','src/App.jsx','src/lib/data.js','src/styles.css']
};
function eligible(){return objectives.filter(o=>o.state==='ready').sort((a,b)=>(b.priority||0)-(a.priority||0));}
function context(files){return files.map(f=>{const s=read(f);return s?`===== ${f} =====\n${s.length>14000?s.slice(0,14000)+'\n...[trimmed]':s}`:''}).filter(Boolean).join('\n\n');}
function parseModel(stdout){let last='';for(const line of stdout.split(/\r?\n/)){try{const j=JSON.parse(line);if(j.message?.content)last=j.message.content}catch{}}if(!last)throw new Error('Qwen returned no structured response');const fenced=last.replace(/^```json\s*/,'').replace(/```$/,'').trim();return JSON.parse(fenced);}
function modelCall(obj,files,repair){const failure=repair?`Previous verification failure:\n${repair}`:'';const prompt=`You are the autonomous production engineer for KNT Hire & Sales, a forklift service business management app. Work only on the current repository.\n\nOBJECTIVE ${obj.id}: ${obj.recipe}\nACCEPTANCE:\n${(obj.acceptance||[]).map(x=>'- '+x).join('\n')}\n\nRULES:\n- Make real production changes, not explanations.\n- Preserve existing contracts and working behaviour.\n- Never fabricate OCR/AI results. Preserve original paper evidence.\n- Never auto-send invoices.\n- Do not modify .github/workflows/** or builder/**.\n- Use the smallest coherent change that clearly advances the objective.\n- Return ONLY JSON: {\"edits\":[{\"file\":\"...\",\"search\":\"exact source block\",\"replace\":\"complete replacement block\"}]}\n- Maximum 2 edits. Each search must match exactly once. Do not rewrite whole files.\n- If the objective is already satisfied, make a useful adjacent improvement instead.\n${failure}\n\nFILES TO INSPECT:\n${files.join(', ')}\n\n${context(files)}`;
const body=JSON.stringify({model,stream:false,keep_alive:'15m',format:{type:'object',properties:{edits:{type:'array',minItems:1,maxItems:2,items:{type:'object',properties:{file:{type:'string'},search:{type:'string'},replace:{type:'string'}},required:['file','search','replace'],additionalProperties:false}}},required:['edits'],additionalProperties:false},options:{temperature:0,num_ctx:16384,num_predict:2600},messages:[{role:'system',content:'You are a careful senior React/JavaScript engineer. Output only JSON search-replace edits.'},{role:'user',content:prompt}]});
const out=run('curl',['-sS','--fail','--connect-timeout','15','--max-time',String(Math.max(60,Math.floor(left()*60))),`${host}/api/chat`,'-H','Content-Type: application/json','-d',body]);
return parseModel(out);
}
function apply(payload,allowed){if(!payload?.edits?.length||payload.edits.length>2)throw new Error('invalid edit list');const seen=new Set();for(const e of payload.edits){if(!allowed.includes(e.file))throw new Error(`out-of-scope file ${e.file}`);if(seen.has(e.file))throw new Error(`duplicate file edit ${e.file}`);seen.add(e.file);const full=read(e.file);if(full.split(e.search).length-1!==1)throw new Error(`search block for ${e.file} must match exactly once`);fs.writeFileSync(path.join(root,e.file),full.replace(e.search,e.replace));}}
function verify(){for(const p of run('git',['diff','--name-only','--diff-filter=ACM']).split(/\r?\n/).filter(Boolean).filter(p=>/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(p)))run(process.execPath,['--check',p]);run('git',['diff','--check']);run('npm',['run','build'],{timeout:Math.min(900000,Math.max(60000,Math.floor(left()*60000)))});}
function reset(){run('git',['reset','--hard','HEAD']);run('git',['clean','-fd','-e','.git']);}
async function main(){
 console.log(`[autobot] KNT Qwen brain starting: model=${model}, budget=${minutes}m, passes=${passes}`);
 if(process.env.LOCAL_AI_READY!=='1')throw new Error('LOCAL_AI_READY=1 required');
 run('git',['fetch','origin',base]);run('git',['checkout','-B',branch,`origin/${base}`]);
 const targets=eligible();let done=0;let lastFailure='';
 for(const obj of targets){if(left()<2||done>=passes)break;const files=fileMap[obj.id]||['src/App.jsx','src/lib/data.js','src/styles.css'];
   for(let attempt=1;attempt<=2&&left()>2&&done<passes;attempt++){
     console.log(`[autobot] ${obj.id} attempt ${attempt}; ${left().toFixed(1)}m left; model=${model}`);
     try{const payload=modelCall(obj,files,lastFailure);apply(payload,files);verify();done++;lastFailure='';console.log(`[autobot] VERIFIED ${obj.id}`);break}
     catch(e){lastFailure=String(e?.message||e);console.log(`[autobot] repair required: ${lastFailure}`);reset();if(attempt===2)console.log(`[autobot] objective ${obj.id} skipped after two failed attempts`)}
   }
 }
 const status=run('git',['status','--short']).trim();
 if(status){run('git',['config','user.name','KNT Qwen Autonomous Builder']);run('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);run('git',['add','-A']);run('git',['commit','-m',`builder: KNT Qwen checkpoint ${process.env.GITHUB_RUN_ID||''}`]);run('git',['push','--set-upstream','origin',branch]);console.log(`[autobot] pushed ${branch}`)}else console.log('[autobot] no verified changes to publish');
 console.log(`[autobot] finished: verifiedObjectives=${done}, elapsed=${((Date.now()-started)/60000).toFixed(1)}m`);
}
main().catch(e=>{console.error(`[autobot] FATAL: ${e.message}`);process.exit(1)});
