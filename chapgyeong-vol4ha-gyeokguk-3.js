// ============================================================
// chapgyeong-vol4ha-gyeokguk-3.js
// 4권下 특수격 3차: 시묘격·육갑추건격·형합격
// 출처: 원문 56~89쪽 (第十八~二十)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');

// ---------- 第十八 시묘격 (원문 56~61쪽) ----------
const SIMYO_SIJI = { 갑:'미', 을:'미', 병:'술', 정:'술', 무:'진', 기:'진', 경:'축', 신:'축', 임:'진', 계:'진' };
function checkSimyo(saju) {
  const ilgan = saju.dStem;
  // [124차] 4권下 실례(66~67쪽): 시지 창고는 재고·관고·인수고 어느 것이든(시묘재격·시묘관격·시묘인수격) — 시지가 진술축미이고 그 창고 지장간에 재·관·인이 들어 있으면 후보
  if (!['진','술','축','미'].includes(saju.tBranch)) return { 성격: false };
  const jgAll = T.JIJANGGAN[saju.tBranch] || []; const kinds = jgAll.map(g => Y.getSipseong(ilgan, g)).filter(k => ['정재','편재','정관','편관','정인','편인'].includes(k));
  if (!kinds.length) return { 성격: false };
  const target = saju.tBranch;
  const rel = B.checkBranchRelations([saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch]);
  const chungOpened = rel.충.some(f=>f.includes(saju.tBranch)) || rel.형.some(f=>f.includes(saju.tBranch));
  // [114차] 원문: 종기재관격과 같이 형충을 만나야 하고 간직한 재고·관고가 투출됨이 있어야 격 성립
  // 성립: 창고 속 재·관·인 오행이 천간(연·월·시)에 투출. 개고(형충)는 성패 조건(마 예: 무형충 → 병중무약)
  const jg = T.JIJANGGAN[saju.tBranch] || []; const stems = [saju.yStem, saju.mStem, saju.tStem]; const tu = jg.some(g => stems.some(st => T.STEM_OHAENG[st]===T.STEM_OHAENG[g]) && ['정재','편재','정관','편관','정인','편인'].includes(Y.getSipseong(ilgan, g)));
  if (!tu || !chungOpened) return { 성격: false, 주의: '시묘이나 개고(형충) 또는 창고 재관인 투출 없음 — 시묘격 불성립(원문 의의: 형충 개고+투출)' };
  const gyeokKind = kinds.find(k => stems.some(st => ['정재','편재','정관','편관','정인','편인'].includes(Y.getSipseong(ilgan, st)) && Y.getSipseong(ilgan, st)[1]===k[1])) || kinds[0];
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  let 특기사항 = [];
  if (!chungOpened) 특기사항.push('형충으로 창고가 열리지 않음(알압복) — 발복 못 함');
  else 특기사항.push('형충으로 창고가 열림(개고) — 발복 가능');
  if (!sinwang) 특기사항.push('신약 — 살귀왕이면 재화 위험');
  return {
    성격: true, 격국명: '시묘격', 창고종류: kinds.join('·'), 개고여부: chungOpened,
    신강신약: sinwang?'신강':'신약',
    용신: '창고(재관고) 개고 시 그 재관을 용신 — 종기재관격과 상통',
    특기사항,
  };
}

// ---------- 第十九 육갑추건격 (원문 66~77쪽) ----------
const CHUGEON_ILJU = ['갑자','갑술','갑신','갑오','갑진','갑인'];
function checkYukgapChugeon(saju) {
  const ilju = saju.dStem+saju.dBranch;
  if (!CHUGEON_ILJU.includes(ilju)) return { 성격: false };
  if (saju.tStem+saju.tBranch !== '을해') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const hasSa = branches.includes('사');
  const haeJaCount = branches.filter(b=>['해','자'].includes(b)).length;
  const inCount = require('./chapgyeong-vol4-gyeokguk.js').countSipseongAll(saju, ['정인','편인']).count;
  let 특기사항 = [];
  if (hasSa) 특기사항.push('사(巳)가 해를 충함 — 가장 꺼리는 파격 조건');
  if (haeJaCount >= 2) 특기사항.push('해자 다봉 — 부귀의 근원, 길함');
  if (inCount > 0) 특기사항.push('인수 투출 — 재성이 겹쳐도 위열명경(길함)');
  return {
    성격: true, 격국명: '육갑추건격', 파격위험: hasSa,
    용신: '해자수의 왕함이 부귀의 근원 — 인수·비겁운 반김',
    특기사항: 특기사항.length ? 특기사항 : null,
  };
}

// ---------- 第二十 형합격 (원문 79~89쪽) ----------
const HYEONGHAP_JIN = ['계유','계해','계묘'];
const HYEONGHAP_BUJIN = ['계사','계미','계축'];
function checkHyeonghap(saju) {
  const ilju = saju.dStem+saju.dBranch;
  // [126차] 원문 시결 「若無戊己庚申字 壯歲榮華達帝京」·실례 나(무토 투출 → 파격, 정관용재격) — 천간에 무·기·경·신 있으면 형합격 불성립
  const pagyeok = [saju.yStem,saju.mStem].some(x=>['무','기','경','신'].includes(x)); // 파격이면 성립은 하되 주격에서 제외(정격으로 용신)
  const isJin = HYEONGHAP_JIN.includes(ilju);
  const isBujin = HYEONGHAP_BUJIN.includes(ilju);
  if (!isJin && !isBujin) return { 성격: false };
  if (saju.tStem+saju.tBranch !== '갑인') return { 성격: false };
  const branches = [saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch];
  const saJeonsil = branches.includes('사');
  const gwanExists = branches.some(b=>['신','유'].includes(b)) ||
                      [saju.yStem,saju.mStem].some(s=>['경','신'].includes(s));
  let 특기사항 = [];
  if (!isJin) 특기사항.push('비진격(계사·계미·계축) — 사가 전실되거나 관이 드러나 파격되기 쉬움(단, 계해일은 인해합으로 예외적 진격)');
  if (saJeonsil) 특기사항.push('사(巳)가 이미 사주에 드러남 — 전실(塡實)로 합관이 안 되어 흉');
  if (gwanExists) 특기사항.push('관성(경신유) 드러남 — 파격');
  return {
    성격: true, 격국명: '형합격', 진격여부: isJin, 파격: pagyeok,
    용신: '인(寅)이 사(巳)를 형출하여 사중 무토(정관)를 합해 옴 — 형출합관',
    특기사항: 특기사항.length ? 특기사항 : ['진격이며 병 없음 — 영호명리객의 귀명'],
  };
}

module.exports = { checkSimyo, checkYukgapChugeon, checkHyeonghap };
