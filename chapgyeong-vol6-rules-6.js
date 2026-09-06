// ============================================================
// chapgyeong-vol6-rules-6.js
// 6권 6차: 第二十四 모자멸자 / 第二十五 아능생모 / 第二十六 병중무구 /
//          第二十七 삼반귀물
// 출처: 원문 79~91쪽
// [후속 수정 반영] 모자멸자 순모지리/군뢰신생 분기 = 재의 투출·정기 기준
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第二十四 모자멸자(母慈滅子) ----------
function checkMojaMyeolja(saju) {
  const ilgan = saju.dStem;
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  if (inCount < 3) return { 성격: false }; // 인수 태왕(종강격 수준)
  // 순모지리/군뢰신생 분기는 배타적 조건이므로 재의 "실질적 존재"(천간 투출 또는 지지 정기)만 인정
  const p = toPillars(saju);
  const jaeTuchul = p.stems.some((s,i)=>i!==2 && ['정재','편재'].includes(Y.getSipseong(ilgan,s)));
  const jaeJeonggi = p.branches.some(b => {
    const jg = T.JIJANGGAN[b][T.JIJANGGAN[b].length-1];
    return ['정재','편재'].includes(Y.getSipseong(ilgan,jg));
  });
  const jaeExists = jaeTuchul || jaeJeonggi;
  let 판정, 특기사항 = [];
  if (!jaeExists) {
    판정 = '순모지리(비겁운을 반김, 종강격) — 인수의 뜻에 순응해야 함';
  } else {
    판정 = '군뢰신생(재를 얻어 왕한 인수를 극제) — 재에 뿌리가 있어야 함, 약한 재로 억지로 극하면 반극당해 위험';
  }
  return { 성격: true, 항목: '모자멸자', 판정, 특기사항 };
}

// ---------- 第二十五 아능생모(兒能生母) ----------
function checkAneungSaengmo(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinyak = Y.isSinYak(wshss);
  const gwansalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  if (!sinyak || gwansalCount === 0 || sikCount === 0) return { 성격: false };
  const p = toPillars(saju);
  const sikTuchul = p.stems.some((s,i)=>i!==2 && ['식신','상관'].includes(Y.getSipseong(ilgan,s)));
  return {
    성격: true, 항목: '아능생모',
    판정: sikTuchul ? '식상이 관살을 제거해 일주(어머니)를 살림 — 식신제살+조후 이중 역할' : '식상이 미약해 아불능생모 위험(살을 못 이기면 크게 위태)',
  };
}

// ---------- 第二十六 병중무구(病重無救) ----------
function checkByeongjungMugu(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const ilOh = Y.ohaengOf(ilgan);
  const GEUK = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
  const byeongOh = GEUK[ilOh]; // 나를 극하는 오행 = 병
  const byeongCount = p.branches.filter(b=>T.BRANCH_OHAENG[b]===byeongOh).length +
                       p.stems.filter((s,i)=>i!==2 && T.STEM_OHAENG[s]===byeongOh).length;
  if (byeongCount < 3) return { 성격: false };
  const yaksinOh = GEUK[byeongOh]; // 병을 극하는 것 = 약신
  const hasYaksin = p.branches.some(b=>T.BRANCH_OHAENG[b]===yaksinOh) ||
                     p.stems.some((s,i)=>i!==2 && T.STEM_OHAENG[s]===yaksinOh);
  if (hasYaksin) return { 성격: false };
  return {
    성격: true, 항목: '병중무구',
    판정: '병(태과한 극신)이 중한데 이를 제거할 약신이 전혀 없음 — 행운에서도 병운을 거듭 만나면 크게 위태',
  };
}

// ---------- 第二十七 삼반귀물(三般貴物) ----------
function checkSambanGwimul(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const hasJeongin = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정인') ||
                      p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정인']));
  const hasJeonggwan = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정관') ||
                        p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정관']));
  const hasJeongjae = p.stems.some((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정재') ||
                        p.branches.some(b=>Y.hasSipseongInBranch(ilgan,b,['정재']));
  if (!hasJeongin || !hasJeonggwan || !hasJeongjae) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  return {
    성격: true, 항목: '삼반귀물(정관·정인·정재 겸비)',
    판정: sinwang ? '신강+삼반물 구비 — 일품의 귀함(여명은 부주증영, 귀부인)' : '삼반물은 있으나 신강하지 못함 — 조정은 가능하나 큰 귀함은 신강 여부에 좌우',
  };
}

const TOPICS_6 = [
  { id:24, 제목:'모자멸자', fn: checkMojaMyeolja },
  { id:25, 제목:'아능생모', fn: checkAneungSaengmo },
  { id:26, 제목:'병중무구', fn: checkByeongjungMugu },
  { id:27, 제목:'삼반귀물', fn: checkSambanGwimul },
];

module.exports = { TOPICS_6, checkMojaMyeolja, checkAneungSaengmo, checkByeongjungMugu, checkSambanGwimul };
