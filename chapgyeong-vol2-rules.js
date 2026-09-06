// ============================================================
// chapgyeong-vol2-rules.js
// 사주첩경 2권 — 육친 통변 66주제 규칙 엔진 (1차, 10개 주제)
// 출처: 사주첩경2권_쉬운한글풀이_완성본.pdf 원문 11~65쪽 (제1~4편)
// [후속 수정 반영] 형제흉사 조건③(충) 추가
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const S = require('./chapgyeong-vol1-sinsal.js');

function toPillars(saju) {
  return {
    y: saju.yStem+saju.yBranch, m: saju.mStem+saju.mBranch,
    d: saju.dStem+saju.dBranch, t: saju.tStem+saju.tBranch,
    branches: [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch],
    stems: [saju.yStem, saju.mStem, saju.dStem, saju.tStem],
  };
}

// ---------- 一. 고향을 떠나 산다 (원문 11~13쪽) ----------

// 생년·일지 기준 역마/지살 지지 집합
function yeokmaJisalSet(p) {
  const S_ = require('./chapgyeong-vol1-sinsal.js');
  const JISAL={신자진:'신',해묘미:'해',인오술:'인',사유축:'사'}, YEOKMA={신자진:'인',해묘미:'사',인오술:'신',사유축:'해'};
  const set=new Set(); for (const b of [p.branches[0],p.branches[2]]) { const g=S_.getSamhapGroup(b); if(g){set.add(JISAL[g]); set.add(YEOKMA[g]);} }
  return set;
}

function topic01_gohyang(saju) {
  const p = toPillars(saju);
  const sinsal = S.analyzeSinsal(saju);
  const reasons = [];
  const jisal = sinsal.십이신살.배치 && Object.keys(sinsal.십이신살.배치).find(b => sinsal.십이신살.배치[b]==='지살');
  if (jisal && (p.branches[0]===jisal || p.branches[2]===jisal)) reasons.push('연 또는 일에 지살');
  const rel = B.checkBranchRelations([p.branches[1], p.branches[2]]);
  if (rel.충.length) reasons.push('일월 상충');
  if (rel.형.length) reasons.push('일월 상형');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '고향을 떠나 타향살이한다' };
}

// ---------- 三. 부모형제간이 불화하다 (원문 15~16쪽) ----------
function topic03_bumohyeongje(saju) {
  const p = toPillars(saju);
  const rel = B.checkBranchRelations([p.branches[1], p.branches[2]]);
  const reasons = [];
  if (rel.충.length) reasons.push('일월 지지 상충');
  const ilOh = Y.ohaengOf(saju.dStem), wolOh = Y.ohaengOf(saju.mStem);
  const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
  if (GEUK[ilOh]===wolOh || GEUK[wolOh]===ilOh) reasons.push('일월 천간 상극');
  if (rel.형.length) reasons.push('일월 상형');
  if (rel.원진.length) reasons.push('일월 원진');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '부모형제간에 불화 또는 별거한다' };
}

// ---------- 四. 조부가 흉사한다 (원문 16~19쪽) ----------
function topic04_jobu(saju) {
  const p = toPillars(saju);
  const reasons = [];
  const ilgan = saju.dStem;
  const pyeonIn자리 = [];
  p.branches.forEach((b,i) => {
    const jeonggi = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    if (Y.getSipseong(ilgan, jeonggi) === '편인') pyeonIn자리.push({idx:i, branch:b});
  });
  if (pyeonIn자리.length === 0) return { 판정:false, 근거:[], 결과:null };
  const stems = p.stems, branches = p.branches;
  pyeonIn자리.forEach(pi => {
    const rel = B.checkBranchRelations(branches);
    const inHyeong = rel.형.some(f => f.includes(pi.branch));
    if (inHyeong) reasons.push(`편인(${pi.branch})이 형을 만남`);
    const gz = stems[pi.idx] + branches[pi.idx];
    if (T.BAEKHO.includes(gz)) reasons.push(`편인 기둥(${gz})이 백호대살`);
  });
  return { 판정: reasons.length>0, 근거: reasons, 결과: '조부가 흉사한다' };
}

// ---------- 五. 부친이 횡사한다 (원문 19~21쪽) ----------
function topic05_bubchin(saju) {
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const ilju = p.d;
  const reasons = [];
  if (['갑진','을미'].includes(ilju)) reasons.push(`일주 자체(${ilju})가 백호대살+편재`);
  p.branches.forEach((b,i) => {
    const jeonggi = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    if (Y.getSipseong(ilgan, jeonggi) === '편재') {
      const gz = p.stems[i] + b;
      if (T.BAEKHO.includes(gz)) reasons.push(`편재 기둥(${gz})이 백호대살`);
    }
  });
  p.stems.forEach((s,i) => {
    if (i===2) return;
    if (Y.getSipseong(ilgan, s) === '편재') {
      const gz = s + p.branches[i];
      if (T.BAEKHO.includes(gz)) reasons.push(`편재 천간 기둥(${gz})이 백호대살`);
    }
  });
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '부친이 횡사(총살·자살·사고사 등)한다' };
}

