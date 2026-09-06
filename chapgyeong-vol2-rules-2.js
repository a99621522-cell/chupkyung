// ============================================================
// chapgyeong-vol2-rules-2.js
// 사주첩경 2권 — 육친 통변 66주제 규칙 엔진 (2차, 二一~三〇)
// 출처: 원문 66~105쪽 (제4~7편)
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

// ---------- 二一. 수족에 이상이 있다 (원문 66~68쪽) ----------

// 생년·일지 기준 역마/지살 지지 집합
function yeokmaJisalSet(p) {
  const S_ = require('./chapgyeong-vol1-sinsal.js');
  const JISAL={신자진:'신',해묘미:'해',인오술:'인',사유축:'사'}, YEOKMA={신자진:'인',해묘미:'사',인오술:'신',사유축:'해'};
  const set=new Set(); for (const b of [p.branches[0],p.branches[2]]) { const g=S_.getSamhapGroup(b); if(g){set.add(JISAL[g]); set.add(YEOKMA[g]);} }
  return set;
}

function topic21_sujok(saju) {
  // [합본 원문 조건] ① 일·시 급각살 ② 일·시 단교관살 ③ 연월 진·유의 무오일 ④ 무일생 삼전(연월일)에 인사신
  const p = toPillars(saju);
  const reasons = [];
  const gyejeol = S.getGyejeol(p.branches[1]);
  const geupgak = T.GEUPGAK[gyejeol] || [];
  if (geupgak.some(b => [p.branches[2],p.branches[3]].includes(b))) reasons.push('일 또는 시에 급각살');
  const dangyo = T.DANGYOGWAN && T.DANGYOGWAN[p.branches[1]];
  if (dangyo && [p.branches[2],p.branches[3]].includes(dangyo)) reasons.push('일 또는 시에 단교관살');
  if (p.d === '무오' && new Set([p.branches[0],p.branches[1]]).size===2 && ['진','유'].every(b=>[p.branches[0],p.branches[1]].includes(b))) reasons.push('연월 진유+무오일생');
  if (saju.dStem==='무' && ['인','사','신'].every(b => [p.branches[0],p.branches[1],p.branches[2]].includes(b))) reasons.push('무일생 삼전에 인사신 구전');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '수족(팔다리)에 이상이 있다(소아마비·불구 등)' };
}

// ---------- 二二. 정신이상을 앓아 본다 (원문 68~71쪽) ----------
function topic22_jeongsin(saju) {
  // [합본 원문 조건] ① 귀문관살 ② 목·화 일주가 심히 약한 자 (V1의 '기일생 허약' 가설은 원문 조건에 없어 제거)
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  if (T.GWIMUNGWAN[p.branches[2]] && p.branches.includes(T.GWIMUNGWAN[p.branches[2]])) reasons.push('귀문관살 보유');
  const ilOh = Y.ohaengOf(ilgan);
  const wshss = Y.getWangSangHyuSuSa(ilgan, p.branches[1]);
  const ilCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]===ilOh).length + p.stems.filter((s,i)=>i!==2&&T.STEM_OHAENG[s]===ilOh).length;
  if ((ilOh==='목'||ilOh==='화') && Y.isSinYak(wshss) && ilCount===0) reasons.push('목·화 일주 심약(무근)');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '정신이상 또는 신경쇠약을 앓아 본다' };
}

// ---------- 二三. 안목에 이상이 있다 (원문 72~78쪽) ----------
function topic23_anmok(saju) {
  // [합본 원문 조건] ① 가을(신유술월) 을축·을유·갑술일생이 재·관살·상관 혼합으로 심약 ② 병일생이 신·임을 만나 재살 왕
  // ③ 해자월 무기일생 재살 왕 ④ 정사를 놓고 금수 태왕, 또는 갑목일 과어조고
  const p = toPillars(saju);
  const ilju = p.d, ilgan = saju.dStem;
  const reasons = [];
  const G1 = require('./chapgyeong-vol4-gyeokguk.js');
  const jaesal = G1.countSipseongAll(saju, ['정재','편재','정관','편관']).count;
  const sang = G1.countSipseongAll(saju, ['상관']).count;
  const sinyak = Y.isSinYak(Y.getWangSangHyuSuSa(ilgan, p.branches[1]));
  if (['신','유','술'].includes(p.branches[1]) && ['을축','을유','갑술'].includes(ilju) && jaesal + sang >= 4 && sinyak) reasons.push('가을 을축/을유/갑술일생, 재·관살·상관 혼합에 심약');
  if (ilgan==='병' && p.stems.some((s,i)=>i!==2 && ['신','임'].includes(s)) && jaesal >= 4) reasons.push('병일생이 신·임을 만나 재살 왕');
  if (['무','기'].includes(ilgan) && ['해','자'].includes(p.branches[1]) && jaesal >= 4) reasons.push('해자월 무기일생 재살 왕');
  const cnt = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const hasJeongsa = p.stems.some((s,i)=>s==='정' && p.branches[i]==='사');
  if (hasJeongsa && cnt(['금','수']) >= 4) reasons.push('정사를 놓고 금수 태왕');
  if (ilgan==='갑' && cnt(['수']) === 0 && !p.branches.some(b=>['진','축'].includes(b)) && cnt(['화','토']) >= 4) reasons.push('갑목일생 과어조고(지나치게 마름)');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '안목(눈)에 이상이 있다(맹인·색맹·야맹 등)' };
}

