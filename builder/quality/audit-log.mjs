#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();const auditPath=path.join(root,'builder','working','autobot-audit.jsonl');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const readRecords=()=>fs.existsSync(auditPath)?fs.readFileSync(auditPath,'utf8').split('\n').filter(Boolean).map(line=>JSON.parse(line)):[];
export function appendAudit(event,details={}){fs.mkdirSync(path.dirname(auditPath),{recursive:true});const records=readRecords();const previousHash=records.at(-1)?.hash||'GENESIS';const payload={version:1,sequence:records.length+1,runId:process.env.GITHUB_RUN_ID||'local',timestamp:new Date().toISOString(),event,details,previousHash};const record={...payload,hash:digest(payload)};fs.appendFileSync(auditPath,`${JSON.stringify(record)}\n`);return record}
export function verifyAuditLog(){const records=readRecords();let previousHash='GENESIS';for(let i=0;i<records.length;i++){const record=records[i],{hash,...payload}=record;if(record.sequence!==i+1||record.previousHash!==previousHash||digest(payload)!==hash)return{valid:false,checked:i+1,error:`audit integrity failure at sequence ${i+1}`};previousHash=hash}return{valid:true,checked:records.length}}
if(import.meta.url===`file://${process.argv[1]}`){const result=verifyAuditLog();console.log(JSON.stringify(result));process.exit(result.valid?0:2)}
