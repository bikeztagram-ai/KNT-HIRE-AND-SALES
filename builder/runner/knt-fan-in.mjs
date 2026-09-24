#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const dir=path.join(root,"builder/working/fan-in");
fs.mkdirSync(dir,{recursive:true});
const input=process.env.KNT_HANDOFF_PATH||path.join(root,"builder/working/knt-specialist-handoff.json");
const handoff=fs.existsSync(input)?JSON.parse(fs.readFileSync(input,"utf8")):null;
const outcome=handoff||{status:"failed",specialistId:process.env.KNT_SPECIALIST_ID||null};
const ledgerPath=process.env.KNT_FAN_IN_LEDGER||path.join(dir,"knt-fan-in-ledger.json");
let ledger=fs.existsSync(ledgerPath)?JSON.parse(fs.readFileSync(ledgerPath,"utf8")):{schemaVersion:"knt-fan-in-ledger-v1",coordinationId:process.env.KNT_COORDINATION_ID||null,workers:[]};
ledger.workers=(ledger.workers||[]).filter(x=>x.specialistId!==outcome.specialistId);
ledger.workers.push({...outcome,recordedAt:new Date().toISOString()});
ledger.workers.sort((a,b)=>String(a.specialistId).localeCompare(String(b.specialistId)));
ledger.summary=ledger.workers.reduce((a,x)=>{const k=x.status||"unknown";a[k]=(a[k]||0)+1;return a;},{});
ledger.updatedAt=new Date().toISOString();
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+"\n");
console.log(JSON.stringify({ok:true,summary:ledger.summary,coordinationId:ledger.coordinationId},null,2));
