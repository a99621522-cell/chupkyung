// ============================================================
// chapgyeong-vol6-rules.js
// 사주첩경 6권 — 문답총론 113항목 규칙 엔진 (1차, 第一~第四)
// 출처: 원문 11~21쪽
// [후속 수정 반영] 군겁쟁재 관살 제어 = 천간 투출·지지 정기 기준
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return {
    branches: [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch],
    stems: [saju.yStem, saju.mStem, saju.dStem, saju.tStem],
  };
}

// ---------- 第一 군겁쟁재(群劫爭財) ----------
function checkGungeopJaengjae(saju) {
  const ilgan = saju.dStem;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  // 관살 제어는 "실질적으로 유효한" 것만 인정 — 천간 투출 또는 지지 정기(주된 기운) 기준
  // (지장간 깊은 곳의 미미한 흔적은 실제 제어력으로 보지 않는다 — 4권 검증에서 확립한 원칙)
  const p = toPillars(saju);
  const gwansalTuchul = p.stems.some((s,i) => i!==2 && ['정관','편관'].includes(Y.getSipseong(ilgan,s)));
  const gwansalJeonggi = p.branches.some(b => {
    const jg = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    return ['정관','편관'].includes(Y.getSipseong(ilgan,jg));
  });
  if (jaeCount === 0 || bigyeopCount < 2) return { 성격: false };
  const jeoje = gwansalTuchul || gwansalJeonggi;
  return {
    성격: true, 항목: '군겁쟁재',
    판정: jeoje ? '비겁을 제어하는 관살 있음 — 반위성부(反爲成富), 오히려 부를 이룸' : '비겁을 제어할 관살 없음 — 파재·극처·극부 위험',
    특기사항: ['동업·합자·주식회사 등은 피해야 함(관살 제어 없을 시)'],
  };
}

// ---------- 第二 득비이재(得比理財) ----------
function checkDeukbiIjae(saju) {
  const ilgan = saju.dStem;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  if (jaeCount < 2 || !sinyak || bigyeopCount === 0) return { 성격: false };
  return {
    성격: true, 항목: '득비이재',
    판정: '재다신약에 비겁의 힘을 빌려 재를 다스림 — 합자·동업·공동투자 유리',
    특기사항: ['형제겁운이 파겁(형충)에 이르면 재앙 위험'],
  };
}

// ---------- 第三 명관과마(明官跨馬) ----------
function checkMyeonggwanGwama(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const gwanStems = p.stems.filter((s,i) => i!==2 && ['정관','편관'].includes(Y.getSipseong(ilgan,s)));
  if (gwanStems.length === 0) return { 성격: false };
  const gwanOhaengs = gwanStems.map(s => Y.ohaengOf(s));
  const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
  const jaeOhaengsNeeded = gwanOhaengs.map(oh => {
    for (const [src, dst] of Object.entries(SAENG)) if (dst === oh) return src;
  });
  const hasJaeSupport = p.branches.some(b => jaeOhaengsNeeded.includes(T.BRANCH_OHAENG[b]));
  if (!hasJaeSupport) return { 성격: false };
  return {
    성격: true, 항목: '명관과마',
    판정: '천간 관성이 지지 재성의 생을 받음 — 여명이면 부주증영(남편 영화)',
  };
}

// ---------- 第四 부성입묘(夫星入墓) — 여명 한정 ----------
const BUSEONG_MYO = { 갑:'축', 을:'축', 병:'진', 정:'진', 무:'미', 기:'미', 경:'술', 신:'술', 임:'진', 계:'진' };
function checkBuseongIbmyo(saju, sex) {
  if (sex !== '여') return { 성격: false };
  const ilgan = saju.dStem;
  const myoBranch = BUSEONG_MYO[ilgan];
  const p = toPillars(saju);
  if (!p.branches.includes(myoBranch)) return { 성격: false };
  return {
    성격: true, 항목: '부성입묘',
    판정: '관성(남편 별)이 묘궁에 듦 — 상부(喪夫) 위험, 부부해로 어려움',
  };
}

const TOPICS = [
  { id:1, 제목:'군겁쟁재', fn: checkGungeopJaengjae },
  { id:2, 제목:'득비이재', fn: checkDeukbiIjae },
  { id:3, 제목:'명관과마', fn: checkMyeonggwanGwama },
  { id:4, 제목:'부성입묘', fn: checkBuseongIbmyo },
];

function analyzeVol6_1(saju, sex) {
  const results = [];
  for (const t of TOPICS) {
    const r = t.fn(saju, sex);
    if (r.성격) results.push({ id: t.id, 제목: t.제목, ...r });
  }
  return results;
}

module.exports = { TOPICS, analyzeVol6_1,
  checkGungeopJaengjae, checkDeukbiIjae, checkMyeonggwanGwama, checkBuseongIbmyo };
