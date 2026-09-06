// ============================================================
// chapgyeong-vol2-rules-5.js
// 사주첩경 2권 — 육친 통변 66주제 (5차, 五五~六六 자손편+총각득자)
// 출처: 원문 229~264쪽 (제14~17편)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

function toPillars(saju) {
  return {
    branches: [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch],
    stems: [saju.yStem, saju.mStem, saju.dStem, saju.tStem],
  };
}
function sipseongOfBranch(ilgan, branch) {
  const jg = T.JIJANGGAN[branch][T.JIJANGGAN[branch].length-1];
  return Y.getSipseong(ilgan, jg);
}

// ---------- 五五. 처녀 잉태 (원문 229~232쪽) ----------
function topic55_cheonyeo(saju, sex) {
  // [합본 원문 조건] 관·식이 동림(같은 기둥)하여 일주와 합한 자
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const rel = B.checkBranchRelations(p.branches);
  for (let i=0;i<4;i++) { if (i===2) continue;
    const st = Y.getSipseong(ilgan, p.stems[i]), br = sipseongOfBranch(ilgan, p.branches[i]);
    const dongrim = (['정관','편관'].includes(st) && ['식신','상관'].includes(br)) || (['식신','상관'].includes(st) && ['정관','편관'].includes(br));
    if (dongrim && rel.합.some(h => h.includes(p.branches[i]) && h.includes(p.branches[2]))) reasons.push(`관·식 동림 기둥(${p.stems[i]}${p.branches[i]})이 일주와 합`);
  }
  // 3권 실례 구결 "식신관합 부정배태": 관 지지와 식상 지지의 합도 저자 실운용상 성립
  const gwanBr = p.branches.filter(b => ['정관','편관'].includes(sipseongOfBranch(ilgan,b)));
  const sikBr = p.branches.filter(b => ['식신','상관'].includes(sipseongOfBranch(ilgan,b)));
  if (gwanBr.some(g => sikBr.some(k => rel.합.some(h => h.includes(g) && h.includes(k))))) reasons.push('관(부)·식(자) 지지가 합함(식신관합)');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '처녀 잉태(부정 배태)가 있다' };
}

// ---------- 五六. 무자하기 쉽다 — 남명 (원문 232~235쪽) ----------
function topic56_muja_nam(saju, sex) {
  // [합본 원문 조건·남명] ① 시 관살+주중 관살 왕 · 시상상관+주중 상관 또 있음 ② 자손궁(시) 공망·형 · 관살 심약에 생조 없음
  if (sex !== '남') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gs = G1.countSipseongAll(saju, ['정관','편관']).count, sang = G1.countSipseongAll(saju, ['상관']).count, jae = G1.countSipseongAll(saju, ['정재','편재']).count;
  const tSip = Y.getSipseong(ilgan, saju.tStem);
  if (['정관','편관'].includes(tSip) && gs >= 3) reasons.push('시에 관살+주중 관살 왕');
  if (tSip === '상관' && sang >= 2) reasons.push('시상상관+주중 상관 또 있음');
  const G60 = require('./chapgyeong-vol1-gapja60.js'); const sun = G60.getSunInfo(saju.dStem+saju.dBranch);
  if (sun && (T.GONGMANG[sun.순+'순']||[]).includes(p.branches[3])) reasons.push('자손궁(시) 공망');
  const rel = B.checkBranchRelations(p.branches);
  if (rel.형.some(f=>f.includes(p.branches[3]))) reasons.push('자손궁(시)이 형');
  if (gs >= 1 && gs <= 1 && jae === 0) reasons.push('관살 심약에 생조(재) 없음');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '무자하기 쉽다(남명)' };
}

