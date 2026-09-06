// ============================================================
// chapgyeong-vol6-rules-15.js — 6권 第五十七~六十四 (합본 원문 텍스트 기반 구현)
// 화신설수·살장관로·기관팔방·순환상생·천지덕합·원신투출·진기왕래·천한지동
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');

const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const STEM_HAP_PAIRS = { 갑기:'토', 기갑:'토', 을경:'금', 경을:'금', 병신:'수', 신병:'수', 정임:'목', 임정:'목', 무계:'화', 계무:'화' };
const stemHap = (a,b) => STEM_HAP_PAIRS[a+b];
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const guks = s => [...B.checkSamhap(br(s)), ...B.checkBanghap(br(s))].map(g=>g.ohaeng);

// 第五十七 화신설수 — 일간 합화가 순국/반국을 이루고 화신을 극하는 것이 없으며, 화신이 알맞게 설기(화신 생하는 오행 존재)
function checkHwasinSeolsu(s) {
  const stems = st(s);
  for (const i of [1,3]) { // 월간·시간과의 합
    const hwa = stemHap(s.dStem, stems[i]); if (!hwa) continue;
    const gukOk = guks(s).includes(hwa) || cntOh(s, hwa) >= 2;
    if (!gukOk) continue;
    const SAMHAP_GROUP = { 수:'신자진', 목:'해묘미', 화:'인오술', 금:'사유축', 토:'진술축미' };
    const geukStems = st(s).filter((x,i)=>i!==2 && T.STEM_OHAENG[x]===GEUKBY[hwa]).length;
    const geukBr = br(s).filter(b => T.BRANCH_OHAENG[b]===GEUKBY[hwa] && !SAMHAP_GROUP[hwa].includes(b)).length;
    if (geukStems + geukBr > 0) return { 성격:false, 주의:`합화(${hwa})를 극하는 ${GEUKBY[hwa]} 있음 — 화신설수 불성립` };
    const seol = SAENG[hwa];
    const seolCnt = cntOh(s, seol) + br(s).filter(b=>(T.JIJANGGAN[b]||[]).some(g=>T.STEM_OHAENG[g]===seol)).length;
    if (seolCnt >= 1 && seolCnt <= 3) return { 성격:true, 항목:'화신설수', 판정:`일간이 ${josa(stems[i],'와')} 합화(${hwa})하여 국을 이루고, 그 화신이 ${josa(seol,'로')} 알맞게 설기 — 정영한 기운(복덕수기)` };
  }
  return { 성격:false };
}
// 第五十八 살장관로 — 칠살은 지지(지장간)에 암장, 정관은 천간에 투출, 일주 왕성
function checkSaljangGwanro(s) {
  const ilgan = s.dStem;
  const gwanT = st(s).some((x,i)=>i!==2 && Y.getSipseong(ilgan,x)==='정관');
  const salT = st(s).some((x,i)=>i!==2 && Y.getSipseong(ilgan,x)==='편관');
  const salJang = br(s).some(b=>(T.JIJANGGAN[b]||[]).some(g=>Y.getSipseong(ilgan,g)==='편관'));
  if (!gwanT || salT || !salJang) return { 성격:false };
  const sinwang = Y.isSinWang(Y.getWangSangHyuSuSa(ilgan, s.mBranch));
  return { 성격:true, 항목:'살장관로', 판정: sinwang ? '칠살은 지지에 암장, 정관은 천간에 노출 — 관이 살에 뿌리를 두어 힘을 얻음(신왕이라 귀함)' : '살장관로이나 신약 — 관살 혼잡의 폐 우려, 인수로 화살자신해야' };
}
// 第五十九 기관팔방 — 자오묘유 / 인신사해 / 진술축미 네 글자가 지지에 온전히(섞임 없이)
function checkGigwanPalbang(s) {
  const b = br(s).slice().sort().join('');
  const sets = { 자오묘유:'묘오유자', 인신사해:'사신인해', 진술축미:'미술진축' };
  for (const [name, key] of Object.entries(sets)) if (b === key.split('').sort().join('')) return { 성격:true, 항목:'기관팔방', 판정:`지지가 ${josa(name,'로')} 온전히 갖춰짐 — 정기가 팔방에 두루 통하는 귀격` };
  return { 성격:false };
}
// 第六十 순환상생 — 오행이 모두 갖춰져 생생불이. 일주에서 멈추지 않고(급신이지 아님) 한 바퀴 돌아옴
function checkSunhwanSangsaeng(s) {
  const ohs = new Set([...br(s).map(b=>T.BRANCH_OHAENG[b]), ...st(s).map(x=>T.STEM_OHAENG[x]), ...br(s).flatMap(b=>(T.JIJANGGAN[b]||[]).map(g=>T.STEM_OHAENG[g]))]);
  if (ohs.size < 5) return { 성격:false };
  const ilOh = Y.ohaengOf(s.dStem);
  if (cntOh(s, SAENG[ilOh]) === 0) return { 성격:false }; // 일주에서 다시 설기되어 나가야 순환
  return { 성격:true, 항목:'순환상생', 판정:'오행이 모두 갖춰져 생생불이 — 일주를 거쳐 다시 순환(원원류장·생의불패), 수복을 겸함' };
}
// 第六十一 천지덕합 — 어느 두 기둥이 천간합과 지지 육합을 동시에
function checkCheonjiDeokhap(s) {
  const stems = st(s), branches = br(s), R = B.checkBranchRelations(branches), names = ['연','월','일','시'];
  const hits = [];
  for (let i=0;i<4;i++) for (let j=i+1;j<4;j++) {
    if (stemHap(stems[i],stems[j]) && R.합.some(h=>h.includes(branches[i])&&h.includes(branches[j]))) hits.push(`${names[i]}${names[j]}(${stems[i]}${branches[i]}·${stems[j]}${branches[j]})`);
  }
  if (!hits.length) return { 성격:false };
  return { 성격:true, 항목:'천지덕합', 판정:`${hits.join(', ')} 천간합+지지합 — 청기와 인심을 함께 얻음${hits.some(h=>h.startsWith('일시'))?' (일시 덕합은 열 가지 정격 중 하나)':''}` };
}
// 第六十二 원신투출 — 월지 본기 오행의 천간(원신)이 투출
function checkWonsinTuchul(s) {
  const wolOh = T.BRANCH_OHAENG[s.mBranch];
  const tu = st(s).filter((x,i)=>i!==2 && T.STEM_OHAENG[x]===wolOh);
  if (!tu.length) {
    // 註: 월건 외 다른 지지궁에서도 이루어짐 — 같은 기둥에서 지지 본기 오행의 천간이 위에 투출한 경우를 준격으로
    const stems = st(s), branches = br(s), names=['연','월','일','시'];
    for (const i of [0,3]) if (T.STEM_OHAENG[stems[i]] === T.BRANCH_OHAENG[branches[i]]) return { 성격:true, 항목:'원신투출(타궁)', 판정:`${names[i]}주 ${stems[i]}${branches[i]} — 지지 원신이 같은 기둥 천간에 투출(그 오행 강화)` };
    return { 성격:false };
  }
  const sip = Y.getSipseong(s.dStem, tu[0]);
  return { 성격:true, 항목:'원신투출', 판정:`월지 ${s.mBranch}(${wolOh})의 원신 ${josa(tu.join('·'),'이')} 천간에 투출 — ${sip} 기운이 크게 강화됨(용신이면 대성)` };
}
// 第六十三 진기왕래 — 일지 지장간과 시간, 시지 지장간과 일간이 서로 합(X자 교류). 속견표 예: 갑인일 신미시, 을묘일 경진시
function checkJingiWangrae(s) {
  const dJ = T.JIJANGGAN[s.dBranch]||[], tJ = T.JIJANGGAN[s.tBranch]||[];
  const a = dJ.some(g=>stemHap(g, s.tStem)), b = tJ.some(g=>stemHap(g, s.dStem));
  if (a && b) return { 성격:true, 항목:'진기왕래', 판정:'일지 장간↔시간, 시지 장간↔일간이 X자로 합 — 상하정동 좌우기협, 참된 기운이 오감' };
  if (a || b) return { 성격:true, 항목:'진기왕래(반)', 판정:'일주와 시주가 한 방향으로 진기 교류' };
  return { 성격:false };
}
// 第六十四 천한지동 — 임계(경신)일주 + 천간 경신임계 거듭(천한) + 해자축월 화 없음(지동)
function checkCheonhanJidong(s) {
  const ilgan = s.dStem;
  if (!['임','계','경','신'].includes(ilgan)) return { 성격:false };
  const geumsuStems = st(s).filter((x,i)=>i!==2 && ['경','신','임','계'].includes(x)).length;
  const dong = ['해','자','축'].includes(s.mBranch);
  const hwa = cntOh(s,'화');
  if (geumsuStems >= 1 && dong && hwa === 0) return { 성격:true, 항목:'천한지동', 판정:'천간 금수 거듭(천한)에 겨울월·화 전무(지동) — 얼어붙은 사주, 화(동일가애)를 절대 기뻐함. 온통 금수면 종기강세로 귀할 수도' };
  if (geumsuStems >= 1 && dong && hwa >= 1) return { 성격:true, 항목:'천한지동(동일가애)', 판정:'천한지동의 계절에 화를 얻어 조화 — 겨울날의 사랑스러움' };
  return { 성격:false };
}
const TOPICS_15 = [
  { id:57, 제목:'화신설수', fn: checkHwasinSeolsu }, { id:58, 제목:'살장관로', fn: checkSaljangGwanro },
  { id:59, 제목:'기관팔방', fn: checkGigwanPalbang }, { id:60, 제목:'순환상생', fn: checkSunhwanSangsaeng },
  { id:61, 제목:'천지덕합', fn: checkCheonjiDeokhap }, { id:62, 제목:'원신투출', fn: checkWonsinTuchul },
  { id:63, 제목:'진기왕래', fn: checkJingiWangrae }, { id:64, 제목:'천한지동', fn: checkCheonhanJidong },
];
module.exports = { TOPICS_15, checkHwasinSeolsu, checkSaljangGwanro, checkGigwanPalbang, checkSunhwanSangsaeng, checkCheonjiDeokhap, checkWonsinTuchul, checkJingiWangrae, checkCheonhanJidong };
