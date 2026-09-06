// ============================================================
// chapgyeong-vol6-rules-3.js
// 사주첩경 6권 — 문답총론 3차: 第十一 진법무민 / 第十三 일장당관
// (第九 진가상관·第十 변화상관·第十二 제거기병은 서술형이라 이진판정
//  규칙화가 어려워 보류)
// 출처: 원문 39~53쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

// ---------- 第十一 진법무민(盡法無民) ----------
function checkJinbeopMumin(saju) {
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  if (gwansalCount === 0 || sikCount < 3) return { 성격: false };
  return {
    성격: true, 항목: '진법무민(제살태과)',
    판정: '관살이 식상에게 거듭 제압당해 완전히 힘을 잃음 — 벼슬·명예·권세 상실, 자녀에게도 흉',
    특기사항: ['운에서 다시 제살을 더하면(중병) 생명 위험'],
  };
}

// ---------- 第十三 일장당관(一將當關) ----------
function checkIljangDanggwan(saju) {
  const ilgan = saju.dStem;
  const p = { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
              stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const sikStems = p.stems.filter((s,i)=>i!==2 && ['식신','상관'].includes(Y.getSipseong(ilgan,s)));
  if (gwansalCount < 3 || sikStems.length !== 1) return { 성격: false };
  return {
    성격: true, 항목: '일장당관',
    판정: '건왕한 식상 하나가 다수의 관살(무리)을 제압·통솔 — 일장당관에 군사자복, 은성(恩星)이 됨',
    특기사항: ['식신제살격·병약설의 약신과 같은 이치'],
  };
}

const TOPICS_3 = [
  { id:11, 제목:'진법무민', fn: checkJinbeopMumin },
  { id:13, 제목:'일장당관', fn: checkIljangDanggwan },
];

module.exports = { TOPICS_3, checkJinbeopMumin, checkIljangDanggwan };
