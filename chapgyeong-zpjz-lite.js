// 자평진전 약식(갈림표용) — 격 취용: 월지 정기 우선, 진술축미 잡기월은 투출 우선(강투>약투), 정기 비겁이면 건록/양인 · 상신: 격별 표준(論用神 순용/역용)
// ※ 간명 앱 gyeokguk.js(조문 70·부록 78건 검증)의 대체가 아니라 갈림표 비교용 약식. 결과에 '약식' 표기.
const T = require('./chapgyeong-vol1-tables.js'); const Y = require('./chapgyeong-vol1-yukchin.js');
const YANG = new Set(['갑','병','무','경','임']);
function chwiyong(s) {
  const il=s.dStem, m=s.mBranch, jg=T.JIJANGGAN[m]||[], jeonggi=jg[jg.length-1]; const stems=[s.yStem,s.mStem,s.tStem].filter(Boolean);
  const sip = g => Y.getSipseong(il,g);
  let gyeok, by;
  if (['진','술','축','미'].includes(m)) { const strong = jg.filter(g=>stems.includes(g)); const weak = jg.filter(g=>stems.some(st=>T.STEM_OHAENG[st]===T.STEM_OHAENG[g])); const pick = strong[0]||weak[0]||jeonggi; gyeok=sip(pick); by='잡기 투출'; }
  else { const js=sip(jeonggi); if (['비견','비겁'].includes(js)) { const tu=jg.filter(g=>stems.includes(g)&&!['비견','비겁'].includes(sip(g))); if (tu.length) { gyeok=sip(tu[0]); by='정기 비겁→투출'; } else { gyeok = YANG.has(il)&&js==='비겁'?'양인':'건록'; by='월겁'; } } else { gyeok=js; by='월령 정기'; } }
  const norm = { 정인:'인수', 편인:'인수', 정재:'재', 편재:'재', 편관:'칠살', 비겁:'양인', 비견:'건록' }[gyeok] || gyeok;
  return { 격: norm, 취용근거: by };
}
const cnt=(s,list)=>{ const il=s.dStem; let n=0; for (const g of [s.yStem,s.mStem,s.tStem].filter(Boolean)) if (list.includes(Y.getSipseong(il,g))) n++; for (const b of [s.yBranch,s.mBranch,s.dBranch,s.tBranch].filter(Boolean)) { const jg=T.JIJANGGAN[b]||[]; if (list.includes(Y.getSipseong(il,jg[jg.length-1]))) n++; } return n; };
function sangsin(s, gyeok) {
  const wang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch)); const has = list => cnt(s,list)>0;
  const R = { 정관: wang ? (has(['정재','편재'])?'재(재생관)':'인수') : (has(['정인','편인'])?'인수(관인상생)':'재'),
    재: wang ? (has(['식신','상관'])?'식상(식상생재)':'관') : (has(['정관','편관'])?'관(재왕생관)':'비겁'),
    인수: has(['정관','편관']) ? '관(관인상생)' : (has(['식신','상관'])?'식상(인수용식)':'재'),
    식신: has(['편관']) ? '칠살(식신제살)' : (has(['정재','편재'])?'재(식신생재)':'인수'),
    칠살: has(['식신']) ? '식신(식신제살)' : has(['정인','편인']) ? '인수(살인상생)' : has(['정재','편재'])&&wang ? '재(재자약살)' : '양인(합살)',
    상관: wang ? (has(['정재','편재'])?'재(상관생재)':'칠살(상관가살)') : '인수(상관패인)',
    양인: has(['편관','정관']) ? '관살(양인용살)' : '식상',
    건록: has(['정관','편관'])&&has(['정재','편재']) ? '재관' : has(['식신','상관']) ? '식상' : '재관' };
  return R[gyeok] || '-';
}
const OH = { 재: s=>({목:'토',화:'금',토:'수',금:'목',수:'화'}[Y.ohaengOf(s.dStem)]), 관: s=>({목:'금',화:'수',토:'목',금:'화',수:'토'}[Y.ohaengOf(s.dStem)]), 인수: s=>({목:'수',화:'목',토:'화',금:'토',수:'금'}[Y.ohaengOf(s.dStem)]), 식상: s=>({목:'화',화:'토',토:'금',금:'수',수:'목'}[Y.ohaengOf(s.dStem)]), 비겁: s=>Y.ohaengOf(s.dStem) };
function analyzeZpjz(s) { const g=chwiyong(s); const ss=sangsin(s,g.격); const key = /^재/.test(ss)?'재':/^관|칠살|관살/.test(ss)?'관':/^인수/.test(ss)?'인수':/^식|상관/.test(ss)?'식상':/비겁|양인|재관/.test(ss)?(ss==='재관'?'재':'비겁'):null; return { 약식:true, ...g, 상신:ss, 상신오행: key?OH[key](s):null }; }
module.exports = { analyzeZpjz, chwiyong, sangsin };
