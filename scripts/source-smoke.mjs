import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const src=path.join(root,'src');
const files=[];
function walk(dir){for(const name of fs.readdirSync(dir)){const p=path.join(dir,name);const s=fs.statSync(p);if(s.isDirectory())walk(p);else if(/\\.(js|jsx)$/.test(name))files.push(p)}}
walk(src);
const failures=[];
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  for(const match of text.matchAll(/from['\"](\\.[^'\"]+)['\"]/g)){
    const spec=match[1];
    const target=path.resolve(path.dirname(file),spec);
    const candidates=[target,target+'.js',target+'.jsx',path.join(target,'index.js'),path.join(target,'index.jsx')];
    if(!candidates.some(fs.existsSync)) failures.push(path.relative(root,file)+': '+spec);
  }
}
if(failures.length){console.error('Local import smoke test failed:');for(const x of failures)console.error(' - '+x);process.exit(1)}
console.log('Local import smoke test passed: '+files.length+' source files checked.');
