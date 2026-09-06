// ============================================================
// chapgyeong-vol4ha-gyeokguk-5.js
// 4권下 특수격 5차: 자요사·축요사·비천록마·공록공귀·협축재
// 출처: 원문 128~207쪽 (第二十四~二十八)
// [후속 수정 반영] 협축재격 딕셔너리 키 구성 오류 수정
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

// ---------- 第二十四 자요사격 (원문 128~141쪽) ----------
function checkJayosa(saju) {
  if (saju.dStem+saju.dBranch !== '갑자' || saju.tStem+saju.tBranch !== '갑자') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const hasGisin = branches.some(b=>['신','유','축','오'].includes(b)) ||
                   [saju.yStem,saju.mStem].some(s=>['경','신'].includes(s));
  const wshss = Y.getWangSangHyuSuSa('갑', saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let 특기사항 = [];
  if (hasGisin) 특기사항.push('경신신유축오 중 존재 — 파격 위험(전실·반합·충해)');
  if (sinwang) 특기사항.push('신왕 — 관향운을 만나면 귀명(경찰서장·대학교수급)');
  return {
    성격: true, 격국명: '자요사격',
    용신: '자중 계수가 사중 병무경(재관)을 은밀히 끌어옴',
    특기사항: 특기사항.length ? 특기사항 : null,
  };
}

// ---------- 第二十五 축요사격 (원문 141~151쪽) ----------
function checkChugyosa(saju) {
  const ilgan = saju.dStem;
  if (!['신','계'].includes(ilgan) || saju.dBranch !== '축') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const chukCount = branches.filter(b=>b==='축').length;
  if (chukCount < 2) return { 성격: false };
  const hasByeongjeongo = branches.some(b=>b==='오') || [saju.yStem,saju.mStem,saju.tStem].some(s=>['병','정'].includes(s));
  const hasSinYu = branches.some(b=>['신','유'].includes(b));
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let 특기사항 = [];
  if (hasByeongjeongo) 특기사항.push('병정오 존재 — 합·반으로 파격 위험');
  if (hasSinYu) 특기사항.push('신유 겸비 — 얽힘(絆合)이 대길흉, 정밀히 살펴야 함');
  if (sinwang) 특기사항.push('신왕 — 법조계·외교관·대학교수급 귀명 가능');
  return {
    성격: true, 격국명: '축요사격', 축개수: chukCount,
    용신: '축중 관살의 기운으로 사화 관성을 멀리서 불러옴',
    특기사항: 특기사항.length ? 특기사항 : null,
  };
}

// ---------- 第二十六 비천록마격/도충록마격 (원문 152~173쪽) ----------
const BICHEON_DEF = [
  { ilju:['경자','임자'], jungbokBranch:'자', chungchulBranch:'오' },
  { ilju:['병오','정사'], jungbokBranch:['오','사'], chungchulBranch:'자' },
];
function checkBicheonRokma(saju) {
  const ilju = saju.dStem+saju.dBranch;
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  for (const def of BICHEON_DEF) {
    if (!def.ilju.includes(ilju)) continue;
    const jbb = Array.isArray(def.jungbokBranch) ? def.jungbokBranch : [def.jungbokBranch];
    const jungbokCount = branches.filter(b=>jbb.includes(b)).length;
    if (jungbokCount < 2) continue;
    const target = def.chungchulBranch;
    const jeonsil = branches.includes(target);
    // [115차] 충출할 관성 오행이 원국 천간·지지 본기에 이미 있으면 전실 — 격 불성립(계축무오병오임진: 임·계 관살 있어 저자는 거관유살격)
    const GB = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' }[Y.ohaengOf(saju.dStem)]; const stems4=[saju.yStem,saju.mStem,saju.tStem];
    if (jeonsil || stems4.some(x=>T.STEM_OHAENG[x]===GB) || branches.some(b=>T.BRANCH_OHAENG[b]===GB)) return { 성격:false, 주의:'관성이 원국에 실재(전실) — 비천록마격 불성립' };
    const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
    const sinwang = Y.isSinWang(wshss);
    let 특기사항 = [];
    if (jeonsil) 특기사항.push(`전실(${target}이 실제로 있음) — 복이 반감`);
    if (!sinwang) 특기사항.push('신약 — 충출된 재관을 감당 못해 재화 위험');
    return {
      성격: true, 격국명: '비천록마격(도충록마격)',
      용신: `${jungbokCount}개의 ${jbb.join('/')}가 충으로 ${target}(관성)을 불러옴`,
      특기사항: 특기사항.length ? 특기사항 : ['전실 없음, 신왕 — 검찰청장급 귀명 가능'],
    };
  }
  return { 성격: false };
}

// ---------- 第二十七 공록공귀격 (원문 173~184쪽) ----------
function checkGongrokGonggwi(saju) {
  const ilju = saju.dStem+saju.dBranch;
  const siju = saju.tStem+saju.tBranch;
  const ilgan = saju.dStem;
  if (ilju === siju) {
    const rok = T.GILSIN_18.정록[ilgan];
    const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
    const jeonsil = branches.includes(rok);
    let 특기사항 = jeonsil ? [`전실(${rok}이 실제로 있음) — 격이 허물어짐`] : ['전실 없음 — 공록 성립'];
    return { 성격:true, 격국명:'공록격', 협공지지:rok, 특기사항 };
  }
  return { 성격: false };
}

// ---------- 第二十八 협축재격 (원문 196~207쪽) ----------
const HYEOPCHUK_DEF = {
  '계유계해': { hyeopgong:'술', jae:'정' },
  '갑인갑자': { hyeopgong:'축', jae:'기' },
  '기묘기사': { hyeopgong:'진', jae:'계' },
  '경오갑신': { hyeopgong:'미', jae:'을' },
};
function checkHyeopchukJae(saju) {
  const ilju = saju.dStem+saju.dBranch;
  const siju = saju.tStem+saju.tBranch;
  const key = ilju+siju;
  const def = HYEOPCHUK_DEF[key];
  if (!def) return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const jeonsil = branches.includes(def.hyeopgong);
  const wshss = Y.getWangSangHyuSuSa(saju.dStem, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let 특기사항 = [];
  if (jeonsil) 특기사항.push(`전실(${def.hyeopgong}이 실제로 있음) — 격이 깨짐`);
  if (sinwang) 특기사항.push('신왕 — 부귀 가능');
  return {
    성격: true, 격국명: '협축재격', 협공지지: def.hyeopgong,
    용신: `${def.hyeopgong}중 ${def.jae}(재성)를 협공`,
    특기사항: 특기사항.length ? 특기사항 : null,
  };
}

module.exports = { checkJayosa, checkChugyosa, checkBicheonRokma, checkGongrokGonggwi, checkHyeopchukJae };
