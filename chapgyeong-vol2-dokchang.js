// ============================================================
// chapgyeong-vol2-dokchang.js — 2권 보강 모듈(복원 부분)
// 이석영 저자 독창의 네 가지 합(준삼합·준방합·동합·우합) +
// 조부흉사 V2(지장간 편인 검사판)
// 원본은 후반 보강판 chapgyeong2-tongbyeon.js(66주제 완결판)의 일부 —
// 대화 기록에서 온전히 추출된 조각만 우선 복원
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

function getRelations(saju) {
  return B.checkBranchRelations([saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch]);
}

// "아무 책에도 기재되어 있지 않으나... 육합·삼합보다 오히려 확률이
// 앞선다"고 저자 스스로 강조한 사주첩경 고유 이론
const JUN_SAMHAP = [['신','자'],['자','진'],['신','진'], ['해','묘'],['묘','미'],['해','미'],
                     ['인','오'],['오','술'],['인','술'], ['사','유'],['유','축'],['사','축']];
const JUN_BANGHAP = [['인','묘'],['묘','진'],['인','진'], ['사','오'],['오','미'],['사','미'],
                      ['신','유'],['유','술'],['신','술'], ['해','자'],['자','축'],['해','축']];
const U_HAP = [['축','인'],['진','사'],['미','신'],['술','해']];

function checkJeojaDokchangHap(b1, b2) {
  if (b1 === b2) return '동합';
  if (JUN_SAMHAP.some(([a,c]) => (a===b1&&c===b2)||(a===b2&&c===b1))) return '준삼합';
  if (JUN_BANGHAP.some(([a,c]) => (a===b1&&c===b2)||(a===b2&&c===b1))) return '준방합';
  if (U_HAP.some(([a,c]) => (a===b1&&c===b2)||(a===b2&&c===b1))) return '우합';
  return null;
}

// 四. 조부가 흉사한다 V2 — 조건①편인(지장간 포함)이 형/해, 조건②편인이 백호대살
function checkJobuHyungsaV2(saju) {
  const rel = getRelations(saju);
  const branches = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch];
  for (const b of branches) {
    const jijanggan = T.JIJANGGAN[b] || [];
    const hasPyeonin = jijanggan.some(g => Y.getSipseong(saju.dStem, g) === '편인');
    if (!hasPyeonin) continue;
    if (rel.형.some(h => h.includes(b)) || rel.해.some(h => h.includes(b))) {
      return { 성립:true, 근거:'조건①(편인 '+b+'이 형·해를 만남)', 결론:'조부 흉사', 대상지지: b };
    }
  }
  const pillars = [
    ['년', saju.yStem+saju.yBranch], ['월', saju.mStem+saju.mBranch],
    ['일', saju.dStem+saju.dBranch], ['시', saju.tStem+saju.tBranch],
  ];
  for (const [pos, p] of pillars) {
    if (T.BAEKHO.includes(p)) {
      const jijanggan = T.JIJANGGAN[p[1]] || [];
      if (jijanggan.some(g => Y.getSipseong(saju.dStem, g) === '편인')) {
        return { 성립:true, 근거:'조건②('+pos+'주 편인이 백호대살)', 결론:'조부 흉사', 기둥: p };
      }
    }
  }
  return { 성립:false };
}

module.exports = { JUN_SAMHAP, JUN_BANGHAP, U_HAP, checkJeojaDokchangHap, checkJobuHyungsaV2 };
