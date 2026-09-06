// ============================================================
// chapgyeong-vol6-rules-2.js
// 사주첩경 6권 — 문답총론 (2차, 第五~第八)
// 출처: 원문 22~31쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches: [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems: [saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第五 명암부집(明暗夫集) — 여명 한정 ----------
function checkMyeongamBujip(saju, sex) {
  if (sex !== '여') return { 성격: false };
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const myeongGwan = p.stems.filter((s,i)=>i!==2 && ['정관','편관'].includes(Y.getSipseong(ilgan,s))).length;
  const amGwan = p.branches.filter(b => Y.hasSipseongInBranch(ilgan, b, ['정관','편관'])).length;
  const total = myeongGwan + amGwan;
  if (total < 3) return { 성격: false };
  return {
    성격: true, 항목: '명암부집',
    판정: '천간 명관+지지 암관이 여럿 모임 — 개가·풍기문란 위험(단, 관살 정리되면 오히려 귀함)',
  };
}

// ---------- 第六 배록축마(背祿逐馬) ----------
function checkBaerokChukma(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const gwanExists = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정관') ||
                      p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정관']));
  const sangExists = G1.countSipseongAll(saju, ['상관']).count > 0;
  if (!gwanExists || !sangExists) return { 성격: false };
  const jaeExists = G1.countSipseongAll(saju, ['정재','편재']).count > 0;
  const bigyeopExists = G1.countSipseongAll(saju, ['비견','비겁']).count > 0;
  if (!jaeExists || !bigyeopExists) return { 성격: false };
  return {
    성격: true, 항목: '배록축마',
    판정: '관이 상관에 배록되고 재가 비겁에 축마됨 — 사회적 출세 어려움, 형제·붕우로 인한 파재',
  };
}

// ---------- 第七 상관상진(傷官傷盡) ----------
function checkSanggwanSangjin(saju) {
  const ilgan = saju.dStem;
  const sangCount = G1.countSipseongAll(saju, ['상관']).count;
  if (sangCount === 0) return { 성격: false };
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  if (inCount === 0) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  return {
    성격: true, 항목: '상관상진',
    판정: sinyak ? '신약상관 — 상진이 마땅함(길, 인수운에 대귀)' : '신강한데 상관 눌림 — 오만불손 항거 위험(신강이면 상관으로 설정해야 함)',
  };
}

// ---------- 第八 파료상관(破了傷官) ----------
function checkParyoSanggwan(saju) {
  const ilgan = saju.dStem;
  const sangCount = G1.countSipseongAll(saju, ['상관']).count;
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  if (sangCount === 0 || inCount === 0) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false };
  return {
    성격: true, 항목: '파료상관',
    판정: '신왕상관약에 인수가 필요한 상관을 파괴 — 수원(壽元) 손상 위험(단, 진상관의 파료는 오히려 영화)',
  };
}

const TOPICS_2 = [
  { id:5, 제목:'명암부집', fn: checkMyeongamBujip },
  { id:6, 제목:'배록축마', fn: checkBaerokChukma },
  { id:7, 제목:'상관상진', fn: checkSanggwanSangjin },
  { id:8, 제목:'파료상관', fn: checkParyoSanggwan },
];

module.exports = { TOPICS_2, checkMyeongamBujip, checkBaerokChukma, checkSanggwanSangjin, checkParyoSanggwan };
