// ============================================================
// chapgyeong-vol4-gyeokguk-2.js
// 사주첩경 4권 — 격국 판정 엔진 2차: 편재·식신·상관·종기재관·양인·건록
// 출처: 원문 245~388쪽 (제5~14편)
// [후속 세션 버그수정 반영] 가상관격은 월지 지원 없이도 성립(게이트 제거)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

// 第五 편재격 (원문 245~258쪽)
function checkPyeonjae(saju) {
  const tuchul = G1.findTuchul(saju, ['편재']);
  if (!tuchul) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const gwanCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  let yongsin, 특기사항 = null;
  if (sinwang && gwanCount > 0) yongsin = '편재용관격(재생관)';
  else if (!sinwang) yongsin = '편재용인비겁격(재다신약)';
  else if (sikCount > 0) yongsin = '편재용식상격';
  else yongsin = '편재격(신왕재왕)';
  if (bigyeopCount >= 2 && !sinwang) 특기사항 = '겁성 다수 — 전원파진(재산 손실) 위험';
  return { 성격:true, 격국명:'편재격', 투출:tuchul, 신강신약: sinwang?'신강':'신약', 용신:yongsin, 특기사항 };
}

// 第六 식신격 (원문 259~271쪽)
function checkSiksin(saju) {
  const tuchul = G1.findTuchul(saju, ['식신']);
  if (!tuchul) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const sinsalCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const doSikRisk = G1.countSipseongAll(saju, ['편인']).count > 0;
  let yongsin = null, 특기사항 = null;
  if (sinwang && jaeCount > 0) yongsin = '식신생재격(재를 생함, 대부의 격)';
  else if (sinwang && sinsalCount > 0) yongsin = '식신제살격(칠살을 제압)';
  else yongsin = '식신격(신왕 우선)';
  if (doSikRisk) 특기사항 = '편인 존재 — 도식(倒食) 위험, 식신을 극해 재화·굶주림 경계';
  return { 성격:true, 격국명:'식신격', 투출:tuchul, 신강신약: sinwang?'신강':'신약', 용신:yongsin, 특기사항 };
}

// 第七 상관격 (원문 271~334쪽) — 진상관/가상관 구분
// [버그수정] 가상관은 월령을 얻지 못한 상관격 — findTuchul(월지 지장간 기반)만으로
// 가상관을 걸러내면 안 됨. 사주 어디든 상관이 있고 신왕하면 가상관 성립 경로 허용.
function checkSanggwan(saju) {
  const ilgan = saju.dStem;
  const ilOh = Y.ohaengOf(ilgan);
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const wolIsSang = Y.hasSipseongInBranch(ilgan, saju.mBranch, ['상관']);
  const tuchul = G1.findTuchul(saju, ['상관']);
  const sangAnywhere = G1.countSipseongAll(saju, ['상관']).count;
  // 진상관: 월령 상관. 가상관: 월령엔 없지만 사주에 상관이 있고 신왕(설기 필요)
  const isJinSanggwan = wolIsSang;
  if (!isJinSanggwan && !(sinwang && sangAnywhere > 0)) return { 성격: false };
  const gwanCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;

  let yongsin, 특기사항 = [];
  if (ilOh === '금' && Y.ohaengOf(saju.mBranch) === '수') {
    특기사항.push('금수상관요견관(조후용관) — 예외적으로 관을 반김');
  }
  if (isJinSanggwan) {
    if (inCount > 0) yongsin = '상관용인격(진상관, 인수로 설기 억제)';
    else if (bigyeopCount > 0) yongsin = '상관용겁격(진상관, 비겁으로 신 보강)';
    else yongsin = '진상관격(용신 불투, 신약 우려)';
    특기사항.push('진상관 — 상관운을 대기(꺼림), 인수·비겁운 반김');
  } else {
    if (jaeCount > 0) yongsin = '상관용재격(가상관, 재로 설기)';
    else yongsin = '가상관격(용신 불투)';
    특기사항.push('가상관 — 상관운에 오히려 발복(행상관운 다영현)');
  }
  if (gwanCount > 0) 특기사항.push('상관견관 주의 — 관을 극해 화가 백단(단, 금수상관은 예외)');
  return { 성격:true, 격국명: isJinSanggwan?'상관격(진상관)':'상관격(가상관)',
    투출:tuchul, 신강신약: sinwang?'신강':'신약', 용신:yongsin, 특기사항 };
}

