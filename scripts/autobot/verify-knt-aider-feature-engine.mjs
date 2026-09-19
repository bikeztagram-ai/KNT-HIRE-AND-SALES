#!/usr/bin/env node
/** KNT-specific contract for the proven Aider repository-map feature engine. */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const read=p=>fs.readFileSync(p,'utf8');
const runner=read('builder/runner/aider-feature-brain.mjs');
const controller=read('builder/runner/long-run-executor.mjs');
const workflow=read('.github/workflows/knt-autonomous-builder.yml');
const objectives=JSON.parse(read('builder/brain/feature-objectives.json')).objectives||[];
const checks=[
 ['Aider engine',runner.includes('aider-repo-map-v4')&&runner.includes('aider')],
 ['KNT objective scopes',runner.includes('feature-objectives.json')&&runner.includes('scopedFiles(obj)')],
 ['dependency-aware selection',runner.includes('o.dependsOn')],
 ['bounded passes',runner.includes('AUTOBOT_FEATURE_PASSES')],
 ['hard deadline',runner.includes('AUTOBOT_FEATURE_DEADLINE_EPOCH_MS')&&runner.includes('remainingMs()')],
 ['repository-map subtree',runner.includes('--subtree-only')&&runner.includes('--map-tokens=768')],
 ['no automatic commits',runner.includes('--no-auto-commits')&&runner.includes('--no-dirty-commits')],
 ['scope rollback',runner.includes('restorePassSnapshot')&&runner.includes('unauthorized KNT modified paths')],
 ['diff/build gates',runner.includes("['diff','--check']")&&runner.includes("['run','build']")],
 ['durable state recovery',runner.includes('loadAiderState')&&runner.includes('saveAiderState')],
 ['KNT business safety',runner.includes('original evidence')&&runner.includes('human-invoice-review')],
 ['controller entrypoint',controller.includes('builder/runner/feature-brain.mjs')],
 ['workflow installs Aider',workflow.includes('aider-chat')],
 ['workflow selects engine',workflow.includes('aider-repo-map-v4')],
 ['workflow uses proxy',workflow.includes('ollama-performance-proxy.mjs')],
 ['exact src scopes',objectives.every(o=>Array.isArray(o.files)&&o.files.length&&o.files.every(f=>f.startsWith('src/')))]
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);
try{execFileSync(process.execPath,['scripts/autobot/repository-intelligence.mjs'],{stdio:'inherit'});}catch{failures.push('repository intelligence refresh failed');}
if(failures.length){console.error('KNT Aider AutoBot contract FAIL:\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1);}
console.log(`KNT Aider AutoBot contract PASS: ${checks.length}/${checks.length}`);
