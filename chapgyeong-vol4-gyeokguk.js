// ============================================================
// chapgyeong-vol4-gyeokguk.js
// 사주첩경 4권 — 격국(格局) 판정 엔진: 정관·편관·인수·정재 4격
// 출처: 사주첩경4권_격국용신편_완성본.pdf 원문 182~244쪽 (제1~4편)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

function toPillars(saju) {
  return {
    branches: [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch],
    stems: [saju.yStem, saju.mStem, saju.dStem, saju.tStem],
  };
}

function findTuchul(saju, targetSipseongs) {
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  const wolji = p.branches[1];
  const jijanggan = T.JIJANGGAN[wolji] || [];
  const found = jijanggan.filter(s => targetSipseongs.includes(Y.getSipseong(ilgan, s)));
  if (found.length === 0) return null;
  const positions = ['년간','월간','시간'];
  const stemIdx = [0,1,3];
  for (const hiddenStem of found) {
    for (let k=0; k<3; k++) {
      const i = stemIdx[k];
      if (p.stems[i] === hiddenStem) {
        return { 투출간: hiddenStem, 위치: positions[k], 지장간후보: found };
      }
    }
  }
  return { 투출간: null, 위치: null, 지장간후보: found };
}

function countSipseongAll(saju, targetSipseongs) {
  const p = toPillars(saju);
  const ilgan = saju.dStem;
  let count = 0;
  const locations = [];
  p.stems.forEach((s,i) => {
    if (i===2) return;
    if (targetSipseongs.includes(Y.getSipseong(ilgan, s))) { count++; locations.push(`${['년간','월간','_','시간'][i]}(${s})`); }
  });
  p.branches.forEach((b,i) => {
    if (Y.hasSipseongInBranch(ilgan, b, targetSipseongs)) { count++; locations.push(`${['년지','월지','일지','시지'][i]}(${b})`); }
  });
  return { count, locations };
}

// ============================================================
// 第一 정관격 (원문 182~193쪽)
// ============================================================
function checkJeonggwan(saju) {
  const tuchul = findTuchul(saju, ['정관']);
  if (!tuchul) return { 성격: false };
  const honjap = countSipseongAll(saju, ['정관','편관']);
  const isJingyeok = tuchul.투출간 !== null && honjap.count <= 1;
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let yongsin = null;
  if (sinwang) {
    const jaeCount = countSipseongAll(saju, ['정재','편재']).count;
    yongsin = jaeCount > 0 ? '정관용재격' : '정관격(신왕관왕)';
  } else {
    const inCount = countSipseongAll(saju, ['정인','편인']).count;
    yongsin = inCount > 0 ? '정관용인격' : '정관용겁격(신약)';
  }
  if (honjap.count >= 2) yongsin = '정관용상관격(관살혼잡 정리 필요 — 거관유살/거살유관)';
  return {
    성격: true, 격국명: '정관격', 진격여부: isJingyeok,
    투출: tuchul, 혼잡: honjap, 신강신약: sinwang?'신강':'신약', 용신: yongsin,
  };
}

// ============================================================
// 第二 편관격(칠살격) (원문 194~211쪽)
// ============================================================
function checkPyeongwan(saju) {
  const tuchul = findTuchul(saju, ['편관']);
  if (!tuchul) return { 성격: false };
  const honjap = countSipseongAll(saju, ['정관','편관']);
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const sikCount = countSipseongAll(saju, ['식신','상관']).count;
  const inCount = countSipseongAll(saju, ['정인','편인']).count;
  let yongsin;
  if (sinwang && sikCount > 0) yongsin = '편관용식상격(식신제살)';
  else if (!sinwang && inCount > 0) yongsin = '편관용인격(살인상생)';
  else if (sinwang) yongsin = '편관용재격';
  else yongsin = '편관용겁격(신약, 비겁으로 재를 눌러야)';
  let 특기사항 = null;
  if (sikCount >= 3) 특기사항 = '식상 과다 — 제살태과 위험(도리어 빈천)';
  return {
    성격: true, 격국명: honjap.count>=2 ? '편관격(관살혼잡)' : '편관격(칠살격)',
    투출: tuchul, 혼잡: honjap, 신강신약: sinwang?'신강':'신약', 용신: yongsin, 특기사항,
  };
}

// ============================================================
// 第三 인수격 (원문 212~231쪽)
// ============================================================
function checkInsu(saju) {
  const tuchul = findTuchul(saju, ['정인','편인']);
  if (!tuchul) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const gwanCount = countSipseongAll(saju, ['정관','편관']).count;
  const jaeCount = countSipseongAll(saju, ['정재','편재']).count;
  const sikCount = countSipseongAll(saju, ['식신','상관']).count;
  let yongsin, 특기사항 = null;
  if (gwanCount > 0) yongsin = '인수용관살격(관인상생·고관대작)';
  else if (jaeCount > 0 && sinwang) yongsin = '인수용재격(인수태왕에 재로 눌러 균형)';
  else if (sikCount > 0) yongsin = '인수용식상격(설기, 청고한 학자·예술가)';
  else yongsin = '인수용비겁격';
  if (jaeCount > 0 && !sinwang) 특기사항 = '재파인수(괴인) 위험 — 재가 인수를 극해 명예·시험·문서에 낭패';
  return {
    성격: true, 격국명: '인수격', 투출: tuchul,
    신강신약: sinwang?'신강':'신약', 용신: yongsin, 특기사항,
  };
}

// ============================================================
// 第四 정재격 (원문 232~244쪽)
// ============================================================
function checkJeongjae(saju) {
  const tuchul = findTuchul(saju, ['정재']);
  if (!tuchul) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const gwanCount = countSipseongAll(saju, ['정관','편관']).count;
  const sikCount = countSipseongAll(saju, ['식신','상관']).count;
  const bigyeopCount = countSipseongAll(saju, ['비견','비겁']).count;
  let yongsin;
  if (sinwang && gwanCount > 0) yongsin = '정재용관격(재생관, 부귀쌍전)';
  else if (!sinwang && bigyeopCount > 0) yongsin = '정재용비겁격(재다신약, 재다용겁격)';
  else if (sikCount > 0) yongsin = '정재용식상격(식상생재)';
  else yongsin = '정재용인격';
  let 특기사항 = sinwang ? null : '재다신약 위험 — 몸이 재물의 종노릇(곤고)';
  return {
    성격: true, 격국명: '정재격', 투출: tuchul,
    신강신약: sinwang?'신강':'신약', 용신: yongsin, 특기사항,
  };
}

module.exports = { findTuchul, countSipseongAll, checkJeonggwan, checkPyeongwan, checkInsu, checkJeongjae };
