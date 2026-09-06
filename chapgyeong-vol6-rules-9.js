// ============================================================
// chapgyeong-vol6-rules-9.js
// 6권 9차: 第三十七 춘양조열 / 第三十九 가살위권
// (第三十八 전인후종은 별도 파일 rules-11.js에 gapja60 헬퍼로 구현됨)
// 출처: 원문 113~123쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第三十七 춘양조열(春陽燥烈) ----------
function checkChunyangJoyeol(saju) {
  const p = toPillars(saju);
  if (!['인','묘','진'].includes(saju.mBranch)) return { 성격: false };
  const hwaCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='화').length +
                    p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]==='화').length;
  if (hwaCount < 2) return { 성격: false };
  const suCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]==='수').length +
                   p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]==='수').length;
  const seupToExists = p.branches.some(b=>['진','축'].includes(b));
  let 특기사항 = [];
  if (suCount === 0 && !seupToExists) 특기사항.push('수기·습토 모두 없음 — 만물이 조고(메마름), 불길');
  else 특기사항.push('수의 뿌리 또는 습토(진·축) 있음 — 조습이 조화되어 귀하고 기이함');
  return { 성격: true, 항목: '춘양조열', 판정: '봄철(인묘진월) 화기가 강렬 — 조습 조화 여부가 길흉을 가름', 특기사항 };
}

// ---------- 第三十九 가살위권(假殺爲權) ----------
function checkGasalWigwon(saju) {
  const ilgan = saju.dStem;
  const chilsalCount = G1.countSipseongAll(saju, ['편관']).count;
  if (chilsalCount === 0) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false };
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  let 유형;
  if (inCount > 0 && sikCount === 0) 유형 = '②살인상생형(덕장) — 살이 인수를 생해 나를 도움, 덕으로 복종시킴';
  else if (sikCount > 0) 유형 = '③식상제살형(지장) — 살을 직접 제박, 힘으로 복종시킴(덕장보다는 한 수 아래)';
  else 유형 = '①일주왕성형 — 인수·비겁의 힘으로 살과 대등';
  return {
    성격: true, 항목: '가살위권',
    판정: `신강+칠살이 오히려 권세로 화함(신강살천) — ${유형}`,
  };
}

const TOPICS_9 = [
  { id:37, 제목:'춘양조열', fn: checkChunyangJoyeol },
  { id:39, 제목:'가살위권', fn: checkGasalWigwon },
];

module.exports = { TOPICS_9, checkChunyangJoyeol, checkGasalWigwon };
