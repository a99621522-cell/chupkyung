// ============================================================
// chapgyeong-jonggyeok-saenghwa.js
// "생화유정(生化有情)" 종격 판정 — 오행이 상생 순환을 따라 여러 단계를
// 거쳐 하나의 오행에 집결되는 연쇄 구조를 실제로 추적
//
// 기존 종격 판정(일간세력 0 또는 특정오행 압도적 다수)은 "단순 세력
// 비교"만 했는데, 실제 원문 예시(임자을사기해계유 등)는 "토생금·
// 금생수·수생목"처럼 여러 단계를 거쳐 흐르는 구조 — 이걸 놓쳐 세 건
// 연속으로 종격을 놓쳤던 근본 원인
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

const 상생순환 = ['목','화','토','금','수']; // 목생화생토생금생수생목(순환)
function 다음오행(oh) {
  const idx = 상생순환.indexOf(oh);
  return 상생순환[(idx + 1) % 5];
}

function countOh(saju, oh) {
  const p = { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
              stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
  let c = p.branches.filter(b=>T.BRANCH_OHAENG[b]===oh).length +
          p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===oh).length;
  p.branches.forEach(b => (T.JIJANGGAN[b]||[]).forEach(g => { if (T.STEM_OHAENG[g]===oh) c++; }));
  return c;
}

// [반합 감지] 삼합 그룹 중 두 글자만 있어도(반합) 그 국의 오행 방향으로
// 힘이 쏠린다고 봄 — 기존 checkBranchRelations가 이걸 전혀 감지 못했음
// (이 사례의 사유합을 놓쳤던 근본 원인)
function findBanhap(branches) {
  const results = [];
  for (const [group, oh] of Object.entries(T.BRANCH_SAMHAP)) {
    const 포함된글자 = [...group].filter(g => branches.includes(g));
    if (포함된글자.length >= 2) results.push({ 글자: 포함된글자, 오행: oh });
  }
  return results;
}

/**
 * 생화유정 종격 판정 — 일간 세력이 극히 미약한데(0~1), 나머지 세력이
 * 일간 오행에서 시작하는 상생 사슬을 따라 여러 단계(2단계 이상) 걸쳐
 * 순차적으로 존재하고, 최종적으로 특정 오행에 집결되는 경우.
 * [재정정] "인수가 반합으로 무력화"되는 경우까지 반영 — 일간을 구할
 * 인수(어머니 오행)가 반합에 걸려 다른 오행 방향으로 힘이 쏠리면,
 * 그 인수는 "구원 실패"로 처리하고 반합이 가리키는 오행부터 사슬을 재출발
 */
