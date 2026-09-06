// ============================================================
// chapgyeong-gujo.js — 4권 격국용신편의 「구조명」 판정: 격과 용신을 한 덩어리로
//  첩경 정격 이름은 월령이 아니라 사주가 작동하는 구조의 이름(식신생재격·재다신약봉운격·상관용인격·살인상생…)이고, 그 이름이 곧 용신을 정한다(98차 발견)
//  각 구조 = 성립 조건 + 용신 오행. 우선순위(위→아래)는 4권 희기 절의 논리 순서 — 세력이 치우친 구조(종·전왕·재다신약)부터, 다음 제살·생재·관인, 마지막 일반 억부
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
const YANGIN = { 갑:'묘', 병:'오', 무:'오', 경:'유', 임:'자' };

function ctx(s) {
  const il=s.dStem, ilOh=Y.ohaengOf(il);
  const brs=[s.yBranch,s.mBranch,s.dBranch,s.tBranch].filter(Boolean), stems=[s.yStem,s.mStem,s.tStem].filter(Boolean);
  const O={ 비:ilOh, 인:INSU[ilOh], 식:SAENG[ilOh], 재:GEUK[ilOh], 관:GEUKBY[ilOh] };
  const cB=oh=>brs.filter(b=>T.BRANCH_OHAENG[b]===oh).length, cS=oh=>stems.filter(x=>T.STEM_OHAENG[x]===oh).length;
  const n={}; for(const k of Object.keys(O)) n[k]=cB(O[k])+cS(O[k]);
  const tu={}; for(const k of Object.keys(O)) tu[k]=cS(O[k])>0;
  const jg=T.JIJANGGAN[s.mBranch]||[]; const wolOh=T.BRANCH_OHAENG[jg[jg.length-1]]; const wol=Object.keys(O).find(k=>O[k]===wolOh);
  const wshss=Y.getWangSangHyuSuSa(il,s.mBranch); const deukryeong=Y.isSinWang(wshss);
  const 몸=n.비+n.인+(deukryeong?1:0), 밖=n.식+n.재+n.관;
  const sinwang = deukryeong ? (몸+1 >= 밖-1) : (몸 >= 밖+1);
  const yangin = YANGIN[il] && brs.includes(YANGIN[il]);
  const gwanStems=stems.filter(x=>T.STEM_OHAENG[x]===O.관).map(x=>Y.getSipseong(il,x)); const honjap=gwanStems.includes('정관')&&gwanStems.includes('편관');
  const sikStems=stems.filter(x=>T.STEM_OHAENG[x]===O.식).map(x=>Y.getSipseong(il,x)); const sangTu=sikStems.includes('상관'), sikTu=sikStems.includes('식신');
  return { il, ilOh, O, n, tu, wol, deukryeong, sinwang, yangin, honjap, sangTu, sikTu, 잡기:['진','술','축','미'].includes(s.mBranch), 금수상관: ['경','신'].includes(il)&&['해','자','축'].includes(s.mBranch) };
}
const R=(name,oh,why)=>({ 구조:name, 용신오행:oh, 근거:'4권 구조 '+name+' — '+why });

function judgeGujo(s) {
  const k=ctx(s); const {O,n,tu,sinwang}=k;
  const rules=[
    // 1. 세력 치우침
    ()=> (n.비+n.인>=6 && n.관===0) && R('전왕·순세', O.식, '비겁·인수 태왕에 관살 없음 — 설기로 순세(왕희순세)'),
    ()=> (n.재>=3 && !sinwang) && (n.관>=2 ? R('재다신약용인', O.인, '재다신약에 관살까지 — 인수로 신을 보함') : R('재다신약용겁', O.비, '재다신약 — 비겁으로 재를 감당(봉운)')),
    ()=> (n.인>=3 && n.관===0 && n.재<=1) && R('인수용식상', O.식, '인수 태왕 관살 무 — 식상으로 설기'),
    ()=> (n.인>=4 && sinwang && n.재>=1) && R('인수용재', O.재, '인수 극왕 신강 — 재로 인수를 누름'),
    // 2. 관살 처리
    ()=> (k.금수상관 && n.식>=1) && R('금수상관요견관', O.관, '금수상관은 화 관을 봐야 함(조후용관)'),
    ()=> (n.관>=2 && !sinwang) && R('살인상생', O.인, '관살 왕에 신약 — 인수로 살을 화함'),
    ()=> (n.관>=1 && n.식>=1 && sinwang && n.식<=3) && R('식신제살', O.식, '신왕에 식신이 살을 제복'),
    ()=> (n.관>=1 && n.식>=4) && R('제살태과', O.관, '식상이 살을 지나치게 눌러 살을 도움'),
    ()=> (k.yangin && n.관>=1) && R('양인합살', O.관, '양인에 칠살 — 합살위귀'),
    ()=> (k.honjap || n.관>=4) && R('관살혼잡용상관', O.식, '관 태과·혼잡 — 식상으로 다스림'),
    // 3. 인·관
    ()=> (n.인>=2 && n.관>=1 && sinwang) && R('관인상생', O.관, '인왕에 관 — 관인상생'),
    ()=> (n.관>=1 && !sinwang) && R('정관용인', O.인, '관왕 신약 — 인수로 통관'),
    // 4. 식·재
    ()=> (n.식>=1 && n.재>=1 && sinwang && n.관===0) && R('식신생재', O.재, '신왕 식신이 재를 낳음'),
    ()=> (n.재>=2 && n.관>=1 && sinwang) && R('재왕생관', O.관, '신왕재왕에 관 — 재생관'),
    ()=> (k.sangTu && sinwang && n.인>=2) && R('상관용재', O.재, '일주강 다인 — 재로 인수를 제어'),
    ()=> (k.sangTu && sinwang && n.비>=2 && n.관>=1) && R('상관용살', O.관, '일주강 비겁다 — 관살로'),
    ()=> (k.sangTu && !sinwang) && R('상관용인', O.인, '일주약 상관 — 인수'),
    ()=> (k.잡기 && tu.인 && sinwang && n.식>=1) && R('종기인수용상관', O.식, '잡기 인수 투출·신강 — 상관 설기'),
    ()=> (n.식>=2 && !sinwang) && R('식신용인', O.인, '식상 다에 신약 — 인수'),
    ()=> (sinwang && n.재>=1) && R('신왕용재', O.재, '신왕 — 재로 설기·유통'),
    ()=> (sinwang && n.관>=1) && R('신왕용관', O.관, '신왕 — 관살로 억제'),
    ()=> (sinwang) && R('신왕용식상', O.식, '신왕 — 식상 설기'),
    ()=> (!sinwang && n.인>=1) && R('신약용인', O.인, '신약 — 인수 생조'),
    ()=> (!sinwang) && R('신약용겁', O.비, '신약 — 비겁 보강'),
  ];
  for (const f of rules) { const r=f(); if (r) return { ...r, 세력:{ 신왕:sinwang, ...n } }; }
  return null;
}
module.exports = { judgeGujo, ctx };
