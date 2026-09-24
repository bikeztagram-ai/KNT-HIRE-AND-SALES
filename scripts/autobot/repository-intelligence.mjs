#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root=process.cwd();
const outFile=path.join(root,'builder/working/repository-map.json');
const run=(cmd,args)=>execFileSync(cmd,args,{cwd:root,encoding:'utf8'});
const sourceExt=/\.(?:js|mjs|cjs|jsx|ts|tsx)$/;
const ignored=/^(?:node_modules|dist|\.git|builder\/working)(?:\/|$)/;
const files=run('git',['ls-files','-z']).split('\0').filter(Boolean).filter(p=>sourceExt.test(p)&&!ignored.test(p));
const fingerprint=()=>{const h=crypto.createHash('sha256');h.update(run('git',['rev-parse','HEAD']).trim());for(const p of run('git',['diff','--name-only','--diff-filter=ACM']).split(/\r?\n/).filter(Boolean).sort()){if(fs.existsSync(path.join(root,p)))h.update(p).update(fs.readFileSync(path.join(root,p)))}return h.digest('hex')};
const fp=fingerprint();
try{const previous=JSON.parse(fs.readFileSync(outFile,'utf8'));if(previous.fingerprint===fp){console.log(`[autobot] repository intelligence cache hit: ${files.length} source files`);process.exit(0)}}catch{}
const symbols=source=>{const out=[];for(const re of [/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,/(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g,/(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/g]){let m;while((m=re.exec(source))&&out.length<80)out.push(m[1])}return[...new Set(out)]};
const imports=source=>{const out=[];const re=/(?:import\s+(?:[\s\S]*?\s+from\s+)?|export\s+(?:[\s\S]*?\s+from\s+)?|import\s*\()\s*['\"]([^'\"]+)['\"]/g;let m;while((m=re.exec(source)))if(m[1].startsWith('.'))out.push(m[1]);return[...new Set(out)]};
const resolve=(from,spec)=>{const base=path.normalize(path.join(path.dirname(from),spec));return [base,`${base}.js`,`${base}.mjs`,`${base}.jsx`,`${base}.ts`,`${base}.tsx`,path.join(base,'index.js')].find(p=>fs.existsSync(path.join(root,p)))||null};
const byPath={};for(const p of files){const source=fs.readFileSync(path.join(root,p),'utf8');byPath[p]={path:p,bytes:Buffer.byteLength(source),symbols:symbols(source),imports:imports(source).map(spec=>({spec,resolved:resolve(p,spec)})),dependents:[]}};
for(const e of Object.values(byPath))for(const dep of e.imports.map(x=>x.resolved).filter(Boolean))if(byPath[dep]&&!byPath[dep].dependents.includes(e.path))byPath[dep].dependents.push(e.path);
fs.mkdirSync(path.dirname(outFile),{recursive:true});fs.writeFileSync(outFile,JSON.stringify({version:1,generatedAt:new Date().toISOString(),fingerprint:fp,files,byPath},null,2)+'\n');console.log(`[autobot] repository intelligence refreshed: ${files.length} source files`);
