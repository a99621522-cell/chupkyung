// ============================================================
// chapgyeong-vol6-rules-13.js
// 6권 13차: 第四十八 급신이지 / 第五十 방신유정 / 第五十一 아우생아
// (第四十九 거탁유청은 오행 조합별로 형태가 다양해 이진 규칙화 보류)
// 출처: 원문 143~154쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };

// ---------- 第四十八 급신이지(及身而止) ----------
function checkGeupsinIji(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  if (inCount === 0) return { 성격: false };
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  const sikTuchul = p.stems.some((s,i)=>i!==2 && ['식신','상관'].includes(Y.getSipseong(ilgan,s)));
  if (sikTuchul) return { 성격: false };
  return {
    성격: true, 항목: '급신이지',
    판정: sikCount>0 ? '식상이 지지 암장에만 미약하게 존재 — 부족하나마 탐용 가능' : '식상 전혀 없음 — 생하는 흐름이 일주에서 완전히 멈춤(원원이유부장), 포부는 있으나 자신이 펼치지 못함',
  };
}

// ---------- 第五十 방신유정(幇身有情) ----------
function checkBangsinYujeong(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  if (!sinyak) return { 성격: false };
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  if (bigyeopCount === 0) return { 성격: false };
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  let 특기사항 = jaeCount>0 ? ['비겁이 병이 되는 재(용신의 병)까지 제거하는 간접 효과도 가능'] : null;
  return {
    성격: true, 항목: '방신유정',
    판정: '신약한 일주를 비견·겁이 도와줌(방신) — 재관을 다스릴 힘을 얻어 녹중권고',
    특기사항,
  };
}

// ---------- 第五十一 아우생아(兒又生兒) / 처우생아(妻又生兒) ----------
function checkAuSaengA(saju) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);
  const sikOh = SAENG[ilOh];
  const jaeOh = SAENG[sikOh];
  const p = toPillars(saju);
  const sikCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]===sikOh).length +
                    p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===sikOh).length;
  const jaeCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]===jaeOh).length +
                    p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===jaeOh).length;
  if (sikCount < 2 || jaeCount === 0) return { 성격: false };
  return {
    성격: true, 항목: '아우생아',
    판정: '식상(아)이 다시 재(아의 자식)를 낳음 — 그 재를 용신으로 삼음, 재를 극하는 것을 크게 꺼리고 재가 왕성해짐을 기뻐함',
  };
}

const TOPICS_13 = [
  { id:48, 제목:'급신이지', fn: checkGeupsinIji },
  { id:50, 제목:'방신유정', fn: checkBangsinYujeong },
  { id:51, 제목:'아우생아', fn: checkAuSaengA },
];

module.exports = { TOPICS_13, checkGeupsinIji, checkBangsinYujeong, checkAuSaengA };
