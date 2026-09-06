// ============================================================
// chapgyeong-vol1-gapja60.js — 60갑자 인덱스 헬퍼
// 순환 위치·거리 계산, 순중(旬中) 판별, 전인후종 판정
// [후속 수정 반영] 전인=순행(갑자→을축·병인), 후종=역행(갑자→계해·임술)
// ============================================================
const STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

/** 60갑자 전체 순환 배열 */
const SIXTY_GANJI = [];
for (let i = 0; i < 60; i++) {
  SIXTY_GANJI.push(STEMS[i % 10] + BRANCHES[i % 12]);
}

/** 간지의 60갑자 인덱스 (없으면 -1) */
function getGanjiIndex(ganji) {
  return SIXTY_GANJI.indexOf(ganji);
}

/** base로부터 target까지 순행 거리 (0~59) */
function getForwardDistance(base, target) {
  const bi = getGanjiIndex(base), ti = getGanjiIndex(target);
  if (bi < 0 || ti < 0) return -1;
  return (ti - bi + 60) % 60;
}

/** base로부터 offset만큼 이동한 간지 */
function getGanjiAt(base, offset) {
  const bi = getGanjiIndex(base);
  if (bi < 0) return null;
  return SIXTY_GANJI[(bi + offset + 60) % 60];
}

/** 간지가 속한 순(旬) — 갑자순/갑술순/갑신순/갑오순/갑진순/갑인순 및 순중 내 위치(0~9) */
const SUN_START = ['갑자','갑술','갑신','갑오','갑진','갑인'];
function getSunInfo(ganji) {
  const idx = getGanjiIndex(ganji);
  if (idx < 0) return null;
  const sunIdx = Math.floor(idx / 10);
  const posInSun = idx % 10; // 0~9
  return { 순: SUN_START[sunIdx], 순중위치: posInSun };
}

/**
 * 제38문 전인후종(前引後從) 판정
 * 원문 정의: 태세(생년) 기준 순행 방향(을축·병인 쪽)이 전인(前引),
 * 역행 방향(계해·임술 쪽)이 후종(後從). 전인은 4자리까지 허용.
 */
function checkJeoninHujong(yearGanji, otherGanjis) {
  const results = { 전인: [], 후종: [] };
  for (const g of otherGanjis) {
    const distForward = getForwardDistance(yearGanji, g); // 태세로부터 순행 거리
    // 전인(앞으로 끎): 태세로부터 순행 1~4자리 이내
    if (distForward >= 1 && distForward <= 4) results.전인.push({ 간지: g, 거리: distForward });
    // 후종(뒤에서 따름): 태세로부터 역행 1~3자리 이내
    const distBackward = 60 - distForward;
    if (distForward > 0 && distBackward >= 1 && distBackward <= 3) results.후종.push({ 간지: g, 거리: distBackward });
  }
  const isComplete = results.전인.length > 0 && results.후종.length > 0;
  // 인원종근(引遠從近): 이끄는 것(전인)이 멀고 따르는 것(후종)이 가까우면 길함
  // (최종판: 전인 거리 우세 = maxJeonin >= minHujong 를 인원종근으로 봄)
  let inwonJonggeun = null;
  if (isComplete) {
    const maxJeonin = Math.max(...results.전인.map(x=>x.거리));
    const minHujong = Math.min(...results.후종.map(x=>x.거리));
    inwonJonggeun = maxJeonin >= minHujong;
  }
  return { 성립: isComplete, ...results, 인원종근: inwonJonggeun };
}

module.exports = { SIXTY_GANJI, getGanjiIndex, getForwardDistance, getGanjiAt, getSunInfo, checkJeoninHujong };
