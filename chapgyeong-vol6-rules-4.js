// ============================================================
// chapgyeong-vol6-rules-4.js
// 6권 4차: 第十四 천관지축 / 第十五 탐재괴인 / 第十六 재인불애 / 第十七 살인상생
// 출처: 원문 54~64쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch] };
}

// ---------- 第十四 천관지축(天關地軸) ----------
function checkCheongwanJichuk(saju) {
  const p = toPillars(saju);
  const hasCheongwan = p.branches.some(b => ['술','해'].includes(b)); // 건(乾)
  const hasJichuk = p.branches.some(b => ['미','신'].includes(b)); // 곤(坤)
  if (!hasCheongwan || !hasJichuk) return { 성격: false };
  return {
    성격: true, 항목: '천관지축',
    판정: '건(술해)+곤(미신)이 모두 갖춰짐 — 기취건곤, 천지 정기가 모여 부귀(단, 격국·용신이 잘 구성된 위에 더해져야 금상첨화)',
  };
}

// ---------- 第十五 탐재괴인(貪財壞印) ----------
function checkTamjaeGoein(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  if (!sinyak || inCount === 0 || jaeCount === 0) return { 성격: false };
  // 재인불애 예외: 인수가 태왕하면 오히려 재가 도움 -> 인수 3개 이상이면 배제
  if (inCount >= 3) return { 성격: false };
  return {
    성격: true, 항목: '탐재괴인',
    판정: '신약에 인수를 용신하는데 재가 그 인수를 극함 — 명예 실추·형벌 위험(학자·문인·관직자 특히 흉)',
    특기사항: ['재인불애의 예외(인수 태왕시)와 구별 필요'],
  };
}

// ---------- 第十六 재인불애(財印不碍) ----------
// [v25 조임판] 인수3+재1이면 41.6% 과다검출 → 인수≥4·재≥2로 상향(14.3%),
// 원문 실례 2건(을축정축을해임오·기해을해을축정해) 검증 통과
function checkJaeinBurae(saju) {
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  if (inCount < 4 || jaeCount < 2) return { 성격: false };
  return {
    성격: true, 항목: '재인불애',
    판정: '인수 태왕에 재가 억제해 줌 — 수표목부(水漂木浮) 등의 병을 재가 고침, 오히려 크게 길함(반흉위길)',
  };
}

// ---------- 第十七 살인상생(殺印相生) ----------
// [v25 최종판] "개수"도 "인접 기둥"도 아닌 — 원문 예시(갑술 정묘 정묘 계묘,
// "시상 계수가 자기 시지 묘목을 생하니")의 진짜 조건은
// "같은 기둥 안에서 천간(편관)이 그 지지(인수)를 직접 생하는 관계".
// 검출률 6.9%로 안정, 원문 예시 검증 통과.
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
function checkSalinSangsaeng(saju) {
  const ilgan = saju.dStem;
  const pillars = [
    { 천간:saju.yStem, 지지:saju.yBranch, 일간자신:false },
    { 천간:saju.mStem, 지지:saju.mBranch, 일간자신:false },
    { 천간:saju.dStem, 지지:saju.dBranch, 일간자신:true },
    { 천간:saju.tStem, 지지:saju.tBranch, 일간자신:false },
  ];
  const found = pillars.some(p => {
    if (p.일간자신) return false;
    if (Y.getSipseong(ilgan, p.천간) !== '편관') return false;
    const branchHasInsu = ['정인','편인'].includes(Y.getSipseong(ilgan, p.지지)) ||
      (T.JIJANGGAN[p.지지]||[]).some(g => ['정인','편인'].includes(Y.getSipseong(ilgan, g)));
    if (!branchHasInsu) return false;
    return SAENG[T.STEM_OHAENG[p.천간]] === T.BRANCH_OHAENG[p.지지];
  });
  if (!found) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  return {
    성격: true, 항목: '살인상생',
    판정: '칠살이 인수를 생하고 인수가 일주를 생함(탐생망극) — 살이 순화되어 오히려 도움, 운에서 재관을 크게 꺼리지 않음',
    특기사항: sinyak ? ['신약에 살인상생이면 특히 반가움'] : null,
  };
}

const TOPICS_4 = [
  { id:14, 제목:'천관지축', fn: checkCheongwanJichuk },
  { id:15, 제목:'탐재괴인', fn: checkTamjaeGoein },
  { id:16, 제목:'재인불애', fn: checkJaeinBurae },
  { id:17, 제목:'살인상생', fn: checkSalinSangsaeng },
];

module.exports = { TOPICS_4, checkCheongwanJichuk, checkTamjaeGoein, checkJaeinBurae, checkSalinSangsaeng };