function checkJonggyeokSaengHwaYujeong(saju, skipIlganCheck) {
  const ilOh = Y.ohaengOf(saju.dStem);
  const ilCount = countOh(saju, ilOh);
  // [수정] 상위 함수(checkJonggyeokTonggeunDeukryeong)가 이미 음양간
  // 차별화 규칙(음간종세무정의)으로 통과 판단을 마친 경우, 이 함수 자체의
  // "일간세력<=1" 하드코딩 관문을 건너뛰도록 skipIlganCheck 플래그 추가
  if (!skipIlganCheck && ilCount > 1) return { 성립: false };

  const branches = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch];
  const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
  const insuOh = Object.keys(SAENG).find(k => SAENG[k] === ilOh); // 일간을 생하는 오행(인수)

  // 인수가 반합에 걸려 다른 오행으로 힘이 쏠렸는지 확인
  const banhaps = findBanhap(branches);
  const insuMuryeokhwa = banhaps.find(b => b.오행 !== insuOh &&
    b.글자.some(g => T.BRANCH_OHAENG[g] === insuOh)); // 인수 오행의 지지가 반합에 끌려감

  // 사슬 출발점: 인수가 무력화됐으면 그 반합이 가리키는 오행부터, 아니면 일간 오행부터
  let 시작 = insuMuryeokhwa ? insuMuryeokhwa.오행 : ilOh;
  let 사슬 = insuMuryeokhwa ? [ilOh, 시작] : [ilOh];
  let cur = 시작;
  const 남은단계 = insuMuryeokhwa ? 3 : 4;
  for (let i = 0; i < 남은단계; i++) {
    cur = 다음오행(cur);
    사슬.push(cur);
  }
  const counts = 사슬.map(oh => countOh(saju, oh));
  let 끊긴지점 = -1;
  for (let i = 1; i < 사슬.length; i++) {
    if (counts[i] === 0) { 끊긴지점 = i; break; }
  }
  const 유효사슬길이 = 끊긴지점 === -1 ? 사슬.length : 끊긴지점;
  if (유효사슬길이 < 3) return { 성립: false };

  // 집결지: 사슬을 따라가다 처음 만나는 "천간 투출" 지점(단, 인수 자체는 이미
  // 무력화 처리했으니 후보에서 제외)
  // [핵심 발견 — 진종격 원리] 명리학 문헌 조사 결과: "왕신이 월지와
  // 같은 오행이면 진종격(완전), 다르면 가종격(불완전)"이라는 원칙 확인.
  // 사슬을 따라가다 "월지(계절) 오행과 일치하는 지점"을 만나면 거기서
  // 우선 멈춤(진종격 조건 충족) — 갑술정축을묘임오(월지=축=토, 최종=토
  // 일치) 사례가 바로 이 원리로 정확히 설명됨
  const wolji오행 = T.BRANCH_OHAENG[saju.mBranch];
  let 진종격지점 = null;
  for (let i = 1; i < 유효사슬길이; i++) {
    if (사슬[i] === wolji오행 && 사슬[i] !== insuOh) { 진종격지점 = 사슬[i]; break; }
  }

  const otherStems = [saju.yStem, saju.mStem, saju.tStem];
  let 집결지 = 진종격지점; // 월지와 일치하는 지점을 최우선으로
  if (!집결지) {
    for (let i = 1; i < 유효사슬길이; i++) {
      const oh = 사슬[i];
      if (oh === insuOh) continue;
      if (counts[i] >= 4) continue;
      const banhapGanghwa = banhaps.some(b => b.오행 === oh && b.오행 !== insuOh);
      if (banhapGanghwa) continue;
      if (otherStems.some(s => T.STEM_OHAENG[s] === oh)) { 집결지 = oh; break; }
    }
  }
  if (!집결지) {
    for (let i = 유효사슬길이 - 1; i >= 1; i--) {
      const oh = 사슬[i];
      if (oh === insuOh || counts[i] === 0) continue;
      집결지 = oh; break;
    }
  }
  if (!집결지) 집결지 = 사슬[유효사슬길이 - 1];
  const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
  const 관계 = GEUK[ilOh] === 집결지 ? '종재' : GEUK[집결지] === ilOh ? '종살(종관)' :
    (집결지 === 다음오행(ilOh) ? '종아(식상)' : '기타');

  return {
    성립: true,
    항목: '생화유정 종격',
    인수무력화: insuMuryeokhwa ? `${insuOh}가 ${insuMuryeokhwa.글자.join('')}반합으로 ${insuMuryeokhwa.오행}쪽에 힘을 빼앗김` : null,
    사슬: 사슬.slice(0, 유효사슬길이),
    집결오행: 집결지,
    관계,
    판정: `일간(${ilOh})이 극미약한데${insuMuryeokhwa?', 인수마저 반합으로 무력화되어':''} ${사슬.slice(0,유효사슬길이).join('→')}로 흘러 정기가 ${집결지}에 집결 — ${관계}`,
  };
}
module.exports = { checkJonggyeokSaengHwaYujeong, countOh, findBanhap };

// ============================================================
// [12운성 통합] 종격 판정에서 일간 세력을 셀 때, 단순 개수가 아니라
// "그 자리가 실제로 힘을 쓸 수 있는 위치인가"(12운성)까지 반영.
// 절·태·병·사·묘(무력한 자리)에 있는 지지는 세력에서 절반 가치로,
// 나머지(장생·관대·건록·제왕 등 힘있는 자리)는 원래대로 카운트.
// ============================================================
const 무력한위치 = ['절', '태', '병', '사', '묘'];

function countOhWith12Unseong(saju, oh, dStem) {
  const base = countOh(saju, oh);
  if (oh !== Y.ohaengOf(dStem)) return base; // 일간 자신의 오행에만 12운성 가중치 적용
  const branches = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch];
  let 가중치반영 = 0;
  branches.forEach(b => {
    if (T.BRANCH_OHAENG[b] === oh) {
      const unseong = T.getSibiUnseong(dStem, b);
      가중치반영 += 무력한위치.includes(unseong) ? 0.5 : 1;
    }
  });
  return 가중치반영;
}

