// ============================================================
// chapgyeong-vol6-rules-8.js
// 6권 8차: 第三十三 병약상제 / 第三十四 재자약살 / 第三十五 재명유기 /
//          第三十六 금실무성
// 출처: 원문 103~112쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第三十三 병약상제(病藥相濟) ----------
function checkByeongyakSangje(saju) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);
  const p = toPillars(saju);
  const GEUK = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
  const byeongOh = GEUK[ilOh];
  const byeongCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]===byeongOh).length +
                       p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===byeongOh).length;
  if (byeongCount < 2) return { 성격: false };
  const yaksinOh = GEUK[byeongOh];
  const hasYaksin = p.branches.some(b=>T.BRANCH_OHAENG[b]===yaksinOh) ||
                     p.stems.some((s,i)=>i!==2 && T.STEM_OHAENG[s]===yaksinOh);
  if (!hasYaksin) return { 성격: false }; // 병중무구와 대칭 — 약이 원국에 있어야 병약상제
  return {
    성격: true, 항목: '병약상제',
    판정: '원국 자체에 병(태과 오행)과 이를 제어하는 약신이 함께 있음 — 약운을 만나면 대발, 병운이 겹치면 위태',
  };
}

// ---------- 第三十四 재자약살(財滋弱殺) ----------
function checkJaejaYaksal(saju, sex) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false };
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  if (gwansalCount === 0 || jaeCount === 0) return { 성격: false };
  if (gwansalCount >= 3) return { 성격: false };
  return {
    성격: true, 항목: '재자약살',
    판정: sex==='여' ? '신강+관살약(남편)+재(시모)가 생조 — 명관과마와 같은 이치, 남편 영화·귀부인' : '신강+관살약에 재가 생조 — 관살이 제 역할을 하게 됨',
  };
}

// ---------- 第三十五 재명유기(財命有氣) ----------
function checkJaemyeongYugi(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  if (!sinwang || jaeCount < 2) return { 성격: false };
  if (jaeCount >= 4) return { 성격: false };
  return {
    성격: true, 항목: '재명유기',
    판정: '일주와 재가 둘 다 뿌리내려 왕성함(有氣) — 왕성한 재를 능히 감당해 대부(大富)',
  };
}

// ---------- 第三十六 금실무성(金實無聲) ----------
function checkGeumsilMuseong(saju) {
  const ilgan = saju.dStem;
  if (!['경','신'].includes(ilgan)) return { 성격: false };
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  if (bigyeopCount < 2) return { 성격: false };
  const p = toPillars(saju);
  const hwaExists = p.branches.some(b=>T.BRANCH_OHAENG[b]==='화') ||
                     p.stems.some((s,i)=>i!==2 && T.STEM_OHAENG[s]==='화');
  return {
    성격: true, 항목: '금실무성',
    판정: hwaExists ? '금 왕성한데 화(火)를 만남 — 추수명검, 그릇을 이뤄 이름을 떨침' : '금 왕성한데 화 없음 — 금실무성, 이름 떨치지 못하고 무명에 그침(수운이나 종격 여부 별도 확인 필요)',
  };
}

const TOPICS_8 = [
  { id:33, 제목:'병약상제', fn: checkByeongyakSangje },
  { id:34, 제목:'재자약살', fn: checkJaejaYaksal },
  { id:35, 제목:'재명유기', fn: checkJaemyeongYugi },
  { id:36, 제목:'금실무성', fn: checkGeumsilMuseong },
];

module.exports = { TOPICS_8, checkByeongyakSangje, checkJaejaYaksal, checkJaemyeongYugi, checkGeumsilMuseong };
