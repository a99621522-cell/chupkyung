// ============================================================
// chapgyeong-vol4ha-gyeokguk.js
// 사주첩경 4권下 — 특수격 판정 엔진 1차: 귀록격·금신격·육을서귀격
// 출처: 사주첩경4권下_격국용신편_특수격_완성본.pdf 원문 9~41쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

// 第十四 귀록격(歸祿格) = 일록거시격 (원문 9~19쪽)
const GWIROK_SIJI = { 갑:'인', 정:'오', 무:'사', 기:'오', 경:'신', 임:'해', 계:'자' };
function checkGwirok(saju) {
  const ilgan = saju.dStem;
  const target = GWIROK_SIJI[ilgan];
  if (!target || saju.tBranch !== target) return { 성격: false };
  const gwanCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  // [114차] 원문: 귀록은 혐관 — 관을 만나면 록이 파괴되어 흉 → 관살(천간·지지 본기) 있으면 격 불성립(4권 스캔 실례 대조로 과검출 확인)
  if (gwanCount > 0) return { 성격: false, 주의: '시지 록이나 관살 존재 — 귀록격 불성립(혐관)' };
  let yongsin, 특기사항 = null;
  if (sinwang && sikCount > 0) yongsin = '귀록용식상격';
  else if (sinwang && jaeCount > 0) yongsin = '귀록용재격';
  else if (!sinwang && inCount > 0) yongsin = '귀록용인격';
  else if (!sinwang) yongsin = '귀록용귀록격(비견으로 신 보강)';
  else yongsin = '귀록격(신왕, 재관 무난)';
  return { 성격:true, 격국명:'귀록격(일록거시격)', 용신:yongsin, 특기사항 };
}

// 第十五 금신격(金神格) (원문 20~30쪽)
const GEUMSIN_SIJU = ['을축','기사','계유'];
function checkGeumsin(saju) {
  const ilgan = saju.dStem;
  if (!['갑','기'].includes(ilgan)) return { 성격: false };
  const siju = saju.tStem + saju.tBranch;
  if (!GEUMSIN_SIJU.includes(siju)) return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const hwaBranchCount = branches.filter(b => T.BRANCH_OHAENG[b]==='화').length;
  const hwaStemCount = [saju.yStem,saju.mStem,saju.tStem].filter(s => T.STEM_OHAENG[s]==='화').length;
  const hwaTotal = hwaBranchCount + hwaStemCount;
  const suTotal = branches.filter(b=>T.BRANCH_OHAENG[b]==='수').length +
                  [saju.yStem,saju.mStem,saju.tStem].filter(s=>T.STEM_OHAENG[s]==='수').length;
  let 특기사항 = [];
  if (hwaTotal === 0) 특기사항.push('화 없음 — 금신을 제복하지 못해 귀명이 되기 어려움');
  if (hwaTotal >= 3) 특기사항.push('화 태왕 — 금신지병(도리어 병) 위험');
  if (suTotal >= 2) 특기사항.push('수운/수기 다수 — 금신격이 가장 꺼리는 조건(빈곤)');
  return {
    성격: true, 격국명: `${ilgan}일금신격`,
    화존재: hwaTotal > 0,
    용신: hwaTotal > 0 ? '금신을 화로 제복(금신우화 귀무의)' : '용신 불명확(화 필요)',
    특기사항: 특기사항.length ? 특기사항 : null,
  };
}

// 第十六 육을서귀격(六乙鼠貴格) (원문 31~41쪽)
function checkYugeulSeogwi(saju) {
  if (saju.dStem !== '을') return { 성격: false };
  if (saju.tStem+saju.tBranch !== '병자') return { 성격: false };
  const rel = B.checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const jaChungOrHap = rel.충.some(f=>f.includes('자')) || rel.합.some(h=>h.includes('자'));
  let 특기사항 = jaChungOrHap ? '시지 자(子)가 충 또는 합을 만남 — 파격 위험(자수가 온전해야 신금 관을 인출)' : null;
  return { 성격:true, 격국명:'육을서귀격', 용신:'자중 계수가 신중 경금(정관)을 인출 — 관귀', 특기사항 };
}

module.exports = { checkGwirok, checkGeumsin, checkYugeulSeogwi };
