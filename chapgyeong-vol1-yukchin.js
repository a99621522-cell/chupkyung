// ============================================================
// chapgyeong-vol1-yukchin.js
// 사주첩경 1권 — 육친(六親) 십성 판정 및 화현법(化現法)
// 출처: 원문 147~189쪽 (제23~26장)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');

// ---------- 오행 상생상극 순환 ----------
const SAENG_NEXT = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' }; // A생B
const GEUK_NEXT  = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' }; // A극B

function ohaengOf(char) {
  return T.STEM_OHAENG[char] || T.BRANCH_OHAENG[char] || null;
}
function yinyangOf(char) {
  return T.STEM_YINYANG[char] || T.BRANCH_YINYANG[char] || null;
}

/**
 * 십성 판정 (원문 147~157쪽 제23~24장)
 */
function getSipseong(ilgan, target) {
  const ilOh = ohaengOf(ilgan);
  const taOh = ohaengOf(target);
  if (!ilOh || !taOh) return null;
  const sameYinYang = yinyangOf(ilgan) === yinyangOf(target);

  if (taOh === ilOh) {
    return sameYinYang ? '비견' : '비겁';
  }
  if (SAENG_NEXT[taOh] === ilOh) {
    return sameYinYang ? '편인' : '정인';
  }
  if (SAENG_NEXT[ilOh] === taOh) {
    return sameYinYang ? '식신' : '상관';
  }
  if (GEUK_NEXT[taOh] === ilOh) {
    return sameYinYang ? '편관' : '정관';
  }
  if (GEUK_NEXT[ilOh] === taOh) {
    return sameYinYang ? '편재' : '정재';
  }
  return null;
}

/**
 * 편관이 칠살인지 편관인지 구분 (원문 154~155쪽)
 */
function isChilsalOrPyeongwan(ilgan, saju8) {
  const ilOh = ohaengOf(ilgan);
  const siksangOh = SAENG_NEXT[ilOh];
  const hasSiksang = saju8.some(c => ohaengOf(c) === siksangOh);
  return hasSiksang ? '편관(유제)' : '칠살(무제)';
}

const GYEJEOL_OF_BRANCH = {
  인:'봄', 묘:'봄', 진:'사계',
  사:'여름', 오:'여름', 미:'사계',
  신:'가을', 유:'가을', 술:'사계',
  해:'겨울', 자:'겨울', 축:'사계'
};
function getWangSangHyuSuSa(ilgan, wolji) {
  const ilOh = ohaengOf(ilgan);
  const woljiOh = ohaengOf(wolji);
  if (ilOh === woljiOh) return '왕';
  if (SAENG_NEXT[woljiOh] === ilOh) return '상';
  if (SAENG_NEXT[ilOh] === woljiOh) return '휴';
  if (GEUK_NEXT[ilOh] === woljiOh) return '수';
  if (GEUK_NEXT[woljiOh] === ilOh) return '사';
  return null;
}
function isSinWang(status) { return status === '왕' || status === '상'; }
function isSinYak(status) { return status === '사' || status === '수'; }

// ---------- 육친 화현법 — 남명 (원문 158~172쪽 제25장) ----------
const HWAHYEON_NAMMYEONG = {
  정인: '생모', 편인: '편모(서모·계모·양모)',
  '정인의 인수(=비견비겁급)': '외숙·이모',
  편관: '아들·외조모',
  정관: '딸·손부·조카·매부',
  식신: '손자·장모·사위',
  상관: '조모·생질',
  정재: '처·형수·고모',
  편재: '부친·첩·숙부',
  비견: '형제',
  비겁: '자매·며느리·딸의 시모',
};

const HWAHYEON_CHAIN_NAMMYEONG = {
  '생모':    ['정인'],
  '편모':    ['편인'],
  '외숙_이모': ['정인','비견비겁'],
  '외조모':  ['정인','정인'],
  '부친':    ['정인','정관'],
  '조부':    ['편재','편재'],
  '조모':    ['편재','정인'],
  '고모_백숙부': ['편재','비견비겁'],
  '아들':    ['정재','비겁_양'],
  '딸':      ['정재','비겁_음'],
  '손자':    ['편관','편관'],
  '며느리':  ['편관','정재'],
  '손부':    ['식신','정재'],
  '처':      ['정재'],
  '첩':      ['편재'],
  '처남_형제': ['정재','비견비겁'],
  '장모':    ['정재','정인'],
  '장인':    ['정재','정인','정관'],
  '사위':    ['정관','정관'],
  '딸의_시모': ['정관','정인'],
  '형제':    ['비견'],
  '자매':    ['비겁'],
  '형수_제수': ['비견비겁','재성'],
  '조카_질녀': ['비견비겁','관성'],
  '매부':    ['비겁(여형제)','관성'],
  '생질_생질녀': ['비겁(여형제)','식상'],
};

// ---------- 육친 화현법 — 여명 (원문 173~180쪽 제26장) ----------
const HWAHYEON_YEOMYEONG = {
  정관: '정식 남편(정부)',
  편관: '편부·시동기간(시아주버니·시동생)',
  편재: '시어머니',
  정재: '시외숙·시이모',
  비겁: '시아버지·동서간',
  상관: '아들(양일주 기준 — 음일주는 딸)',
  식신: '딸(양일주 기준 — 음일주는 아들)',
  정인: '사위·손자',
  편인: '손녀',
};
function getJasikSeong(ilgan, isDaughter) {
  const ilYang = yinyangOf(ilgan) === '양';
  if (ilYang) {
    return isDaughter ? '상관' : '식신';
  } else {
    return isDaughter ? '식신' : '상관';
  }
}

/**
 * 지지의 지장간 전체(초기·중기·정기)를 참조해 특정 십성이 들어있는지 확인
 * — 포함적 조건은 지장간 전체 기준(후속 세션 확립 설계원칙)
 */
function hasSipseongInBranch(ilgan, branch, targetSipseongs) {
  const jjg = T.JIJANGGAN[branch] || [];
  return jjg.some(g => targetSipseongs.includes(getSipseong(ilgan, g)));
}

module.exports = {
  ohaengOf, yinyangOf, getSipseong, isChilsalOrPyeongwan, hasSipseongInBranch,
  getWangSangHyuSuSa, isSinWang, isSinYak, GYEJEOL_OF_BRANCH,
  HWAHYEON_NAMMYEONG, HWAHYEON_CHAIN_NAMMYEONG, HWAHYEON_YEOMYEONG,
  getJasikSeong, SAENG_NEXT, GEUK_NEXT,
};