// ---------- 二四. 수액이 있다 (원문 79~84쪽) ----------
function topic24_suaek(saju) {
  // [합본 원문 조건] ① 일·시 낙정관살 ② 갑을일생에 수성 왕양 ③ 무기일생이 금수 또는 재살 태왕
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const reasons = [];
  if ([p.branches[2],p.branches[3]].includes(T.NAKJEONGGWAN[ilgan])) reasons.push('일 또는 시에 낙정관살');
  const cnt = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const ilOh = Y.ohaengOf(ilgan);
  if (ilOh==='목' && cnt(['수']) >= 3) reasons.push('갑을일생에 수성 왕양(수다목표)');
  if (ilOh==='토') {
    const G1 = require('./chapgyeong-vol4-gyeokguk.js');
    const jaesal = G1.countSipseongAll(saju, ['정재','편재','정관','편관']).count;
    if (cnt(['금','수']) >= 4 || jaesal >= 5) reasons.push('무기일생 금수·재살 태왕(토류)');
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '수액(익사·음독 등)이 있다' };
}

// ---------- 二五. 치질 또는 맹장염 (원문 85~87쪽) ----------
function topic25_chijil(saju) {
  // [합본 원문 조건] ① 인묘사오미월 경인·경오·경술일 ② 인묘사오미월 신사·신묘·신미일 + 목화 多 ③ 경신일생 목화 왕
  const p = toPillars(saju);
  const ilju = p.d;
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const inmyo = ['인','묘','사','오','미'];
  const reasons = [];
  if (inmyo.includes(p.branches[1]) && ['경인','경오','경술'].includes(ilju)) reasons.push('인묘사오미월 경인/경오/경술일생');
  if (inmyo.includes(p.branches[1]) && ['신사','신묘','신미'].includes(ilju) && cntOh(['목','화']) >= 4) reasons.push('인묘사오미월 신사/신묘/신미일생+목화 다봉');
  if (['경','신'].includes(saju.dStem) && cntOh(['목','화']) >= 4) reasons.push('경신일생+목화 왕');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '치질 또는 맹장염을 앓는다(여명은 월경건혈·생리통)' };
}

// ---------- 二六. 비위가 약하다 (원문 88~93쪽) ----------
function topic26_biwi(saju) {
  // [합본 원문 조건] ① 무기일생이 금·목·수 多 ② 주중 무기토가 재살 多 ③ 인오술·사오미월 무기일이 화토 多
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const reasons = [];
  if (['무','기'].includes(ilgan) && cntOh(['금','목','수']) >= 5) reasons.push('무기일생이 금·목·수를 많이 만남');
  if (['무','기'].includes(ilgan)) {
    const G1 = require('./chapgyeong-vol4-gyeokguk.js');
    if (G1.countSipseongAll(saju, ['정재','편재','정관','편관']).count >= 5) reasons.push('무기토가 재살을 많이 만남');
    if (['인','오','술','사','미'].includes(p.branches[1]) && cntOh(['화','토']) >= 5) reasons.push('화왕월 무기일이 화토를 많이 만남(조토)');
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '비위가 약하다(위병·소화불량 등)' };
}

// ---------- 二七. 해수 또는 천식 (원문 93~96쪽) ----------
function topic27_haesu(saju) {
  // [합본 원문 조건] ① 인오술사미월 갑인·갑오·갑술·을사·을미일 ② 二五 치질 해당자 ③ 임계일생 지지 화국 ④ 해자축월 임신·임자·임인/을해·을묘·을미일 + 수목 엉김
  const p = toPillars(saju);
  const ilju = p.d;
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const reasons = [];
  if (['인','오','술','사','미'].includes(p.branches[1]) && ['갑인','갑오','갑술','을사','을미'].includes(ilju)) reasons.push('화왕월 갑인/갑오/갑술/을사/을미일생');
  if (topic25_chijil(saju).판정) reasons.push('二五 치질·맹장 해당자');
  const B_ = require('./chapgyeong-vol1-basics.js');
  if (['임','계'].includes(saju.dStem) && [...B_.checkSamhap(p.branches),...B_.checkBanghap(p.branches)].some(g=>g.ohaeng==='화')) reasons.push('임계일생 지지 화국');
  if (['해','자','축'].includes(p.branches[1]) && ['임신','임자','임인','을해','을묘','을미'].includes(ilju) && cntOh(['수','목']) >= 4) reasons.push('삼동월 임/을일생 수목 엉김');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '해수 또는 천식이 있다' };
}

