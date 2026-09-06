// ============================================================
// chapgyeong-vol6-rules-10.js
// 6권 10차: 第四十 관록분야 / 第四十一 과어유정 / 第四十二 왕희순세 /
//           第四十三 호환재록
// 출처: 원문 124~134쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第四十 관록분야(官祿分野) ----------
function checkGwallokBunya(saju) {
  const ilgan = saju.dStem;
  const p = toPillars(saju);
  const gwanStem = p.stems.find((s,i)=>i!==2 && Y.getSipseong(ilgan,s)==='정관');
  if (!gwanStem) return { 성격: false };
  const rokBranch = T.GILSIN_18.정록[gwanStem];
  if (!p.branches.includes(rokBranch)) return { 성격: false };
  const samhap = require('./chapgyeong-vol1-basics.js').checkSamhap(p.branches);
  const banghap = require('./chapgyeong-vol1-basics.js').checkBanghap(p.branches);
  const hasGuk = samhap.length > 0 || banghap.length > 0;
  if (!hasGuk) return { 성격: false };
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  return {
    성격: true, 항목: '관록분야',
    판정: sinwang ? '관+녹이 국을 이루고 신왕 — 고관대작' : '관록분야는 있으나 신약 — 오히려 불안·화 위험(신왕해야 고귀)',
  };
}

// ---------- 第四十一 과어유정(過於有情) ----------
function checkGwaeoYujeong(saju) {
  const p = toPillars(saju);
  const rel = B.checkBranchRelations(p.branches);
  const branchHapCount = rel.합.length;
  let stemHapCount = 0;
  for (let i=0;i<4;i++) for (let j=i+1;j<4;j++) {
    const pair = p.stems[i]+p.stems[j];
    if (['갑기','기갑','을경','경을','병신','신병','정임','임정','무계','계무'].includes(pair)) stemHapCount++;
  }
  const totalHap = branchHapCount + stemHapCount;
  if (totalHap < 3) return { 성격: false };
  return {
    성격: true, 항목: '과어유정',
    판정: '사주에 합이 지나치게 많음 — 뜻이 원대함에 이르지 못함(志無遠達), 여명은 화류계 위험(단, 합화로 기운이 통하면 오히려 길)',
  };
}

// ---------- 第四十二 왕희순세(旺喜順勢) ----------
function checkWanghuiSunse(saju) {
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  const bigyeopCount = G1.countSipseongAll(saju, ['비견','비겁']).count;
  if (inCount < 3 && bigyeopCount < 3) return { 성격: false };
  const jaeCount = G1.countSipseongAll(saju, ['정재','편재']).count;
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  let 특기사항 = [];
  if (sikCount > 0) 특기사항.push('식상(설기) 있음 — 순세, 순조로움');
  if (jaeCount > 0) 특기사항.push('재(역세, 왕신을 극) 있음 — 역모지리 위험, 관살운도 대흉');
  return {
    성격: true, 항목: '왕희순세',
    판정: '사주 전체가 한쪽 오행으로 치우쳐 왕성(종격 수준) — 순세(설기)를 기뻐하고 역세(극)를 크게 꺼림',
    특기사항,
  };
}

// ---------- 第四十三 호환재록(互換財祿) ----------
function checkHohwanJaerok(saju) {
  const ilju = saju.dStem + saju.dBranch;
  const found = T.GYOROK_PAIRS.some(pair => pair.includes(ilju));
  if (!found) return { 성격: false };
  return {
    성격: true, 항목: '호환재록(교록)',
    판정: '일주가 타주와 정록을 서로 교환하는 자리 — 부귀쌍전, 자리를 옮겨 다님에 이로움',
  };
}

const TOPICS_10 = [
  { id:40, 제목:'관록분야', fn: checkGwallokBunya },
  { id:41, 제목:'과어유정', fn: checkGwaeoYujeong },
  { id:42, 제목:'왕희순세', fn: checkWanghuiSunse },
  { id:43, 제목:'호환재록', fn: checkHohwanJaerok },
];

module.exports = { TOPICS_10, checkGwallokBunya, checkGwaeoYujeong, checkWanghuiSunse, checkHohwanJaerok };