// ---------- 六. 모친이 흉사한다 (원문 22~25쪽) ----------
function topic06_mochin(saju) {
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  p.branches.forEach((b,i) => {
    const jeonggi = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    if (Y.getSipseong(ilgan, jeonggi) === '정인' || Y.getSipseong(ilgan, jeonggi) === '편인') {
      const rel = B.checkBranchRelations(p.branches);
      if (rel.형.some(f => f.includes(b))) reasons.push(`인수(${b})가 형을 만남`);
      const gz = p.stems[i] + b;
      if (T.BAEKHO.includes(gz)) reasons.push(`인수 기둥(${gz})이 백호대살`);
    }
  });
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '모친이 흉사하거나 불구가 된다' };
}

// ---------- 一〇. 형제자매간에 흉사가 있다 (원문 33~36쪽) ----------
function topic10_hyeongje(saju) {
  // [합본 원문 조건] ① 비견·비겁이 형을 만난 자 ② 비겁이 백호대살에 임한 자 ③ 월건이 충을 만나거나, 비겁이 충을 만나고 관살이 왕한 자
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  const rel = B.checkBranchRelations(p.branches);
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const gwansalWang = G1.countSipseongAll(saju, ['정관','편관']).count >= 3;
  p.branches.forEach((b,i) => {
    const ss = Y.getSipseong(ilgan, T.JIJANGGAN[b][T.JIJANGGAN[b].length-1]);
    if (ss !== '비견' && ss !== '비겁') return;
    if (rel.형.some(f => f.includes(b))) reasons.push(`비견/비겁(${b})이 형을 만남`);
    if (T.BAEKHO.includes(p.stems[i] + b)) reasons.push(`비견/비겁 기둥(${p.stems[i]}${b})이 백호대살`);
    if (gwansalWang && rel.충.some(f => f.includes(b))) reasons.push(`비견/비겁(${b})이 충을 만나고 관살 왕`);
  });
  if (rel.충.some(f => f.includes(p.branches[1]))) reasons.push('월건(형제궁)이 충을 만남');
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '형제자매간에 흉사(사고사·자살 등)가 있다' };
}

// ---------- 一七. 해외출입을 한다 (원문 50~53쪽) ----------
function topic17_haeoe(saju) {
  // [합본 원문 조건] ① 주중에 역마(생년·일지 기준) ② 지살을 거듭 만남 ③ 해·자 연월의 갑을일생, 또는 해·자 연월의 임계일생
  const p = toPillars(saju);
  const S_ = require('./chapgyeong-vol1-sinsal.js');
  const JISAL={신자진:'신',해묘미:'해',인오술:'인',사유축:'사'}, YEOKMA={신자진:'인',해묘미:'사',인오술:'신',사유축:'해'};
  const reasons = [];
  for (const [base,label] of [[p.branches[0],'생년'],[p.branches[2],'일지']]) {
    const g = S_.getSamhapGroup(base); if (!g) continue;
    if (p.branches.includes(YEOKMA[g])) reasons.push(`${label} 기준 역마(${YEOKMA[g]}) 보유`);
    if (p.branches.filter(b=>b===JISAL[g]).length >= 2) reasons.push(`${label} 기준 지살(${JISAL[g]}) 거듭`);
  }
  if (['해','자'].includes(p.branches[0]) && ['해','자'].includes(p.branches[1]) && ['갑','을','임','계'].includes(saju.dStem)) reasons.push('해·자 연월의 갑을/임계일생');
  return { 판정: reasons.length>0, 근거: [...new Set(reasons)], 결과: '해외출입(유학·이민·무역 등)을 한다' };
}

// ---------- 一八. 노상횡액이 있다 — 형합격 90% (원문 53~57쪽) ----------
function topic18_nosanghoeaek(saju) {
  // [합본 원문 조건] ① 계사·계축·계미일 갑인시 ② 역마·지살이 일지를 형 ③ 역마·지살이 재살국을 이룸 ④ 역마·지살로 상관·식신이 태왕
  const p = toPillars(saju);
  const ilju = p.d, ilgan = saju.dStem;
  const reasons = [];
  if (['계사','계축','계미'].includes(ilju) && p.t === '갑인') reasons.push(`${ilju}일 갑인시 — 형합격(교통사고 90% 경험)`);
  const yj = yeokmaJisalSet(p);
  const present = p.branches.filter(b => yj.has(b));
  const rel = B.checkBranchRelations(p.branches);
  if (present.some(b => b!==p.branches[2] && rel.형.some(f => f.includes(b) && f.includes(p.branches[2])))) reasons.push('역마·지살이 일지를 형함');
  const GEUK={목:'토',화:'금',토:'수',금:'목',수:'화'}, GWAN={목:'금',화:'수',토:'목',금:'화',수:'토'}; const ilOh=Y.ohaengOf(ilgan);
  const guks=[...B.checkSamhap(p.branches),...B.checkBanghap(p.branches)];
  if (present.length && guks.some(g => (g.ohaeng===GEUK[ilOh]||g.ohaeng===GWAN[ilOh]) && present.some(b=>g.chars.includes(b)))) reasons.push('역마·지살이 재살국을 이룸');
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  if (sikCount >= 4 && present.some(b => ['식신','상관'].includes(Y.getSipseong(ilgan, T.JIJANGGAN[b].slice(-1)[0])))) reasons.push('역마·지살로 상관·식신 태왕');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '노상횡액(교통사고 등)을 겪는다' };
}

