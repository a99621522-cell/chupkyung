// ============================================================
// chapgyeong-vol6-rules-20.js — 6권 第百六~百十三 (합본 원문 텍스트 기반) — 113종 완결
// 벽갑인화·권재일인·천복지재·녹록종신·좌우협기·군불가항·효자봉친·시종득소
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const guks = s => [...B.checkSamhap(br(s)), ...B.checkBanghap(br(s))].map(g=>g.ohaeng);

// 第百六 벽갑인화 — 인월 정화 일주(목왕 화식)에 갑목과 경금을 함께 만남. 경금이 둘 이상이면 파격, 임수로 갑목 합화하면 경금 없어야
function checkByeokgapInhwa(s) {
  if (s.dStem !== '정' || s.mBranch !== '인') return { 성격:false };
  const stems = st(s).filter((x,i)=>i!==2);
  const gap = stems.includes('갑') || cntOh(s,'목') >= 2, gyeong = stems.filter(x=>x==='경').length + br(s).filter(b=>b==='신').length;
  if (!gap || gyeong === 0) return { 성격:false };
  if (gyeong >= 2) return { 성격:true, 항목:'벽갑인화(파격)', 판정:'인월 정화가 갑·경을 만났으나 경금이 거듭 — 왕한 목기를 거슬러 파격' };
  return { 성격:true, 항목:'벽갑인화', 판정:'정월 정화, 갑목이 당권하여 화가 꺼질 듯한데 경금이 갑목을 쪼개 불쏘시개로 — 정화가 살아남(궁통보감 姑用庚金)' };
}
// 第百七 권재일인 — 사주 기운이 하나의 오행으로 종합되어 일주에 귀결(종강·종왕 유형이 대표)
function checkGwonjaeIlin(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const c = { 비: cntOh(s, ilOh) + 1, 인: cntOh(s, INSU[ilOh]) };
  const rest = 8 - c.비 - c.인;
  if (c.비 + c.인 < 6 || rest > 2) return { 성격:false };
  return { 성격:true, 항목:'권재일인', 판정:`기운이 ${ilOh}(비겁 ${c.비})·${josa(`${INSU[ilOh]}(인수 ${c.인})`,'으로')} 집결하여 일주에 귀결 — 종강·종왕 유형, 순세` };
}
// 第百八 천복지재 — 천간은 지지에 뿌리(생왕지)를 두고, 지지는 천간의 덮음(생부)을 받음. 용신 오행 기준으로 판정
function checkCheonbokJijae(s) {
  const stems = st(s), branches = br(s), names=['연','월','일','시'];
  const good = [], bad = [];
  for (let i=0;i<4;i++) {
    const so = T.STEM_OHAENG[stems[i]], bo = T.BRANCH_OHAENG[branches[i]];
    if (bo === so || SAENG[bo] === so) good.push(`${names[i]}주 ${stems[i]}${branches[i]}(지재)`);
    else if (GEUKBY[so] === bo) bad.push(`${names[i]}주 ${stems[i]}${branches[i]}(천간이 지지에 극당)`);
    if (SAENG[so] === bo || so === bo) { /* 천복 */ }
    else if (GEUK[so] === bo) bad.push(`${names[i]}주 ${stems[i]}${branches[i]}(천간이 지지를 극)`);
  }
  if (good.length >= 3 && bad.length === 0) return { 성격:true, 항목:'천복지재', 판정:`${good.join('·')} — 천간이 지지에 실리고 지지가 덮임을 받아 뿌리가 박힘(천지순축·정수자창)` };
  if (bad.length >= 3) return { 성격:true, 항목:'천복지재(불성)', 판정:`${bad.join('·')} — 덮고 실음이 어긋나 뿌리가 불안` };
  return { 성격:false };
}
// 第百九 녹록종신 — 지지가 국을 이루고 원신이 투출한 가운데 천간에 단 하나의 관성(무근)
function checkNoknokJongsin(s) {
  const ilgan = s.dStem, ilOh = Y.ohaengOf(ilgan);
  const gukOhs = guks(s); if (!gukOhs.length) return { 성격:false };
  const gwanOh = GEUKBY[ilOh];
  const gwanStems = st(s).filter((x,i)=>i!==2 && T.STEM_OHAENG[x]===gwanOh);
  const gwanRoot = br(s).some(b=>T.BRANCH_OHAENG[b]===gwanOh);
  if (gwanStems.length !== 1 || gwanRoot) return { 성격:false };
  const gukIsBigyeop = gukOhs.includes(ilOh) || gukOhs.includes(INSU[ilOh]);
  if (!gukIsBigyeop) return { 성격:false };
  return { 성격:true, 항목:'녹록종신', 판정:`지지 ${gukOhs.join('·')}국에 천간 관성 ${gwanStems[0]} 하나가 뿌리 없이 허탈 — 주관 없이 그럭저럭 한평생(관살을 살리는 운이나 제거하는 원국이면 발달)` };
}
// 第百十 좌우협기 — 곤란(살 왕·신약 등)에서 식신 제살·비겁 상정·재자약살·살인상생 등 좌우에서 돕는 기운
function checkJwauHyeopgi(s) {
  const c = k => G1.countSipseongAll(s, k).count;
  const sal = c(['편관']); if (!sal) return { 성격:false };
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  const sik = c(['식신']), bg = c(['비견','비겁']), jae = c(['정재','편재']), ins = c(['정인','편인']);
  const help = [];
  if (!sinwang) { if (sik) help.push('식신 제살'); if (bg >= 2) help.push('비겁 상정'); if (ins) help.push('인수 살인상생'); }
  else { if (sal <= 1 && jae) help.push('재성 자살(약한 살을 도움)'); if (sal >= 2 && c(['상관'])) help.push('상관 제살'); }
  if (!help.length) return { 성격:false };
  return { 성격:true, 항목:'좌우협기', 판정:`${sinwang?'신왕':'신약'}에 칠살(${sal}) — 좌우에서 ${josa(help.join('·'),'로')} 협조` };
}
// 第百十一 군불가항 — 일주(군) 태왕에 재(신) 한둘(군왕신쇠): 식상으로 설기해 신을 도움(손상익하)이 순, 재가 관살을 생해 군을 극하면 항군
function checkGunbulGahang(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const gun = cntOh(s, ilOh) + 1, sin = cntOh(s, GEUK[ilOh]);
  if (gun < 5 || sin === 0 || sin > 2) return { 성격:false };
  const seol = cntOh(s, SAENG[ilOh]), hang = cntOh(s, GEUKBY[ilOh]);
  return { 성격:true, 항목: hang ? '군불가항(항군)' : '군불가항', 판정: hang ? `군(${ilOh} ${gun}) 왕성·신(${GEUK[ilOh]} ${sin}) 쇠극에 관살 ${josa(GEUKBY[ilOh],'이')} 군을 극하려 함 — 항군, 크게 해로움` : `군(${ilOh} ${gun}) 왕성·신(${GEUK[ilOh]} ${sin}) 쇠극 — ${seol?'식상으로 설기하여 신을 도움(손상익하)':'화(식상)운으로 흘러 손상익하해야'}` };
}
// 第百十二 효자봉친 — 일주·비겁 왕성(자상)에 인수 한둘(모쇠·모고): 자손이 어머니를 받듦. 재(며느리)가 관살을 생하면 부성필한
function checkHyojaBongchin(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const ja = cntOh(s, ilOh) + 1, mo = cntOh(s, INSU[ilOh]);
  if (ja < 4 || mo === 0 || mo > 2) return { 성격:false };
  const jae = cntOh(s, GEUK[ilOh]), gwan = cntOh(s, GEUKBY[ilOh]);
  return { 성격:true, 항목:'효자봉친', 판정:`자손(비겁 ${ilOh} ${ja}) 왕성·어머니(인수 ${INSU[ilOh]} ${mo}) 쇠약 — 자상모고, 자손이 어머니를 받들면 평안${jae&&gwan?' (재=며느리가 관살을 생해 성질이 사나움 — 부성필한)':''}` };
}
// 第百十三 시종득소 — 오행 5기 완비 + 천간→지지(또는 지지→천간) 생 사슬이 막힘없이 이어져 같은 곳에서 끝맺음
function checkSijongDeukso(s) {
  const stems = st(s).map(x=>T.STEM_OHAENG[x]), branches = br(s).map(b=>T.BRANCH_OHAENG[b]);
  const all = new Set([...stems, ...branches]); if (all.size < 5) return { 성격:false };
  // 천간 사슬 길이 ≥3 이고 그 끝이 지지 오행을 생하며, 지지에서 다시 천간 시작 오행을 생하면(순환) 득소
  let bestLen = 0, endOh = null, startOh = null;
  for (const o of new Set(stems)) { let len=1, cur=o; while (stems.includes(SAENG[cur]) && len<5) { cur=SAENG[cur]; len++; } if (len>bestLen) { bestLen=len; endOh=cur; startOh=o; } }
  if (bestLen < 3) return { 성격:false };
  const toBranch = branches.includes(SAENG[endOh]);
  const back = toBranch && branches.some(b => SAENG[b] === startOh || SAENG[SAENG[b]] === startOh);
  if (!toBranch) return { 성격:false };
  return { 성격:true, 항목:'시종득소', 판정:`천간 ${startOh}에서 시작해 ${endOh}까지 생생유통하고 지지 ${josa(SAENG[endOh],'로')} 이어짐${back?', 다시 시작 자리로 돌아옴':''} — 구슬을 꿴 듯 시기소시·종기소종, 복수부귀` };
}
const TOPICS_20 = [
  { id:106, 제목:'벽갑인화', fn: checkByeokgapInhwa }, { id:107, 제목:'권재일인', fn: checkGwonjaeIlin },
  { id:108, 제목:'천복지재', fn: checkCheonbokJijae }, { id:109, 제목:'녹록종신', fn: checkNoknokJongsin },
  { id:110, 제목:'좌우협기', fn: checkJwauHyeopgi }, { id:111, 제목:'군불가항', fn: checkGunbulGahang },
  { id:112, 제목:'효자봉친', fn: checkHyojaBongchin }, { id:113, 제목:'시종득소', fn: checkSijongDeukso },
];
module.exports = { TOPICS_20, checkByeokgapInhwa, checkGwonjaeIlin, checkCheonbokJijae, checkNoknokJongsin, checkJwauHyeopgi, checkGunbulGahang, checkHyojaBongchin, checkSijongDeukso };