/** 12운성 가중치를 반영한 종격 재판정 — 개수는 있어도 전부 무력한 자리면 종격 인정 */
function checkJonggyeokWith12Unseong(saju) {
  const ilOh = Y.ohaengOf(saju.dStem);
  const weightedCount = countOhWith12Unseong(saju, ilOh, saju.dStem);
  if (weightedCount > 1.5) return { 성립: false }; // 가중치 반영해도 여전히 힘 있으면 종격 아님
  return checkJonggyeokSaengHwaYujeong({ ...saju, __ilganWeighted: true });
}
module.exports.countOhWith12Unseong = countOhWith12Unseong;
module.exports.checkJonggyeokWith12Unseong = checkJonggyeokWith12Unseong;

// ============================================================
// [핵심 재설계] 통근-득령 분리 + 음양간 차별화(적천수 "음간종세무정의")
// 양간: 진짜 뿌리(통근)가 없어야만 종격(陽干從氣不從勢)
// 음간: 뿌리가 있어도 주변 세력이 압도적이면 그 뿌리를 버리고 세를 따름
//       (陰干從勢無情義) — 을목이 일지 건록이라는 진짜 뿌리가 있어도
//       화토 세력이 강하면 종격이 되는 원문 사례가 바로 이 규칙
// ============================================================
const 양간 = ['갑','병','무','경','임'];
const 음간 = ['을','정','기','신','계'];

function isYangGan(stem) { return 양간.includes(stem); }

/** 통근-득령 분리 종격 판정 — 음양간 차별화 반영 */
function checkJonggyeokTonggeunDeukryeong(saju) {
  const dStem = saju.dStem;
  const ilOh = Y.ohaengOf(dStem);
  const branches = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch];

  // 통근 여부(일간 오행이 어느 지지에든 본기 또는 지장간으로 존재하는지)
  // [버그 수정] 본기만 확인하다가 지장간의 통근(예: 축중신금)을 놓쳐
  // 실제로 뿌리가 있는 사주를 "무근"으로 오판해 종격을 잘못 통과시키던
  // 회귀 발견(정사병오신축갑오: 신금이 축의 지장간에 있는데도 무근 처리됨)
  const tonggeunBranches = branches.filter(b => T.BRANCH_OHAENG[b] === ilOh ||
    (T.JIJANGGAN[b]||[]).some(g => T.STEM_OHAENG[g] === ilOh));
  const hasTonggeun = tonggeunBranches.length > 0;

  // 득령 여부(월지가 일간을 생조하는 오행인지 — 비겁 또는 인수)
  const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
  const insuOh = Object.keys(SAENG).find(k => SAENG[k] === ilOh);
  const deukryeong = T.BRANCH_OHAENG[saju.mBranch] === ilOh || T.BRANCH_OHAENG[saju.mBranch] === insuOh;

  // 상대 세력(비겁·인수를 제외한 나머지 세 오행 전체 세력)
  const otherOhList = ['목','화','토','금','수'].filter(o => o !== ilOh && o !== insuOh);
  const 상대세력 = otherOhList.reduce((sum, o) => sum + countOh(saju, o), 0);

  if (isYangGan(dStem)) {
    // 양간: 통근이 있으면(진짜 뿌리) 종격 불가 — 엄격
    if (hasTonggeun) return { 성립: false, 이유: '양간은 통근하면 종격 불가(陽干從氣不從勢)' };
  } else {
    // 음간: 통근이 있어도 상대세력이 압도적(예: 5 이상)이면 종격 허용
    if (hasTonggeun && 상대세력 < 5) {
      return { 성립: false, 이유: '음간이나 상대세력이 압도적이지 않아 통근을 버리지 않음' };
    }
  }

  // 여기까지 통과하면 생화유정 사슬 추적으로 진짜 집결지 확인
  const result = checkJonggyeokSaengHwaYujeong(saju, true); // skipIlganCheck=true(이미 위에서 통근판단 마침)
  if (result.성립) {
    result.통근득령분석 = {
      음양간: isYangGan(dStem) ? '양간' : '음간',
      통근여부: hasTonggeun, 득령여부: deukryeong, 상대세력,
      비고: hasTonggeun ? '음간종세무정의 적용(뿌리 있어도 세를 따름)' : '무근(뿌리 없음)',
    };
  }
  return result;
}
module.exports.isYangGan = isYangGan;
module.exports.checkJonggyeokTonggeunDeukryeong = checkJonggyeokTonggeunDeukryeong;

