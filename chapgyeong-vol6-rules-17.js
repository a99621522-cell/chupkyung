// ============================================================
// chapgyeong-vol6-rules-17.js — 6권 第七十一·七十二(특례 등록)·七十六~八十四 (합본 원문 텍스트 기반)
// 신불가과·삼기득위(vol6-teukrye 재사용) · 수대근심·축수양목·상하정화·체전지상·신왕적살·형전형결·방조설상·종지진가·암요제궐
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const G60 = require('./chapgyeong-vol1-gapja60.js');
const TK = require('./chapgyeong-vol6-teukrye.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUK = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const INSU = { 목:'수', 화:'목', 토:'화', 금:'토', 수:'금' };
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const wangMonth = { 목:['인','묘','진'], 화:['사','오','미'], 금:['신','유','술'], 수:['해','자','축'], 토:['진','술','축','미'] };

// 第七十六 수대근심 / 수소근천 — 갑을일생 인묘진 왕성 vs 인월 갑을일에 다른 목기 없음(嫩木)
function checkSudaeGeunsim(s) {
  if (!['갑','을'].includes(s.dStem)) return { 성격:false };
  const b = br(s), mokBr = b.filter(x=>['인','묘','진'].includes(x)).length, mok = cntOh(s,'목');
  if (mokBr >= 2 && mok >= 3) return { 성격:true, 항목:'수대근심', 판정:`갑을일이 지지 인묘진에 뿌리 깊음(목 ${mok}) — 큰 나무 깊은 뿌리, 온산송백의 기상` };
  if (s.mBranch==='인' && mok - (b.includes('인')?1:0) === 0) return { 성격:true, 항목:'수소근천', 판정:'인월 갑을일에 다른 목기 없음 — 막 싹튼 어린 나무(嫩木), 사오월 화의 생을 받아도 힘이 미약' };
  if (['사','오'].includes(s.mBranch) && mok <= 1) return { 성격:true, 항목:'수소근천(약류)', 판정:'목이 병사궁(사오월)에 나고 뿌리 얕음 — 축 늘어진 버드나무의 기상' };
  return { 성격:false };
}
// 第七十七 축수양목 — 밖에 물이 없는데 축·진 중 계수(신궁 임수는 투출 시만)가 은밀히 목을 기름
function checkChuksuYangmok(s) {
  const su = cntOh(s,'수'); if (su > 0) return { 성격:false }; // 겉으로 드러난 물이 없어야
  const mok = cntOh(s,'목') + (Y.ohaengOf(s.dStem)==='목'?1:0); if (!mok) return { 성격:false };
  const b = br(s), store = b.filter(x=>['축','진'].includes(x));
  const sinTu = b.includes('신') && st(s).some((x,i)=>i!==2 && x==='임');
  if (!store.length && !sinTu) return { 성격:false };
  return { 성격:true, 항목:'축수양목', 판정:`사주 밖에 물이 없으나 ${store.length?store.join('·')+'중 계수':''}${josa(sinTu?(store.length?'·':'')+'신궁 임수(투출)':'','가')} 은밀히 목을 기름 — 매우 소중한 물` };
}
// 第七十八 상하정화(유정) — 대표 유정례: 관쇠 상왕에 재국이 관을 생 / 재경겁중에 식상이 겁을 제 / 신강 살경 재 반김 등
function checkSanghaJeonghwa(s) {
  const c = k => G1.countSipseongAll(s, k).count;
  const gs=c(['정관','편관']), sang=c(['상관']), sik=c(['식신','상관']), jae=c(['정재','편재']), bg=c(['비견','비겁']), ins=c(['정인','편인']);
  const 근거=[];
  if (gs>=1 && gs<=1 && sang>=2 && jae>=2) 근거.push('관쇠 상왕에 재가 관을 생함(상관생재·재생관 통관)');
  if (jae>=1 && jae<=1 && bg>=3 && sik>=1) 근거.push('재경겁중에 식상이 비겁을 제어해 재를 지킴');
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  if (sinwang && gs>=1 && gs<=1 && jae>=2) 근거.push('신강 살경에 재가 살을 생조(재자약살)');
  if (!sinwang && gs>=3 && ins>=1 && jae===0) 근거.push('살중용인에 재가 없어 인수를 깨지 않음');
  if (!근거.length) return { 성격:false };
  return { 성격:true, 항목:'상하정화', 판정:`간지가 생극제화로 화목·협조(유정) — ${근거.join(' / ')}. 위아래가 귀해지려면 유정해야 함` };
}
// 第七十九 체전지상 — 독수(수 일주에 수 하나뿐)가 경신금을 세 번 만남, 신유 금월 전제
function checkCheojeonJisang(s) {
  if (!['임','계'].includes(s.dStem)) return { 성격:false };
  if (cntOh(s,'수') > 0) return { 성격:false }; // 일주 외 물이 없어야 독수
  if (!['신','유'].includes(s.mBranch)) return { 성격:false };
  const geum = cntOh(s,'금'); if (geum < 3) return { 성격:false };
  const gap = st(s).some((x,i)=>i!==2&&x==='갑'), sul = br(s).includes('술');
  return { 성격:true, 항목:'체전지상', 판정:`독수 삼봉경신(금 ${geum}) — 인수의 생으로 전강. ${gap&&sul?'갑·술 모두 있어 금으로 물의 근원을 전용':sul?'술토 관궁을 씀':gap?'갑목 상관에 설기':'무갑무술 — 전용 금발수원'}` };
}
// 第八十 신왕적살 — 신왕에 칠살 있어 스스로 대적(살변위관); 살 태과면 제살 필요
function checkSinwangJeoksal(s) {
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  const sal = G1.countSipseongAll(s, ['편관']).count; const bg = G1.countSipseongAll(s, ['비견','비겁']).count;
  if (!sinwang || sal === 0 || bg < 2) return { 성격:false };
  return { 성격:true, 항목:'신왕적살', 판정:`몸이 왕성하여 칠살(${sal})을 겁내지 않고 다스려 씀 — 귀신이 변하여 관이 됨${sal>=3?' (살이 지나치면 식상 제살 병용)':''}` };
}
// 第八十一 형전형결 — 일간 오행이 왕월에 나면 형전(의설의손), 병사지에 나면 형결(의보)
function checkHyeongjeonHyeonggyeol(s) {
  const ilOh = Y.ohaengOf(s.dStem), m = s.mBranch;
  if (wangMonth[ilOh].includes(m)) return { 성격:true, 항목:'형전', 판정:`${ilOh} 일주가 왕월(${m})에 나 형이 완전 — 마땅히 설기·손(宜泄宜損)` };
  const SICK = { 목:['사','오'], 화:['신','유'], 금:['해','자'], 수:['인','묘'], 토:['인','묘'] };
  if ((SICK[ilOh]||[]).includes(m)) return { 성격:true, 항목:'형결', 판정:`${ilOh} 일주가 병사지(${m}월)에 나 형이 결핍 — 마땅히 도와 보충(宜補)` };
  return { 성격:false };
}
// 第八十二 방조설상 — 정보성: 방(비겁)·조(인수)·설(식상)·상(재관) 4방향 계수 요약
function checkBangjoSeolsang(s) {
  const c = k => G1.countSipseongAll(s, k).count;
  const bang=c(['비견','비겁']), jo=c(['정인','편인']), seol=c(['식신','상관']), sang=c(['정재','편재','정관','편관']);
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  return { 성격:true, 항목:'방조설상', 판정:`방(비겁 ${bang})·조(인수 ${jo}) / 설(식상 ${seol})·상(재관 ${sang}) — ${sinwang?'신왕이라 설·상이 마땅':'신약이라 방·조가 마땅'}` };
}
// 第八十三 종지진가 — 일주 무근·비겁 전무에 한 오행 국이 가득(진종) / 미약한 뿌리·비겁 있는 채 따름(가종)
function checkJongjiJinga(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const counts = {}; for (const o of ['목','화','토','금','수']) counts[o] = cntOh(s,o);
  const [top, n] = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  if (n < 5) return { 성격:false };
  const NAME = top===GEUKBY[ilOh]?'종살':top===GEUK[ilOh]?'종재':top===SAENG[ilOh]?'종아':top===ilOh?'종왕':'종강';
  const root = br(s).some(b=>T.BRANCH_OHAENG[b]===ilOh) || st(s).some((x,i)=>i!==2&&T.STEM_OHAENG[x]===ilOh);
  if (['종왕','종강'].includes(NAME)) return { 성격:true, 항목:`종지진가(${NAME})`, 판정:`사주가 온통 ${top}(${n}) — ${josa(NAME,'은')} 무의(無依) 원칙의 예외` };
  return { 성격:true, 항목: root ? `종지진가(가종·${NAME})` : `종지진가(진종·${NAME})`, 판정: root ? `${top}국(${n})이 가득하나 일주에 뿌리·비겁이 남아 있어 거짓으로 따름(가종) — 뿌리 제거운에 발복, 뿌리 생조운에 흉` : `${top}국(${n})이 가득하고 일주 무의 — 참으로 따름(진종)` };
}
// 第八十四 암요제궐 — 년지(제좌)의 충 지지(제궐)가 드러나지 않고, 그와 삼합하는 지지가 있어 은밀히 맞이함. 제궐 공망 아니어야 더 귀
function checkAmyoJegwol(s) {
  const CHUNG = { 자:'오', 축:'미', 인:'신', 묘:'유', 진:'술', 사:'해', 오:'자', 미:'축', 신:'인', 유:'묘', 술:'진', 해:'사' };
  const SAMHAP = { 자:'신진', 오:'인술', 묘:'해미', 유:'사축', 진:'신자', 술:'인오', 축:'사유', 미:'해묘', 인:'오술', 신:'자진', 사:'유축', 해:'묘미' };
  const jegwol = CHUNG[s.yBranch]; const b = br(s);
  if (b.includes(jegwol)) return { 성격:false }; // 드러나면 암요 아님
  const yo = b.filter((x,i)=>i!==0 && SAMHAP[jegwol].includes(x));
  if (!yo.length) return { 성격:false };
  const sun = G60.getSunInfo(s.dStem+s.dBranch); const gm = sun ? (T.GONGMANG[sun.순+'순']||[]) : [];
  return { 성격:true, 항목:'암요제궐', 판정:`제좌 ${s.yBranch}의 제궐 ${josa(jegwol,'이')} 드러나지 않고 ${josa(yo.join('·'),'이')} 삼합으로 은밀히 맞이함${gm.includes(jegwol)?' — 단 제궐이 공망':' — 제궐 공망 아님, 귀격에 금상첨화'}` };
}
const TOPICS_17 = [
  // 71·72는 용신 특례 계층(yongsin.js)이 제목으로 가로채므로 '참고' 플래그를 달아 master에서 용신 입력에서 제외(v25 상태 보존)
  { id:71, 제목:'신불가과', fn: s => { const r = TK.checkSinbulGagwa(s); return r.성격 ? { ...r, 참고:true } : r; } },
  { id:72, 제목:'삼기득위', fn: s => { const r = TK.checkSamgiDeukwi(s); return r.성격 ? { ...r, 참고:true } : r; } },
  { id:76, 제목:'수대근심', fn: checkSudaeGeunsim }, { id:77, 제목:'축수양목', fn: checkChuksuYangmok },
  { id:78, 제목:'상하정화', fn: checkSanghaJeonghwa }, { id:79, 제목:'체전지상', fn: checkCheojeonJisang },
  { id:80, 제목:'신왕적살', fn: checkSinwangJeoksal }, { id:81, 제목:'형전형결', fn: checkHyeongjeonHyeonggyeol },
  { id:82, 제목:'방조설상', fn: checkBangjoSeolsang }, { id:83, 제목:'종지진가', fn: checkJongjiJinga },
  { id:84, 제목:'암요제궐', fn: checkAmyoJegwol },
];
module.exports = { TOPICS_17, checkSudaeGeunsim, checkChuksuYangmok, checkSanghaJeonghwa, checkCheojeonJisang, checkSinwangJeoksal, checkHyeongjeonHyeonggyeol, checkBangjoSeolsang, checkJongjiJinga, checkAmyoJegwol };
