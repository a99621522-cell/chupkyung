// ============================================================
// chapgyeong-vol1-sinsal.js
// 사주첩경 1권 — 길신 18종 · 흉살 19종 · 십이신살 · 포태법 종합 판정
// 출처: 원문 62~127쪽 (제16~19장)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');

function getSamhapGroup(branch) {
  for (const key in T.BRANCH_SAMHAP) {
    if (key.includes(branch)) return key;
  }
  return null;
}
function getBanghapGroup(branch) {
  for (const key in T.BRANCH_BANGHAP) {
    if (key.includes(branch)) return key;
  }
  return null;
}
function getGyejeol(monthBranch) {
  const map = { 인:'봄',묘:'봄',진:'봄', 사:'여름',오:'여름',미:'여름', 신:'가을',유:'가을',술:'가을', 해:'겨울',자:'겨울',축:'겨울' };
  return map[monthBranch];
}

function analyzeSinsal(p) {
  const {yStem,yBranch,mStem,mBranch,dStem,dBranch,tStem,tBranch} = p;
  const ilgan = dStem;
  const allBranches = [yBranch, mBranch, dBranch, tBranch];
  const allStems = [yStem, mStem, dStem, tStem];
  const result = { 길신: [], 흉살: [], 십이신살: {} };

  // ---- 십이신살 (생년 삼합 기준) ----
  const yearSamhap = getSamhapGroup(yBranch);
  if (yearSamhap) {
    const map = T.getSibiSinsal(yearSamhap);
    result.십이신살.기준 = yearSamhap;
    result.십이신살.배치 = map;
    result.십이신살.해당 = allBranches.map(b => ({지지:b, 신살:map[b]}));
  }
  // 일지 기준 십이신살 병기 — 2권 一七(해외출입) 등 첩경 실운용은 일지 기준 역마·지살도 유효로 봄
  const daySamhap = getSamhapGroup(dBranch);
  if (daySamhap) {
    const map2 = T.getSibiSinsal ? T.getSibiSinsal(daySamhap) : null;
    if (map2) { result.십이신살.일지기준 = daySamhap; result.십이신살.일지배치 = map2; result.십이신살.일지해당 = allBranches.map(b => ({지지:b, 신살:map2[b]})); }
  }

  // ---- 길신 18종 ----
  if (allBranches.includes(T.GILSIN_18.정록[ilgan])) result.길신.push('정록(십간록)');
  if (allStems.includes(T.GILSIN_18.천덕[mBranch])) result.길신.push('천덕귀인');
  if (allStems.includes(T.GILSIN_18.월덕[mBranch])) result.길신.push('월덕귀인');
  const cheoneul = T.GILSIN_18.천을귀인[ilgan] || [];
  if (allBranches.some(b => cheoneul.includes(b))) result.길신.push('옥당천을귀인');
  const taegeuk = T.GILSIN_18.태극귀인[ilgan] || [];
  if (taegeuk.includes(yBranch)) result.길신.push('태극귀인');
  if (T.GILSIN_18.천주귀인[ilgan] === mBranch) result.길신.push('천주귀인');
  if (allBranches.includes(T.GILSIN_18.관귀학관[ilgan])) result.길신.push('관귀학관');
  if (allBranches.includes(T.GILSIN_18.문창귀인[ilgan])) result.길신.push('문창귀인');
  if (allBranches.includes(T.GILSIN_18.문곡귀인[ilgan])) result.길신.push('문곡귀인');
  if ([mBranch, tBranch].includes(T.GILSIN_18.학당귀인[ilgan])) result.길신.push('학당귀인');
  if (allBranches.includes(T.GILSIN_18.금여[ilgan])) result.길신.push('금여록');
  if (allBranches.includes(T.GILSIN_18.암록[ilgan])) result.길신.push('암록');
  const hyeoprok = T.GILSIN_18.협록[ilgan] || [];
  if (hyeoprok.length === 2 && hyeoprok.every(b => allBranches.includes(b))) result.길신.push('협록');
  const ilju = dStem + dBranch;
  T.GYOROK_PAIRS.forEach(pair => { if (pair.includes(ilju)) result.길신.push('교록'); });
  const gyejeol = getGyejeol(mBranch);
  if (T.JINSIN[gyejeol] === ilju) result.길신.push('진신');
  if (T.CHEONSA[gyejeol] === ilju) result.길신.push('천사');

  // ---- 흉살 19종 ----
  const geupgak = T.GEUPGAK[gyejeol] || [];
  // 급각살 — 1권 조문은 생일·생시 기준이나 3권 실례(第9·第38·第184)는 연·월지의 급각도 판정 → 전 지지 확장, 위치 표기
  { const pos = ['연','월','일','시'].filter((n,i)=>geupgak.includes(allBranches[i])); if (pos.length) result.흉살.push(`급각살(${pos.join('·')})`); }
  // 탕화살 (일지 그룹 기준)
  const tanghwaGroup = T.TANGHWA_GROUP[dBranch];
  if (tanghwaGroup) {
    const target = T.TANGHWA_TARGET[tanghwaGroup];
    if (allBranches.includes(target)) result.흉살.push('탕화살');
  }
  if (allBranches.includes(T.GWIMUNGWAN[dBranch])) result.흉살.push('귀문관살');
  if ([dBranch,tBranch].includes(T.NAKJEONGGWAN[ilgan])) result.흉살.push('낙정관살');
  allStems.forEach((s,i) => {
    const gz = s + allBranches[i];
    if (T.BAEKHO.includes(gz)) result.흉살.push(`백호대살(${gz})`);
  });
  if (T.GOEGANG.includes(ilju)) result.흉살.push('괴강살');
  if (T.CHAKSAL.includes(ilju) || T.CHAKSAL.includes(tStem+tBranch)) result.흉살.push('음양차착살');
  if (T.GORAN.includes(ilju)) result.흉살.push('고란살');
  const yearBanghap = getBanghapGroup(yBranch);
  if (yearBanghap) {
    if ([dBranch,tBranch].includes(T.GOSIN[yearBanghap])) result.흉살.push('고신살');
    if ([dBranch,tBranch].includes(T.GWASUK[yearBanghap])) result.흉살.push('과숙살');
  }
  if (allBranches.includes(T.YANGIN[ilgan])) {
    // 원문 103쪽: 음간(을정기신계)의 진술축미는 '음인'이라 따로 부르고, 갑묘·병무오·경유·임자만 양인으로 작용
    const yin = ['을','정','기','신','계'].includes(ilgan);
    result.흉살.push(T.YANGIN_ILIN.includes(ilju) ? '양인살(일인)' : yin ? '음인(陰刃)' : '양인살');
  }
  // 단교관살 — 생월 기준 일지·시지 (원문 93쪽: 1~12월 = 인묘신축술유진사오미해자)
  const WOL_IDX = ['인','묘','진','사','오','미','신','유','술','해','자','축'].indexOf(mBranch) + 1; // 절기월 1~12
  const DANGYO = ['인','묘','신','축','술','유','진','사','오','미','해','자'];
  if (WOL_IDX && [dBranch,tBranch].includes(DANGYO[WOL_IDX-1])) result.흉살.push('단교관살');
  // 순중공망 — 일주 순의 공망 지지가 연·월·시에 있으면(일주 자신은 연주 기준) (원문 103~105쪽)
  const G60 = require('./chapgyeong-vol1-gapja60.js'); const sun = G60.getSunInfo(ilju); const gm = sun ? (T.GONGMANG[sun.순+'순']||[]) : [];
  const gmHit = [['연',yBranch],['월',mBranch],['시',tBranch]].filter(([n,b])=>gm.includes(b)).map(([n])=>n);
  const ysun = G60.getSunInfo(yStem+yBranch); const ygm = ysun ? (T.GONGMANG[ysun.순+'순']||[]) : [];
  if (ygm.includes(dBranch)) gmHit.push('일');
  if (gmHit.length) result.흉살.push(`순중공망(${gmHit.join('·')})`);
  // 절로공망 — 임시·계시생 (원문 105~106쪽: 일간별 시지 신유/오미/진사/인묘/자축)
  if ((T.JEOLLOGONGMANG[ilgan]||[]).includes(tBranch)) result.흉살.push('절로공망');
  // 부벽살 — 일지 삼합국의 부벽 지지가 주중에 (원문 112쪽: 자오묘유→사, 인신사해→유, 진술축미→축)
  const BUBYEOK_GROUP = { 자:'자오묘유', 오:'자오묘유', 묘:'자오묘유', 유:'자오묘유', 인:'인신사해', 신:'인신사해', 사:'인신사해', 해:'인신사해', 진:'진술축미', 술:'진술축미', 축:'진술축미', 미:'진술축미' };
  const bb = T.BUBYEOK[BUBYEOK_GROUP[dBranch]]; if (bb && allBranches.some((b,i)=>i!==2 && b===bb)) result.흉살.push('부벽살');
  // 길신 16~18: 황은대사·천희·홍란 — 생월(절기월 1~12) 기준 일지·시지 (원문 87~89쫙)
  const HWANGEUN = ['술','축','인','사','유','묘','자','오','해','진','신','미'];
  const CHEONHUI = ['미','오','사','진','묘','인','축','자','해','술','유','신'];
  const HONGRAN  = ['축','자','해','술','유','신','미','오','사','진','묘','인'];
  if (WOL_IDX) { if ([dBranch,tBranch].includes(HWANGEUN[WOL_IDX-1])) result.길신.push('황은대사'); if ([dBranch,tBranch].includes(CHEONHUI[WOL_IDX-1])) result.길신.push('천희신'); if ([dBranch,tBranch].includes(HONGRAN[WOL_IDX-1])) result.길신.push('홍란성'); }
  if (yearSamhap && [mBranch,dBranch,tBranch].includes(T.DOHWA[yearSamhap])) result.흉살.push('도화살');
  if (yearSamhap && allBranches.includes(T.SUOK[yearSamhap])) result.흉살.push('수옥살');
  if (T.CHEONJEON[gyejeol] === ilju) result.흉살.push('천전살');
  if (T.JIJEON[gyejeol] === ilju) result.흉살.push('지전살');
  if (T.HYOSIN.includes(ilju)) result.흉살.push('효신살');

  return result;
}

function analyzePoTae(dStem, branches) {
  return branches.map(b => ({지지:b, 운성: T.getSibiUnseong(dStem, b)}));
}

module.exports = { analyzeSinsal, analyzePoTae, getSamhapGroup, getBanghapGroup, getGyejeol };
