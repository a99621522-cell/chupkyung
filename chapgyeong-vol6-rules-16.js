// ============================================================
// chapgyeong-vol6-rules-16.js — 6권 第六十五~七十·七十三~七十五 (합본 원문 텍스트 기반)
// 모정유변·갑목맹아(66, 합본 번호 오기)·추수통원·기취감궁(팔궁)·살인상정·일락서산·자오쌍포·전이불항·회동제궐
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const YANGIN = { 갑:'묘', 병:'오', 무:'오', 경:'유', 임:'자' };

// 第六十五 모정유변 — 어머니(일주 오행) 태왕에 자손(식상) 한두 점 미약: 수(인수)운·토운에 자손이 상함
function checkMojeongYubyeon(s) {
  const ilOh = Y.ohaengOf(s.dStem);
  const mo = cntOh(s, ilOh) + 1, ja = cntOh(s, SAENG[ilOh]);
  if (mo < 5 || ja === 0 || ja > 2) return { 성격:false };
  return { 성격:true, 항목:'모정유변', 판정:`어머니(일주 ${ilOh} ${mo})가 태왕한데 자손(식상 ${SAENG[ilOh]} ${ja})은 미약 — 화토운은 모자 화합, 수운·습토운이면 모불용자(母不容子)로 자손 상함` };
}
// 第六十六 갑목맹아 — 해월생: 해중 갑목이 움터 통관·설기 작용(계일생은 상관, 화토금 있으면 순환)
function checkGapmokMaenga(s) {
  if (s.mBranch !== '해') return { 성격:false };
  const tu = st(s).some((x,i)=>i!==2 && ['갑','을'].includes(x));
  return { 성격:true, 항목:'갑목맹아', 판정:`해월생 — 해중 갑목이 맹아하여 ${tu?'천간 갑을(원신)로 드러남':'암암리에'} 작용. ${['임','계'].includes(s.dStem)?'수일생은 이를 상관 설기로 볼 것':'화·토·금이 있으면 갑목이 통관하여 순환상생'}` };
}
// 第六十七 추수통원 — 임계일 신유월: 금수쌍청·원원류장, 신월 계일도 사중봉생
function checkChusuTongwon(s) {
  if (!['임','계'].includes(s.dStem) || !['신','유'].includes(s.mBranch)) return { 성격:false };
  const mu = st(s).some((x,i)=>i!==2 && x==='무');
  return { 성격:true, 항목:'추수통원', 판정:`${s.dStem}수 일주가 ${s.mBranch}월 — 가을 물이 근원과 통해 징청지수(금수쌍청), 몸이 왕성${mu?', 무토를 만나 제방을 이룸':''}. 격국이 혼탁으로 변하지 않으면 부귀` };
}
// 第六十八 기취감궁(팔궁) — 지지가 한 궁의 기운으로 집결
function checkGichwiGamgung(s) {
  const b = br(s);
  const has = x => b.includes(x);
  const full = (set) => set.split('').every(has);
  if (full('해자축') || full('신자진')) return { 성격:true, 항목:'기취감궁', 판정:'지지가 북방 수국으로 집결(기취감궁) — 정영한 기운, 설기가 있으면 문장·귀' };
  if (full('사오미') || full('인오술')) return { 성격:true, 항목:'기취리궁', 판정:'지지가 남방 화국으로 집결(기취리궁)' };
  if (full('인묘진') || full('해묘미')) return { 성격:true, 항목:'기취진궁', 판정:'지지가 동방 목국으로 집결(기취진궁)' };
  if (full('신유술') || full('사유축')) return { 성격:true, 항목:'기취태궁', 판정:'지지가 서방 금국으로 집결(기취태궁)' };
  if (has('술')&&has('해')) return { 성격:true, 항목:'기취건궁', 판정:'술해(건방·천문)로 기운 집결' };
  if (has('축')&&has('인')) return { 성격:true, 항목:'기취간궁', 판정:'축인(간방)으로 기운 집결' };
  if (has('진')&&has('사')) return { 성격:true, 항목:'기취손궁', 판정:'진사(손방)로 기운 집결' };
  if (has('미')&&has('신')) return { 성격:true, 항목:'기취곤궁', 판정:'미신(곤방·지축)으로 기운 집결' };
  return { 성격:false };
}
// 第六十九 살인상정 — 양일간이 양인을 두고 칠살이 천간에 드러나 살인쌍현
function checkSalinSangjeong(s) {
  const yin = YANGIN[s.dStem]; if (!yin) return { 성격:false };
  const yinCnt = br(s).filter(b=>b===yin).length;
  const salStems = st(s).filter((x,i)=>i!==2 && Y.getSipseong(s.dStem,x)==='편관');
  if (!yinCnt || !salStems.length) return { 성격:false };
  const R = B.checkBranchRelations(br(s));
  const chung = R.충.some(c=>c.includes(yin));
  return { 성격:true, 항목:'살인상정', 판정:`양인(${yin}${yinCnt>1?'×'+yinCnt:''})과 칠살(${salStems.join('')})이 함께 드러남 — 살인쌍현균정이면 지위가 왕후에 이름${chung?' (양인이 충을 맞음 — 인강이면 무방, 인약이면 꺼림)':''}` };
}
// 第七十 일락서산 — 병일 신유월
function checkIllakSeosan(s) {
  if (s.dStem !== '병' || !['신','유'].includes(s.mBranch)) return { 성격:false };
  const sinT = st(s).some((x,i)=>i!==2 && x==='신'), chuk = br(s).includes('축');
  return { 성격:true, 항목:'일락서산', 판정:`병화가 ${s.mBranch}월 — 태양이 서산에 짐. 양간이라 세력을 따르지 않으나${sinT?' 병신합으로':''}${chuk?' 축토 회기(晦氣)로':''} 약해짐. 사주 전체를 참작해야 하는 까다로운 격` };
}
// 第七十三 자오쌍포 — 두 자 두 오 / 두 오 한 자 / 두 자 한 오
function checkJaoSsangpo(s) {
  const b = br(s), ja = b.filter(x=>x==='자').length, o = b.filter(x=>x==='오').length;
  if (ja>=2 && o>=2) return { 성격:true, 항목:'자오쌍포', 판정:'두 자·두 오가 서로 감싸는 완전한 자오쌍포 — 제좌·단문이 짝을 이룸(기제지공)' };
  if (o>=2 && ja===1) return { 성격:true, 항목:'자오쌍포(양오포일자)', 판정:'두 오가 한 자를 감쌈' };
  if (ja>=2 && o===1) return { 성격:true, 항목:'자오쌍포(양자포일오)', 판정:'두 자가 한 오를 감쌈' };
  return { 성격:false };
}
// 第七十四 전이불항 — 양간 일주 양인 거듭·신강에 칠살 있음: 합살 정전 후 항복 않고 싸움
function checkJeoniBulhang(s) {
  const yin = YANGIN[s.dStem]; if (!yin) return { 성격:false };
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(s.dStem, s.mBranch));
  const bg = G1.countSipseongAll(s, ['비견','비겁']).count;
  const sal = G1.countSipseongAll(s, ['편관']).count;
  if (!sinwang || bg < 3 || sal === 0) return { 성격:false };
  return { 성격:true, 항목:'전이불항', 판정:`양인·비겁으로 고강한 일주(비겁 ${bg})에 칠살 — 패할지언정 항복하지 않는 상, 공을 위해 끝까지 싸우는 위엄(양인이 양인 자리를 거듭 만나는 운은 크게 위태)` };
}
// 第七十五 회동제궐 — 술해(천문=제궐) 갖춤, 또는 해+유가 술을 공협
function checkHoedongJegwol(s) {
  const b = br(s);
  if (b.includes('술') && b.includes('해')) return { 성격:true, 항목:'회동제궐', 판정:'술해 천문(제궐)을 회동 — 격국·용신이 갖춰지면 귀히 됨(천개지축과 함께면 명동천하)' };
  if (b.includes('술') && b.includes('자')) return { 성격:true, 항목:'회동제궐(공협)', 판정:'술·자가 가지런하여 사이의 해를 공협 — 회동제궐을 이룸(우열 차 없음)' };
  if (b.includes('해') && b.includes('유')) return { 성격:true, 항목:'회동제궐(공협)', 판정:'해·유가 가지런하여 사이의 술을 공협 — 회동제궐을 이룸(우열 차 없음)' };
  return { 성격:false };
}
const TOPICS_16 = [
  { id:65, 제목:'모정유변', fn: checkMojeongYubyeon }, { id:66, 제목:'갑목맹아', fn: checkGapmokMaenga },
  { id:67, 제목:'추수통원', fn: checkChusuTongwon }, { id:68, 제목:'기취감궁', fn: checkGichwiGamgung },
  { id:69, 제목:'살인상정', fn: checkSalinSangjeong }, { id:70, 제목:'일락서산', fn: checkIllakSeosan },
  { id:73, 제목:'자오쌍포', fn: checkJaoSsangpo }, { id:74, 제목:'전이불항', fn: checkJeoniBulhang },
  { id:75, 제목:'회동제궐', fn: checkHoedongJegwol },
];
module.exports = { TOPICS_16, checkMojeongYubyeon, checkGapmokMaenga, checkChusuTongwon, checkGichwiGamgung, checkSalinSangjeong, checkIllakSeosan, checkJaoSsangpo, checkJeoniBulhang, checkHoedongJegwol };