// ---------- 五七. 무자하기 쉽다 — 여명 (원문 236~238쪽) ----------
function topic57_muja_yeo(saju, sex) {
  // [합본 원문 조건·여명] ① 일·시 인수·효신 겸비로 자손궁 점령·상관 극 · 일·시 상관이 형충공망 ② 상관 심약 또는 심왕(모쇠자왕) · 병오일 임진시 상관 다봉 · 묘일유시·유일묘시
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const sang = G1.countSipseongAll(saju, ['상관']).count, sik = G1.countSipseongAll(saju, ['식신','상관']).count;
  const inS = ['정인','편인'];
  if (inS.includes(sipseongOfBranch(ilgan,p.branches[2])) && inS.includes(sipseongOfBranch(ilgan,p.branches[3]))) reasons.push('일·시에 인수·효신 겸비 — 자손궁 점령, 상관 극');
  const rel = B.checkBranchRelations(p.branches);
  const G60 = require('./chapgyeong-vol1-gapja60.js'); const sun = G60.getSunInfo(ilju); const gm = sun ? (T.GONGMANG[sun.순+'순']||[]) : [];
  for (const i of [2,3]) { const b=p.branches[i]; if (sipseongOfBranch(ilgan,b)!=='상관') continue;
    if (rel.형.some(f=>f.includes(b)) || rel.충.some(c=>c.includes(b)) || gm.includes(b)) reasons.push(`${i===2?'일':'시'}지 상관이 형·충·공망`); }
  if (sik === 0) reasons.push('상관·식신 전무(자성 심약)'); else if (sang >= 4) reasons.push(`상관 심왕(${sang}) — 모쇠자왕`);
  if (ilju === '병오' && saju.tStem+saju.tBranch === '임진' && sang >= 2) reasons.push('병오일 임진시 상관 다봉');
  if ((p.branches[2]==='묘'&&p.branches[3]==='유') || (p.branches[2]==='유'&&p.branches[3]==='묘')) reasons.push('묘일 유시 / 유일 묘시');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '무자하기 쉽다(여명)' };
}

// ---------- 五八. 소실에서 득자 (원문 239~243쪽) ----------
function topic58_sosilDeukja(saju, sex) {
  // [합본 원문 조건·남명] 관귀(자식별)가 거듭 패망·극 · 일지 암장관이 타주 지지 관살과 합(육합·삼합·방합·준합·우합·동합)하고 천간에도 관살 한 자 이상
  if (sex !== '남') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gs = G1.countSipseongAll(saju, ['정관','편관']).count, sik = G1.countSipseongAll(saju, ['식신','상관']).count;
  const rel = B.checkBranchRelations(p.branches);
  const gwanBr = p.branches.filter(b => ['정관','편관'].includes(sipseongOfBranch(ilgan,b)));
  const hyeongchung = gwanBr.filter(g => rel.형.some(f=>f.includes(g)) || rel.충.some(c=>c.includes(g))).length;
  if (hyeongchung >= 2 || (hyeongchung >= 1 && sik >= 3)) reasons.push('관귀(자식별)가 거듭 형충·극을 당함');
  const isGwan = g => ['정관','편관'].includes(Y.getSipseong(ilgan,g));
  const stemGwan = [saju.yStem,saju.mStem,saju.tStem].some(isGwan);
  if (stemGwan && (T.JIJANGGAN[p.branches[2]]||[]).some(isGwan)) {
    const D = require('./chapgyeong-vol2-dokchang.js');
    for (const i of [0,1,3]) { const ob=p.branches[i]; if (!(T.JIJANGGAN[ob]||[]).some(isGwan)) continue;
      const yh = rel.합.some(h=>h.includes(ob)&&h.includes(p.branches[2])), dk = D.checkJeojaDokchangHap(p.branches[2], ob);
      if (yh || dk) { reasons.push(`일지 암장관이 타주(${ob}) 관과 ${yh?'육합':dk} + 천간 관살`); break; } }
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '소실(첩)에서 득자한다' };
}

// ---------- 五九·六〇. 불구 자손 (원문 244~249쪽) ----------
function topic5960_bulgu(saju, sex) {
  // [합본 원문 五九·六〇] 남: 관살 미약에 상식 왕 극 · 관살·시간 공망·충·형 · 시에 급각·단교 / 여: 상식이 인수 거듭 또는 형 · 상식 또는 시에 급각·단교
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gs = G1.countSipseongAll(saju, ['정관','편관']).count, sik = G1.countSipseongAll(saju, ['식신','상관']).count, ins = G1.countSipseongAll(saju, ['정인','편인']).count;
  const rel = B.checkBranchRelations(p.branches);
  const S_ = require('./chapgyeong-vol1-sinsal.js'); const geupgak = T.GEUPGAK[S_.getGyejeol(p.branches[1])]||[]; const dangyo = T.DANGYOGWAN && T.DANGYOGWAN[p.branches[1]];
  const G60 = require('./chapgyeong-vol1-gapja60.js'); const sun = G60.getSunInfo(saju.dStem+saju.dBranch); const gm = sun ? (T.GONGMANG[sun.순+'순']||[]) : [];
  const t = p.branches[3];
  if (sex === '남') {
    if (gs >= 1 && gs <= 1 && sik >= 3) reasons.push('관살(자손) 미약에 상식 왕하여 극함');
    const gwanBr = p.branches.filter(b=>['정관','편관'].includes(sipseongOfBranch(ilgan,b)));
    if ([...gwanBr, t].some(b => gm.includes(b) || rel.충.some(c=>c.includes(b)) || rel.형.some(f=>f.includes(b)))) reasons.push('관살·시간이 공망·충·형');
    if (geupgak.includes(t) || t === dangyo) reasons.push('시에 급각·단교관살');
  } else {
    const sikBr = p.branches.filter(b=>['식신','상관'].includes(sipseongOfBranch(ilgan,b)));
    if (sikBr.length && ins >= 3) reasons.push('상식(자녀)이 인수를 거듭 만남');
    if (sikBr.some(b=>rel.형.some(f=>f.includes(b)))) reasons.push('상식(자녀)이 형을 만남');
    if ([...sikBr, t].some(b => geupgak.includes(b) || b === dangyo)) reasons.push('상식 또는 시에 급각·단교관살');
  }
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '불구 자손을 둔다' };
}

