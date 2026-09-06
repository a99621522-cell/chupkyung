// ============================================================
// chapgyeong-vol6-rules-5.js
// 6권 5차: 第十八 거관유살 / 第十九 관살병용 / 第二十 거류서배 /
//          第二十一 자매강강 / 第二十三 모쇠자왕
// 출처: 원문 65~76쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第十八 거관유살 / 거살유관 ----------
function checkGeogwanYusal(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const gwanCount = p.stems.filter((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정관').length +
                     p.branches.filter(b=>Y.hasSipseongInBranch(ilgan,b,['정관'])).length;
  const salCount = p.stems.filter((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='편관').length +
                    p.branches.filter(b=>Y.hasSipseongInBranch(ilgan,b,['편관'])).length;
  if (gwanCount === 0 || salCount === 0) return { 성격: false };
  const rel = B.checkBranchRelations(p.branches);
  const hasHapOrChung = rel.합.length > 0 || rel.충.length > 0;
  if (!hasHapOrChung) return { 성격: false };
  return {
    성격: true, 항목: '거관유살/거살유관',
    판정: '관살혼잡 중 합 또는 충으로 하나가 제거되어 하나만 남음 — 남은 것이 왕강하면 크게 귀함',
    특기사항: ['거관유살=관 제거·살 존속, 거살유관=살 제거·관 존속 (어느 쪽이 남는지 확인 필요)'],
  };
}

// ---------- 第十九 관살병용(官殺並用) ----------
function checkGwansalByeongyong(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const gwanCount = p.stems.filter((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정관').length;
  const salCount = p.stems.filter((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='편관').length;
  if (gwanCount === 0 || salCount === 0) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false };
  return {
    성격: true, 항목: '관살병용',
    판정: '신왕격에 관살을 모두 병용 — 거관유살로 하나만 남기지 않고도 귀하게 됨(형충 겸비시 출장입상)',
  };
}

// ---------- 第二十 거류서배(去留舒配) ----------
function checkGeoryuSeobae(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const gwansalTotal = p.stems.filter((s,i)=>i!==2 && ['정관','편관'].includes(Y.getSipseong(ilgan,s))).length +
                        p.branches.filter(b=>Y.hasSipseongInBranch(ilgan,b,['정관','편관'])).length;
  if (gwansalTotal < 3) return { 성격: false };
  const rel = B.checkBranchRelations(p.branches);
  const hasChung = rel.충.length > 0;
  const hasHap = rel.합.length > 0;
  if (!hasChung || !hasHap) return { 성격: false };
  return {
    성격: true, 항목: '거류서배',
    판정: '관살 삼중 중 하나는 충으로 제거(去), 하나는 합으로 짝지어짐(舒配), 하나는 남음(留) — 조정만 잘되면 복록, 여명은 파란 후 안정',
    특기사항: ['관살 다수라고 무조건 흉으로 단정하면 안 됨 — 조정 상태를 살펴야'],
  };
}

// ---------- 第二十一 자매강강(姉妹剛强) — 여명 한정 ----------
function checkJamaeGangang(saju, sex) {
  if (sex !== '여') return { 성격: false };
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  if (bigyeopCount < 3) return { 성격: false };
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  let 특기사항 = [];
  if (gwansalCount > 0) 특기사항.push('관살 왕성 — 비겁을 눌러 오히려 반김');
  if (sikCount > 0) 특기사항.push('상관·식신으로 비겁 설기 가능');
  if (gwansalCount === 0 && sikCount === 0) 특기사항.push('비겁 제어 수단 없음 — 남편이 다처(多妻)를 두거나 첩이 될 위험');
  return { 성격: true, 항목: '자매강강', 판정: '비견·겁재 왕성(여명) — 군겁탈부, 이녀동부 위험', 특기사항 };
}

// ---------- 第二十三 모쇠자왕(母衰子旺) — 여명 한정 ----------
function checkMoswaeJawang(saju, sex) {
  if (sex !== '여') return { 성격: false };
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  if (!sinyak || sikCount < 2) return { 성격: false };
  return {
    성격: true, 항목: '모쇠자왕',
    판정: '일주(모) 약한데 식상(자) 왕성 — 식왕신쇠, 출산시 난산·유산 위험(체질 허약한데 태아 큼)',
  };
}

const TOPICS_5 = [
  { id:18, 제목:'거관유살/거살유관', fn: checkGeogwanYusal },
  { id:19, 제목:'관살병용', fn: checkGwansalByeongyong },
  { id:20, 제목:'거류서배', fn: checkGeoryuSeobae },
  { id:21, 제목:'자매강강(여)', fn: checkJamaeGangang },
  { id:23, 제목:'모쇠자왕(여)', fn: checkMoswaeJawang },
];

module.exports = { TOPICS_5, checkGeogwanYusal, checkGwansalByeongyong, checkGeoryuSeobae, checkJamaeGangang, checkMoswaeJawang };
