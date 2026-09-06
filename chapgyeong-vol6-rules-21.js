// ============================================================
// chapgyeong-vol6-rules-21.js — 6권 보류 항목 6종 채움 (第九·十·十二·二十二·三十二·四十九) — 113종 완결
// 진·가상관 / 변화상관 / 제거기병 / 자매강강(여명) / 귀물제거 / 거탁유청
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const sipB = (s,b) => Y.getSipseong(s.dStem, (T.JIJANGGAN[b]||[]).slice(-1)[0]);
const B = require('./chapgyeong-vol1-basics.js');
const bodyStrength = s => { const ilOh=Y.ohaengOf(s.dStem); const guk=[...B.checkSamhap(br(s)),...B.checkBanghap(br(s))].some(g=>g.ohaeng===ilOh)?3:0; return guk + cntOh(s,ilOh)+cntOh(s,INSU[ilOh]) - cntOh(s,SAENG[ilOh]) - cntOh(s,GEUK[ilOh]) - cntOh(s,GEUKBY[ilOh]); };

// 第九 진·가상관 — 월지 정기가 상관이면 진상관; 월지 인수·비겁에 타주 상관(용신)이면 가상관
function checkJinGaSanggwan(s) {
  // 원문은 '사오미월의 갑을일생' 식으로 월지 오행 단위로 상관을 봄 → 식신·상관을 상관 계열로 묶어 판정
  const wolRaw = sipB(s, s.mBranch); const wol = ['식신','상관'].includes(wolRaw) ? '상관' : wolRaw;
  const sangElse = [s.yStem,s.mStem,s.tStem].some(x=>Y.getSipseong(s.dStem,x)==='상관') || br(s).some((b,i)=>i!==1 && sipB(s,b)==='상관');
  if (wol === '상관') {
    const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
    return { 성격:true, 항목:'진상관', 판정:`월지 상관 — 진상관. ${sinwang?'몸이 왕하면 상관용재 가능':'몸이 약하면 상관용인(親印)해야, 용신이 상하는 운은 크게 위태'}` };
  }
  if (['정인','편인','비견','비겁'].includes(wol) && sangElse) return { 성격:true, 항목:'가상관', 판정:'월지 인수·비겁에 타주 상관을 씀 — 가상관. 인수운을 만나면 파료상관(지지 인수국 합도 살필 것)' };
  return { 성격:false };
}
// 第十 변화상관 — 진상관인데 몸이 왕하면 가상관으로, 가상관인데 몸이 약해지면 진상관으로 변함
function checkByeonhwaSanggwan(s) {
  const base = checkJinGaSanggwan(s); if (!base.성격) return { 성격:false };
  const str = bodyStrength(s);
  if (base.항목==='진상관' && str >= 1) return { 성격:true, 항목:'변화상관(진→가)', 판정:`월지 진상관이나 원국 전체로는 수목·인비가 왕성(세력 +${str}) — 진상관이 가상관으로 변함, 파료상관 속단 금물` };
  if (base.항목==='가상관' && str <= -2) return { 성격:true, 항목:'변화상관(가→진)', 판정:`월지 인수·비겁의 가상관이나 원국이 약함(세력 ${str}) — 가상관이 진상관으로 변함, 상관용인` };
  return { 성격:false };
}
// 第十二 제거기병 — 일주지병(태과 오행)이 있고 그 병을 제거하는 약신이 원국에 있음
function checkJegeoGibyeong(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const cands = ['목','화','토','금','수'].filter(o=>o!==ilOh).map(o=>[o,cntOh(s,o)]).sort((a,b)=>b[1]-a[1]);
  const [byeong, n] = cands[0]; if (n < 4) return { 성격:false };
  const yak = GEUKBY[byeong], yakCnt = cntOh(s, yak) + (ilOh===yak?1:0);
  const NAME = byeong===GEUK[ilOh]?'재다신약':byeong===INSU[ilOh]?'인다(토중금매 류)':byeong===SAENG[ilOh]?'설기태심':byeong===GEUKBY[ilOh]?'살중':'비겁 옹체';
  if (!yakCnt) return { 성격:true, 항목:'제거기병(약 부재)', 판정:`일주지병 ${byeong}(${n}, ${NAME}) 태과인데 약신 ${josa(yak,'이')} 원국에 없음 — 운에서 ${josa(yak,'을')} 만나야` };
  return { 성격:true, 항목:'제거기병', 판정:`일주지병 ${josa(`${byeong}(${n}, ${NAME})`,'을')} 약신 ${josa(`${yak}(${yakCnt})`,'이')} 제거 — 병 있고 약 있어 귀함(병약상제와 통함)` };
}
// 第二十二 자매강강(여명) — 여명에 비겁 태강: 서로 양보 없어 가정 불화, 관살 왕성을 반기고 없으면 식상 설기
function checkJamaeGanggang(s, sex) {
  if (sex !== '여') return { 성격:false };
  const bg = G1.countSipseongAll(s, ['비견','비겁']).count, ins = G1.countSipseongAll(s, ['정인','편인']).count;
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  // 원문 예(신유 경신 계해 정유 곤명): 인수 태왕으로 일주가 강강해진 경우도 포함
  if (!(bg >= 4 || (sinwang && bg >= 1 && bg + ins >= 5))) return { 성격:false };
  const gs = G1.countSipseongAll(s, ['정관','편관']).count, sik = G1.countSipseongAll(s, ['식신','상관']).count;
  return { 성격:true, 항목:'자매강강', 판정:`여명 비겁 태강(${bg}) — 남편의 처첩과 같은 별이 많아 가정 불화 우려. ${gs>=2?'관살이 왕성하여 다스림(반김)':sik?'관살 부족이나 식상으로 설기':'관살·식상 모두 부족 — 인수 불필요, 설기·제어운 요망'}` };
}
// 第三十二 귀물제거 — 종재·종살로 흐르려는 극약 일주에 미약한 인수·비겁이 남아 종세를 방해(귀물)
function checkGwimulJegeo(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const jae = cntOh(s, GEUK[ilOh]), sal = cntOh(s, GEUKBY[ilOh]);
  const target = jae >= sal ? ['재', jae] : ['살', sal]; if (target[1] < 4) return { 성격:false };
  const gwimul = cntOh(s, ilOh) + cntOh(s, INSU[ilOh]);
  if (gwimul === 0 || gwimul > 2) return { 성격:false };
  return { 성격:true, 항목:'귀물제거', 판정:`일주가 종${target[0]}하려 하는데 미약한 인수·비겁(${gwimul})이 남아 종세를 방해 — 귀물. 제거되어야 사주가 고상해짐(약신인지 귀물인지 강약 재검토 필요)` };
}
// 第四十九 거탁유청 — 궁통보감 예: 하월 목이 계수를 쓸 때 무기토가 물을 흐리나(탁) 갑목 투간이 토를 눌러 물을 지킴(청)
function checkGeotakYucheong(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  // 일반화: 용신급 오행(신약→인수, 신강→식상)이 있고 그것을 극하는 탁기가 있으며, 탁기를 제어하는 오행이 천간에 투출
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  const yong = sinwang ? SAENG[ilOh] : INSU[ilOh];
  if (!cntOh(s, yong)) return { 성격:false };
  const tak = GEUKBY[yong], takCnt = cntOh(s, tak); if (!takCnt) return { 성격:false };
  const cheong = GEUKBY[tak], cheongTu = st(s).some((x,i)=>i!==2 && T.STEM_OHAENG[x]===cheong) || Y.ohaengOf(s.dStem)===cheong;
  if (!cheongTu) return { 성격:true, 항목:'거탁유청(미제)', 판정:`${josa(`${yong}(용신급)`,'이')} ${tak}(${takCnt})에 흐려지는데 이를 누르는 ${josa(cheong,'이')} 투간되지 않음 — 탁기 미제거` };
  return { 성격:true, 항목:'거탁유청', 판정:`${josa(yong,'을')} 흐리는 ${josa(`${tak}(${takCnt})`,'을')} 천간의 ${josa(cheong,'이')} 눌러 물을 보호 — 탁기 제거·청기만 남음(거${tak}유${yong} 유형)` };
}
const TOPICS_21 = [
  { id:9, 제목:'진·가상관', fn: checkJinGaSanggwan }, { id:10, 제목:'변화상관', fn: checkByeonhwaSanggwan },
  { id:12, 제목:'제거기병', fn: checkJegeoGibyeong }, { id:22, 제목:'자매강강(여명)', fn: checkJamaeGanggang },
  { id:32, 제목:'귀물제거', fn: checkGwimulJegeo }, { id:49, 제목:'거탁유청', fn: checkGeotakYucheong },
];
module.exports = { TOPICS_21, checkJinGaSanggwan, checkByeonhwaSanggwan, checkJegeoGibyeong, checkJamaeGanggang, checkGwimulJegeo, checkGeotakYucheong };
