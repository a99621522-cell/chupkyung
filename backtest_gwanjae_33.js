const M=require('/home/claude/engine/node_modules/@fullstackfamily/manseryeok'); const A=require('/home/claude/engine/chapgyeong-input.js'); const U=require('/home/claude/engine/chapgyeong-un.js'); const {analyzeAll}=require('/home/claude/engine/chapgyeong-master.js');
// 인물(양력 생년월일, 시 미상), 자리를 잃은 사건 연도(구속·파면·법정구속·사퇴 등) — 채점 기준은 실행 전 고정: 사건연도±3의 7년 창에서 세운 점수 하위 2위 안 = 적중(우연 29%)
const CASES=[
 ['박근혜',1952,2,2,'여',2017,'파면·구속'],['이명박',1941,12,19,'남',2018,'구속'],['노태우',1932,12,4,'남',1995,'구속'],['전두환',1931,1,18,'남',1995,'구속'],
 ['노무현',1946,9,1,'남',2004,'탄핵소추'],['이재용',1968,6,23,'남',2017,'구속'],['최서원',1956,6,23,'여',2016,'구속'],['김기춘',1939,11,25,'남',2017,'구속'],
 ['조윤선',1966,7,22,'여',2017,'구속'],['안희정',1965,5,1,'남',2018,'사퇴·기소'],['김경수',1967,12,1,'남',2019,'법정구속'],['조국',1965,4,6,'남',2024,'수감'],
 ['이석기',1962,2,27,'남',2013,'구속'],['한명숙',1944,3,24,'여',2015,'수감'],['정몽구',1938,3,19,'남',2006,'구속'],['김승연',1952,2,7,'남',2007,'구속'],
 ['최태원',1960,12,3,'남',2013,'법정구속'],['우병우',1967,1,10,'남',2017,'구속'],['양승태',1948,1,26,'남',2019,'구속'],['이완구',1950,6,2,'남',2015,'총리 사퇴'],
 ['정준영',1989,2,21,'남',2019,'구속'],['이승현(승리)',1990,12,12,'남',2021,'구속'],['박유천',1986,6,4,'남',2019,'구속'],['원세훈',1951,1,31,'남',2015,'법정구속'],
 ['남재준',1944,10,13,'남',2017,'구속'],['이병기',1947,6,12,'남',2017,'구속'],['이재현',1960,3,19,'남',2013,'구속'],['김우중',1936,12,19,'남',1999,'도피·해체'],
 ['신동빈',1955,2,14,'남',2018,'법정구속'],['이호진',1962,10,8,'남',2011,'구속'],['전병헌',1958,3,17,'남',2018,'구속'],['윤석열',1960,12,18,'남',2025,'구속·파면'],['한덕수',1949,6,18,'남',2026,'1심 유죄'],
];
let hit=0,n=0,hitTop1=0, daeunHit=0, daeunN=0; const rows=[];
for (const [who,y,m,d,sex,ev,what] of CASES) {
  const mm=M.calculateSaju(y,m,d,12,0,{applyTimeCorrection:false}); const inp=A.fromManse(mm); const s4=inp.saju; const r=analyzeAll(s4,sex); // 용신·격은 임시 시주 포함(월령 위주라 영향 작음)
  const s3={...s4}; delete s3.tStem; delete s3.tBranch;
  const years=[]; for (let yy=ev-3; yy<=ev+3; yy++) years.push(yy);
  const scores=years.map(yy=>{ const g=U.seunGanji(M,yy); const j=U.judgeUn(s3,g,r.용신); return {yy,g,sc:j.점수,grade:j.등급}; });
  const sorted=[...scores].sort((a,b)=>a.sc-b.sc); const rank=sorted.findIndex(x=>x.yy===ev)+1; const evS=scores.find(x=>x.yy===ev);
  const ok=rank<=2; if(ok)hit++; if(rank===1)hitTop1++; n++;
  // 대운: 사건연도가 흉 대운 안인가
  const D=U.buildDaeun(M,{y,m,d,h:12,min:0},s4,sex,10); const cur=D.대운.find(dd=>{const a=+dd.시작시점.split('.')[0], b=+dd.끝시점.split('.')[0]; return ev>=a && ev<b;}); if(cur){ const jd=U.judgeUn(s3,cur.간지,r.용신); daeunN++; if(jd.등급==='흉') daeunHit++; rows.push([who,inp.pillars.slice(0,3).join(' '),ev+' '+what, evS.g+' '+evS.grade+'('+evS.sc+')', rank+'/7', ok?'✓':'✗', cur.간지+' '+jd.등급]); }
}
console.log('인물 | 삼주 | 사건 | 사건연도 세운 | 흉 순위 | 적중 | 사건 대운');
rows.forEach(r=>console.log(r.join(' | ')));
console.log(`\n세운 하위2위 적중: ${hit}/${n} = ${Math.round(100*hit/n)}% (우연 29%) | 최저 1위 적중: ${hitTop1}/${n} = ${Math.round(100*hitTop1/n)}% (우연 14%) | 사건 대운이 흉: ${daeunHit}/${daeunN} = ${Math.round(100*daeunHit/daeunN)}%`);

