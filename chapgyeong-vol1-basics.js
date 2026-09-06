// ============================================================
// chapgyeong-vol1-basics.js
// 사주첩경 1권 — 사주 세우는 법 (연두법·시두법), 지지합충형파해원진 판정
// 출처: 원문 17~62쪽 (제1~16장)
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');

// ---------- 월건법(연두법) — 원문 20~23쪽 ----------
const WOLGEON_START = {
  갑:'병', 기:'병',
  을:'무', 경:'무',
  병:'경', 신:'경',
  정:'임', 임:'임',
  무:'갑', 계:'갑'
};
function getWolju(yeonStem, monthIndexFromIn) {
  const startStem = WOLGEON_START[yeonStem];
  const startIdx = T.STEMS.indexOf(startStem);
  const stem = T.STEMS[(startIdx + monthIndexFromIn) % 10];
  const branchOrder = ['인','묘','진','사','오','미','신','유','술','해','자','축'];
  const branch = branchOrder[monthIndexFromIn];
  return stem + branch;
}

// ---------- 시두법 — 원문 25~27쪽 ----------
const SIDU_START = {
  갑:'갑', 기:'갑',
  을:'병', 경:'병',
  병:'무', 신:'무',
  정:'경', 임:'경',
  무:'임', 계:'임'
};
const SI_BRANCH_ORDER = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
function getSiju(ilStem, siBranchIndex) {
  const startStem = SIDU_START[ilStem];
  const startIdx = T.STEMS.indexOf(startStem);
  const stem = T.STEMS[(startIdx + siBranchIndex) % 10];
  const branch = SI_BRANCH_ORDER[siBranchIndex];
  return stem + branch;
}

// ---------- 지지합충형파해원진 종합 판정 ----------
function pairKey(a, b) { return [a,b].sort().join(''); }

function checkBranchRelations(branches) {
  const result = { 합:[], 충:[], 형:[], 파:[], 해:[], 원진:[] };
  for (let i = 0; i < branches.length; i++) {
    for (let j = i+1; j < branches.length; j++) {
      const a = branches[i], b = branches[j];
      const key = pairKey(a,b);
      for (const hapKey in T.BRANCH_YUKHAP) {
        if (pairKey(hapKey[0], hapKey[1]) === key) result.합.push([a,b,T.BRANCH_YUKHAP[hapKey]]);
      }
      T.BRANCH_CHUNG.forEach(([x,y]) => { if (pairKey(x,y) === key) result.충.push([a,b]); });
      T.YUKPA.forEach(([x,y]) => { if (pairKey(x,y) === key) result.파.push([a,b]); });
      T.YUKHAE.forEach(([x,y]) => { if (pairKey(x,y) === key) result.해.push([a,b]); });
      T.WONJIN.forEach(([x,y]) => { if (pairKey(x,y) === key) result.원진.push([a,b]); });
    }
  }
  const branchSet = new Set(branches);
  if (['인','사','신'].every(b => branchSet.has(b))) result.형.push(['인','사','신', T.SAMHYEONG.인사신]);
  if (['축','술','미'].every(b => branchSet.has(b))) result.형.push(['축','술','미', T.SAMHYEONG.축술미]);
  if (branchSet.has('자') && branchSet.has('묘')) result.형.push(['자','묘', T.SANGHYEONG.자묘]);
  T.JAHYEONG.forEach(pair => {
    const ch = pair[0];
    const count = branches.filter(b => b === ch).length;
    if (count >= 2) result.형.push([ch, ch, '자형']);
  });
  // 삼형의 반형(두 글자만 있어도 형 성립) — 3권 교차검증에서 확정된 규칙
  const samhyeongPairs = [['인','사'],['사','신'],['인','신'],['축','술'],['술','미'],['축','미']];
  samhyeongPairs.forEach(([x,y]) => {
    if (branchSet.has(x) && branchSet.has(y)) {
      const already = result.형.some(f => f.includes(x) && f.includes(y));
      if (!already) result.형.push([x, y, '반형(삼형의 부분)']);
    }
  });
  return result;
}

// ---------- 삼합/방합 판정 ----------
function checkSamhap(branches) {
  const set = new Set(branches);
  const found = [];
  for (const key in T.BRANCH_SAMHAP) {
    const chars = key.split('');
    const matchCount = chars.filter(c => set.has(c)).length;
    if (matchCount === 3) found.push({type:'삼합', chars:key, ohaeng:T.BRANCH_SAMHAP[key]});
    else if (matchCount === 2) found.push({type:'반합', chars:key, ohaeng:T.BRANCH_SAMHAP[key], partial:true});
  }
  return found;
}
function checkBanghap(branches) {
  const set = new Set(branches);
  const found = [];
  for (const key in T.BRANCH_BANGHAP) {
    const chars = key.split('');
    if (chars.every(c => set.has(c))) found.push({type:'방합', chars:key, ohaeng:T.BRANCH_BANGHAP[key]});
  }
  return found;
}

module.exports = {
  WOLGEON_START, getWolju, SIDU_START, SI_BRANCH_ORDER, getSiju,
  checkBranchRelations, checkSamhap, checkBanghap,
};
