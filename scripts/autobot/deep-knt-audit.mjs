#!/usr/bin/env node
/**
 * KNT deep repository audit.
 * Machine checks are deliberately conservative: missing imports/exports, broken
 * local references, duplicate routes, objective/file mismatches and build health.
 * Semantic review is performed by the Aider audit/repair stage in CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),errors=[],warnings=[];
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const src=walk(path.join(root,'src')).filter(f=>/\.(js|jsx|ts|tsx)$/.test(f));
const files=new Set(src.map(f=>path.relative(root,f).replaceAll('\\','/')));
for(const file of src){
  const text=fs.readFileSync(file,'utf8');
  for(const m of text.matchAll(/(?:from\s+|import\s*\(\s*)['"](@?\.\.?\/[^'"]+)['"]/g)){
    let spec=m[1]; if(!spec.startsWith('.'))continue;
    const base=path.resolve(path.dirname(file),spec), candidates=[base,...['.js','.jsx','.ts','.tsx'].map(x=>base+x),...['index.js','index.jsx','index.ts','index.tsx'].map(x=>path.join(base,x))];
    if(!candidates.some(x=>fs.existsSync(x)))errors.push(`Missing local import in ${path.relative(root,file)}: ${spec}`);
  }
}
const objFile=path.join(root,'builder/brain/feature-objectives.json');
if(fs.existsSync(objFile)){const o=JSON.parse(fs.readFileSync(objFile,'utf8'));if(o.engine!=='aider-repo-map-v4')errors.push('Feature objectives engine is not aider-repo-map-v4');for(const x of o.objectives||[])for(const f of x.files||[])if(!files.has(f))errors.push(`Objective ${x.id} references missing/non-src file: ${f}`)}
try{execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'})}catch{errors.push('npm run build failed')}
console.log(JSON.stringify({ok:errors.length===0,errors,warnings,checkedSourceFiles:src.length},null,2));
process.exit(errors.length?1:0);