// ---- 채점 2: 관재 지표(사전 정의) — 세운 지지가 일지/년지와 형·충(+2), 일지 자형·년지 자형(+1), 수옥살 자리 도래(+2), 세운 천간이 관살(+1). 7년 창에서 상위 2위 안 = 적중
const T=require('/home/claude/engine/chapgyeong-vol1-tables.js'); const B=require('/home/claude/engine/chapgyeong-vol1-basics.js'); const S=require('/home/claude/engine/chapgyeong-vol1-sinsal.js'); const Y=require('/home/claude/engine/chapgyeong-vol1-yukchin.js');
function gwanjae(s3, g) { const b=g[1], st=g[0]; let sc=0; const R=B.checkBranchRelations([s3.yBranch,s3.mBranch,s3.dBranch,b]);
  for (const c of R.충) if (c.includes(b) && (c.includes(s3.dBranch)||c.includes(s3.yBranch))) sc+=2;
  for (const f of R.형) if (f.includes(b) && (f.includes(s3.dBranch)||f.includes(s3.yBranch))) sc+= (f[2]==='자형'?1:2);
  const gy=S.getSamhapGroup(s3.yBranch), gd=S.getSamhapGroup(s3.dBranch); if ((gy&&T.SUOK[gy]===b)||(gd&&T.SUOK[gd]===b)) sc+=2;
  if (['정관','편관'].includes(Y.getSipseong(s3.dStem, st))) sc+=1; return sc; }
let hit2=0,top2=0; const rows2=[];
for (const [who,y,m,d,sex,ev,what] of CASES) { const mm=M.calculateSaju(y,m,d,12,0,{applyTimeCorrection:false}); const s=A.fromManse(mm).saju; const s3={yStem:s.yStem,yBranch:s.yBranch,mStem:s.mStem,mBranch:s.mBranch,dStem:s.dStem,dBranch:s.dBranch};
  const scores=[]; for (let yy=ev-3; yy<=ev+3; yy++){ const g=U.seunGanji(M,yy); scores.push({yy,g,sc:gwanjae(s3,g)}); }
  const sorted=[...scores].sort((a,b)=>b.sc-a.sc); const rank=sorted.findIndex(x=>x.yy===ev)+1; const evS=scores.find(x=>x.yy===ev); const ties=sorted.filter(x=>x.sc===evS.sc).length;
  const ok = evS.sc>0 && rank<=2; if(ok) hit2++; if(rank===1 && evS.sc>0) top2++; rows2.push(`${who} ${ev} ${evS.g} 관재점수 ${evS.sc} 순위 ${rank}/7${ties>1?'(동점 '+ties+')':''} ${ok?'✓':'✗'}`); }
console.log('\n[채점 2 · 관재 지표]'); rows2.forEach(r=>console.log(' ',r));
console.log(`관재 지표 상위2위 적중: ${hit2}/${CASES.length} = ${Math.round(100*hit2/CASES.length)}% (우연 29%) | 1위: ${top2}/${CASES.length}`);