// ---------- 一九. 화상 또는 음독 (원문 58~62쪽) ----------
function topic19_hwasang(saju) {
  // [합본 원문 조건] ①인·오·축일생(탕화살) ②인일생이 사·신 ③오일생이 진·오·축 ④축일생이 오·미·술 ⑤무인일 인 거듭 ⑥무자일 인·사·신
  const p = toPillars(saju);
  const ilju = p.d, dBranch = p.branches[2];
  const others = p.branches.filter((b,i)=>i!==2);
  const reasons = [];
  if (['인','오','축'].includes(dBranch)) reasons.push(`일지 ${dBranch} 탕화살`);
  if (dBranch==='인' && others.some(b=>['사','신'].includes(b))) reasons.push('인일생이 사·신을 만남');
  if (dBranch==='오' && others.some(b=>['진','오','축'].includes(b))) reasons.push('오일생이 진·오·축을 만남');
  if (dBranch==='축' && others.some(b=>['오','미','술'].includes(b))) reasons.push('축일생이 오·미·술을 만남');
  if (ilju==='무인' && others.includes('인')) reasons.push('무인일이 인을 거듭 만남');
  if (ilju==='무자' && others.some(b=>['인','사','신'].includes(b))) reasons.push('무자일이 인·사·신을 만남');
  // 탕화 단독(①)만 있으면 약한 근거 — ②~⑥ 중 하나가 겹칠 때 판정
  const strong = reasons.filter(r=>!r.includes('탕화살'));
  return { 판정: strong.length>0, 근거: reasons, 결과: '화상 또는 음독(자살기도 포함)을 겪어 본다' };
}

// ---------- 二〇. 감금을 당한다 (원문 63~65쪽) ----------
function topic20_gamgeum(saju) {
  const p = toPillars(saju);
  const dBranch = p.branches[2];
  const reasons = [];
  const rel = B.checkBranchRelations(p.branches);
  if (rel.형.some(f => f.includes(dBranch))) reasons.push('일지가 형을 만남');
  const yearSamhap = S.getSamhapGroup(p.branches[0]);
  if (yearSamhap && p.branches.includes(T.SUOK[yearSamhap])) reasons.push('주중에 수옥살 보유');
  const namang = ['진','술','사','해'];
  if (namang.includes(dBranch)) {
    const others = p.branches.filter((b,i) => i!==2 && namang.includes(b));
    if (others.length > 0) reasons.push(`나망(진술사해)일생이 나망 글자(${others.join(',')})를 더 만남`);
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '감금·납치·구속 등을 당해 본다(경찰·형무관·사법관 종사시 무방)' };
}

// ---------- 종합 실행기 ----------
const TOPICS = [
  { id:1, 제목:'고향을 떠나 산다', fn: topic01_gohyang },
  { id:3, 제목:'부모형제간이 불화하다', fn: topic03_bumohyeongje },
  { id:4, 제목:'조부가 흉사한다', fn: topic04_jobu },
  { id:5, 제목:'부친이 횡사한다', fn: topic05_bubchin },
  { id:6, 제목:'모친이 흉사한다', fn: topic06_mochin },
  { id:10, 제목:'형제자매간에 흉사가 있다', fn: topic10_hyeongje },
  { id:17, 제목:'해외출입을 한다', fn: topic17_haeoe },
  { id:18, 제목:'노상횡액이 있다', fn: topic18_nosanghoeaek },
  { id:19, 제목:'화상 또는 음독', fn: topic19_hwasang },
  { id:20, 제목:'감금을 당한다', fn: topic20_gamgeum },
];

function analyzeVol2(saju) {
  const results = [];
  for (const topic of TOPICS) {
    const r = topic.fn(saju);
    if (r.판정) results.push({ id: topic.id, 제목: topic.제목, ...r });
  }
  return results;
}

module.exports = { TOPICS, analyzeVol2,
  topic01_gohyang, topic03_bumohyeongje, topic04_jobu, topic05_bubchin, topic06_mochin,
  topic10_hyeongje, topic17_haeoe, topic18_nosanghoeaek, topic19_hwasang, topic20_gamgeum };