// ---------- 六一. 자손 흉사 — 남명 (원문 249~252쪽) ----------
function topic61_jasonHyungsa_nam(saju, sex) {
  // [합본 원문 六一·남명] ① 기미일생 축·술 · 갑을일생 병술월·병술시 ② 관살이 형을 만나고 상식 많음
  if (sex !== '남') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem, ilju = saju.dStem+saju.dBranch;
  const reasons = [];
  if (ilju === '기미' && p.branches.some((b,i)=>i!==2&&['축','술'].includes(b))) reasons.push('기미일생이 축/술을 만남');
  if (['갑','을'].includes(ilgan) && (p.m === '병술' || p.t === '병술')) reasons.push('갑을일생 병술월/병술시');
  const G1 = require('./chapgyeong-vol4-gyeokguk.js'); const sik = G1.countSipseongAll(saju, ['식신','상관']).count;
  const rel = B.checkBranchRelations(p.branches);
  const gwanBr = p.branches.filter(b=>['정관','편관'].includes(sipseongOfBranch(ilgan,b)));
  if (gwanBr.some(b=>rel.형.some(f=>f.includes(b))) && sik >= 3) reasons.push('관살(자손)이 형을 만나고 상식 많음');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '자손이 흉사한다(남명)' };
}

// ---------- 六二. 자손 수액 — 남명 (원문 253~255쪽) ----------
function topic62_jasonSuaek(saju, sex) {
  // [합본 원문 六二·남명] 경진일 경진시 · 임계일 수왕에 토 관살 미약
  if (sex !== '남') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const reasons = [];
  if (saju.dStem+saju.dBranch === '경진' && p.t === '경진') reasons.push('경진일 경진시');
  if (['임','계'].includes(saju.dStem)) {
    const G1 = require('./chapgyeong-vol4-gyeokguk.js'); const gs = G1.countSipseongAll(saju, ['정관','편관']).count;
    const su = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='수').length + p.stems.filter((s,i)=>i!==2&&T.STEM_OHAENG[s]==='수').length;
    if (su >= 4 && gs <= 1) reasons.push('임계일 수왕에 토관살 미약(수다토류)');
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '자손에게 수액이 있다(남명)' };
}

// ---------- 六四. 옥외 출생 (원문 257~259쪽) ----------
function topic64_okoe(saju) {
  // [합본 원문 六四] 일·시의 역마·지살(생년·일지 기준)이 합한 자 · 연·월의 역마·지살이 일주와 합한 자
  const p = toPillars(saju);
  const reasons = [];
  const S_ = require('./chapgyeong-vol1-sinsal.js'); const map = S_.analyzeSinsal(saju).십이신살.배치 || {};
  const rel = B.checkBranchRelations(p.branches);
  const isYJ = b => ['역마','지살'].includes(map[b]);
  for (const i of [2,3]) if (isYJ(p.branches[i]) && rel.합.some(h=>h.includes(p.branches[i]))) reasons.push(`${i===2?'일':'시'}지 ${map[p.branches[i]]}(${p.branches[i]})이 합함`);
  for (const i of [0,1]) if (isYJ(p.branches[i]) && rel.합.some(h=>h.includes(p.branches[i])&&h.includes(p.branches[2]))) reasons.push(`${i===0?'연':'월'}지 ${map[p.branches[i]]}(${p.branches[i]})이 일주와 합`);
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '옥외(차중·길·타향 등)에서 출생했다' };
}