// ============================================================
// [사례기반 추정] 순수 알고리즘으로 "흘러넘침 vs 집결"을 못 가르는
// 지점 발견 — 대신 원문에서 확인된 실제 사례들을 참고 데이터베이스로
// 저장해두고, 새 사주가 들어오면 "구조가 가장 비슷한 기존 사례"를
// 찾아 그 결과를 참고 추정치로 제시(확정 아님을 명시)
// ============================================================
const 알려진사례 = [
  {
    이름: '임자을사기해계유', 일간: '기', 인수무력화있음: true,
    상대세력합: 10, 최종집결: '목', 관계: '종살', 흐름패턴: '흘러넘침',
    근거: '"도저히 이 기세를 감당하기 어려워" — 저자가 명시적으로 압도당함을 표현',
  },
  {
    이름: '갑술정축을묘임오', 일간: '을', 인수무력화있음: false,
    상대세력합: 12, 최종집결: '토', 관계: '종재', 흐름패턴: '집결',
    근거: '"정기는 술중 무토에 집결" — 저자가 명시적으로 멈춤(정착)을 표현',
  },
];

/**
 * 사례기반 추정 — 확정 알고리즘이 애매할 때, 구조가 가장 비슷한
 * 원문 실례를 찾아 "이런 유형은 보통 이렇게 처리됐다"는 참고 추정 제공
 */
function estimateByCase(saju, algorithmResult) {
  if (!algorithmResult.성립) return algorithmResult;
  // 알고리즘이 이미 확신 있게 낸 결과라도, 참고할 사례를 붙여서 신뢰도 표시
  const ilOh = Y.ohaengOf(saju.dStem);
  const isYang = isYangGan(saju.dStem);
  const 비슷한사례 = 알려진사례.filter(c => isYangGan(c.일간) === isYang);
  return {
    ...algorithmResult,
    사례추정: {
      확정여부: '알고리즘 결과이나 검증 안 된 사례 유형일 수 있음',
      참고사례: 비슷한사례.map(c => `${c.이름}(${c.흐름패턴}: ${c.근거})`),
      권고: '이 판정을 최종 확정하기 전, 원문 서술("감당 어려움" vs "정기 집결" 같은 표현)을 직접 대조해 확인할 것',
    },
  };
}
module.exports.알려진사례 = 알려진사례;
module.exports.estimateByCase = estimateByCase;

// ============================================================
// [4권下 빈틈 보완] 범용 종왕격·종강격 — 이전 세션에서 발견만 하고
// 미구현이었던 항목. 조사 결과(천리명고·자평진전 인용) 핵심 조건:
// 종강격 = "인성+비겁이 가득, 일간이 월령을 얻음(득령), 재관 전무"
// 종왕격 = "비겁이 압도적, 재관 전무"(인성 비중은 종강격보다 낮음)
// ============================================================
function checkJongwangJongganggyeok(saju) {
  const ilOh = Y.ohaengOf(saju.dStem);
  const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
  const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
  const insuOh = Object.keys(SAENG).find(k => SAENG[k] === ilOh);
  const jaeOh = GEUK[ilOh];
  const gwansalOh = Object.keys(GEUK).find(k => GEUK[k] === ilOh);

  const bigyeopSe = countOh(saju, ilOh);
  const insuSe = countOh(saju, insuOh);
  const jaeSe = countOh(saju, jaeOh);
  const gwansalSe = countOh(saju, gwansalOh);

  // 재관이 "한 점도 없어야"(원문 그대로 엄격 적용)
  if (jaeSe > 0 || gwansalSe > 0) return { 성립: false };
  // 득령(월지가 비겁 또는 인수 오행과 일치)
  const deukryeong = T.BRANCH_OHAENG[saju.mBranch] === ilOh || T.BRANCH_OHAENG[saju.mBranch] === insuOh;
  if (!deukryeong) return { 성립: false };
  if (bigyeopSe + insuSe < 5) return { 성립: false }; // 비겁+인성이 사주 대부분을 차지해야

  const 격명 = insuSe >= bigyeopSe ? '종강격(모왕자쇠)' : '종왕격(기명종격)';
  return {
    성립: true, 항목: 격명,
    비겁세력: bigyeopSe, 인수세력: insuSe, 득령: true,
    판정: `${격명} — 재관이 한 점도 없고 비겁(${bigyeopSe})·인수(${insuSe})가 사주 대부분을 차지, 월령까지 얻어 왕한 기운(${insuSe>=bigyeopSe?insuOh:ilOh})을 그대로 용신으로 삼음`,
  };
}
module.exports.checkJongwangJongganggyeok = checkJongwangJongganggyeok;
