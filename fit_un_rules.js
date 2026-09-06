// 운 판정 규칙 재적합: docs/eval_daeun_vol4ha.json 의 (원국, 운, 저자 길흉)에 대해 특징을 뽑고 가중치 격자 탐색
// node docs/fit_un_rules.js [--author-yongsin]
const fs=require('fs'),path=require('path'); const T=require('../chapgyeong-vol1-tables.js'), B=require('../chapgyeong-vol1-basics.js'), Y=require('../chapgyeong-vol1-yukchin.js');
const {analyzeAll}=require('../chapgyeong-master.js');
const S=a=>({yStem:a[0],yBranch:a[1],mStem:a[2],mBranch:a[3],dStem:a[4],dBranch:a[5],tStem:a[6],tBranch:a[7]});
const SAENG={목:'화',화:'토',토:'금',금:'수',수:'목'},GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'},GEUKBY={목:'금',화:'수',토:'목',금:'화',수:'토'};
const CH={자:'오',오:'자',축:'미',미:'축',인:'신',신:'인',묘:'유',유:'묘',진:'술',술:'진',사:'해',해:'사'};
const rows=JSON.parse(fs.readFileSync(path.join(__dirname,'eval_daeun_vol4ha.json'))).rows;
const data=rows.map(r=>{ const s=S(r.기둥); const y=r.용신; const brs=[s.yBranch,s.mBranch,s.dBranch,s.tBranch], sts=[s.yStem,s.mStem,s.tStem];
  const parts=[]; if(r.운.length===2){ parts.push(['st',T.STEM_OHAENG[r.운[0]]]); parts.push(['br',T.BRANCH_OHAENG[r.운[1]],r.운[1]]); } else parts.push(['br',T.BRANCH_OHAENG[r.운],r.운]);
  const f={same:0,saeng:0,geuk:0,piGeuk:0,sul:0,chungY:0,chungAny:0,hapY:0,gisin:0};
  const yBr=brs.filter(b=>T.BRANCH_OHAENG[b]===y), ilOh=T.STEM_OHAENG[s.dStem];
  for(const p of parts){ const o=p[1]; const w = p[0]==='br'?1:1;
    if(o===y) f.same+=w; else if(SAENG[o]===y) f.saeng+=w; else if(GEUKBY[y]===o) f.geuk+=w; else if(GEUK[y]===o) f.piGeuk+=w; else if(SAENG[y]===o) f.sul+=w;
    if(p[0]==='br'){ const b=p[2]; if(yBr.includes(CH[b])) f.chungY++; if(brs.includes(CH[b])) f.chungAny++; const R=B.checkBranchRelations([...brs,b]); if((R.합||[]).some(h=>h.includes(b)&&h.some(v=>yBr.includes(v)&&v!==b))) f.hapY++; } }
  return {f, lab:r.저자, id:r.id};
});
const W={same:[0,1,2,3],saeng:[0,1,2],geuk:[0,-1,-2,-3],piGeuk:[0,-1],sul:[0,-1,1],chungY:[0,-1,-2],chungAny:[0,-1],hapY:[0,-1,-2],gisin:[0]};
const keys=Object.keys(W); let best=null; const combos=[];
(function rec(i,cur){ if(i===keys.length){ combos.push({...cur}); return;} for(const v of W[keys[i]]){ cur[keys[i]]=v; rec(i+1,cur);} })(0,{});
for(const w of combos){ for(const th of [0.5,1,1.5]){ let ok=0,okG=0,okB=0,nG=0,nB=0; for(const d of data){ let sc=0; for(const k of keys) sc+=w[k]*d.f[k]; const pred=sc>=th?'길':sc<=-th?'흉':'평'; if(d.lab==='길'){nG++; if(pred==='길'){ok++;okG++;}} else {nB++; if(pred==='흉'){ok++;okB++;}} }
  if(!best||ok>best.ok) best={ok,okG,okB,nG,nB,w,th}; } }
console.log(`표본 ${data.length} — 최적: 일치 ${best.ok}/${data.length} (길 ${best.okG}/${best.nG} · 흉 ${best.okB}/${best.nB})`, JSON.stringify(best.w), 'th', best.th);
// 부호만(평 없이)으로도
let best2=null; for(const w of combos){ let ok=0; for(const d of data){ let sc=0; for(const k of keys) sc+=w[k]*d.f[k]; const pred=sc>0?'길':sc<0?'흉':'평'; if(pred===d.lab) ok++; } if(!best2||ok>best2.ok) best2={ok,w}; }
console.log(`부호 판정 최적: ${best2.ok}/${data.length}`, JSON.stringify(best2.w));
// 특징별 단순 통계
for(const k of keys){ const g=data.filter(d=>d.f[k]>0); if(!g.length) continue; console.log(`${k.padEnd(8)} 발생 ${g.length}: 길 ${g.filter(d=>d.lab==='길').length} 흉 ${g.filter(d=>d.lab==='흉').length}`); }