// ---------- 二八. 성병을 앓아 본다 (원문 96~99쪽) ----------
const GONGRANG_DOHWA = [
  {ilju:'병자', si:'신묘'}, {ilju:'기묘', si:'갑자'},
];
function topic28_seongbyeong(saju) {
  // [합본 원문 조건] ① 임계일생 화·토 多 ② 도화가 형을 만난 자 ③ 곤랑도화
  const p = toPillars(saju);
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const reasons = [];
  if (['임','계'].includes(saju.dStem) && cntOh(['화','토']) >= 4) reasons.push('임계일생 화·토 다봉');
  const yearSamhap = S.getSamhapGroup(p.branches[0]);
  if (yearSamhap) {
    const dohwa = T.DOHWA[yearSamhap];
    if (p.branches.includes(dohwa)) {
      const rel = require('./chapgyeong-vol1-basics.js').checkBranchRelations(p.branches);
      if (rel.형.some(f=>f.includes(dohwa))) reasons.push(`도화(${dohwa})가 형을 만남`);
    }
  }
  const ilju = p.d;
  GONGRANG_DOHWA.forEach(g => { if (ilju === g.ilju && p.t === g.si) reasons.push(`곤랑도화(${g.ilju}일 ${g.si}시)`); });
  return { 판정: reasons.length>0, 근거: reasons, 결과: '성병을 앓아 본다' };
}

// ---------- 二九. 늦도록 야뇨증 (원문 99~101쪽) ----------
function topic29_yanyo(saju) {
  // [합본 원문 조건] ① 신유술해자축월 경신임계일생이 다시 금수를 만난 자 ② 임계일생이 지지 화국에 다시 수화를 만난 자
  const p = toPillars(saju);
  const cntOh = ohs => p.branches.filter(b=>ohs.includes(T.BRANCH_OHAENG[b])).length + p.stems.filter((s,i)=>i!==2&&ohs.includes(T.STEM_OHAENG[s])).length;
  const reasons = [];
  if (['신','유','술','해','자','축'].includes(p.branches[1]) && ['경','신','임','계'].includes(saju.dStem) && cntOh(['금','수']) >= 4) reasons.push('가을·겨울월 금수일생+금수 다봉(금수냉한)');
  const B_ = require('./chapgyeong-vol1-basics.js');
  if (['임','계'].includes(saju.dStem) && [...B_.checkSamhap(p.branches),...B_.checkBanghap(p.branches)].some(g=>g.ohaeng==='화') && cntOh(['수']) >= 2) reasons.push('임계일생 지지 화국에 다시 수화(수화상열)');
  return { 판정: reasons.length>0, 근거: reasons, 결과: '늦도록 야뇨증(오줌싸개)이 있다' };
}

// ---------- 三〇. 나팔관 임신 — 여명 한정 (원문 101~105쪽) ----------
function topic30_nappalgwan(saju, sex) {
  if (sex !== '여') return { 판정:false, 근거:[], 결과:null };
  const p = toPillars(saju);
  const reasons = [];
  const jinsul = ['진','술','축','미'];
  if (['병','정'].includes(saju.dStem) && jinsul.includes(p.branches[1])) {
    const toCount = p.branches.filter(b => T.BRANCH_OHAENG[b]==='토').length;
    if (toCount >= 2) reasons.push('병정일생 진술축미월+토 다봉');
  }
  return { 판정: reasons.length>0, 근거: reasons, 결과: '나팔관 임신·자궁수술 등이 있다(여명)' };
}

const TOPICS_2 = [
  { id:21, 제목:'수족에 이상이 있다', fn: topic21_sujok },
  { id:22, 제목:'정신이상을 앓아 본다', fn: topic22_jeongsin },
  { id:23, 제목:'안목에 이상이 있다', fn: topic23_anmok },
  { id:24, 제목:'수액이 있다', fn: topic24_suaek },
  { id:25, 제목:'치질 또는 맹장염', fn: topic25_chijil },
  { id:26, 제목:'비위가 약하다', fn: topic26_biwi },
  { id:27, 제목:'해수 또는 천식', fn: topic27_haesu },
  { id:28, 제목:'성병을 앓아 본다', fn: topic28_seongbyeong },
  { id:29, 제목:'늦도록 야뇨증', fn: topic29_yanyo },
  { id:30, 제목:'나팔관 임신(여명)', fn: topic30_nappalgwan },
];

module.exports = { TOPICS_2,
  topic21_sujok, topic22_jeongsin, topic23_anmok, topic24_suaek, topic25_chijil,
  topic26_biwi, topic27_haesu, topic28_seongbyeong, topic29_yanyo, topic30_nappalgwan };
