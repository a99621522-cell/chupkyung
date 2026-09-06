// ============================================================
// chapgyeong-vol4-gyeokguk-3.js
// 사주첩경 4권 — 격국 판정 엔진 3차: 시상편관·연시상관성·시상편재
// 출처: 원문 396~432쪽 (제15~17편)
// 공통 원칙: "일위(一位)"만 진격 — 같은 십성이 시(또는 연·시)에 딱 하나만
// 있어야 하며, 둘 이상이면 파격(破格)이다.
// [후속 수정 반영] 배타적 조건(일위·무관)은 천간 투출·지지 정기 기준으로 판단
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

/** 유근(有根) 판정: 시간(또는 연간)의 그 오행이 지지 어딘가에 뿌리(같은 오행)를 두는지 */
function hasRoot(stem, branches) {
  const oh = Y.ohaengOf(stem);
  return branches.some(b => T.BRANCH_OHAENG[b] === oh || T.JIJANGGAN[b].some(j => Y.ohaengOf(j) === oh));
}

// ============================================================
// 時上偏官格 = 時上一位貴格 (원문 396~400쪽)
// ============================================================
function checkSisangPyeongwan(saju) {
  const ilgan = saju.dStem;
  const tSipseong = Y.getSipseong(ilgan, saju.tStem);
  if (tSipseong !== '편관') return { 성격: false };
  // 일위(一位) 조건: 다른 천간(연간·월간)에 편관이 중복 투출되면 파격.
  // (지장간 깊숙한 초기·중기까지는 "일위" 판정에서 제외 — 원문은 투출 여부를 우선 봄)
  const otherStems = [saju.yStem, saju.mStem];
  const dup = otherStems.some(s => Y.getSipseong(ilgan, s) === '편관');
  const isIlwi = !dup;
  const yuGeun = hasRoot(saju.tStem, [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch]);
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let 특기사항 = [];
  if (!isIlwi) 특기사항.push('편관이 시 외에도 존재 — 일위(一位) 원칙 위반, 파격 위험');
  if (!yuGeun) 특기사항.push('시상 칠살이 무근(無根) — 파격');
  if (sikCount >= 2) 특기사항.push('식상 과다 — 제복태과 위험');
  return {
    성격: true, 격국명: '시상편관격(시상일위귀격)',
    일위여부: isIlwi, 유근: yuGeun,
    신강신약: sinwang?'신강':'신약',
    용신: '시상 칠살(편관) 자체가 용신으로 작용 — 제복이 알맞으면 형권·무직의 귀명',
    특기사항: 특기사항.length?특기사항:null,
  };
}

// ============================================================
// 年時上官星格 (원문 412~416쪽) — 월에 관 없고 연 또는 시에 정관 일위
// ============================================================
function checkYeonsiSanggwanseong(saju) {
  const ilgan = saju.dStem;
  // 월에 관성이 없어야 함 — "정격을 못 잡는다"는 뜻이므로 월지의 정기(주된 기운) 기준으로 판단
  // (지장간 초기·중기의 미미한 흔적까지 배제 조건으로 삼으면 너무 엄격해져 대부분의 사주가 걸림)
  const woljiJeonggi = T.JIJANGGAN[saju.mBranch][T.JIJANGGAN[saju.mBranch].length-1];
  const wolHasGwan = ['정관','편관'].includes(Y.getSipseong(ilgan, woljiJeonggi));
  if (wolHasGwan) return { 성격: false };
  // 연 또는 시에 정관 일위
  const yGwan = Y.getSipseong(ilgan, saju.yStem) === '정관';
  const tGwan = Y.getSipseong(ilgan, saju.tStem) === '정관';
  if (!yGwan && !tGwan) return { 성격: false };
  if (yGwan && tGwan) {
    return { 성격: true, 격국명:'연시상관성격', 특기사항:['연·시 모두에 정관 — 일위 원칙 위반, 파격 위험'] };
  }
  const 위치 = yGwan ? '연' : '시';
  const gwanStem = yGwan ? saju.yStem : saju.tStem;
  const yuGeun = hasRoot(gwanStem, [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch]);
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  let yongsin;
  if (!sinwang && jaeCount > 0) yongsin = '연시상관성용재격(관 약, 재로 생조)';
  else if (!sinwang && inCount > 0) yongsin = '연시상관성용인격(신약관왕, 인수로 통관)';
  else yongsin = '연시상관성격(정관 일위 자체가 용신)';
  return {
    성격: true, 격국명: '연시상관성격', 관위치: 위치, 유근: yuGeun,
    신강신약: sinwang?'신강':'신약', 용신: yongsin,
    특기사항: yuGeun ? null : ['관성이 무근 — 형충파해 없이 안정되어야 진격'],
  };
}

// ============================================================
// 時上偏財格 (원문 424~432쪽)
// ============================================================
function checkSisangPyeonjae(saju) {
  const ilgan = saju.dStem;
  const tSipseong = Y.getSipseong(ilgan, saju.tStem);
  if (tSipseong !== '편재') return { 성격: false };
  const otherStems = [saju.yStem, saju.mStem];
  const dup = otherStems.some(s => Y.getSipseong(ilgan, s) === '편재');
  const isIlwi = !dup;
  const yuGeun = hasRoot(saju.tStem, [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch]);
  const rel = B.checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const hyeongChung = rel.형.some(f=>f.includes(saju.tBranch)) || rel.충.some(f=>f.includes(saju.tBranch));
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let 특기사항 = [];
  if (!isIlwi) 특기사항.push('편재가 시 외에도 존재 — 일위 원칙 위반');
  if (!yuGeun) 특기사항.push('시상 편재가 무근 — 파격 위험');
  if (hyeongChung) 특기사항.push('시지가 형충을 만남 — 파격 위험');
  return {
    성격: true, 격국명: '시상편재격',
    일위여부: isIlwi, 유근: yuGeun,
    신강신약: sinwang?'신강':'신약',
    용신: '시상 편재 자체가 용신으로 작용',
    특기사항: 특기사항.length?특기사항:null,
  };
}

module.exports = { hasRoot, checkSisangPyeongwan, checkYeonsiSanggwanseong, checkSisangPyeonjae };
