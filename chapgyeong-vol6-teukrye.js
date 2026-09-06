// ============================================================
// chapgyeong-vol6-teukrye.js — 6권 후반 용신특례 검출기 (v25 최종판 복원)
// 삼기득위(第十九?후반)·부건파처(第二十七?후반)·신불가과(第七十一)·쇠왕태극
// 원본: chapgyeong-vol6-rules-19.js / -27.js / vol6-yongsin-based.js 최종판
// ⚠️ 사용 주의: 이 검출기들을 vol6 자동 파이프라인에 등록하면 용신 특례
// 계층이 억부/종격보다 먼저 발동해 v25 검증 사례 일부(정사병오신축갑오 등)가
// 회귀함을 확인 — 원본 v25에서는 종격 검출 상태가 달라 순서가 성립했음.
// 따라서 "검증된 별도 도구"로만 보존(원본의 생화유정 종격 모듈과 동일한 지위).
// 특정 사주에 특례 적용이 필요할 때 개별 호출할 것.
// 검출률(406건 기준): 삼기득위 14.5% · 부건파처 18.7% · 신불가과 27.8% ·
// (살인상생 6.9%·재인불애 14.3%는 rules-4.js에 반영됨)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
function countOh(saju, oh) {
  const p = toPillars(saju);
  return p.branches.filter(b=>T.BRANCH_OHAENG[b]===oh).length +
         p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===oh).length;
}

// ---------- 삼기득위(三奇得位) — v25 최종판(방합그룹 안착) ----------
function checkSamgiDeukwi(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const jaeOh = GEUK[Y.ohaengOf(ilgan)];
  const gwanOh = Object.keys(GEUK).find(k=>GEUK[k]===Y.ohaengOf(ilgan));
  const inOh = Object.keys(SAENG).find(k=>SAENG[k]===Y.ohaengOf(ilgan));

  const hasJeongjae = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정재') ||
                        p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정재']));
  const hasJeonggwan = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정관') ||
                        p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정관']));
  const hasJeongin = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정인') ||
                       p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정인']));
  if (!hasJeongjae || !hasJeonggwan || !hasJeongin) return { 성격: false };

  // "득위"의 진짜 정의(원문 211쪽): 정재는 진술미, 정관은 신유술, 정인은
  // 해자축 지지에 각각 임함 — 각 오행이 자기 방합 그룹에 안착해야 함
  const BANGHAP = { 목:['인','묘','진'], 화:['사','오','미'], 금:['신','유','술'], 수:['해','자','축'], 토:['진','술','축','미'] };
  const jaeDeukwi = p.branches.some(b => BANGHAP[jaeOh].includes(b));
  const gwanDeukwi = p.branches.some(b => BANGHAP[gwanOh].includes(b));
  const inDeukwi = p.branches.some(b => BANGHAP[inOh].includes(b));
  if (!jaeDeukwi || !gwanDeukwi || !inDeukwi) return { 성격: false };

  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  return {
    성격: true, 항목: '삼기득위',
    판정: sinwang ? '정재·정관·정인 모두 갖추고 일주 고강 — 일품의 귀함(여명은 남편 봉후)' : '삼기는 갖췄으나 일주 약함 — 인수가 생조하면 귀함 가능',
  };
}

// ---------- 부건파처(夫健怕妻) — v25 최종판(간여지동 경로 추가) ----------
function checkBugeonPacheo(saju) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);
  // 원문 예시(계해 갑자 무술 계축)는 월지 기준으론 신약이나 일지(술=토,
  // 간여지동)로 직접 뿌리내려 건왕 — 월지 왕상휴수사 OR 일지 간여지동
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const woljiSinwang = Y.isSinWang(wshss);
  const iljiGanYeoJiDong = T.BRANCH_OHAENG[saju.dBranch] === ilOh;
  const sinwang = woljiSinwang || iljiGanYeoJiDong;
  if (!sinwang) return { 성격: false };
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  if (jaeCount < 3) return { 성격: false };
  return {
    성격: true, 항목: '부건파처',
    판정: '일주 건왕한데 재(처)가 왕성하여 오히려 두려워함(재생살 위험) — 신강운을 만나면 부귀, 재다신약과는 근본적으로 다름',
  };
}

// ---------- 신불가과(臣不可過) — v25 최종판(재 조건 제거) ----------
function checkSinbulGagwa(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false }; // 신(일주)이 극왕해야
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  if (gwansalCount === 0 || gwansalCount >= 3) return { 성격: false }; // 관살이 "한두 점"만 약하게 있어야
  // 원문은 재의 존재 여부를 전혀 문제 삼지 않음 — 핵심은 "관살 자체가 미약한가"
  return {
    성격: true, 항목: '신불가과',
    판정: '일주(신하)가 극왕한데 관살(임금)은 쇠약함(군쇠신왕) — 억지로 억누르면 반격당함, 통관 오행으로 순화시켜야 상하 편안',
  };
}

// ---------- 쇠왕태극(衰旺太極) — v25 최종판(4구분) ----------
function checkSoewangTaeguk(saju) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);
  const c = countOh(saju, ilOh);
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  // 문턱을 극단적으로: 8글자 중 압도적 편중만 인정(과다검출 방지)
  if (c >= 6) {
    const insu = Object.keys(SAENG).find(k => SAENG[k] === ilOh);
    return { 성격: true, 항목: '쇠왕태극(왕극)', 판정: `일간(${ilOh})이 사주 8자 중 ${c}개로 극왕 — 특별법으로 오히려 인수(${insu})를 반김(종강)` };
  }
  if (c === 0) {
    return { 성격: true, 항목: '쇠왕태극(쇠극)', 판정: `일간(${ilOh}) 완전 무근(쇠극) — 흐름을 거스르지 않고 설기(식상) 방향을 씀(衰極宜洩)` };
  }
  // 원문 원칙: "태왕에는 설기가 반갑고... 태쇠에는 극제를 더함이 마땅하다"
  if (wshss === '왕' && c >= 3 && c < 6) {
    const sikOh = SAENG[ilOh];
    return { 성격: true, 항목: '쇠왕태극(태왕)', 판정: `일간(${ilOh})이 월령상 왕하고 세력(${c}개)도 강함(태왕) — 설기 방향(식상 ${sikOh})을 반김` };
  }
  if ((wshss === '수' || wshss === '사') && c === 1) {
    const gwanOh = Object.keys(GEUK).find(k => GEUK[k] === ilOh);
    return { 성격: true, 항목: '쇠왕태극(태쇠)', 판정: `일간(${ilOh})이 월령상 쇠약하고 세력(${c}개)도 약함(태쇠) — 억누르기보다 극제(관살 ${gwanOh})를 더함이 마땅` };
  }
  return { 성격: false };
}

const TOPICS_TEUKRYE = [
  { id:'삼기득위', 제목:'삼기득위', fn: checkSamgiDeukwi },
  { id:'부건파처', 제목:'부건파처', fn: checkBugeonPacheo },
  { id:'신불가과', 제목:'신불가과', fn: checkSinbulGagwa },
  { id:'쇠왕태극', 제목:'쇠왕태극', fn: checkSoewangTaeguk },
];

module.exports = { TOPICS_TEUKRYE, checkSamgiDeukwi, checkBugeonPacheo, checkSinbulGagwa, checkSoewangTaeguk };