// ---------- 六五. 혼혈아 (원문 259~262쪽) ----------
function topic65_honhyeol(saju, sex) {
  // [합본 원문 六五] ① 역마에 관살이 임하고 재가 일주와 합 ② 인신사해가 일간의 재·관이 되어 일지에 합
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const S_ = require('./chapgyeong-vol1-sinsal.js'); const map = S_.analyzeSinsal(saju).십이신살.배치 || {};
  const rel = B.checkBranchRelations(p.branches);
  const sipB = b => sipseongOfBranch(ilgan, b);
  const yeokmaGwan = p.branches.some((b,i)=>map[b]==='역마' && (['정관','편관'].includes(sipB(b)) || (i!==2 && ['정관','편관'].includes(Y.getSipseong(ilgan,p.stems[i])))));
  const jaeHapIl = p.branches.some((b,i)=>i!==2 && ['정재','편재'].includes(sipB(b)) && rel.합.some(h=>h.includes(b)&&h.includes(p.branches[2])));
  if (yeokmaGwan && jaeHapIl) reasons.push('역마에 관살 임하고 재가 일주와 합');
  p.branches.forEach((b,i)=>{ if (i===2 || !['인','신','사','해'].includes(b)) return; if (['정재','편재','정관','편관'].includes(sipB(b)) && rel.합.some(h=>h.includes(b)&&h.includes(p.branches[2]))) reasons.push(`인신사해(${b})가 재·관이 되어 일지에 합`); });
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '혼혈아를 얻는다(국제결혼)' };
}

// ---------- 六六. 총각득자 (원문 262~264쪽) ----------
function topic66_chonggak(saju, sex) {
  // [합본 원문 六六·남명] 재와 관이 동궁(같은 기둥)에 임하여 일주에 합 · 재·관이 각각 있어 (각각) 일주에 합
  if (sex !== '남') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const rel = B.checkBranchRelations(p.branches);
  const sipB = b => sipseongOfBranch(ilgan, b);
  const hapIl = b => rel.합.some(h=>h.includes(b)&&h.includes(p.branches[2]));
  for (let i=0;i<4;i++) { if (i===2) continue;
    const st = Y.getSipseong(ilgan, p.stems[i]), brS = sipB(p.branches[i]);
    const dong = (['정재','편재'].includes(st)&&['정관','편관'].includes(brS)) || (['정관','편관'].includes(st)&&['정재','편재'].includes(brS));
    if (dong && hapIl(p.branches[i])) reasons.push(`재관 동궁 기둥(${p.stems[i]}${p.branches[i]})이 일주에 합`);
  }
  const jaeHap = p.branches.some((b,i)=>i!==2&&['정재','편재'].includes(sipB(b))&&hapIl(b)), gwanHap = p.branches.some((b,i)=>i!==2&&['정관','편관'].includes(sipB(b))&&hapIl(b));
  if (jaeHap && gwanHap) reasons.push('재·관이 각각 일주에 합');
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '총각이 득자한다' };
}

const TOPICS_5 = [
  { id:55, 제목:'처녀 잉태(여)', fn: topic55_cheonyeo },
  { id:56, 제목:'무자하기 쉽다(남)', fn: topic56_muja_nam },
  { id:57, 제목:'무자하기 쉽다(여)', fn: topic57_muja_yeo },
  { id:58, 제목:'소실에서 득자(남)', fn: topic58_sosilDeukja },
  { id:'59-60', 제목:'불구 자손', fn: topic5960_bulgu },
  { id:61, 제목:'자손 흉사(남)', fn: topic61_jasonHyungsa_nam },
  { id:62, 제목:'자손 수액(남)', fn: topic62_jasonSuaek },
  { id:64, 제목:'옥외 출생', fn: topic64_okoe },
  { id:65, 제목:'혼혈아', fn: topic65_honhyeol },
  { id:66, 제목:'총각득자(남)', fn: topic66_chonggak },
];

module.exports = { TOPICS_5,
  topic55_cheonyeo, topic56_muja_nam, topic57_muja_yeo, topic58_sosilDeukja,
  topic5960_bulgu, topic61_jasonHyungsa_nam, topic62_jasonSuaek, topic64_okoe,
  topic65_honhyeol, topic66_chonggak };
