// ============================================================
// chapgyeong-vol6-rules-18.js — 6권 第八十五~九十四 (합본 원문 텍스트 기반)
// 구통수화·천지교태·쇠왕태극(87, 특례 참고)·귀기불통·유정견합·상성오리·기식상통·목화통명·수기유행·원원류장
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const TK = require('./chapgyeong-vol6-teukrye.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const ohOf = (s,i,isStem) => isStem ? T.STEM_OHAENG[st(s)[i]] : T.BRANCH_OHAENG[br(s)[i]];

// 第八十五 구통수화 — 수·화가 함께 집결(각 ≥2)했을 때 목이 있어 통관하면 수화구통, 없으면 화수미제
function checkGutongSuhwa(s) {
  const su = cntOh(s,'수') + (Y.ohaengOf(s.dStem)==='수'?1:0), hwa = cntOh(s,'화') + (Y.ohaengOf(s.dStem)==='화'?1:0);
  if (su < 2 || hwa < 2) return { 성격:false };
  const mok = cntOh(s,'목') + (Y.ohaengOf(s.dStem)==='목'?1:0) + br(s).filter(b=>(T.JIJANGGAN[b]||[]).some(g=>T.STEM_OHAENG[g]==='목')).length;
  return mok > 0 ? { 성격:true, 항목:'구통수화', 판정:`수(${su})·화(${hwa})가 대치하는데 목이 도랑처럼 소통 — 수화기제, 귀함` }
                 : { 성격:true, 항목:'화수미제', 판정:`수(${su})·화(${hwa})가 대치하고 통관하는 목이 없음 — 수화불통, 천하게 봄(목운에 통함)` };
}
// 第八十六 천지교태 — 천간 4자가 한 오행(비겁 포함)이고 지지가 그 오행의 삼합/방합 국을 온전히 이룸(오행전왕격보다 엄격)
function checkCheonjiGyotae(s) {
  const stemOhs = new Set(st(s).map(x=>T.STEM_OHAENG[x])); if (stemOhs.size !== 1) return { 성격:false };
  const oh = [...stemOhs][0];
  const gukOk = [...B.checkSamhap(br(s)), ...B.checkBanghap(br(s))].some(g=>g.ohaeng===oh) || (oh==='토' && br(s).every(b=>T.BRANCH_OHAENG[b]==='토'));
  if (!gukOk) return { 성격:false };
  return { 성격:true, 항목:'천지교태', 판정:`천간이 온전히 ${oh}이고 지지도 ${oh}국 — 하늘과 땅의 기운이 크게 합함(전왕격보다 엄격한 한 기운의 쏠림, 순세 필수)` };
}
// 第八十八 귀기불통 — 년주의 귀기(정관·정재·인수 등 용신급)가 월주 기신에 극·합거되어 일간과 통하지 못함
function checkGwigiBultong(s) {
  const ilgan = s.dStem;
  const yS = Y.getSipseong(ilgan, s.yStem), yB = Y.getSipseong(ilgan, (T.JIJANGGAN[s.yBranch]||[]).slice(-1)[0]);
  const gwi = ['정관','정재','정인'];
  const hits = [];
  for (const [g, oh, label] of [[yS, T.STEM_OHAENG[s.yStem], '년간'], [yB, T.BRANCH_OHAENG[s.yBranch], '년지']]) {
    if (!gwi.includes(g)) continue;
    const mOh = [T.STEM_OHAENG[s.mStem], T.BRANCH_OHAENG[s.mBranch]];
    if (mOh.includes(GEUKBY[oh])) hits.push(`${label} ${josa(`${g}(${oh})`,'이')} 월주 ${GEUKBY[oh]}에 가로막힘`);
  }
  if (!hits.length) return { 성격:false };
  return { 성격:true, 항목:'귀기불통', 판정:`${hits.join(', ')} — 은혜가 중간에서 막힘(기은중). 막힘이 풀리는 운에 억즉필달` };
}
// 第八十九 유정견합 — 귀기가 멀리(년) 있고 월의 기신이 그것을 극하나, 그 기신이 일간이 반기는 별과 합하여 오히려 통함
function checkYujeongGyeonhap(s) {
  const ilgan = s.dStem;
  const gwi = ['정관','정재','정인'];
  const yOh = T.BRANCH_OHAENG[s.yBranch], ySip = Y.getSipseong(ilgan, (T.JIJANGGAN[s.yBranch]||[]).slice(-1)[0]);
  if (!gwi.includes(ySip)) return { 성격:false };
  const mOh = T.BRANCH_OHAENG[s.mBranch];
  if (mOh !== GEUKBY[yOh]) return { 성격:false }; // 월지가 년지 귀기를 극하는 기신
  const R = B.checkBranchRelations(br(s));
  const hapWith = R.합.filter(h=>h.includes(s.mBranch)).map(h=>h[0]===s.mBranch?h[1]:h[0]);
  if (!hapWith.length) return { 성격:false };
  return { 성격:true, 항목:'유정견합', 판정:`년지 귀기 ${josa(`${s.yBranch}(${ySip})`,'를')} 가로막던 월지 기신 ${josa(s.mBranch,'이')} ${josa(hapWith.join('·'),'와')} 합하여 기신이 묶임 — 정이 있어 끌어당겨 통함(해후상봉)` };
}
// 第九十 상성오리 — 목금 상극에서 공·성·윤·종·난 다섯 이치(목 일주 기준 계절별)
function checkSangseongOri(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  if (!['목','금'].includes(ilOh)) return { 성격:false };
  const geum = cntOh(s,'금'), mok = cntOh(s,'목'), su = cntOh(s,'수'), hwa = cntOh(s,'화');
  if (ilOh==='목' && !geum) return { 성격:false }; if (ilOh==='금' && !mok) return { 성격:false };
  const m = s.mBranch; let ri;
  if (ilOh==='목') {
    if (['인','묘'].includes(m) && geum<=2) ri = '공(攻) — 이른 봄 어린 나무를 금으로 다듬어 바르게 키움';
    else if (['사','오','미'].includes(m) && hwa>=2) ri = su>0 ? '윤(潤) — 여름 화 메마름을 물로 적셔 목금을 성공시킴' : '성(成) — 여름 목이 설기되어 금을 보태 완성';
    else if (['신','유','술'].includes(m)) ri = '종(從) — 가을 목 쇠약, 금의 기세를 따름';
  } else {
    if (['해','자','축'].includes(m)) ri = hwa>0 ? '난(暖) — 서늘한 금을 화로 따뜻하게 하여 균형' : '난(暖) 필요 — 화가 없어 금이 차가움';
  }
  if (!ri) return { 성격:false };
  return { 성격:true, 항목:'상성오리', 판정:`목금 상극 중 ${ri}` };
}
// 第九十一 기식상통 — 살이 있을 때 인수가 살을 화(살인상생) 또는 양인이 살을 합(살인상정) 또는 식상이 제살 — 간접적으로 일주를 이롭게 하는 구조
function checkGisikSangtong(s) {
  const c = k => G1.countSipseongAll(s, k).count;
  const sal = c(['편관']); if (!sal) return { 성격:false };
  const ins = c(['정인','편인']), sik = c(['식신','상관']);
  const YANGIN = { 갑:'묘', 병:'오', 무:'오', 경:'유', 임:'자' };
  const yin = YANGIN[s.dStem] && br(s).includes(YANGIN[s.dStem]);
  const ways = [];
  if (ins) ways.push('인수가 살을 화하여 일간을 생(살인상생)'); if (yin) ways.push('양인이 살과 합하여 정전(살인상정)'); if (sik) ways.push('식상이 살을 제거(식신제살)');
  if (!ways.length) return { 성격:false };
  return { 성격:true, 항목:'기식상통', 판정:`칠살(${sal})에 대해 ${ways.join(' / ')} — 위치는 달라도 일주를 위해 호흡이 통함(귀기불통의 반대)` };
}
// 第九十二 목화통명 / 목분신회 — 목 일주 왕성+화 설기(진상관) vs 목 쇠약에 화 왕성(가상관·목분신회)
function checkMokhwaTongmyeong(s) {
  const ilOh = Y.ohaengOf(s.dStem); if (ilOh !== '목') return { 성격:false };
  const hwa = cntOh(s,'화'); if (!hwa) return { 성격:false };
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch)), mok = cntOh(s,'목') + 1;
  if (sinwang || mok >= 3) return { 성격:true, 항목:'목화통명', 판정:`왕성한 목(${mok})이 화(${hwa})로 빼어나게 설기 — 진상관, 화운에 대발(문장·총명)` };
  if (hwa >= 3) return { 성격:true, 항목:'목분신회', 판정:`쇠약한 목(${mok})이 왕한 화(${hwa})를 생하다 스스로 탐 — 가상관, 화운 거듭이면 위태(인수 수로 구제)` };
  return { 성격:false };
}
// 第九十三 수기유행 — 천간에 투출한 오행(수기)이 다시 다른 천간 오행을 생하며 흘러 일주에 미침(급신이지 아님)
function checkSugiYuhaeng(s) {
  // 예: 기묘 을해 을미 병술 — 지지 목국(수기)→천간 병화→기토·술토로 흘러 일주에서 멈추지 않음
  const ilOh = Y.ohaengOf(s.dStem);
  const stemOhs = new Set(st(s).map(x=>T.STEM_OHAENG[x]));
  const seq = [INSU[ilOh], ilOh, SAENG[ilOh], SAENG[SAENG[ilOh]]];
  // 일주 오행에서 출발해 천간으로 이어지는 생 사슬 길이(일주 포함)
  let len = 1; for (const o of seq.slice(2)) { if (stemOhs.has(o)) len++; else break; }
  const upstream = stemOhs.has(seq[0]) || cntOh(s, seq[0]) > 0;
  if (len < 3 && !(len === 2 && upstream)) return { 성격:false };
  return { 성격:true, 항목:'수기유행', 판정:`${upstream?seq[0]+'→':''}${seq.slice(1,1+len).join('→')} — 빼어난 기운이 천간으로 뻗어 일주에서 그치지 않고 흘러감(급신이지 아님), 후원이 튼튼하면 부귀격` };
}

