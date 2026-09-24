import fs from "node:fs";
const fleet=JSON.parse(fs.readFileSync("builder/brain/knt-specialist-fleet.json","utf8"));
const objectives=JSON.parse(fs.readFileSync("builder/brain/feature-objectives.json","utf8")).objectives;
if(fleet.specialists?.length!==10) throw new Error("KNT specialist fleet must contain exactly 10 specialists");
const ids=new Set(fleet.specialists.map(x=>x.id));
if(ids.size!==10) throw new Error("Specialist IDs must be unique");
for(const s of fleet.specialists){
  if(!s.objectiveId||!objectives.some(o=>o.id===s.objectiveId)) throw new Error(`Missing objective for ${s.id}`);
}
if(fleet.handshake?.verifiedCarryForward!==true||fleet.handshake?.rejectCandidateOnVerificationFailure!==true) throw new Error("Unsafe handshake contract");
console.log(JSON.stringify({ok:true,specialists:fleet.specialists.map(x=>x.id),handshake:fleet.handshake},null,2));
