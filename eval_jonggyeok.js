// 종격 검출기 비교: 양성 = 4권下 저자 종재·종살·종아 + v25 종격 2건 / 음성 = 4권上 스캔(전부 정격) + 4권下 저자 용신 명시 非종 + 3권 A(허용치) + 강헌
// node docs/eval_jonggyeok.js
const fs=require('fs'),path=require('path');
const T=require('../chapgyeong-vol1-tables.js'), Y=require('../chapgyeong-vol1-yukchin.js');
const JS=require('../chapgyeong-jonggyeok-saenghwa.js'), YS=require('../chapgyeong-yongsin.js');
const S=a=>({yStem:a[0][0],yBranch:a[0][1],mStem:a[1][0],mBranch:a[1][1],dStem:a[2][0],dBranch:a[2][1],tStem:a[3][0],tBranch:a[3][1]});
const H={甲:'갑',乙:'을',丙:'병',丁:'정',戊:'무',己:'기',庚:'경',辛:'신',壬:'임',癸:'계',子:'자',丑:'축',寅:'인',卯:'묘',辰:'진',巳:'사',午:'오',未:'미',申:'신',酉:'유',戌:'술',亥:'해'};
const hg=p=>p.split('').map(c=>H[c]||c).join('');
const GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'},SAENG={목:'화',화:'토',토:'금',금:'수',수:'목'},INSU={목:'수',화:'목',토:'화',금:'토',수:'금'},GWAN={목:'금',화:'수',토:'목',금:'화',수:'토'};
const all=JSON.parse(fs.readFileSync(path.join(__dirname,'vol4ha_silrye_scan_ALL.json'))).silrye.filter(x=>x.conf!=='C');
const jongOf=t=>{ if(/從財 불가|不從財|從 불가|不從|종 안|從殺 안/.test(t)) return null; if(/종재|從財/.test(t)) return '재'; if(/종살|從殺/.test(t)) return '살'; if(/종아|從兒/.test(t)) return '아'; if(/종강|從强|從旺|종왕/.test(t)) return '강'; return null; };
const pos=[]; const negHa=[];
for (const x of all) { const t=(x.gyeok_wonmun||'')+' '+(x.gugyeol||'')+' '+(x.note||''); const j=jongOf(t); const ko=x.myeongjo.map(hg);
  if (j && j!=='강') pos.push({id:x.id,기둥:ko,종:j});
  else if (!j && /用官|용관|用財|용재|用印|용인|用刦|용겁|傷官用|印綬用|假傷官|가상관|用神/.test(t)) negHa.push({id:x.id,기둥:ko}); }
pos.push({id:'v25 임자을사기해계유',기둥:['임자','을사','기해','계유'],종:'살'},{id:'v25 갑술정축을묘임오',기둥:['갑술','정축','을묘','임오'],종:'재'});
const negUp=JSON.parse(fs.readFileSync(path.join(__dirname,'vol4_silrye_scan.json'))).filter(r=>r.권!=='4권下'&&r.기둥&&!r.기둥.some(p=>!p||p.includes('?'))&&!/종/.test(r.격명||'')).map(r=>({id:'4권上 '+r.격명,기둥:r.기둥}));
const db3raw=require('../chapgyeong3_myeongshik_db.json').filter(d=>d.conf==='A');
const db3pos=db3raw.filter(d=>/종재|종살|종아|從財|從殺|從兒|棄命|從格|從勢|종격/.test(JSON.stringify(d))).map(d=>({id:'3권 '+d.no,기둥:d.기둥}));
const db3=db3raw.filter(d=>!/종재|종살|종아|從財|從殺|從兒|棄命|從格|從勢|종격/.test(JSON.stringify(d))).map(d=>({id:'3권',기둥:d.기둥}));
pos.push(...db3pos.map(x=>({...x,종:'?'})));
const dbK=require('../kanghun_myeongshik_db.json').map(d=>({id:'강헌',기둥:d.기둥}));

