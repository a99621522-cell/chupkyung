// ============================================================
// chapgyeong-vol6-rules-19.js — 6권 第九十五~百五 (합본 원문 텍스트 기반)
// 공작조화(납음)·생화유정(96, 별도도구 참고)·부건파처(97, 특례 참고)·취정회신·이인동심·삼기성상·일기위근·감리상지·화지진가·애가증진·가신난진
// ============================================================
const T = require('./chapgyeong-vol1-tables.js');
const { josa } = require('./chapgyeong-josa.js');
const B = require('./chapgyeong-vol1-basics.js');
const Y = require('./chapgyeong-vol1-yukchin.js');
const G1 = require('./chapgyeong-vol4-gyeokguk.js');
const TK = require('./chapgyeong-vol6-teukrye.js');
let SH = null; try { SH = require('./chapgyeong-jonggyeok-saenghwa.js'); } catch (e) {}
const SAENG = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
const GEUKBY = { 목:'금', 화:'수', 토:'목', 금:'화', 수:'토' };
const br = s => [s.yBranch,s.mBranch,s.dBranch,s.tBranch];
const st = s => [s.yStem,s.mStem,s.dStem,s.tStem];
const cntOh = (s,oh) => br(s).filter(b=>T.BRANCH_OHAENG[b]===oh).length + st(s).filter((x,i)=>i!==2&&T.STEM_OHAENG[x]===oh).length;
const STEM_HAP_PAIRS = { 갑기:'토', 기갑:'토', 을경:'금', 경을:'금', 병신:'수', 신병:'수', 정임:'목', 임정:'목', 무계:'화', 계무:'화' };
// 납음오행(60갑자 → 오행)
const NAPEUM = (() => {
  const G = ['갑','을','병','정','무','기','경','신','임','계'], J = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  // 해중금·노중화·대림목·노방토·검봉금·산두화·간하수·성두토·백납금·양류목·천중수·옥상토·벽력화·송백목·장류수·사중금·산하화·평지목·벽상토·금박금·복등화·천하수·대역토·차천금·상자목·대계수·사중토·천상화·석류목·대해수
  const seq = ['금','화','목','토','금','화','수','토','금','목','수','토','화','목','수','금','화','목','토','금','화','수','토','금','목','수','토','화','목','수'];
  const m = {}; for (let i=0;i<60;i++) m[G[i%10]+J[i%12]] = seq[Math.floor(i/2)]; return m;
})();

