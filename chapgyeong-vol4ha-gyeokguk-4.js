// ============================================================
// chapgyeong-vol4ha-gyeokguk-4.js
// 4권下 특수격 4차: 육임추간격·합록격·전재격
// 출처: 원문 92~127쪽 (第二十一~二十三)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

// ---------- 第二十一 육임추간격 (원문 92~99쪽) ----------
const CHUGAN_ILJU = ['임신','임오','임진','임인','임자','임술'];
function checkYugimChugan(saju) {
  const ilju = saju.dStem+saju.dBranch;
  if (!CHUGAN_ILJU.includes(ilju)) return { 성격: false };
  if (saju.tStem+saju.tBranch !== '임인') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  if (branches.filter(b=>b==='인').length < 2) return { 성격: false }; // [115차] 원문 「인(艮)을 많이 두어」
  const hasSinHae = branches.some(b=>['신','해'].includes(b)); // 신은 인충, 해는 인해합 전실
  const hasJin = branches.includes('진');
  const hasGyeong = [saju.yStem,saju.mStem].includes('경');
  let 특기사항 = [];
  if (hasSinHae) 특기사항.push('신(충) 또는 해(전실) 존재 — 파격 위험, 부군납치 등 흉 가능');
  if (hasJin) 특기사항.push('진(辰) 존재 — 운룡풍호를 이루어 길함');
  if (hasGyeong) 특기사항.push('경금 투출 — 길함');
  return {
    성격: true, 격국명: '육임추간격',
    용신: '인해합으로 임수 정록(암록) 인출 — 인중 갑병무 관을 얻음',
    특기사항: 특기사항.length ? 특기사항 : null,
  };
}

// ---------- 第二十二 합록격 (원문 104~113쪽) ----------
const HAPROK_MU_ILJU = ['무진','무인','무자','무술','무신','무오'];
const HAPROK_GYE_ILJU = ['계유','계미','계사','계묘','계축','계해'];
function checkHaprok(saju) {
  const ilju = saju.dStem+saju.dBranch;
  const isMu = HAPROK_MU_ILJU.includes(ilju);
  const isGye = HAPROK_GYE_ILJU.includes(ilju);
  if (!isMu && !isGye) return { 성격: false };
  if (saju.tStem+saju.tBranch !== '경신') return { 성격: false };
  const ilgan = saju.dStem;
  const gwanExists = require('./chapgyeong-vol4-gyeokguk.js').countSipseongAll(saju, ['정관','편관']).count > 0;
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const rel = B.checkBranchRelations(branches);
  const saSinHyeong = rel.형.some(f=>f.includes('사')&&f.includes('신'));
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (gwanExists) return { 성격: false, 주의: '관성이 이미 드러남 — 전실, 합록격 불성립(115차)' };
  let 특기사항 = [];
  if (saSinHyeong) 특기사항.push('사신형(巳申刑) — 격이 혼잡되어 흠이 됨');
  if (!sinwang) 특기사항.push('신약 — 초년 고독 위험(월상 심왕이면 반전 가능)');
  return {
    성격: true, 격국명: '합록격',
    용신: isMu ? '경신시가 묘중 을목(무일의 정관)을 작합·기동해 관록 합래' : '경신시가 사중 무토(계일의 정관)를 기동해 합록',
    특기사항: 특기사항.length ? 특기사항 : ['격이 청순 — 신주 왕하면 부귀영화'],
  };
}

// ---------- 第二十三 전재격 (원문 116~127쪽) ----------
const JEONJAE_SI = {
  갑:['진','술','축','미'], 을:['진','술','축','미'],
  병:['신','유'], 정:['신','유'],
  무:['해','자'], 기:['해','자'],
  경:['인','묘'], 신:['인','묘'],
  임:['사','오'], 계:['사','오'],
};
function checkJeonjae(saju) {
  const ilgan = saju.dStem;
  const targets = JEONJAE_SI[ilgan];
  if (!targets || !targets.includes(saju.tBranch)) return { 성격: false };
  const jg = T.JIJANGGAN[saju.tBranch][T.JIJANGGAN[saju.tBranch].length-1];
  const ss = Y.getSipseong(ilgan, jg);
  if (!['정재','편재'].includes(ss)) return { 성격: false };
  // [114차] 원문: 시상에 재성 하나만 있고 다른 재가 섞이지 않아야 진격 → 시 외 천간·지지 본기에 재가 있으면 불성립
  const jaeAll = require('./chapgyeong-vol4-gyeokguk.js').countSipseongAll(saju, ['정재','편재']).count;
  if (jaeAll > 1) return { 성격: false, 주의: '재가 시상 외에도 있음 — 전재격 불성립' };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  const bigyeopCount = require('./chapgyeong-vol4-gyeokguk.js').countSipseongAll(saju, ['비견','비겁']).count;
  let 특기사항 = [];
  if (sinwang) 특기사항.push('신왕 — 부격(富格) 가능');
  else 특기사항.push('신약 — 재다신약으로 곤고 위험');
  if (bigyeopCount >= 2 && sinwang) 특기사항.push('비겁 다수+신왕 — 군겁쟁재 위험');
  return {
    성격: true, 격국명: '전재격', 시지십성: ss,
    용신: sinwang ? '전재격(신왕부격)' : '전재용비겁격 또는 전재용인격(신약 보강 필요)',
    특기사항,
  };
}

module.exports = { checkYugimChugan, checkHaprok, checkJeonjae };
