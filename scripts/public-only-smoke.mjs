import fs from 'node:fs';
const main=fs.readFileSync('src/main.jsx','utf8');
if(main.includes('AuthGate')||main.includes('/app')||main.includes("from './App'")) throw new Error('Public site still embeds app runtime');
const pub=fs.readFileSync('src/PublicSite.jsx','utf8');
if(pub.includes('href="/app"')) throw new Error('Public site still links to embedded app');
if(!pub.includes('knt-hire-and-sales-app.vercel.app')) throw new Error('No standalone app link');
if(fs.existsSync('public/manifest.webmanifest')) throw new Error('Public site still owns app manifest');
console.log('PUBLIC-ONLY SMOKE PASS');
