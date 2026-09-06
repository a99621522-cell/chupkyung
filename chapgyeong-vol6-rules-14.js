// ============================================================
// chapgyeong-vol6-rules-14.js
// 6권 14차: 第五十二 제살태과 / 第五十三 재관쌍미 / 第五十四 정신포만 /
//           第五十五 지지연여 / 第五十六 신청기수
// 출처: 원문 153~165쪽
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

function toPillars(saju) {
  return { branches:[saju.yBranch,saju.mBranch,saju.dBranch,saju.tBranch],
           stems:[saju.yStem,saju.mStem,saju.dStem,saju.tStem] };
}

// ---------- 第五十二 제살태과(制殺太過) ----------
function checkJesalTaegwa(saju) {
  const chilsalCount = G1.countSipseongAll(saju, ['편관']).count;
  if (chilsalCount === 0) return { 성격: false };
  const sikCount = G1.countSipseongAll(saju, ['식신','상관']).count;
  if (sikCount < 2) return { 성격: false };
  return {
    성격: true, 항목: '제살태과',
    판정: '식상이 칠살을 지나치게 제복 — 살이 약해진 중 다시 제살운을 만나면 진법무민(크게 위태), 살을 억누르던 것을 제거하는 운을 만나면 크게 떨쳐 일어남',
  };
}

// ---------- 第五十三 재관쌍미(財官雙美) ----------
const JAEGWAN_SSANGMI_ILJU = ['계사','임오'];
function checkJaegwanSsangmi(saju) {
  const ilju = saju.dStem + saju.dBranch;
  if (!JAEGWAN_SSANGMI_ILJU.includes(ilju)) return { 성격: false };
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  return {
    성격: true, 항목: '재관쌍미',
    판정: sinwang ? '계사일/임오일 — 일지에 정재+정관 동궁, 신강하여 능히 재관을 감당 — 귀함' : '재관쌍미이나 신약 — 종살·종재로 흐르거나 오히려 하천해질 위험(추동생이 유리)',
  };
}

// ---------- 第五十四 정신포만(精神飽滿) ----------
function checkJeongsinPoman(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false };
  const inCount = G1.countSipseongAll(saju, ['정인','편인']).count;
  if (inCount < 2) return { 성격: false };
  return {
    성격: true, 항목: '정신포만',
    판정: '일주가 인수의 힘으로 고강 — 사주 전체 정기가 일주로 집중(탁함 없으면 귀함, 용신 안 상하면 부귀)',
  };
}

// ---------- 第五十五 지지연여(地支連茹) ----------
const BRANCH_ORDER = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
function checkJijiYeonyeo(saju) {
  const branches = [saju.yBranch, saju.mBranch, saju.dBranch, saju.tBranch];
  const indices = branches.map(b => BRANCH_ORDER.indexOf(b));
  for (const step of [1, 2, 3]) {
    let isForward = true, isBackward = true;
    for (let i = 0; i < 3; i++) {
      const diffF = (indices[i+1] - indices[i] + 12) % 12;
      const diffB = (indices[i] - indices[i+1] + 12) % 12;
      if (diffF !== step) isForward = false;
      if (diffB !== step) isBackward = false;
    }
    if (isForward || isBackward) {
      return {
        성격: true, 항목: '지지연여', 간격: step, 방향: isForward?'순행':'역행',
        판정: `지지가 ${step}칸 간격으로 일정하게 이어짐(${isForward?'순행':'역행'}) — 의지가 견고하고 생활 기반이 튼튼, 부귀`,
      };
    }
  }
  return { 성격: false };
}

// ---------- 第五十六 신청기수(神淸氣秀) ----------
function checkSincheongGisu(saju) {
  const ilgan = saju.dStem;
  const wshss = Y.getWangSangHyuSuSa(ilgan, saju.mBranch);
  const sinwang = Y.isSinWang(wshss);
  if (!sinwang) return { 성격: false };
  const p = toPillars(saju);
  const targetStems = p.stems.filter((s,i) => i!==2);
  let hasSugi = false, sugiOhaeng = null;
  for (const s of targetStems) {
    const oh = T.STEM_OHAENG[s];
    const hasRoot = p.branches.some(b => T.BRANCH_OHAENG[b]===oh || T.JIJANGGAN[b].some(j=>T.STEM_OHAENG[j]===oh));
    if (hasRoot) { hasSugi = true; sugiOhaeng = oh; break; }
  }
  if (!hasSugi) return { 성격: false };
  return {
    성격: true, 항목: '신청기수',
    판정: `일주 고강+정신 맑음(신청)+투출 오행(${sugiOhaeng})이 지지에 뿌리를 둠(기수) — 크게 귀함`,
  };
}

const TOPICS_14 = [
  { id:52, 제목:'제살태과', fn: checkJesalTaegwa },
  { id:53, 제목:'재관쌍미', fn: checkJaegwanSsangmi },
  { id:54, 제목:'정신포만', fn: checkJeongsinPoman },
  { id:55, 제목:'지지연여', fn: checkJijiYeonyeo },
  { id:56, 제목:'신청기수', fn: checkSincheongGisu },
];

module.exports = { TOPICS_14, checkJesalTaegwa, checkJaegwanSsangmi, checkJeongsinPoman, checkJijiYeonyeo, checkSincheongGisu };
