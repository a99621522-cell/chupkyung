// ============================================================
// chapgyeong-vol6-rules-11.js
// 6권 11차: 第三十八 전인후종(前引後從)/포승(包承)
// 출처: 원문 115~120쪽
// ============================================================
const G60 = require('./chapgyeong-vol1-gapja60.js');

function checkJeoninHujongTopic(saju) {
  const yearGanji = saju.yStem + saju.yBranch;
  const others = [saju.mStem+saju.mBranch, saju.dStem+saju.dBranch, saju.tStem+saju.tBranch];
  const r = G60.checkJeoninHujong(yearGanji, others);
  if (!r.성립) return { 성격: false };
  return {
    성격: true, 항목: '전인후종',
    판정: r.인원종근 ? '전인후종 갖추고 인원종근(引遠從近) — 크게 부귀' : '전인후종은 갖췄으나 인원종근은 아님(인근종원 등) — 파격 가능성',
    전인: r.전인, 후종: r.후종,
  };
}

module.exports = { checkJeoninHujongTopic };
