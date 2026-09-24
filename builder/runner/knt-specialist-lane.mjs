#!/usr/bin/env node
/**
 * KNT specialist lane controller.
 * Each matrix worker owns an isolated candidate branch. It never merges code.
 * A candidate only advances when the specialist's build verification passes.
 */
import fs from "node:fs";
import path from "node:path";
import {execFileSync, spawnSync} from "node:child_process";

const root=process.cwd();
const botId=String(process.env.KNT_SPECIALIST_ID||"").trim();
const objectiveId=String(process.env.AUTOBOT_SPECIALIST_OBJECTIVE_ID||"").trim();
const coordinationId=String(process.env.KNT_COORDINATION_ID||"").trim();
if(!botId||!objectiveId||!coordinationId) throw new Error("KNT specialist handshake requires specialist id, objective id and coordination id.");

const git=(args)=>execFileSync("git",args,{cwd:root,encoding:"utf8"}).trim();
const base=git(["rev-parse","HEAD"]);
const branch=`autobot/knt/${botId}/${process.env.GITHUB_RUN_ID||Date.now()}`;
execFileSync("git",["checkout","-b",branch],{cwd:root,stdio:"inherit"});
execFileSync("git",["config","user.name","KNT FORGE Specialist"],{cwd:root,stdio:"inherit"});
execFileSync("git",["config","user.email","41898282+github-actions[bot]@users.noreply.github.com"],{cwd:root,stdio:"inherit"});

const specialistMinutes=Math.max(1,Number(process.env.KNT_SPECIALIST_MINUTES||15));
const env={...process.env,AUTOBOT_SPECIALIST_OBJECTIVE_ID:objectiveId,AUTOBOT_FEATURE_PASSES:process.env.KNT_SPECIALIST_PASSES||"2",AUTOBOT_FINISH_GRACE_MINUTES:"0",BUILDER_MAX_MINUTES:String(specialistMinutes)};
const run=spawnSync(process.execPath,["builder/runner/feature-brain.mjs"],{cwd:root,stdio:"inherit",env,timeout:Math.max(60_000,specialistMinutes*60_000)});
if(run.error||run.status!==0) throw new Error(`specialist builder failed: ${run.error?.message||run.status}`);

const changed=git(["status","--short","--","src"]).split(/\r?\n/).filter(Boolean).map(x=>x.slice(3).trim()).filter(Boolean);
if(!changed.length) throw new Error("specialist produced no product change");
execFileSync("npm",["run","build"],{cwd:root,stdio:"inherit",timeout:120_000});
execFileSync("git",["diff","--check","HEAD"],{cwd:root,stdio:"inherit"});
const allowed=JSON.parse(fs.readFileSync(path.join(root,"builder/brain/feature-objectives.json"),"utf8")).objectives.find(x=>x.id===objectiveId)?.files||[];
const unexpected=changed.filter(x=>!allowed.includes(x));
if(unexpected.length) throw new Error("scope violation: "+unexpected.join(", "));
execFileSync("git",["add","--",...changed],{cwd:root,stdio:"inherit"});
execFileSync("git",["commit","-m",`feat: KNT ${botId} specialist candidate`],{cwd:root,stdio:"inherit"});
const candidate=git(["rev-parse","HEAD"]);
execFileSync("git",["push","--set-upstream","origin",branch],{cwd:root,stdio:"inherit"});

const handoff={
 schemaVersion:"knt-specialist-handoff-v1",coordinationId,specialistId:botId,objectiveId,
 status:"verified-candidate",baseCommit:base,candidateCommit:candidate,branch,ownedFiles:allowed,
 changedFiles:changed,verification:{build:"pass",diffCheck:"pass",scope:"pass"},
 integrationEligible:true,createdAt:new Date().toISOString()
};
fs.mkdirSync(path.join(root,"builder/working"),{recursive:true});
fs.writeFileSync(path.join(root,"builder/working/knt-specialist-handoff.json"),JSON.stringify(handoff,null,2)+"\n");
console.log(JSON.stringify(handoff,null,2));
