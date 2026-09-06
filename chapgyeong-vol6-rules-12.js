// ============================================================
// chapgyeong-vol6-rules-12.js
// 6권 12차: 第四十四 화위설상 / 第四十五 등라계갑 / 第四十六 적수오건 /
//           第四十七 녹원호환
// 출처: 원문 133~143쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

const STEM_HAP_HWA = { 갑기:'토', 기갑:'토', 을경:'금', 경을:'금', 병신:'수', 신병:'수', 정임:'목', 임정:'목', 무계:'화', 계무:'화' };
function pairKey(a,b){ return a+b; }

// ---------- 第四十四 화위설상(化爲泄傷) ----------
function checkHwawiSeolsang(saju) {
  const p = toPillars(saju);
  let hwahwaOhaeng = null;
  for (let i=0;i<4;i++) {
    if (i===2) continue;
    const key = pairKey(saju.dStem, p.stems[i]);
    if (STEM_HAP_HWA[key]) { hwahwaOhaeng = STEM_HAP_HWA[key]; break; }
  }
  if (!hwahwaOhaeng) return { 성격: false };
  const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
  const seolgiOh = SAENG[hwahwaOhaeng];
  const seolgiCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]===seolgiOh).length +
                       p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===seolgiOh).length;
  if (seolgiCount < 2) return { 성격: false };
  return {
    성격: true, 항목: '화위설상',
    판정: `일주가 합화하여 ${hwahwaOhaeng}이 되었으나 ${seolgiOh}에게 과다 설기됨 — 원기 손상(돕는 오행 있으면 길, 없으면 공명 못 이룸)`,
  };
}

// ---------- 第四十五 등라계갑(藤蘿繫甲) ----------
function checkDeungnaGyegap(saju) {
  if (saju.dStem !== '을') return { 성격: false };
  const p = toPillars(saju);
  const hasGap = p.stems.some((s,i)=>i!==2 && s==='갑') || p.branches.includes('인');
  if (!hasGap) return { 성격: false };
  const suCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='수').length +
                   p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]==='수').length;
  let 특기사항 = [];
  if (suCount === 0) 특기사항.push('물이 전혀 없음 — 빈곤 위험(강약·조열·용신에 따라 갈림)');
  else if (suCount >= 3) 특기사항.push('물 지나침 — 수다목표(나무가 떠내려감) 위험');
  else 특기사항.push('적당한 물 — 관인상생 가능, 귀격');
  return { 성격: true, 항목: '등라계갑', 판정: '을목이 갑목에 의존 — 무조건 길격이 아니라 강약·조습·용신에 따라 갈림', 특기사항 };
}

// ---------- 第四十六 적수오건(滴水熬乾) ----------
function checkJeoksuOgeon(saju) {
  const p = toPillars(saju);
  const suStemCount = p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]==='수').length;
  if (suStemCount === 0) return { 성격: false };
  const suBranchCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='수').length;
  if (suBranchCount > 0) return { 성격: false };
  const hwaCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='화').length;
  if (hwaCount < 2) return { 성격: false };
  const seupToExists = p.branches.some(b=>['진','축'].includes(b));
  if (seupToExists) return { 성격: false };
  return {
    성격: true, 항목: '적수오건',
    판정: '천간의 물이 지지에 뿌리 전혀 없이 화국에 완전히 마름 — 화·토 종격으로 흐름, 순세(順)면 형통 역세(逆)면 대흉',
  };
}

// ---------- 第四十七 녹원호환(祿元互換) ----------
const NOKWON_PAIRS = { '무신을묘':1, '정유임자':1, '경오정해':1 };
function checkNokwonHohwan(saju) {
  const ilju = saju.dStem + saju.dBranch;
  const siju = saju.tStem + saju.tBranch;
  const key = ilju + siju;
  if (!NOKWON_PAIRS[key]) return { 성격: false };
  return {
    성격: true, 항목: '녹원호환',
    판정: '일주와 시간이 서로의 정관 녹을 맞바꾸어 지님 — 격국·용신이 좋으면 금상첨화(칠살·일지시지충 있으면 흠)',
  };
}

const TOPICS_12 = [
  { id:44, 제목:'화위설상', fn: checkHwawiSeolsang },
  { id:45, 제목:'등라계갑', fn: checkDeungnaGyegap },
  { id:46, 제목:'적수오건', fn: checkJeoksuOgeon },
  { id:47, 제목:'녹원호환', fn: checkNokwonHohwan },
];

module.exports = { TOPICS_12, checkHwawiSeolsang, checkDeungnaGyegap, checkJeoksuOgeon, checkNokwonHohwan };