// 第八 종기재관격 (원문 334~346쪽) — 월지가 진술축미(잡기)
function checkJonggiJaegwan(saju) {
  const japgi = ['진','술','축','미'];
  if (!japgi.includes(saju.mBranch)) return { 성격: false };
  const ilgan = saju.dStem;
  const jijanggan = T.JIJANGGAN[saju.mBranch];
  const found = jijanggan.map(s => ({stem:s, sipseong: Y.getSipseong(ilgan,s)}))
    .filter(x => ['정재','편재','정관','편관','정인','편인','식신','상관'].includes(x.sipseong));
  if (found.length === 0) return { 성격: false };
  const rel = require('./chapgyeong-vol1-basics.js').checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const chungOpened = rel.충.some(f => f.includes(saju.mBranch));
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let yongsin = `종기${found[0].sipseong.includes('재')?'재관':found[0].sipseong.includes('관')?'재관':found[0].sipseong.includes('인')?'인수':'상관'}격`;
  let 특기사항 = chungOpened ? '충으로 창고가 열림(開庫) — 이 격은 유일하게 충을 반김' : '충이 없어 창고가 닫혀 있음 — 발복 지연';
  return { 성격:true, 격국명:'종기재관격(잡기재관인격)', 암장후보:found,
    신강신약: sinwang?'신강':'신약', 용신:yongsin, 특기사항, 개고여부: chungOpened };
}

// 第九 양인격 (원문 353~372쪽) — 양일간만
const YANGIN_MONTHLY = { 갑:'묘', 병:'오', 무:'오', 경:'유', 임:'자' };
function checkYangin(saju) {
  const ilgan = saju.dStem;
  const yanginBranch = YANGIN_MONTHLY[ilgan];
  if (!yanginBranch) return { 성격: false };
  const isWolIn = saju.mBranch === yanginBranch;
  const isIlIn = saju.dBranch === yanginBranch;
  if (!isWolIn && !isIlIn) return { 성격: false };
  const chilsalCount = G1.countSipseongAll(saju, ['편관']).count;
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  const rel = require('./chapgyeong-vol1-basics.js').checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const hapsal = rel.합.some(h => h.includes(yanginBranch));
  let yongsin, 특기사항 = [];
  if (chilsalCount > 0) {
    yongsin = '합살위귀격(양인+칠살 조화, 위권 귀명)';
    특기사항.push('양인+칠살 — 신왕하면 합살위귀, 신약하면 대흉');
  } else if (jaeCount > 0) {
    yongsin = '양인용재격';
    특기사항.push('재를 보면 군겁쟁재 위험');
  } else if (sikCount > 0) {
    yongsin = '양인생식상격(식거선살거후)';
  } else {
    yongsin = '양인격(용신 미정)';
  }
  return { 성격:true, 격국명: isIlIn?'일인(日刃)':'양인격', 위치: isWolIn?'월지':'일지',
    용신:yongsin, 특기사항 };
}

// 第十 건록격 (원문 380~388쪽)
function checkGeonrok(saju) {
  const ilgan = saju.dStem;
  const rokBranch = T.GILSIN_18.정록[ilgan];
  if (saju.mBranch !== rokBranch) return { 성격: false };
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const gwanCount = G1.countSipseongAll(saju, ['정관','편관']).count;
  const chilsalCount = G1.countSipseongAll(saju, ['편관']).count;
  let yongsin, 특기사항 = null;
  if (jaeCount > 0 && gwanCount > 0) yongsin = '건록용재관격(재관 균형, 관록마 자양)';
  else if (jaeCount > 0) yongsin = '건록용재격';
  else if (gwanCount > 0) yongsin = '건록용관격';
  else yongsin = '건록격(비겁 중첩, 현처복재)';
  if (chilsalCount >= 2) 특기사항 = '살왕향 — 신약이 심하면 위태, 제살운을 반김';
  return { 성격:true, 격국명:'건록격', 용신:yongsin, 특기사항 };
}

module.exports = { checkPyeonjae, checkSiksin, checkSanggwan, checkJonggiJaegwan, checkYangin, checkGeonrok };