// 第九十五 공작조화 — 일주와 시주(또는 타주)가 납음/정음의 어긋남을 서로 자리를 바꿔 해소: 일주 납음이 자기 정음에게 극당하고, 시주 납음은 그 정음에 녹을 두는 관계
function checkGongjakJohwa(s) {
  const pillars = [[s.yStem,s.yBranch],[s.mStem,s.mBranch],[s.dStem,s.dBranch],[s.tStem,s.tBranch]];
  const d = pillars[2], dNap = NAPEUM[d.join('')], dJeong = T.BRANCH_OHAENG[d[1]];
  if (GEUKBY[dNap] !== dJeong) return { 성격:false }; // 일주 납음이 정음(지지)에 극당해 불안
  const names=['연','월','일','시'];
  for (const i of [3,1,0]) { const o = pillars[i], oNap = NAPEUM[o.join('')], oJeong = T.BRANCH_OHAENG[o[1]];
    // 상대 납음이 내 정음과 같은 오행(내 자리로 오면 녹), 내 납음이 상대 정음과 같은 오행(그 자리로 가면 편안)
    if (oNap === dJeong && dNap === oJeong) return { 성격:true, 항목:'공작조화', 판정:`일주 ${josa(`${d.join('')}(납음 ${dNap}, 정음 ${dJeong} 극)`,'와')} ${names[i]}주 ${josa(`${o.join('')}(납음 ${oNap}, 정음 ${oJeong})`,'가')} 자리를 맞바꾸면 각각 녹을 얻어 화평 — 공작조화` };
  }
  return { 성격:false };
}
// 第九十八 취정회신 — 수 둘·화 둘이 각각 왕성하고 다른 오행이 어지럽히지 않음(수화기제)
function checkChwijeongHoesin(s) {
  const su = cntOh(s,'수') + (Y.ohaengOf(s.dStem)==='수'?1:0), hwa = cntOh(s,'화') + (Y.ohaengOf(s.dStem)==='화'?1:0);
  const other = 8 - su - hwa;
  if (su < 2 || hwa < 2 || other > 2) return { 성격:false };
  return { 성격:true, 항목:'취정회신', 판정:`수(정, ${su})·화(신, ${hwa})가 한데 모이고 잡됨이 적음 — 수화기제, 크게 귀히 드러나고 장수(감리상지·구통수화 참조)` };
}
// 第九十九 이인동심 — 사주가 두 오행(상생 관계)으로 이루어짐, 특히 인수+비겁(종강)
function checkIinDongsim(s) {
  const counts = {}; for (const o of ['목','화','토','금','수']) counts[o] = cntOh(s,o) + (Y.ohaengOf(s.dStem)===o?1:0);
  const present = Object.entries(counts).filter(([,n])=>n>0).map(([o])=>o);
  if (present.length !== 2) return { 성격:false };
  const [a,b] = present; if (SAENG[a]!==b && SAENG[b]!==a) return { 성격:false };
  const ilOh = Y.ohaengOf(s.dStem);
  const jonggang = present.includes(ilOh) && present.includes(Object.keys(SAENG).find(k=>SAENG[k]===ilOh));
  return { 성격:true, 항목:'이인동심', 판정:`사주가 ${a}·${b} 두 오행의 상생으로만 이루어짐 — 마음을 합침${jonggang?'(인수+비겁 종강: 순세·인수운 반김, 재로 인수를 깨지 말 것)':''}` };
}
// 第百 삼기성상 / 이기성상 / 사기성상 — 오행 종류 수 3(상생 연결)·2·4
function checkSamgiSeongsang(s) {
  const counts = {}; for (const o of ['목','화','토','금','수']) counts[o] = cntOh(s,o) + (Y.ohaengOf(s.dStem)===o?1:0);
  const present = Object.keys(counts).filter(o=>counts[o]>0);
  if (present.length === 3) {
    const chain = present.some(a => present.includes(SAENG[a]) && present.includes(SAENG[SAENG[a]]));
    return { 성격:true, 항목:'삼기성상', 판정:`${present.join('·')} 세 기운으로 하나의 상을 이룸${chain?'(연속 상생 — 청격, 부귀 겸함)':'(통관·원원류장 여부를 볼 것)'}` };
  }
  if (present.length === 4) return { 성격:true, 항목:'사기성상', 판정:`${present.join('·')} 네 기운 — 사상격` };
  return { 성격:false };
}
// 第百一 일기위근 — 납음 4주 동일 오행 / 일간 오행의 방합 완비 / 특정 천간합+지지국 조합
function checkIlgiWigeun(s) {
  const pillars = [s.yStem+s.yBranch, s.mStem+s.mBranch, s.dStem+s.dBranch, s.tStem+s.tBranch];
  const naps = new Set(pillars.map(p=>NAPEUM[p]));
  if (naps.size === 1) return { 성격:true, 항목:'일기위근(납음)', 판정:`사주 납음이 온통 ${[...naps][0]} — 한 기운으로 뿌리를 삼음` };
  const ilOh = Y.ohaengOf(s.dStem), BANG = { 목:'인묘진', 화:'사오미', 금:'신유술', 수:'해자축' };
  if (BANG[ilOh] && BANG[ilOh].split('').every(b=>br(s).includes(b))) return { 성격:true, 항목:'일기위근(방합)', 판정:`${ilOh} 일주가 지지에 ${josa(BANG[ilOh],'를')} 온전히 갖춤 — 일기위근` };
  const stems = st(s).filter((x,i)=>i!==2), has = (a,b) => stems.includes(a) && stems.includes(b);
  const guk = k => k.split('').every(b=>br(s).includes(b));
  if (['갑','을'].includes(s.dStem) && has('정','임') && guk('해묘미')) return { 성격:true, 항목:'일기위근(합국)', 판정:'갑을일 천간 정임(합목)+지지 해묘미 목국' };
  if (['경','신'].includes(s.dStem) && has('무','계') && guk('인오술')) return { 성격:true, 항목:'일기위근(합국)', 판정:'경신일 천간 무계(합화)+지지 인오술 화국' };
  if (['임','계'].includes(s.dStem) && has('을','경') && guk('사유축')) return { 성격:true, 항목:'일기위근(합국)', 판정:'임계일 천간 을경(합금)+지지 사유축 금국' };
  if (['갑','을'].includes(s.dStem) && has('병','신') && guk('해자축')) return { 성격:true, 항목:'일기위근(합국)', 판정:'갑을일 천간 병신(합수)+지지 해자축 수국' };
  return { 성격:false };
}
// 第百二 감리상지 — 수·화 대치(각 ≥2)에 다스리는 것이 있어 공존: 목(승/화)·토(제)·금(강/해) 통관
function checkGamriSangji(s) {
  const su = cntOh(s,'수') + (Y.ohaengOf(s.dStem)==='수'?1:0), hwa = cntOh(s,'화') + (Y.ohaengOf(s.dStem)==='화'?1:0);
  if (su < 2 || hwa < 2) return { 성격:false };
  const ways = [];
  if (cntOh(s,'목') + (Y.ohaengOf(s.dStem)==='목'?1:0)) ways.push('목(승·화: 수생목 목생화)');
  if (cntOh(s,'토') + (Y.ohaengOf(s.dStem)==='토'?1:0)) ways.push('토(제: 물을 제방)');
  if (cntOh(s,'금') + (Y.ohaengOf(s.dStem)==='금'?1:0)) ways.push('금(강·해: 화를 덜고 수를 생)');
  if (!ways.length) return { 성격:false };
  return { 성격:true, 항목:'감리상지', 판정:`수(${su})·화(${hwa})가 대치하나 ${josa(ways.join('·'),'이')} 다스려 오래 지속(오리법)` };
}
// 第百三 화지진가 — 일간 합화: 화신이 생왕(월령·국)을 얻으면 진화, 충극 받으면 가화
function checkHwajiJinga(s) {
  const stems = st(s);
  for (const i of [1,3]) { const hwa = STEM_HAP_PAIRS[s.dStem+stems[i]]; if (!hwa) continue;
    const support = cntOh(s, hwa) + (T.BRANCH_OHAENG[s.mBranch]===hwa?1:0), geuk = cntOh(s, GEUKBY[hwa]);
    if (support >= 2 && geuk === 0) return { 성격:true, 항목:'화지진가(진화)', 판정:`일간이 ${josa(stems[i],'와')} 합하여 ${josa(hwa,'로')} 화함 — 화신이 생왕(${support})하고 충극 없음: 진화` };
    if (geuk > 0) return { 성격:true, 항목:'화지진가(가화)', 판정:`일간이 ${josa(stems[i],'와')} 합하나 화신 ${josa(hwa,'이')} ${GEUKBY[hwa]}(${geuk})에 극당함 — 가화(운에서 진가가 뒤바뀔 수 있음)` };
    return { 성격:true, 항목:'화지진가(미정)', 판정:`일간 ${s.dStem}${stems[i]} 합은 있으나 화신 ${hwa}의 생왕이 부족 — 합이나 화하지 못함(집일론 경계)` };
  }
  return { 성격:false };
}
// 第百四 애가증진 — 진신(월령 사령 오행)이 세력을 잃고 가신(실시 오행)이 국을 얻어 가신을 용신으로 씀
function checkAegaJeungjin(s) {
  const jin = T.BRANCH_OHAENG[s.mBranch]; const jinCnt = cntOh(s, jin);
  const counts = {}; for (const o of ['목','화','토','금','수']) if (o!==jin) counts[o] = cntOh(s,o);
  const [ga, gaCnt] = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  if (jinCnt >= 2 || gaCnt < 4) return { 성격:false };
  return { 성격:true, 항목:'애가증진', 판정:`진신 ${josa(`${jin}(월령)`,'이')} 세력을 잃고(${jinCnt}) 가신 ${josa(`${ga}(${gaCnt})`,'이')} 국을 얻음 — 가신을 아껴 쓰고 진신을 미워하는 상(진위가·가위진)` };
}
// 第百五 가신난진 / 진신난가 — 가신이 진신을 충극(가신난진: 병을 제거하면 성공) / 진신이 가신을 극(진신난가)
function checkGasinNanjin(s) {
  const jin = T.BRANCH_OHAENG[s.mBranch]; const jinCnt = cntOh(s, jin);
  const geukCnt = cntOh(s, GEUKBY[jin]);
  if (jinCnt >= 1 && geukCnt >= 2 && geukCnt >= jinCnt) return { 성격:true, 항목:'가신난진', 판정:`가신 ${josa(`${GEUKBY[jin]}(${geukCnt})`,'이')} 진신 ${josa(`${jin}(${jinCnt})`,'을')} 극하여 어지럽힘 — 가신이 진신의 병이니 병을 제거하는 운에 성공` };
  const gaCnt = cntOh(s, GEUKBY[GEUKBY[jin]] === jin ? '' : Object.keys(GEUKBY).find(k=>GEUKBY[jin]===k) ) ;
  const target = Object.keys(GEUKBY).find(k=>GEUKBY[k]===jin); // 진신이 극하는 오행
  const tCnt = target ? cntOh(s, target) : 0;
  if (jinCnt >= 2 && tCnt >= 1 && tCnt <= 1) return { 성격:true, 항목:'진신난가', 판정:`진신 ${josa(`${jin}(${jinCnt})`,'이')} 가신 ${josa(`${target}(${tCnt})`,'을')} 극하여 방해 — 진신난가(부귀를 이루는 경우가 많음)` };
  return { 성격:false };
}
const TOPICS_19 = [
  { id:95, 제목:'공작조화', fn: checkGongjakJohwa },
  { id:96, 제목:'생화유정', fn: s => { if (!SH) return { 성격:false }; const r = SH.checkJonggyeokSaengHwaYujeong(s); return r && r.성격 ? { ...r, 항목: r.항목||'생화유정', 참고:true } : { 성격:false }; } },
  { id:97, 제목:'부건파처', fn: s => { const r = TK.checkBugeonPacheo(s); return r.성격 ? { ...r, 참고:true } : r; } },
  { id:98, 제목:'취정회신', fn: checkChwijeongHoesin }, { id:99, 제목:'이인동심', fn: checkIinDongsim },
  { id:100, 제목:'삼기성상', fn: checkSamgiSeongsang }, { id:101, 제목:'일기위근', fn: checkIlgiWigeun },
  { id:102, 제목:'감리상지', fn: checkGamriSangji }, { id:103, 제목:'화지진가', fn: checkHwajiJinga },
  { id:104, 제목:'애가증진', fn: checkAegaJeungjin }, { id:105, 제목:'가신난진', fn: checkGasinNanjin },
];
module.exports = { TOPICS_19, NAPEUM, checkGongjakJohwa, checkChwijeongHoesin, checkIinDongsim, checkSamgiSeongsang, checkIlgiWigeun, checkGamriSangji, checkHwajiJinga, checkAegaJeungjin, checkGasinNanjin };
