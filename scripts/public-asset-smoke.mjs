import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const publicDir=path.join(root,"public");
const required=[
  "knt-logo.svg",
  "manifest.webmanifest",
  "stock/daewoo-d15s.svg",
  "stock/mitsubishi-grendia-20.svg",
  "stock/mitsubishi-fg25.svg"
];
const missing=required.filter(p=>!fs.existsSync(path.join(publicDir,p)));
if(missing.length){
  console.error("Public asset smoke failed. Missing:");
  for(const item of missing) console.error(" - "+item);
  process.exit(1);
}
for(const item of required){
  const file=path.join(publicDir,item);
  const data=fs.readFileSync(file);
  if(data.length<80) throw new Error("Asset is suspiciously small: "+item);
  if(item.endsWith(".svg") && !data.toString("utf8").includes("<svg")) throw new Error("Invalid SVG asset: "+item);
}
const site=fs.readFileSync(path.join(root,"src/PublicSite.jsx"),"utf8");
for(const match of site.matchAll(/["'](\/[^"']+\.(?:svg|webp|png|jpg|jpeg))["']/g)){
  const asset=match[1].replace(/^\//,"");
  if(!fs.existsSync(path.join(publicDir,asset))) throw new Error("PublicSite references missing asset: "+match[1]);
}
console.log("Public asset smoke passed: "+required.length+" required assets and referenced media checked.");