// 검출기들: 반환 {종:'재'|'살'|'아'|null}
const ilOh=s=>T.STEM_OHAENG[s.dStem];
const dominant=(s)=>{ const o=ilOh(s), brs=[s.yBranch,s.mBranch,s.dBranch,s.tBranch], st=[s.yStem,s.mStem,s.tStem];
  const c=x=>brs.filter(b=>T.BRANCH_OHAENG[b]===x).length+st.filter(z=>T.STEM_OHAENG[z]===x).length;
  const cand=[['살',GWAN[o],c(GWAN[o])],['재',GEUK[o],c(GEUK[o])],['아',SAENG[o],c(SAENG[o])]].sort((a,b)=>b[2]-a[2]); return cand[0]; };
const root=(s)=>{ const o=ilOh(s); return [s.yBranch,s.mBranch,s.dBranch,s.tBranch].filter(b=>[o,INSU[o]].includes(T.BRANCH_OHAENG[b])).length; };
const rootJ=(s)=>{ const o=ilOh(s); return [s.yBranch,s.mBranch,s.dBranch,s.tBranch].filter(b=>(T.JIJANGGAN[b]||[]).some(g=>[o].includes(T.STEM_OHAENG[g]))).length; };
const outSum=(s)=>{ const o=ilOh(s), brs=[s.yBranch,s.mBranch,s.dBranch,s.tBranch], st=[s.yStem,s.mStem,s.tStem]; const c=x=>brs.filter(b=>T.BRANCH_OHAENG[b]===x).length+st.filter(z=>T.STEM_OHAENG[z]===x).length; return c(GWAN[o])+c(GEUK[o])+c(SAENG[o]); };
// 방향: 생화유정 사슬(도구)로 집결지 → 십성 매핑, 실패 시 세력 최대
const dirChain=(s)=>{ try{ const r=JS.checkJonggyeokSaengHwaYujeong(s,true); const o=ilOh(s); const rel=(r&&r.성립&&r.관계)||''; if(/종살|종관/.test(rel)) return '살'; if(/종재/.test(rel)) return '재'; if(/종아|종식|종상/.test(rel)) return '아'; }catch(e){} return dominant(s)[0]; };
const gate=(s,thYin,thYang,minOut)=>{ const sw=YS.strengthWeighted(s); const yin=['을','정','기','신','계'].includes(s.dStem); const r=root(s); return yin ? (r<=1&&sw.점수<=thYin&&outSum(s)>=minOut) : (r<=0&&sw.점수<=thYang&&outSum(s)>=minOut); };
const DET={
  'F E게이트+장간뿌리≤1': s=>(gate(s,-4,-4,5)&&rootJ(s)<=1)?dirChain(s):null,
  'F2 E게이트+장간뿌리≤1+밖≥6': s=>(gate(s,-4,-4,6)&&rootJ(s)<=1)?dirChain(s):null,
  'F3 (음 -4/양 -6, 밖≥5)+장간뿌리≤1': s=>(gate(s,-4,-6,5)&&rootJ(s)<=1)?dirChain(s):null,
  'F4 (음 -5/양 -6, 밖≥5)+장간뿌리≤1': s=>(gate(s,-5,-6,5)&&rootJ(s)<=1)?dirChain(s):null,
  'E 밖총합 게이트(음 -4/양 -4, 밖≥5, 뿌리 음≤1/양0)+세력최대 방향': s=>gate(s,-4,-4,5)?dominant(s)[0]:null,
  'E2 같은 게이트 + 생화사슬 방향': s=>gate(s,-4,-4,5)?dirChain(s):null,
  'E3 게이트(음 -3/양 -4, 밖≥5)+사슬': s=>gate(s,-3,-4,5)?dirChain(s):null,
  'E4 게이트(음 -4/양 -5, 밖≥5)+사슬': s=>gate(s,-4,-5,5)?dirChain(s):null,
  'E5 게이트(음 -4/양 -4, 밖≥6)+사슬': s=>gate(s,-4,-4,6)?dirChain(s):null,
  'E6 게이트(음 -5/양 -6, 밖≥5)+사슬': s=>gate(s,-5,-6,5)?dirChain(s):null,
  'A 극약(현재: 점수≤-4·뿌리0·세력≥4)': s=>{ const sw=YS.strengthWeighted(s); const d=dominant(s); return (sw.점수<=-4&&root(s)<=0&&d[2]>=4)?d[0]:null; },
  'A2 극약(점수≤-4·뿌리≤1·세력≥4)': s=>{ const sw=YS.strengthWeighted(s); const d=dominant(s); return (sw.점수<=-4&&root(s)<=1&&d[2]>=4)?d[0]:null; },
  'A3 극약(점수≤-5·뿌리≤1·세력≥4)': s=>{ const sw=YS.strengthWeighted(s); const d=dominant(s); return (sw.점수<=-5&&root(s)<=1&&d[2]>=4)?d[0]:null; },
  'A4 극약(점수≤-4·뿌리≤1·세력≥5)': s=>{ const sw=YS.strengthWeighted(s); const d=dominant(s); return (sw.점수<=-4&&root(s)<=1&&d[2]>=5)?d[0]:null; },
  'B 통근득령(생화유정 도구)': s=>{ try{ const r=JS.checkJonggyeokTonggeunDeukryeong(s); if(!r.성립) return null; const rel=r.관계||r.판정||''; return /종재|재/.test(rel)?'재':/종살|살|관/.test(rel)?'살':/종아|식|상관/.test(rel)?'아':'?'; }catch(e){ return null; } },
  'C 음간종세 조임(음간·뿌리≤1·점수≤-3·세력≥4 / 양간·뿌리0·점수≤-4·세력≥4)': s=>{ const sw=YS.strengthWeighted(s); const d=dominant(s); const yin=['을','정','기','신','계'].includes(s.dStem);
     return yin ? ((root(s)<=1&&sw.점수<=-3&&d[2]>=4)?d[0]:null) : ((root(s)<=0&&sw.점수<=-4&&d[2]>=4)?d[0]:null); },
  'D 음간종세+지장간뿌리(음간·본기뿌리≤1·장간뿌리≤1·점수≤-3·세력≥4 / 양간 무근·점수≤-4)': s=>{ const sw=YS.strengthWeighted(s); const d=dominant(s); const yin=['을','정','기','신','계'].includes(s.dStem);
     return yin ? ((root(s)<=1&&rootJ(s)<=1&&sw.점수<=-3&&d[2]>=4)?d[0]:null) : ((root(s)<=0&&rootJ(s)<=1&&sw.점수<=-4&&d[2]>=4)?d[0]:null); },
};
const run=(fn,arr)=>arr.map(c=>{ try{ return fn(S(c.기둥)); }catch(e){ return null; } });
console.log(`양성 ${pos.length}(4권下 22+v25 2+3권 종언급 ${db3pos.length}) / 음성: 4권上 ${negUp.length}, 4권下 非종 ${negHa.length}, 3권 ${db3.length}, 강헌 ${dbK.length}`);
for (const [name,fn] of Object.entries(DET)) {
  const rp=run(fn,pos); const hit=rp.filter((r,i)=>r&&(r===pos[i].종||pos[i].종==='?')).length, any=rp.filter(Boolean).length;
  const fUp=run(fn,negUp).filter(Boolean).length, fHa=run(fn,negHa).filter(Boolean).length, f3=run(fn,db3).filter(Boolean).length, fK=run(fn,dbK).filter(Boolean).length;
  console.log(`${name.padEnd(70)} 재현 ${hit}/${pos.length}(방향무관 ${any})  오탐: 4권上 ${fUp} · 4권下非종 ${fHa} · 3권 ${f3} · 강헌 ${fK}`);
}
console.log('\n양성 상세(현재 A 기준 미검출):');
const fA=DET['A 극약(현재: 점수≤-4·뿌리0·세력≥4)'];
for (const c of pos) { const s=S(c.기둥); const r=fA(s); if (r!==c.종) console.log(' ',c.id,c.기둥.join(''),'저자 종'+c.종,'| 점수',YS.strengthWeighted(s).점수,'뿌리',root(s),'장간뿌리',rootJ(s),'세력',JSON.stringify(dominant(s)),'양간',['갑','병','무','경','임'].includes(s.dStem)); }
console.log('\nF 오탐(라벨 있는 음성):');
const fF=DET['F E게이트+장간뿌리≤1'];
for (const c of [...negUp,...negHa]) { const r=fF(S(c.기둥)); if (r) console.log(' ',c.id,c.기둥.join(''),'→ 종'+r); }
console.log('F 양성 적중:'); for (const c of pos) { const r=fF(S(c.기둥)); if (r) console.log(' ',c.id,c.기둥.join(''),'저자',c.종,'엔진',r); }