// 第九十四 원원류장 — 용신을 향해 3대 이상 이어지는 생의 사슬(예: 금→수→목→화 용신)
function checkWonwonRyujang(s) {
  const present = new Set(['목','화','토','금','수'].filter(o=>cntOh(s,o)>0 || Y.ohaengOf(s.dStem)===o));
  // 가장 긴 연속 생 사슬 길이
  let best = 0, bestStart = null;
  for (const start of present) { let len=1, cur=start; while (present.has(SAENG[cur]) && len<5) { cur=SAENG[cur]; len++; } if (len>best) { best=len; bestStart=start; } }
  if (best < 4) return { 성격:false };
  const chain = []; let cur = bestStart; for (let i=0;i<best;i++){ chain.push(cur); cur=SAENG[cur]; }
  return { 성격:true, 항목:'원원류장', 판정:`${chain.join('→')} ${best}대 연속 상생 — 근원이 멀어 흐름이 길다, 선조 은덕·성공 기반이 튼튼` };
}
const TOPICS_18 = [
  { id:85, 제목:'구통수화', fn: checkGutongSuhwa }, { id:86, 제목:'천지교태', fn: checkCheonjiGyotae },
  { id:87, 제목:'쇠왕태극', fn: s => { const r = TK.checkSoewangTaeguk(s); return r.성격 ? { ...r, 참고:true } : r; } },
  { id:88, 제목:'귀기불통', fn: checkGwigiBultong }, { id:89, 제목:'유정견합', fn: checkYujeongGyeonhap },
  { id:90, 제목:'상성오리', fn: checkSangseongOri }, { id:91, 제목:'기식상통', fn: checkGisikSangtong },
  { id:92, 제목:'목화통명', fn: checkMokhwaTongmyeong }, { id:93, 제목:'수기유행', fn: checkSugiYuhaeng },
  { id:94, 제목:'원원류장', fn: checkWonwonRyujang },
];
module.exports = { TOPICS_18, checkGutongSuhwa, checkCheonjiGyotae, checkGwigiBultong, checkYujeongGyeonhap, checkSangseongOri, checkGisikSangtong, checkMokhwaTongmyeong, checkSugiYuhaeng, checkWonwonRyujang };
