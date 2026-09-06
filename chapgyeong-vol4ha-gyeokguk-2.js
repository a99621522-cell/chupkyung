// ============================================================
// chapgyeong-vol4ha-gyeokguk-2.js
// 4권下 특수격 2차: 육을서귀격(정확판)·육음조양격
// 출처: 원문 31~51쪽 (第十六~十七)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');

// ---------- 第十六 육을서귀격 (진삼일/부진삼일 정확 반영) ----------
const SEOGWI_JIN = ['을해','을미','을사'];
const SEOGWI_BUJIN = ['을축','을유','을묘'];
function checkYugeulSeogwiV2(saju) {
  if (saju.dStem !== '을') return { 성격: false };
  if (saju.tStem+saju.tBranch !== '병자') return { 성격: false };
  const ilju = saju.dStem+saju.dBranch;
  const isJin = SEOGWI_JIN.includes(ilju);
  const isBujin = SEOGWI_BUJIN.includes(ilju);
  if (!isJin && !isBujin) return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const rel = B.checkBranchRelations(branches);
  const jaChungOrHyeong = rel.충.some(f=>f.includes('자')) || rel.형.some(f=>f.includes('자'));
  const gwansalExists = branches.some(b=>['신','유','축'].includes(b)) ||
                         [saju.yStem,saju.mStem].some(s=>['경','신'].includes(s));
  let 특기사항 = [];
  if (!isJin) 특기사항.push('부진삼일(을축·을유·을묘) — 자축합/자유파/자묘형으로 격이 온전치 못함');
  if (jaChungOrHyeong) 특기사항.push('자수가 충 또는 형을 만남 — 파격');
  if (gwansalExists) 특기사항.push('관살(경신유) 또는 축 존재 — "일위봉지라도 병"(원문), 파격 위험');
  return {
    성격: true, 격국명: '육을서귀격', 진격여부: isJin,
    용신: '자중 계수가 신중 경금(정관)을 인출 — 관귀',
    특기사항: 특기사항.length ? 특기사항 : ['진삼일이며 병 없음 — 신등어각의 귀명'],
  };
}

// ---------- 第十七 육음조양격 ----------
const JOYANG_JIN = ['신해','신유','신사'];
const JOYANG_BUJIN = ['신축','신미','신묘'];
function checkYugeumJoyang(saju) {
  if (saju.dStem !== '신') return { 성격: false };
  if (saju.tStem+saju.tBranch !== '무자') return { 성격: false };
  const ilju = saju.dStem+saju.dBranch;
  const isJin = JOYANG_JIN.includes(ilju);
  const isBujin = JOYANG_BUJIN.includes(ilju);
  if (!isJin && !isBujin) return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const pabreakers = branches.some(b=>['병','정','오'].includes(b)) ||
                      [saju.yStem,saju.mStem].some(s=>['병','정'].includes(s));
  // [123차] 4권下 원문 43쪽: 부진삼일은 사중·미중 병정화 관이 動하면 조양 불성 — 병정 투출 또는 사·오 지지 있으면 격 불성(예 라 己酉乙亥辛巳戊子 → 상관용인격)
  const gwanBr = branches.some(b=>['사','오'].includes(b)) || [saju.yStem,saju.mStem].some(x=>['병','정'].includes(x));
  if (gwanBr) return { 성격:false, 주의:'육음조양이나 병정·사오 관성이 실재 — 격 불성립(별격으로 다룸)' };
  let 특기사항 = [];
  if (!isJin) 특기사항.push('부진삼일(신미·신사·신묘) — 관성이 동하지 않아 성립');
  const bukBranch = branches.filter(b=>['해','자','축'].includes(b)).length;
  if (bukBranch >= 3) 특기사항.push('북방(해자축) 과다 — "최혐북" 경계에 해당, 과습 위험');
  return {
    성격: true, 격국명: '육음조양격', 진격여부: isJin,
    용신: '자중 계수가 사중 병화(정관)를 인출·조현 — 무토가 신금을 자양',
    특기사항: 특기사항.length ? 특기사항 : ['진삼일이며 병 없음 — 서방·동방운에 발달'],
  };
}

module.exports = { checkYugeulSeogwiV2, checkYugeumJoyang };
